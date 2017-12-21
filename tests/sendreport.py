# -*- coding: utf-8 -*-

from __future__ import unicode_literals


import os
import sys
import re
import json

sys.path.insert(0, "packages")
import requests

# Mailing
import boto.ses

# Templating
from jinja2 import Template, Environment

# Iron.io
from iron_worker import *

# --------------
# Get Payload
# --------------
payload_file = None
payload = None
env_payload_file = os.getenv("PAYLOAD_FILE")

# Gets payload from environment variable
if env_payload_file != None:
    with open(env_payload_file, "r") as f:
        payload = json.loads(f.read())

# Gets payload from passed arguments
else:
    for i in range(len(sys.argv)):
        if sys.argv[i] == "-payload" and (i + 1) < len(sys.argv):
            payload_file = sys.argv[i + 1]
            with open(payload_file, "r") as f:
                payload = json.loads(f.read())
            break

# uuid = payload.get("test_id")
email = payload.get("email")
username = payload.get("username", "User Name")
results_file_path = payload.get("result_file", "test-results.json")
results_meta_file_path = payload.get("result_meta_file", "test-results-meta.json")
# END


# ------------
# Get Config
# ------------
config_file = None
config = {}
env_config_file = os.getenv("CONFIG_FILE")

# Gets config from environment variable
if env_config_file is not None:
    with open(env_config_file, "r") as f:
        config = json.loads(f.read())

def get_env(key, else_val=None):
    """ Get environment variable if not then get value from iron config """
    if os.getenv(key):
        return os.getenv(key)
    elif config.get(key):
        return config.get(key)
    else:
        return else_val

TASK_ID = get_env("TASK_ID")
RETRY = (True if get_env("RETRY") and json.loads(get_env("RETRY")) == True else False)
MAX_RETRY = get_env("MAX_RETRY")
DEBUG = (True if payload.get("debug") and json.loads(payload.get("debug")) == True else False)
# END

# ----------------------
# E-mail Notifications
# ----------------------
email_client = boto.ses.connect_to_region(
    get_env("AWS_REGION", "us-east-1"),
    aws_access_key_id=get_env("AWS_KEY_ID"),
    aws_secret_access_key=get_env("AWS_SECRET_KEY")
)

print "Generating HTML report..."
results = {}

with open(results_file_path, "a+") as f:
    results = json.loads(str(f.read()))

with open(results_meta_file_path, "a+") as f:
    results_meta = json.loads(str(f.read()))


def get_build_by_session_id(session_id):
    re_build_id = re.compile(".+/builds/([0-9a-z]+)/sessions/.+")
    url = "https://www.browserstack.com/automate/sessions/{session_id}.json".format(session_id=session_id)

    headers = {
        "authorization": "Basic cm9obTo5THlXdUVTN3A0aDVoQjhJakhVVA==", # TODO: Move this value to config.json
        "cache-control": "no-cache"
    }

    response = requests.request("GET", url, headers=headers)
    log_url = json.loads(response.text).get("automation_session").get("logs")
    return re_build_id.findall(log_url)[0]

# ------------------
# Add test metadata
# ------------------
sessions = []
sessions_map = {}


for i, test in enumerate(results.get("tests").get("passed")):
    try:
        results["tests"]["passed"][i]["meta"] = results_meta[results["tests"]["passed"][i].get("id")]
    except Exception as e:
        results["tests"]["passed"][i]["meta"] = {}

    sessions.append(results["tests"]["passed"][i]["sessionId"])

    if sessions_map.get(results["tests"]["passed"][i]["sessionId"]):
        results["tests"]["passed"][i]["meta"]["buildId"] = sessions_map.get(results["tests"]["passed"][i]["sessionId"])
    else:
        build_id = get_build_by_session_id(results["tests"]["passed"][i]["sessionId"])
        results["tests"]["passed"][i]["meta"]["buildId"] = build_id
        sessions_map[results["tests"]["passed"][i]["sessionId"]] = build_id

for i, test in enumerate(results.get("tests").get("failed")):
    try:
        results["tests"]["failed"][i]["meta"] = results_meta[results["tests"]["failed"][i].get("id")]
    except Exception as e:
        results["tests"]["failed"][i]["meta"] = {}

    sessions.append(results["tests"]["failed"][i]["sessionId"])

    if sessions_map.get(results["tests"]["failed"][i]["sessionId"]):
        results["tests"]["failed"][i]["meta"]["buildId"] = sessions_map.get(results["tests"]["failed"][i]["sessionId"])
    else:
        build_id = get_build_by_session_id(results["tests"]["failed"][i]["sessionId"])
        results["tests"]["failed"][i]["meta"]["buildId"] = build_id
        sessions_map[results["tests"]["failed"][i]["sessionId"]] = build_id

sessions = list(set(sessions))

for session in sessions:
    sessions_map[session] = get_build_by_session_id(session)
# END


def main():
    if results:
        recip = [
            {
                "email": "magdiel.david@gmail.com",
                "name": "Magdiel Juma",
                "type": "to"
            },
        ]

        if email:
            recip.append({
                "email": email,
                "name": username,
                "type": "to"
            })

        if DEBUG != True:
            recip.extend([
                {
                    "email": "msilverman@nutritionix.com",
                    "name": "Matt Silverman",
                    "type": "to"
                },
                {
                    "email": "leojoseph@nutritionix.com",
                    "name": "Leo Gajitos",
                    "type": "to"
                },
                {
                    "email": "odiehl@nutritionix.com",
                    "name": "Owen Diehl",
                    "type": "to"
                },
                {
                    "email": "yfedoriv@nutritionix.com",
                    "name": "Yurko Fedoriv",
                    "type": "to"
                },
                ]
            )

        from_email = get_env("EMAIL_SENDER", "hive2@nutritionix.com")
        from_name  = get_env("EMAIL_NAME", "Nutritionix Live Test")

        # Pick Passed Tests
        passed_tests = results.get("tests").get("passed")

        # Pick Failed Tests
        failed_tests = results.get("tests").get("failed")

        tests_count = (len(passed_tests) if passed_tests else 0) + (len(failed_tests) if failed_tests else 0)


        def send_message():
            def generate_message():
                html_template = open("report.html", "rU").read()

                env = Environment()
                template = env.from_string(html_template)
                rendered_template = template.render(
                    passed_tests=passed_tests,
                    failed_tests=failed_tests,
                    tests_count=tests_count,
                    results=results,
                    payload=payload
                )

                subject = "Post Deployment Tests " + ("SUCCESS" if not failed_tests else "FAIL")

                return {
                    "from_email": "{from_name}<{from_email}>".format(
                        from_email=from_email,
                        from_name=from_name,
                    ),
                    "from_name": from_name,
                    "subject": subject,
                    "html": rendered_template,
                    "to": [r.get("email") for r in recip]
                }

            if (failed_tests):
                print "Sending HTML report by e-mail..."

                message = generate_message()
                response = email_client.send_email(
                        message.get('from_email'),
                        message.get('subject'),
                        message.get('html'),
                        message.get('to'),
                        html_body=message.get('html')
                )
            else:
                print "E-mail report not required, there is no failed tests detected."

        if failed_tests and len(failed_tests):
            print "There are failed tests"
            if (RETRY and MAX_RETRY) and (RETRY == True and int(payload.get("retry_count", 0) < int(MAX_RETRY))):
                print "retrying..."
                retry_count = payload.get("retry_count", 0)+1
                label = "retry_count_%d"%(retry_count)
                worker = IronWorker(project_id=get_env('PROJECT_ID'), token=get_env('IRON_TOKEN'),)
                task = Task(code_name="nix-live-test")
                task.payload = payload
                task.payload["retry_count"] = retry_count
                task.cluster = "nutritionix"
                task.timeout = 600 # TODO: Get timeout value from current task option
                task.label = label
                response = worker.queue(task)

                print "retrying on task: %s"%(response)
            else:
                print "max retrying count reached or retry is disabled"
                send_message()
        else:
            print "there is not failed tests"
            send_message()


if __name__ == "__main__":
    sys.exit(main())

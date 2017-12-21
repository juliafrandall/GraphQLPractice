#!/usr/bin/env bash
WORKER_NAME="nix-live-test"
WORKER_NORMALIZED_NAME=${WORKER_NAME//:/_}
WORKER_SOURCE=`dirname $0`
WORKER_PACKAGE="${WORKER_SOURCE}/build/${WORKER_NORMALIZED_NAME}.zip"
WORKER_DOCKER_IMAGE_NAME="nutritionix/ubuntu-node:$(git log -n 1 --pretty=format:%h -- Dockerfile)"
WORKER_IRON_CONFIG="${WORKER_SOURCE}/config.json"

if [[ "$*" == *'--pack'* || "x${1}" == "x" ]]; then
    echo "Packing ${WORKER_PACKAGE}"
    rm -f ${WORKER_PACKAGE}

    mkdir 'build/'
    chmod -R 755 ./build

    zip -r \
        "--exclude=/.git/*" \
        "--exclude=/.idea/*" \
        "--exclude=/build/*" \
        --exclude=.gitignore \
        --exclude=deploy.sh \
        --exclude=Dockerfile \
        --exclude=README.md \
        --exclude=iron.json \
        --exclude=config.local.json \
        --exclude=test-results.json \
        --exclude=test-results-meta.json \
        --exclude=bs.zip \
        --exclude=requirements.txt \
        ${WORKER_PACKAGE} ${WORKER_SOURCE}
fi

if [[ "$*" == *'--build-docker'* || "x${1}" == "x" ]]; then
    echo "Building docker image ${WORKER_DOCKER_IMAGE_NAME}"
    docker build -t "${WORKER_DOCKER_IMAGE_NAME}" "${WORKER_SOURCE}"
    docker run --rm -v "$(pwd)":/worker -w /worker "${WORKER_DOCKER_IMAGE_NAME}" bash -c 'rm -rf packages; pip install -t packages -r requirements.txt'
    docker run --rm -v "$(pwd)":/worker -w /worker "${WORKER_DOCKER_IMAGE_NAME}" bash -c 'rm -rf node_modules; npm install'
    docker push "${WORKER_DOCKER_IMAGE_NAME}"
fi

if [[ "$*" == *'--upload'* || "x${1}" == "x" ]]; then
    echo "Publishing worker to iron.io"
    iron worker upload --zip "${WORKER_PACKAGE}" --retries 3 --retries-delay 7 --config-file ${WORKER_IRON_CONFIG} --name "${WORKER_NAME}" "${WORKER_DOCKER_IMAGE_NAME}" bash -c "'chmod -R 755 ./; bash run.sh; python sendreport.py'"
fi

if [[ "$*" == *'--local'* ]]; then
    echo "Running test"
    docker run --rm -v "$(pwd)":/src -w /src "${WORKER_DOCKER_IMAGE_NAME}" bash -c 'export CONFIG_FILE="/src/config.local.json"&& export PAYLOAD_FILE="/src/payload.json" && chmod -R 755 ./; bash run.sh; python sendreport.py'
fi

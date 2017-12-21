#!/usr/bin/env bash
WORKER_SOURCE=`dirname $0`
WORKER_NAME=${1}
WORKER_PACKAGE=${WORKER_SOURCE}/runtime/${WORKER_NAME}.zip
WORKER_DOCKER_IMAGE_NAME="mhart/alpine-node:6"

if [[ "x${WORKER_NAME}" == "x" ]]; then
    echo "Please provide worker name"
    exit 1
fi


if [[ "$*" == *'--pack'* || "x${2}" == "x" ]]; then
    echo "Packing ${WORKER_PACKAGE}"
    rm -f ${WORKER_PACKAGE}

    zip -r \
        "--exclude=/.git/*" \
        "--exclude=/.idea/*" \
        "--exclude=/runtime/*" \
        --exclude=.gitignore \
        --exclude=deploy.sh \
        --exclude=Dockerfile \
        --exclude=README.md \
        --exclude=iron.json \
        ${WORKER_PACKAGE} ${WORKER_SOURCE}

fi

if [[ "$*" == *'--upload'* || "x${2}" == "x" ]]; then
    echo "Publishing worker to iron.io"
    iron worker upload \
        --zip ${WORKER_PACKAGE} \
        --name ${WORKER_NAME} \
        --max-concurrency ${MAX_CONCURRENCY:-"3"} \
        --retries ${RETRIES:-"0"} \
        --retries-delay ${RETRIES_DELAY:-"0"} \
        --config-file runtime/config.yml \
        ${WORKER_DOCKER_IMAGE_NAME} node ${WORKER_NAME}.js
fi

if [[ "$*" == *'--local'* ]]; then
    echo "Running test"
    docker run --rm -v "$(pwd)":/worker -w /worker "${WORKER_DOCKER_IMAGE_NAME}" sh -c "TASK_ID=test PAYLOAD_FILE=runtime/payload_${WORKER_NAME}.yml CONFIG_FILE=runtime/config.yml node ${WORKER_NAME}.js"
fi

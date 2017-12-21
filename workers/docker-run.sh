#!/usr/bin/env bash
docker run -it --rm --name my-running-script -v "$PWD":/usr/src/app -w /usr/src/app mhart/alpine-node:6 "$@"

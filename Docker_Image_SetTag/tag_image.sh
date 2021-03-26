#!/usr/bin/env bash

set -eu -o pipefail

FULL_IMAGE_NAME=${1:-""}
TAG_NAME=${2:-""}

echo "###################################"
echo "Docker_Image_SetTag Inputs:"
echo "---"
echo "FULL_IMAGE_NAME=${FULL_IMAGE_NAME}"
echo "TAG_NAME=${TAG_NAME}"
echo "---"

docker pull "${FULL_IMAGE_NAME}:latest"

docker tag \
    "${FULL_IMAGE_NAME}:latest" \
    "${FULL_IMAGE_NAME}:${TAG_NAME}"

docker push "${FULL_IMAGE_NAME}:${TAG_NAME}"
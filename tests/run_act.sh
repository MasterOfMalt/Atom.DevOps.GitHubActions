#!/bin/bash
set -eu
#set -x

# shellcheck disable=SC1090,SC1091,SC1094
source "${PWD}/.env"

job="${1:-promote}"
event="${2:-pull_request}"

time act \
  --env-file "" \
  --secret GITHUB_TOKEN="$GITHUB_TOKEN" \
  --eventpath "tests/${event}.json" \
  --directory ../ \
  -P ubuntu-20.04=catthehacker/ubuntu:act-20.04 \
  -P ubuntu-latest=catthehacker/ubuntu:act-20.04 \
  -j "${job}" \
  "${event}" || true

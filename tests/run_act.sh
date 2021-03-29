#!/bin/bash
set -eu
#set -x

# shellcheck disable=SC1090
source "${PWD}/.env"

job="${1:-promote}"
event="${2:-pull_request}"

time act \
  --env-file "" \
  --secret GITHUB_TOKEN="$GITHUB_TOKEN" \
  --eventpath "tests/${event}.json" \
  --directory ../ \
  -P ubuntu-18.04=nektos/act-environments-ubuntu:18.04 \
  -P ubuntu-latest=nektos/act-environments-ubuntu:18.04 \
  -j "${job}" \
  "${event}" || true

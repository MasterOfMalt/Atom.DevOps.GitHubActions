#!/usr/bin/env bash
set -eu -o pipefail

GITHUB_REF=${GITHUB_REF:-""}
GITHUB_HEAD_REF=${GITHUB_HEAD_REF:-""}

REF="$GITHUB_REF"
if [ "$GITHUB_HEAD_REF" != "" ]; then
  REF="$GITHUB_HEAD_REF"
fi
if [ "$REF" == 'refs/heads/master' ]
then
  echo "::set-output name=tag_name::latest"
else
  echo "::set-output name=tag_name::$(basename "$REF")"
fi

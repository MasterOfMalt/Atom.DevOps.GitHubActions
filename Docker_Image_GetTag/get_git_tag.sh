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
  tag_name="latest"
else
  tag_name="$(basename "$REF")"
fi
echo "::set-output name=tag_name::${tag_name}"
echo "###################################"
echo "Docker_Image_GetTag Output:"
echo "---"
echo "tag_name: ${tag_name}"
echo "---"
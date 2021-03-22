#!/usr/bin/env bash

set -eu -o pipefail

# This will pull a docker image to build from if available,
# and output the caching data inot the step output variable `setting`
# Args:
#   image_name: The image name consisting of <registry>/<repo_name>/<image_name>.
#   image_tag:  The current tag - usually the git branch or tag name.
# Outputs:
#   stdout:     The github workflow instructions to set a variable. Github workflow atuomatically responds to these.

IMAGE_NAME=${1:-""}
TAG_NAME=${2:-""}
EXPIRY_TIME_IN_DAYS=${3:-3}
EXPIRY_TIME_IN_SECS=$(( EXPIRY_TIME_IN_DAYS * 24 * 60 * 60 )) # 3 days.
echo "EXPIRY_TIME_IN_SECS=${EXPIRY_TIME_IN_SECS}"

function prepare_cache_setting() {
    ## Caching image layers is good - it saves build time, reduces storage and network usage. 
    ## However, we don't want to cache forever. For the pip packages that aren't pinned, 
    ## we want it to fetch fresh ones regularly. Currently that is 3 days.
    ## We avoid pinning unless necessary, so we don't end up dependant on ancient versions or afraid to update.

    local image_full_name=$1   # registry/repo/name
    local image_layers
    local layer_date
    local layer_age

    if [ "${image_full_name}" == "" ]; then
        return 1
    fi
    image_layers=$( docker image history "${image_full_name}" \
                    --format "{{.CreatedAt}}#{{.CreatedBy}}" --no-trunc)

    # TODO: Make this more generic and less python orientated
    if ! echo "$image_layers" | grep requirements; then
        return 1
    fi
    layer_date=$( echo "$image_layers" | grep requirements | cut -d'#' -f1 )
    layer_age=$(( $(date +%s) - $(date +%s -d  "$layer_date") ))

    if [ $layer_age -gt $EXPIRY_TIME_IN_SECS ]; then
        return 1
    fi
}

function main() {
    ## Pulling the previous image allows us to use its layers as a cache, to reduce build times.
    ## When pulling an image - we try the current tag name first,
    ## failing that, we try the latest.
    ## if there's nothing to pull - there is no cache.

    local image_name=$1
    local image_tag=$2
    local image_full_name=""

    if docker pull "${image_name}:${image_tag}"; then
        image_full_name="${image_name}:${image_tag}"
    elif docker pull "${image_name}:latest"; then
        image_full_name="${image_name}:latest"
    else
        echo "::set-output name=setting::--no-cache"
        return
    fi

    if prepare_cache_setting "${image_full_name}"; then
        echo "::set-output name=setting::--cache-from=${image_full_name}"
    else
        echo "::set-output name=setting::--no-cache"
    fi    
}

if [ "$IMAGE_NAME" == "" ]; then
  echo "IMAGE_NAME not specified"; exit 1;
fi
if [ "$TAG_NAME" == "" ]; then
  echo "TAG_NAME not specified"; exit 1;
fi

main "$IMAGE_NAME" "$TAG_NAME"

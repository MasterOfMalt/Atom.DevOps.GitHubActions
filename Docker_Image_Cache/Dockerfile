FROM docker:latest
RUN apk update \
    && apk add --no-cache ca-certificates bash
COPY "prepare_container_image_cache.sh" "/prepare_container_image_cache.sh"
ENTRYPOINT ["/bin/bash", "/prepare_container_image_cache.sh"]

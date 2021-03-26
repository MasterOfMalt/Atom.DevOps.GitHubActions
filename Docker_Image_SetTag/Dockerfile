FROM docker:latest
RUN apk update \
    && apk add --no-cache ca-certificates bash
COPY "tag_image.sh" "/tag_image.sh"
ENTRYPOINT ["/bin/bash", "/tag_image.sh"]

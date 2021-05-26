FROM docker:20.10
RUN apk update \
    && apk add --no-cache ca-certificates bash
COPY "get_git_tag.sh" "/get_git_tag.sh"
ENTRYPOINT ["/bin/bash", "/get_git_tag.sh"]

FROM ubuntu:latest AS base

RUN echo "HELLO WORLD" > /opt/stuff.txt

FROM ubuntu:latest AS runner

COPY --from=base /opt/stuff.txt /opt/copied_stuff.txt


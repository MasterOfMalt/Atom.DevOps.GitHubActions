FROM ubuntu:20.04 AS base

RUN echo "HELLO WORLD" > /opt/stuff.txt

FROM ubuntu:20.04 AS runner

COPY --from=base /opt/stuff.txt /opt/copied_stuff.txt


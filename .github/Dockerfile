FROM ubuntu:20.04 AS base
RUN echo "HELLO WORLD" > /opt/stuff.txt

FROM ubuntu:20.04 AS runner
ARG GREETING="Hello"
ARG ADDRESSEE="World"
COPY --from=base /opt/stuff.txt /opt/copied_stuff.txt
RUN echo ${GREETING}, ${ADDRESSEE}. >/opt/greet.txt
CMD cat /opt/greet.txt

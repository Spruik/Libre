# Dockerfile
FROM postgres:9.6

LABEL maintainer="Tom Hollingworth <tom.hollingworth@spruiktec.com>"

COPY db/*.sql /docker-entrypoint-initdb.d/

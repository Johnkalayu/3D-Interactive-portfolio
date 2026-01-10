#!/bin/bash

DOCKERFILE_NAME='Dockerfile'
IMAGE_NAME='portfolio_db_postgres'
CONTAINER_NAME='postgres_db'
CONTAINER_NETWORK='portfolio_network'

source .env

cat <<EOF > ${DOCKERFILE_NAME}
FROM postgres:16.11-alpine3.23 
ENV POSTGRES_USER=${DB_USER}
ENV POSTGRES_PASSWORD=${DB_PASSWORD}
ENV POSTGRES_DB=${DB_NAME}
ENV POSTGRES_PORT=${DB_PORT}
VOLUME /var/lib/postgresql/data
EXPOSE 5432
EOF

docker build -t ${IMAGE_NAME} -f ${DOCKERFILE_NAME} .

docker run --name ${CONTAINER_NAME} -d --restart unless-stopped \
-e POSTGRES_USER=${DB_USER} \
-e POSTGRES_PASSWORD=${DB_PASSWORD} \
-e POSTGRES_DB=${DB_NAME} \
-e POSTGRES_PORT=${DB_PORT} \
-v $(pwd)/data:/var/lib/postgresql/data \
-p 5432:5432 \
--network ${CONTAINER_NETWORK} \
${IMAGE_NAME}
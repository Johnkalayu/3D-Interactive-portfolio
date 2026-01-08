#!/bin/bash

docker run --name postgres_db -d --restar unless=stopped \
-e POSTGRES_USER=${DB_USER} \
-e POSTGRES_PASSWORD=${DB_PASSWORD} \
-e POSTGRES_DB=${DB_NAME} \
-e POSTGRES_PORT=${DB_PORT} \
-v $(pwd)/data:/var/lib/postgresql/data \
-p 5432:5432 \
postgres:16.11-alpine3.23 
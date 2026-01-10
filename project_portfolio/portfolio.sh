#!/bin/bash

DOCKERFILE_NAME='Dockerfile'
IMAGE_NAME='portfolio'
CONTAINER_NAME='portfolio_app'
CONTAINER_NETWORK='portfolio_network'
ENV_FILE='.env'

cat  > ${DOCKERFILE_NAME} << EOF

# Build stage
FROM python:3.14-slim AS builder

RUN mkdir -p /portfolio/app
WORKDIR /portfolio/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt /portfolio/app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.14-slim AS final

RUN useradd -m -r appuser && \
    mkdir -p /portfolio/app && \
    chown -R appuser:appuser /portfolio

WORKDIR /portfolio/app

COPY --from=builder /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --chown=appuser:appuser . .

USER appuser
EXPOSE 8000

CMD sh -c "python manage.py migrate --noinput && \
           python manage.py collectstatic --noinput && \
           gunicorn --bind 0.0.0.0:8000 --workers 3 project_portfolio.wsgi:application"

EOF

#docker tag ${IMAGE_NAME} ${IMAGE_NAME}:latest
#docker push ${IMAGE_NAME}:latest

docker network create ${CONTAINER_NETWORK} 

docker build -t ${IMAGE_NAME} -f ${DOCKERFILE_NAME} .

docker run --name ${CONTAINER_NAME} -d --restart unless-stopped \
    --env-file ${ENV_FILE} \
    -p 8000:8000 \
    --network ${CONTAINER_NETWORK} \
    ${IMAGE_NAME}

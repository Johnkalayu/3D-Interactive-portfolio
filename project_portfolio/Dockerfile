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

RUN useradd -m -r john && \
    mkdir -p /portfolio/app && \
    chown -R john:john /portfolio

WORKDIR /portfolio/app

COPY --from=builder /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --chown=john:john . .

# Collect static files
RUN python manage.py collectstatic --noinput

USER john
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "project_portfolio.wsgi:application"]

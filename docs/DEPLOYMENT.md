# Deployment Strategy

## Production Requirements
- Nginx / Caddy reverse proxy with HTTP/2 and TLS termination.
- PHP-FPM 8.3 configured with OPcache enabled.
- MySQL 8.0+ with optimized connection pooling.
- Redis server for cache, rate limiting, and queue jobs.
- Background worker processes via Supervisor / systemd for playlist & EPG ingestion queues.

## Containerization
Dockerfiles and Docker Compose manifests are organized inside `infrastructure/docker/` supporting both local development and staging/production deployments.

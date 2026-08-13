#!/usr/bin/env bash
# Run daily via cron on the VPS (WBS Chapter 8) — `certbot renew` is safe to
# run this often, it only actually renews certs within 30 days of expiry.
# Reloading nginx unconditionally after is cheap and avoids needing to
# detect "did it actually renew" just to decide whether to reload.
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose -f infra/docker-compose.yml run --rm certbot renew --webroot -w /var/www/certbot --quiet
docker compose -f infra/docker-compose.yml exec -T nginx nginx -s reload

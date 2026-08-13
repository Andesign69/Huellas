#!/usr/bin/env bash
# Manual deploy script (WBS Chapter 7 — deploy method chosen: manual/SSH,
# not CI). Run this ON the VPS, from anywhere, after a git pull is wanted:
#
#   ssh huellas-vps
#   /srv/huellas/app/infra/deploy.sh
#
# Assumes infra/.env already exists on the VPS with real secrets (copy from
# infra/.env.example once, never committed — see docs/deploy.md).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull

echo "==> docker compose build + up"
docker compose -f infra/docker-compose.yml --env-file infra/.env up --build -d

echo "==> pruning old images"
docker image prune -f

echo "==> status"
docker compose -f infra/docker-compose.yml ps

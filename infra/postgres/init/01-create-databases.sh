#!/bin/bash
# Runs once, only when the Postgres data directory is first initialized —
# not on every `docker compose up`. POSTGRES_DB (set in docker-compose.yml)
# becomes the prod database automatically; this just adds staging's.
set -euo pipefail

# --dbname explícito: sin esto psql intenta conectar a una base con el
# mismo nombre que POSTGRES_USER (no $POSTGRES_DB) y falla si no existe
# — confirmado corriendo esto antes de fijarlo. "postgres" es la DB de
# mantenimiento que siempre existe, y toca estar conectado a otra DB para
# poder crear una nueva de todos modos.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
    CREATE DATABASE huellas_staging;
EOSQL

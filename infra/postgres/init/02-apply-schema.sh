#!/bin/bash
# Runs once, right after 01-create-databases.sh, same first-init-only caveat.
# schema.sql is mounted to /schema.sql (NOT inside /docker-entrypoint-initdb.d/
# — anything in that directory gets auto-executed by the Postgres entrypoint,
# and running schema.sql that way would skip the :approle variable entirely).
#
# Later schema changes need a manual re-apply (docs/deploy.md) — this project
# has no migration tooling, deliberately, given its current scale.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d huellas_prod \
  -v approle="$HUELLAS_APP_ROLE_PROD" \
  -f /schema.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d huellas_staging \
  -v approle="$HUELLAS_APP_ROLE_STAGING" \
  -f /schema.sql

# --dbname postgres explícito acá también (ver el comentario en
# 01-create-databases.sh) — ALTER ROLE es cluster-wide, la DB conectada no
# importa funcionalmente, pero psql igual necesita una que exista.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c \
  "ALTER ROLE ${HUELLAS_APP_ROLE_PROD} WITH PASSWORD '${HUELLAS_APP_PASSWORD_PROD}';"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c \
  "ALTER ROLE ${HUELLAS_APP_ROLE_STAGING} WITH PASSWORD '${HUELLAS_APP_PASSWORD_STAGING}';"

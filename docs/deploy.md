# Deploy runbook

## Database connection

The app connects to Postgres via a role dedicated to it (not the table owner — see the comment at the top of `supabase/schema.sql`), through a single `DATABASE_URL` env var, standard `postgres://user:password@host:port/dbname` form.

| Environment | Where Postgres runs | Role | Notes |
|---|---|---|---|
| Local dev | `docker-compose.dev.yml` at repo root, `127.0.0.1:5432` | `huellas_app` | `docker compose -f docker-compose.dev.yml up -d`, then apply the schema (see below) and set the role's password once. Copy `.env.local.example` to `.env.local` and fill in `DATABASE_URL`. |
| Staging (VPS) | `infra/docker-compose.yml`, one Postgres instance, `huellas_staging` database | `huellas_app_staging` | Own database **and** own role/password — see "Why separate roles" below. |
| Production (VPS) | Same Postgres instance, `huellas_prod` database | `huellas_app_prod` | Same isolation as staging. |

Postgres never gets a port published to the VPS's public interface — only reachable on the internal Docker Compose network, from the app containers. Verified after every deploy: `nc -zv <vps-ip> 5432` times out from outside the VPS.

### Applying the schema

`supabase/schema.sql` takes the app role's name as a psql variable, not hardcoded — this is what makes prod/staging isolation real instead of cosmetic:

```
psql -v approle=huellas_app -f supabase/schema.sql              # local dev
psql -v approle=huellas_app_prod -f supabase/schema.sql          # prod
psql -v approle=huellas_app_staging -f supabase/schema.sql       # staging
```

On the VPS this happens automatically, once, the first time the Postgres container starts (`infra/postgres/init/`) — not on every deploy. Schema changes after that first run need a manual re-apply; there's no migration tooling here, deliberately, given the project's current scale.

### Why separate roles per environment, not just separate databases

A shared role+password across `huellas_prod` and `huellas_staging` would mean a leaked staging credential also grants prod access — Postgres permissions are per-database, but a login role's password is cluster-wide. Verified directly while building this: connecting as `huellas_app_staging` to the `prod`-equivalent database returns `permission denied`, confirmed with real distinct passwords, not just distinct usernames.

## Other env vars

`NEXT_PUBLIC_MAPTILER_KEY` — baked into the client bundle at **build** time (all `NEXT_PUBLIC_*` vars are), not read at runtime like `DATABASE_URL`. This is why prod and staging can share one built Docker image (`infra/docker-compose.yml` builds `huellas-app:latest` once, both services reference it) — only their runtime env vars (`DATABASE_URL`, `UPLOADS_DIR`) differ.

## Running locally

```
docker compose -f docker-compose.dev.yml up -d   # start local Postgres
npm run dev                                       # start Next.js
```

## Photo storage

`UPLOADS_DIR` — local dev uses a gitignored folder (`./.data/uploads` by default), served by `src/app/photos/[...path]/route.ts` since there's no nginx locally. Prod/staging use `/srv/huellas/uploads/{prod,staging}` on the VPS, served directly by nginx (`infra/nginx/default.conf`) — same URL shape (`/photos/<uuid>.<ext>`) in every environment, so the client never needs environment-specific logic.

**Bind-mount ownership matters**: the app container runs as an unprivileged `nextjs` user (uid 1001, set in `infra/Dockerfile`), not root. The host upload directories must be owned by that same uid or every upload fails with `EACCES` — hit this for real deploying to the VPS the first time. Fixed once with `sudo chown -R 1001:1001 /srv/huellas/uploads`; only needs doing once per host, not per deploy.

## Containerization (WBS Chapter 7)

- `infra/Dockerfile` — multi-stage build using Next.js `output: "standalone"` (set in `next.config.ts`) for a lean runtime image (~43MB standalone output before the Alpine/Node base layers).
- `infra/docker-compose.yml` — `postgres` (no published port), `app-prod`, `app-staging` (share one built image), `nginx` (the only service with published ports, 80/443).
- `infra/nginx/default.conf` — reverse proxy + direct `/photos/` static serving, routed by hostname (see Domains & TLS below).
- `infra/.env` (never committed — copy from `infra/.env.example`) holds `POSTGRES_PASSWORD`, `HUELLAS_APP_PASSWORD_PROD`, `HUELLAS_APP_PASSWORD_STAGING`. **Generate these with `openssl rand -hex 24`, not `-base64`** — base64 output can contain `/`, `+`, `=`, and an unescaped `/` in a password breaks `DATABASE_URL` parsing (it reads as a path separator). Hit this for real on first deploy: `app-prod` came up `unhealthy` because its generated password happened to contain a `/`; `app-staging`'s didn't, so only one broke — confusing to debug without knowing to look there.

## Deploying

Deploy method (WBS Chapter 7 decision): manual, not CI — run `infra/deploy.sh` on the VPS by hand when there's something new to ship:

```
ssh huellas-vps
/srv/huellas/app/infra/deploy.sh
```

The script: `git pull`, `docker compose -f infra/docker-compose.yml --env-file infra/.env up --build -d`, prune dangling images, print status. Revisit this (GitHub Actions, etc.) only if manual deploys become a real bottleneck — not needed at current scale.

## Domains & TLS (WBS Chapter 8)

| Domain | Environment | DNS |
|---|---|---|
| `rastreahuellas.com` | Production | A record → VPS IP, Hetzner DNS |
| `staging.rastreahuellas.com` | Staging | A record → same VPS IP |

Both hostnames hit the same nginx, on the same VPS — routing is by `Host` header via nginx `map` directives in `infra/nginx/default.conf` (`$app_upstream` picks `app-prod` vs `app-staging`, `$uploads_env` picks which `/photos/` directory to serve from). Requires `resolver 127.0.0.11 valid=30s;` — Docker's embedded DNS — because `proxy_pass` with a variable (as opposed to a literal upstream name) resolves at request time, not at nginx startup.

**One certificate covers both domains** (SAN, obtained via `certbot certonly -d rastreahuellas.com -d staging.rastreahuellas.com`) — simpler than two separate certs since it's one nginx `server` block either way. Certbot names the cert directory after the first domain listed (`/etc/letsencrypt/live/rastreahuellas.com/`), even though it also covers staging.

**Getting a cert on a fresh host** — nginx can't start a `listen 443 ssl` block pointing at cert files that don't exist yet, so this is inherently two-step:
1. Deploy nginx with only the HTTP (port 80) server block — proxies normally, plus serves `/.well-known/acme-challenge/` from a webroot volume shared with the `certbot` service.
2. Run certbot against that running HTTP server, **with `--staging` first** to test the whole flow without touching Let's Encrypt's real rate limits:
   ```
   docker compose -f infra/docker-compose.yml run --rm certbot certonly --webroot -w /var/www/certbot \
     --staging -d rastreahuellas.com -d staging.rastreahuellas.com \
     --email <email> --agree-tos --no-eff-email
   ```
   Once that succeeds, delete the fake staging cert (`certbot delete --cert-name rastreahuellas.com`) and rerun without `--staging` for the real one.
3. Switch nginx to the final config: HTTPS server block with the real certs, HTTP now redirects to HTTPS (except the ACME challenge path, kept alive for renewals).

**Renewal**: `infra/renew-certs.sh` (`certbot renew` + unconditional `nginx -s reload` — cheap enough to not bother detecting whether a renewal actually happened) runs daily via host cron (`0 3 * * *`, logs to `/var/log/huellas-cert-renew.log`) — not inside Compose, since there's no clean way for a renewal container to signal nginx to reload across separate containers without more moving parts than this needs. Let's Encrypt certs are valid 90 days; `certbot renew` only actually renews within 30 days of expiry, so daily is safe to run unconditionally.

## Not yet done

Monitoring and the final launch QA pass — WBS Chapter 9.

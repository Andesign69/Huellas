# Deploy runbook

## Database connection

The app connects to Postgres as the `huellas_app` role (see `supabase/schema.sql` — not the table owner, deliberately unprivileged beyond what its grants/RLS policies allow; the owner/admin role is only used to apply the schema itself). Connection is a single `DATABASE_URL` env var, standard `postgres://user:password@host:port/dbname` form.

| Environment | Where Postgres runs | Notes |
|---|---|---|
| Local dev | `docker-compose.dev.yml` at repo root, `127.0.0.1:5432` | `docker compose -f docker-compose.dev.yml up -d`, then apply `supabase/schema.sql` and set `huellas_app`'s password once (`ALTER ROLE huellas_app WITH PASSWORD '...'`) — see the comment at the top of that file. Copy `.env.local.example` to `.env.local` and fill in `DATABASE_URL`. |
| Staging (VPS) | Same Postgres instance as prod, separate database | Not yet provisioned — lands in WBS Chapter 7/8. Isolated database + own `DATABASE_URL`, so staging writes can never reach prod data. |
| Production (VPS) | `rastreahuellas.com` | Not yet provisioned — lands in WBS Chapter 7/8. |

Postgres itself must never have a port published to the VPS's public interface in either staging or prod — only reachable on the internal Docker Compose network from the app containers (locked in at WBS Chapter 7 after the Chapter 1 gate's connection review).

## Other env vars

`NEXT_PUBLIC_MAPTILER_KEY` — unrelated to the backend migration, unchanged. See `.env.local.example` for the full current list; `NEXT_PUBLIC_SUPABASE_*` are retired in WBS Chapter 6 (Client Repointing) once nothing calls Supabase anymore.

## Running locally

```
docker compose -f docker-compose.dev.yml up -d   # start local Postgres
npm run dev                                       # start Next.js
```

## Everything else (containerization, staging/prod domains, actual deploy method)

Not yet decided/built — filled in as WBS Chapters 6–8 land (`Reference Files/Refactor/WBS.md`, gitignored planning doc). Deploy method itself (manual SSH script vs. GitHub Actions vs. image pipeline) is an open decision — see Refactor Plan §2.5.

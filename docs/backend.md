# Backend API reference

Route handlers under `src/app/api/**` — the backend layer introduced to replace direct client→Supabase calls (see `docs/adr/0001-vps-migration.md`). Only these routes talk to Postgres; the database itself has no public-facing port.

Error responses are always `{ "error": string }`. For `submit_report`/`resolve_report` failures, that message is the exact text the Postgres function raised (already user-facing Spanish, meant to be shown as-is — matches how the client already displayed `rpcError.message` against Supabase).

## `GET /api/health`

Pings Postgres. `{ "status": "ok" }` (200) or `{ "status": "error" }` (503). No auth, used by Docker healthchecks and uptime monitoring.

## `GET /api/reports`

List unresolved reports, newest first. Optional `?limit=N` (1–100) — the home page caps at 6, `/mapa` fetches all. Returns `PetReport[]`.

## `POST /api/reports`

Creates a report via `submit_report()`. Body: `{ name?, species, breed?, sex?, status, photo_url?, lat, lng, city, description?, contact, honeypot?, form_loaded_at? }`. Returns `{ id, resolve_token }` (201) — the token is shown once, the client is responsible for persisting it (currently `localStorage`, unchanged).

Anti-spam (unchanged from the original Postgres function, verified working through this path): honeypot field must be empty, submission must be ≥3s after `form_loaded_at`, max 6 submissions per IP per 20 minutes.

**Important**: rate limiting is per-IP, derived from the `X-Forwarded-For` header read by this route (`src/lib/request-ip.ts`) and passed explicitly to `submit_report(..., p_ip)`. This replaced a Supabase/PostgREST-specific mechanism (`current_setting('request.headers')`) that has no equivalent here — see the comment in `supabase/schema.sql` above `submit_report`. **This only works correctly if the app is never reachable except through nginx** (WBS Chapter 7) — otherwise a client could set `X-Forwarded-For` itself and spoof any IP, defeating the rate limit entirely.

## `GET /api/reports/[id]`

Single report by id. 404 `{ error: "Este reporte ya no existe." }` if missing/deleted.

## `POST /api/reports/[id]/resolve`

Body: `{ token }` — the one-time token returned by `POST /api/reports`. Calls `resolve_report()`; wrong/missing token returns 400 with the function's rejection message. Returns `{ resolved: true }` on success.

## `GET /api/shelters`

List shelters, ordered by city.

## `POST /api/upload`

`multipart/form-data`, field name `photo`. Validates the **real** file type via magic bytes (`src/lib/sniff-image.ts` — jpg/png/webp), not the client's declared `Content-Type`, which is untrusted input. Hard 8MB cap. Returns `{ url: "/photos/<uuid>.<ext>" }` (201).

Photos are served at `/photos/<filename>`, identically in every environment:
- **Prod/staging**: nginx serves the file directly from `/srv/huellas/uploads/{env}/`, bypassing the app entirely (draft config in `infra/nginx/photos.conf.draft`, wired up in WBS Chapter 7).
- **Local dev**: `src/app/photos/[...path]/route.ts` serves the same path from `UPLOADS_DIR` (default `./.data/uploads`, gitignored), since there's no nginx locally. Filenames are validated against a strict `<uuid>.<jpg|png|webp>` pattern — anything else 404s outright rather than attempting to sanitize it.

Same-shape URL in every environment means the client never needs to know which one actually served a given request.

## `POST /api/reports/[id]/flag`

Body: `{ reason?, honeypot?, form_loaded_at? }`. Calls `flag_report()` — same honeypot/timing/rate-limit protection as `submit_report`, added in WBS Chapter 5 (previously this insert had none, inconsistent with the rest of the app). Returns `{ flagged: true }` (201).

## `POST /api/shelters/suggest`

Body: `{ name, city, contact, website?, notes?, honeypot?, form_loaded_at? }`. Calls `suggest_shelter()`, same protection pattern. Returns `{ suggested: true }` (201).

**Rate-limit buckets are independent per action.** `report_rate_limits` gained an `action` column (`submit_report` / `flag_report` / `suggest_shelter`) so these three don't share one counter — someone hitting the flag rate limit can still submit a report or suggest a shelter in the same 20-minute window. Verified directly: 6 flags from one IP succeed and a 7th is rejected, while that same IP immediately succeeds at both a report submission and a shelter suggestion.

**Not yet done** (both routes accept `honeypot`/`form_loaded_at` today, but nothing sends them): the actual hidden honeypot field and form-load timestamp capture need to be added to the `/refugios/sugerir` form and the flag form in `/mascota/[id]` — that's part of WBS Chapter 6 (Client Repointing), when those pages get rewired to call these routes instead of Supabase directly.

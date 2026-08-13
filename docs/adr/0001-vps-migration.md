# ADR-0001: Move from Supabase + Vercel to a self-hosted VPS

## Status

Accepted — 2026-08-12

## Context

Huellas launched as an internal MVP on Supabase (Postgres + Storage) and Vercel (hosting), with no backend of its own: the browser talks directly to Supabase's auto-generated REST/RPC layer (PostgREST) using a public anon key, and all sensitive logic (anti-spam, rate limiting, one-time resolve tokens) lives in Postgres `security definer` functions instead of a server.

That architecture was the right call for a fast MVP under emergency-response time pressure, but it has real limits going into a more durable, cost-conscious deployment:
- Ongoing cost and control: a dedicated VPS (Hetzner CX33 — 4 vCPU, 8GB RAM, 80GB NVMe) is available and budget-appropriate; Supabase/Vercel's free tiers carry usage ceilings and no guarantee of staying free as traffic grows.
- No real production data exists yet, so this is a from-scratch infra build rather than a live migration with cutover risk.
- The project needs a staging environment with data fully isolated from production, which is simpler to guarantee when both databases are ours to configure directly.

## Decision

Move the database (self-hosted Postgres), hosting (containerized Next.js), and photo storage (VPS disk, served by nginx) onto a single Hetzner VPS, orchestrated with Docker Compose. Full target architecture is in `Reference Files/Refactor/Refactor Plan.md` (internal planning doc, not shipped); this ADR records the *decision and its consequences*, not the full working plan.

The most consequential downstream effect: **a self-hosted Postgres instance has no PostgREST equivalent and should not be reachable from the public internet.** So for the first time, this app needs a real backend layer — Next.js Route Handlers under `src/app/api/**` — sitting between the browser and Postgres. This is not a rewrite of the existing anti-spam/rate-limit/token logic: `submit_report()` and `resolve_report()` remain Postgres functions, just called by trusted server-side code instead of the browser. RLS becomes defense-in-depth rather than the only security boundary, since the database itself is no longer publicly reachable.

Backups: Hetzner's daily automated VPS backup (a paid add-on) was chosen over a self-managed `pg_dump`/rclone job. It's a whole-server block-level snapshot, crash-consistent for Postgres (WAL-based crash recovery handles it the same way it handles an unexpected power loss), and covers the photo uploads directory in the same snapshot since both live on the same disk. Tradeoff accepted: no point-in-time recovery, and restoring rolls back the entire server, not a single table or file — judged acceptable for current low-traffic, no-real-data-yet risk profile.

## Consequences

**Gained:**
- Full control over infra and cost, no vendor usage ceilings.
- A real backend layer, which also becomes the natural place to close existing gaps (e.g. anti-spam protection missing on `report_flags`/`shelter_suggestions` inserts — tracked in WBS Chapter 5).
- Clean prod/staging isolation (separate databases, separate upload directories, separate domains).

**Given up / now owned by us instead of a vendor:**
- Supabase's Table Editor (the moderation workflow for flagged reports and shelter suggestions loses its GUI — options and interim plan are in Refactor Plan §2.6).
- Vercel's zero-config auto-deploy on push (replaced by a deploy method decided in WBS Chapter 7).
- Managed backup/uptime SLA (replaced by Hetzner's backup product + self-hosted monitoring, WBS Chapter 9).
- All of `src/app/api/**` is new code that didn't exist before, and is new attack surface requiring the same care already shown in the existing `submit_report` anti-spam design (especially the new photo upload endpoint, which accepts arbitrary file uploads for the first time).

Full execution tracking lives in `Reference Files/Refactor/WBS.md` (gitignored planning doc, not shipped with this repo).

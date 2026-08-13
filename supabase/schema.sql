-- Huellas: esquema de datos.
-- Self-hosted Postgres (migrated off Supabase — see docs/adr/0001-vps-migration.md).
--
-- Only the Next.js backend connects to this database now; there is no more
-- direct client access via PostgREST/anon key. Access control is therefore
-- two layers, not one: the Next.js API layer is the primary boundary, and
-- the app role below (used by that backend, NOT the table owner) is kept
-- deliberately unprivileged beyond what these grants/policies allow — real
-- defense-in-depth, not vestigial, in case a route handler bug ever lets a
-- query through it shouldn't.
--
-- The role name is a psql variable, not hardcoded — prod and staging get
-- genuinely separate roles (and therefore separate passwords), not just
-- separate databases. Sharing one role+password across environments would
-- mean a leaked staging credential also grants prod access. Run this file
-- as the owning/admin role, passing the role name explicitly:
--
--   psql -v approle=huellas_app_prod -f schema.sql        # prod
--   psql -v approle=huellas_app_staging -f schema.sql     # staging
--   psql -v approle=huellas_app -f schema.sql             # local dev
--
-- Set that role's password separately after (ALTER ROLE ... WITH PASSWORD
-- ...) — deliberately not stored in this file, which is committed to git.

create extension if not exists pgcrypto;

-- No usamos un bloque do $$ ... $$ acá a propósito: psql NO sustituye
-- variables (:approle) dentro de cuerpos con dollar-quoting, así que
-- :approle quedaría como texto literal en vez de interpolarse. \gexec sí
-- interpola normalmente porque es SQL de nivel superior.
select format('create role %I with login', :'approle')
where not exists (select from pg_roles where rolname = :'approle')
\gexec

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  name text,
  species text not null check (species in ('perro', 'gato', 'otro')),
  breed text,
  sex text check (sex in ('macho', 'hembra')),
  status text not null check (status in ('perdido', 'encontrado', 'en_refugio')) default 'perdido',
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  city text not null,
  description text,
  contact text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Migración incremental para proyectos que ya corrieron este script antes
-- de que existieran name/breed/sex (no-op si la tabla se crea desde cero):
alter table public.reports add column if not exists name text;
alter table public.reports add column if not exists breed text;
alter table public.reports add column if not exists sex text check (sex in ('macho', 'hembra'));

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_city_idx on public.reports (city);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;
grant select on public.reports to :approle;

create policy "reports_public_select" on public.reports
  for select using (true);

-- Ya no hay INSERT directo a "reports" desde el cliente (ver Fase 2 más
-- abajo): la única puerta de entrada es la función submit_report(), que
-- aplica rate limiting y un honeypot antes de insertar.

-- Marcar como resuelto YA NO es un UPDATE abierto: cualquiera podía cerrar
-- el reporte de cualquier otra persona sin verificación. Ahora solo se
-- puede a través de resolve_report() (más abajo), que exige el token
-- secreto que se entrega al crear el reporte y se guarda en el navegador
-- de quien lo publicó.
revoke update (resolved) on public.reports from :approle;
revoke update on public.reports from :approle;
drop policy if exists "reports_public_resolve" on public.reports;

-- Si ya corriste una versión anterior de este script, límpiala antes de
-- que la función submit_report() se vuelva el único camino de inserción:
drop policy if exists "reports_public_insert" on public.reports;
revoke insert on public.reports from :approle;

-- ============================================================
-- Fase 2 — rate limiting y anti-spam para nuevos reportes
-- ============================================================

-- Registro de intentos por IP (hasheada, nunca se guarda la IP real).
-- Nadie tiene acceso directo a esta tabla; solo las funciones de abajo,
-- que corren con privilegios elevados (security definer). "action" separa
-- los contadores por tipo de acción (submit_report, flag_report,
-- suggest_shelter) para que no compartan el mismo límite de 6/20min —
-- publicar reportes y marcar contenido inapropiado son cosas distintas.
create table if not exists public.report_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  action text not null default 'submit_report',
  created_at timestamptz not null default now()
);

alter table public.report_rate_limits add column if not exists action text not null default 'submit_report';

create index if not exists report_rate_limits_ip_idx
  on public.report_rate_limits (ip_hash, action, created_at);

alter table public.report_rate_limits enable row level security;
-- Sin policies ni grants: cerrada por completo al rol de la app.

-- Token secreto de cada reporte: solo quien lo creó lo tiene (se lo
-- devuelve submit_report() y el navegador lo guarda en localStorage).
-- Es la única forma de marcar ese reporte como resuelto. Cerrada por
-- completo al rol de la app: nadie puede leerla directamente.
create table if not exists public.report_tokens (
  report_id uuid primary key references public.reports (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now()
);

alter table public.report_tokens enable row level security;

-- Única forma de crear un reporte. Corre con los privilegios del dueño de
-- la función (security definer), así que puede leer/escribir report_rate_limits
-- y reports aunque el que llama (el rol de la app) no tenga permiso directo sobre esas
-- tablas. Rechaza envíos con el campo trampa (honeypot) lleno, envíos
-- sospechosamente rápidos, y más de 6 reportes por IP en 20 minutos.
-- Devuelve el id del reporte y un token secreto de una sola vez: es lo
-- único que permite luego marcarlo como resuelto (ver resolve_report()).
--
-- p_ip: bajo Supabase/PostgREST esto se leía de current_setting('request.headers'),
-- una variable de sesión que PostgREST inyectaba por cada request. Ya no existe
-- ese intermediario — el backend (Next.js) es quien lee X-Forwarded-For de la
-- request real y lo pasa explícito aquí. Ver src/lib/request-ip.ts.
create or replace function public.submit_report(
  p_name text,
  p_species text,
  p_breed text,
  p_sex text,
  p_status text,
  p_photo_url text,
  p_lat double precision,
  p_lng double precision,
  p_city text,
  p_description text,
  p_contact text,
  p_honeypot text default null,
  p_form_loaded_at timestamptz default null,
  p_ip text default null
) returns table (id uuid, resolve_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ip text;
  v_ip_hash text;
  v_recent_count int;
  v_new_id uuid;
  v_token text;
begin
  if p_honeypot is not null and length(trim(p_honeypot)) > 0 then
    raise exception 'Solicitud inválida.';
  end if;

  if p_form_loaded_at is not null and now() - p_form_loaded_at < interval '3 seconds' then
    raise exception 'Solicitud inválida.';
  end if;

  v_ip := coalesce(nullif(trim(p_ip), ''), 'unknown');
  v_ip_hash := encode(digest(v_ip, 'sha256'), 'hex');

  select count(*) into v_recent_count
  from public.report_rate_limits
  where ip_hash = v_ip_hash
    and action = 'submit_report'
    and created_at > now() - interval '20 minutes';

  if v_recent_count >= 6 then
    raise exception 'Estás publicando reportes muy seguido. Espera unos minutos e intenta de nuevo.';
  end if;

  insert into public.report_rate_limits (ip_hash, action) values (v_ip_hash, 'submit_report');

  insert into public.reports (
    name, species, breed, sex, status, photo_url, lat, lng, city, description, contact
  ) values (
    p_name, p_species, p_breed, p_sex, p_status, p_photo_url, p_lat, p_lng, p_city, p_description, p_contact
  )
  returning reports.id into v_new_id;

  v_token := encode(gen_random_bytes(16), 'hex');
  insert into public.report_tokens (report_id, token) values (v_new_id, v_token);

  return query select v_new_id, v_token;
end;
$$;

grant execute on function public.submit_report(
  text, text, text, text, text, text, double precision, double precision, text, text, text, text, timestamptz, text
) to :approle;

-- Única forma de marcar un reporte como resuelto: exige el token que
-- solo tiene el navegador que lo creó. Devuelve true si funcionó.
create or replace function public.resolve_report(
  p_report_id uuid,
  p_token text
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_match boolean;
begin
  select exists (
    select 1 from public.report_tokens
    where report_id = p_report_id and token = p_token
  ) into v_match;

  if not v_match then
    raise exception 'No tienes permiso para marcar este reporte como resuelto.';
  end if;

  update public.reports set resolved = true where id = p_report_id;

  return true;
end;
$$;

grant execute on function public.resolve_report(uuid, text) to :approle;

-- "Reportar contenido": cualquiera puede marcar un reporte para revisión.
-- Sin lectura pública; se revisa manualmente (ver docs/backend.md — por ahora
-- vía psql directo, WBS Chapter 5 dejó pendiente elegir una herramienta
-- de moderación definitiva).
create table if not exists public.report_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.report_flags enable row level security;
-- Sin policies ni grants directos: cerrada por completo al rol de la app, igual
-- que reports — la única puerta de entrada es flag_report() (abajo), con la
-- misma protección honeypot/timing/rate-limit que submit_report().

-- Única forma de marcar un reporte para revisión. Antes de este chapter
-- (WBS Chapter 5) este insert no tenía ninguna protección, a diferencia de
-- submit_report() — cerrada esa brecha aquí.
create or replace function public.flag_report(
  p_report_id uuid,
  p_reason text default null,
  p_honeypot text default null,
  p_form_loaded_at timestamptz default null,
  p_ip text default null
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ip text;
  v_ip_hash text;
  v_recent_count int;
begin
  if p_honeypot is not null and length(trim(p_honeypot)) > 0 then
    raise exception 'Solicitud inválida.';
  end if;

  if p_form_loaded_at is not null and now() - p_form_loaded_at < interval '3 seconds' then
    raise exception 'Solicitud inválida.';
  end if;

  v_ip := coalesce(nullif(trim(p_ip), ''), 'unknown');
  v_ip_hash := encode(digest(v_ip, 'sha256'), 'hex');

  select count(*) into v_recent_count
  from public.report_rate_limits
  where ip_hash = v_ip_hash
    and action = 'flag_report'
    and created_at > now() - interval '20 minutes';

  if v_recent_count >= 6 then
    raise exception 'Estás enviando reportes de contenido muy seguido. Espera unos minutos e intenta de nuevo.';
  end if;

  insert into public.report_rate_limits (ip_hash, action) values (v_ip_hash, 'flag_report');

  insert into public.report_flags (report_id, reason) values (p_report_id, p_reason);
end;
$$;

grant execute on function public.flag_report(uuid, text, text, timestamptz, text) to :approle;

create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  zone text,
  address text,
  contact text,
  website text,
  lat double precision,
  lng double precision,
  is_exact_location boolean not null default false,
  notes text
);

-- Migración incremental para proyectos que ya corrieron este script:
alter table public.shelters add column if not exists address text;
alter table public.shelters add column if not exists website text;
alter table public.shelters add column if not exists is_exact_location boolean not null default false;

alter table public.shelters enable row level security;
grant select on public.shelters to :approle;

create policy "shelters_public_select" on public.shelters
  for select using (true);

-- Fotos: ya no viven en Postgres/Supabase Storage. Se sirven desde disco en
-- el VPS via el endpoint POST /api/upload + nginx — ver docs/adr/0001-vps-migration.md
-- y Reference Files/Refactor/Refactor Plan.md §2.3.

-- Fundaciones y refugios ya identificados (Fase 3, se completa con ubicación después).
insert into public.shelters (name, city, notes, website) values
  ('Siempre a tu Lado', 'Pereira', 'Fundación de rescate animal', 'https://www.instagram.com/siempreatulado_albergue/'),
  ('Kenovy', 'Armenia', 'Fundación de rescate animal', 'https://www.instagram.com/fundacionkenovycolombia'),
  ('Ángeles de la Calle', 'Manizales', 'Fundación de rescate animal', 'https://www.instagram.com/angelesdelacallemanizales')
on conflict do nothing;

insert into public.shelters (name, city, notes, address) values
  ('Centro de Bienestar Animal de Cali', 'Cali', 'Centro oficial de bienestar animal', 'Cra. 56 #7oeste-445, Guadalupe, Cali, Valle del Cauca')
on conflict do nothing;

-- Coordenadas para pinear los refugios en el mapa. Centro de Bienestar
-- Animal de Cali tiene dirección real (geocodificada con OpenStreetMap
-- Nominatim); los demás solo tienen ciudad, así que se ubican en el
-- centro de su ciudad y quedan marcados como aproximados (is_exact_location
-- = false) para no sugerir que ese es el punto exacto.
update public.shelters set lat = 3.4100192, lng = -76.5621338, is_exact_location = true
  where name = 'Centro de Bienestar Animal de Cali';
update public.shelters set lat = 4.8133, lng = -75.6961, is_exact_location = false
  where name = 'Siempre a tu Lado';
update public.shelters set lat = 4.5339, lng = -75.6811, is_exact_location = false
  where name = 'Kenovy';
update public.shelters set lat = 5.0689, lng = -75.5174, is_exact_location = false
  where name = 'Ángeles de la Calle';

-- Solicitudes ciudadanas para agregar un nuevo refugio a la lista (Fase 3).
-- Nadie puede leerlas por la API pública (ver /refugios/sugerir); quien
-- administre el proyecto las revisa manualmente antes de agregarlas a
-- "shelters" a mano (misma nota que report_flags arriba sobre moderación).
create table if not exists public.shelter_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  contact text not null,
  website text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.shelter_suggestions enable row level security;
-- Sin policies ni grants directos: misma razón que report_flags — la única
-- puerta de entrada es suggest_shelter() (abajo).

-- Única forma de sugerir un refugio. Antes de este chapter (WBS Chapter 5)
-- este insert no tenía ninguna protección, a diferencia de submit_report().
create or replace function public.suggest_shelter(
  p_name text,
  p_city text,
  p_contact text,
  p_website text default null,
  p_notes text default null,
  p_honeypot text default null,
  p_form_loaded_at timestamptz default null,
  p_ip text default null
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ip text;
  v_ip_hash text;
  v_recent_count int;
begin
  if p_honeypot is not null and length(trim(p_honeypot)) > 0 then
    raise exception 'Solicitud inválida.';
  end if;

  if p_form_loaded_at is not null and now() - p_form_loaded_at < interval '3 seconds' then
    raise exception 'Solicitud inválida.';
  end if;

  v_ip := coalesce(nullif(trim(p_ip), ''), 'unknown');
  v_ip_hash := encode(digest(v_ip, 'sha256'), 'hex');

  select count(*) into v_recent_count
  from public.report_rate_limits
  where ip_hash = v_ip_hash
    and action = 'suggest_shelter'
    and created_at > now() - interval '20 minutes';

  if v_recent_count >= 6 then
    raise exception 'Estás enviando solicitudes muy seguido. Espera unos minutos e intenta de nuevo.';
  end if;

  insert into public.report_rate_limits (ip_hash, action) values (v_ip_hash, 'suggest_shelter');

  insert into public.shelter_suggestions (name, city, contact, website, notes)
  values (p_name, p_city, p_contact, p_website, p_notes);
end;
$$;

grant execute on function public.suggest_shelter(text, text, text, text, text, text, timestamptz, text) to :approle;

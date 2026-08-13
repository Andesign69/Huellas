-- Huellas: esquema de datos.
-- Correr en el SQL Editor del proyecto de Supabase (Database > SQL Editor).
--
-- Asume que "Automatically expose new tables" está DESACTIVADO en
-- Project Settings > Data API (recomendación de Supabase). Por eso este
-- script otorga permisos a las tablas explícitamente en vez de depender
-- de ese toggle; el acceso real a filas lo siguen controlando las
-- políticas de RLS de abajo.

create extension if not exists pgcrypto;

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
grant select on public.reports to anon, authenticated;

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
revoke update (resolved) on public.reports from anon, authenticated;
revoke update on public.reports from anon, authenticated;
drop policy if exists "reports_public_resolve" on public.reports;

-- Si ya corriste una versión anterior de este script, límpiala antes de
-- que la función submit_report() se vuelva el único camino de inserción:
drop policy if exists "reports_public_insert" on public.reports;
revoke insert on public.reports from anon, authenticated;

-- ============================================================
-- Fase 2 — rate limiting y anti-spam para nuevos reportes
-- ============================================================

-- Registro de intentos por IP (hasheada, nunca se guarda la IP real).
-- Nadie tiene acceso directo a esta tabla; solo la función de abajo,
-- que corre con privilegios elevados (security definer).
create table if not exists public.report_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists report_rate_limits_ip_idx
  on public.report_rate_limits (ip_hash, created_at);

alter table public.report_rate_limits enable row level security;
-- Sin policies ni grants: cerrada por completo a anon/authenticated.

-- Token secreto de cada reporte: solo quien lo creó lo tiene (se lo
-- devuelve submit_report() y el navegador lo guarda en localStorage).
-- Es la única forma de marcar ese reporte como resuelto. Cerrada por
-- completo a anon/authenticated: nadie puede leerla directamente.
create table if not exists public.report_tokens (
  report_id uuid primary key references public.reports (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now()
);

alter table public.report_tokens enable row level security;

-- Debe ir antes de crear la nueva versión: create or replace no permite
-- cambiar el tipo de retorno de una función existente.
drop function if exists public.submit_report(
  text, text, text, text, text, text, double precision, double precision, text, text, text, text, timestamptz
);

-- Única forma de crear un reporte. Corre con los privilegios del dueño de
-- la función (security definer), así que puede leer/escribir report_rate_limits
-- y reports aunque el que llama (anon) no tenga permiso directo sobre esas
-- tablas. Rechaza envíos con el campo trampa (honeypot) lleno, envíos
-- sospechosamente rápidos, y más de 6 reportes por IP en 20 minutos.
-- Devuelve el id del reporte y un token secreto de una sola vez: es lo
-- único que permite luego marcarlo como resuelto (ver resolve_report()).
create function public.submit_report(
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
  p_form_loaded_at timestamptz default null
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

  v_ip := coalesce(
    nullif(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), ''),
    'unknown'
  );
  v_ip_hash := encode(digest(v_ip, 'sha256'), 'hex');

  select count(*) into v_recent_count
  from public.report_rate_limits
  where ip_hash = v_ip_hash
    and created_at > now() - interval '20 minutes';

  if v_recent_count >= 6 then
    raise exception 'Estás publicando reportes muy seguido. Espera unos minutos e intenta de nuevo.';
  end if;

  insert into public.report_rate_limits (ip_hash) values (v_ip_hash);

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
  text, text, text, text, text, text, double precision, double precision, text, text, text, text, timestamptz
) to anon, authenticated;

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

grant execute on function public.resolve_report(uuid, text) to anon, authenticated;

-- "Reportar contenido": cualquiera puede marcar un reporte para revisión.
-- Sin lectura pública; se revisa desde el Table Editor de Supabase.
create table if not exists public.report_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.report_flags enable row level security;
grant insert on public.report_flags to anon, authenticated;

create policy "report_flags_public_insert" on public.report_flags
  for insert with check (true);

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
grant select on public.shelters to anon, authenticated;

create policy "shelters_public_select" on public.shelters
  for select using (true);

-- Bucket de fotos. Si falla porque ya existe, ignorar.
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "pet_photos_public_insert" on storage.objects
  for insert with check (bucket_id = 'pet-photos');

create policy "pet_photos_public_select" on storage.objects
  for select using (bucket_id = 'pet-photos');

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
-- Nadie puede leerlas por la API pública; se revisan a mano desde el Table
-- Editor de Supabase (ver /refugios/sugerir) antes de agregarlas a "shelters".
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
grant insert on public.shelter_suggestions to anon, authenticated;

create policy "shelter_suggestions_public_insert" on public.shelter_suggestions
  for insert with check (true);

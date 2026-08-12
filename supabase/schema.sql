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
grant select, insert on public.reports to anon, authenticated;

create policy "reports_public_select" on public.reports
  for select using (true);

create policy "reports_public_insert" on public.reports
  for insert with check (true);

-- Fase 2 (moderación) agregará una policy de update/delete más estricta;
-- por ahora cualquiera puede publicar, que es el punto de un reporte ciudadano abierto.

create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  zone text,
  contact text,
  lat double precision,
  lng double precision,
  notes text
);

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
insert into public.shelters (name, city, notes) values
  ('Siempre a tu Lado', 'Pereira', 'Fundación de rescate animal'),
  ('Kenovy', 'Armenia', 'Fundación de rescate animal'),
  ('Ángeles de la Calle', 'Manizales', 'Fundación de rescate animal'),
  ('Amigos de Cuatro Patas', 'Villamaría', 'Fundación de rescate animal'),
  ('Centro de Bienestar Animal de Cali', 'Cali', 'Centro oficial de bienestar animal')
on conflict do nothing;

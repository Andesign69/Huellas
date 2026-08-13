# Huellas

Buscador ciudadano de mascotas perdidas o encontradas tras el sismo del 10 de agosto de 2026 en Colombia (Pereira, Cali, Manizales, Quibdó).

No reemplaza a las autoridades ni a Cruz Roja. Es un mapa + formulario público para que la gente reporte y busque mascotas.

## Poner en marcha

1. `npm install`
2. `docker compose -f docker-compose.dev.yml up -d` — levanta Postgres local.
3. Aplica el esquema y dale password al rol de la app (ver el comentario al inicio de `supabase/schema.sql` para el detalle):
   ```
   docker exec -i huellas-dev-postgres psql -U huellas -d huellas_dev < supabase/schema.sql
   docker exec -i huellas-dev-postgres psql -U huellas -d huellas_dev -c "ALTER ROLE huellas_app WITH PASSWORD 'lo-que-quieras';"
   ```
4. Copia `.env.local.example` a `.env.local` y llena `DATABASE_URL` con esa misma password. `NEXT_PUBLIC_MAPTILER_KEY` es opcional — sin ella el mapa usa tiles públicos de OpenStreetMap (bien para desarrollar, no para tráfico real). Se consigue gratis en https://cloud.maptiler.com.
5. `npm run dev` y abre http://localhost:3000

Detalle completo (variables por ambiente, cómo se sirven las fotos, etc.) en `docs/deploy.md`.

## Estructura

- `src/app/page.tsx` — vista pública: lista o mapa de reportes, con filtros por ciudad y estado.
- `src/app/reportar/page.tsx` — formulario para publicar un reporte (foto, especie, estado, ubicación, contacto).
- `src/app/api/**` — backend (Next.js Route Handlers) que habla con Postgres; ver `docs/backend.md` para la referencia completa de rutas.
- `src/components/MapView.tsx` — mapa de reportes (Leaflet).
- `src/components/LocationPicker.tsx` — mini mapa para marcar la ubicación al reportar.
- `supabase/schema.sql` — esquema de base de datos (self-hosted Postgres), políticas RLS y seed de fundaciones/refugios conocidos.
- `docs/adr/` — decisiones de arquitectura importantes (por qué Postgres self-hosteado en vez de Supabase, etc.).

## Estado del proyecto

El proyecto se está migrando de Supabase + Vercel a un VPS propio — ver `docs/adr/0001-vps-migration.md` para el porqué. Anti-spam (honeypot, límite por IP, verificación de tiempo) ya está activo en las cuatro rutas de escritura pública (reportar, marcar resuelto, reportar contenido, sugerir refugio). La moderación de contenido reportado y sugerencias de refugio sigue siendo manual — ver `docs/backend.md`.

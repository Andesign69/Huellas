# Huellas

Buscador ciudadano de mascotas perdidas o encontradas tras el sismo del 10 de agosto de 2026 en Colombia (Pereira, Cali, Manizales, Quibdó).

No reemplaza a las autoridades ni a Cruz Roja. Es un mapa + formulario público para que la gente reporte y busque mascotas.

## Poner en marcha

1. `npm install`
2. Copia `.env.local.example` a `.env.local` y llena:
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` — en tu proyecto de Supabase, en *Project Settings > API*.
   - `NEXT_PUBLIC_MAPTILER_KEY` — opcional. Sin ella el mapa usa tiles públicos de OpenStreetMap (bien para desarrollar, no para tráfico real). Se consigue gratis en https://cloud.maptiler.com.
3. En el SQL Editor de Supabase, pega y corre todo el contenido de `supabase/schema.sql`. Esto crea las tablas `reports` y `shelters`, sus políticas públicas, y el bucket de fotos `pet-photos`.
4. `npm run dev` y abre http://localhost:3000

## Estructura

- `src/app/page.tsx` — vista pública: lista o mapa de reportes, con filtros por ciudad y estado.
- `src/app/reportar/page.tsx` — formulario para publicar un reporte (foto, especie, estado, ubicación, contacto).
- `src/components/MapView.tsx` — mapa de reportes (Leaflet).
- `src/components/LocationPicker.tsx` — mini mapa para marcar la ubicación al reportar.
- `supabase/schema.sql` — esquema de base de datos, políticas RLS y seed de fundaciones/refugios conocidos.

## Estado del proyecto

El plan por fases y las tareas pendientes están en el tracker: pídele el enlace a quien lo esté coordinando, o revisa las tareas de esta sesión.

Pendiente antes de producción (Fase 2 del plan): rate limiting, anti-spam, moderación y aviso de responsabilidad. Ahora mismo cualquiera puede publicar sin restricciones — es intencional para la Fase 1, pero no debe quedar así en producción con tráfico real.

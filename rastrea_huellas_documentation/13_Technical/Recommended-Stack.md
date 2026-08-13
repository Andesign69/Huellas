---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Descubrimiento técnico
dependencies:
  - "[[Product-Requirements]]"
related_documents:
  - "[[Architecture]]"
  - "[[Integrations]]"
  - "[[Decision-Log]]"
---

# Recommended Stack — Rastrea Huellas

## Propósito del documento

Registra el stack técnico real y por qué se eligió cada pieza, no como recomendación futura sino como decisión ya tomada e implementada.

Se considera suficiente cuando alguien puede justificar cada tecnología del stack sin tener que preguntar por qué se eligió.

## Hecho: stack

| Capa | Tecnología | Versión (aprox.) |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.3.0 |
| UI runtime | React | 19.2.8 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS | v4 |
| Componentes | shadcn/ui | ^4.17.0 |
| Backend | Supabase (Postgres + Storage) | `@supabase/supabase-js` ^2.112.3 |
| Mapa | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Tiles de mapa | MapTiler (con fallback a OpenStreetMap) | — |
| Hosting | Vercel (plan Hobby) | — |
| Control de versiones | GitHub (`Andesign69/Huellas`) | — |

## Decisión: sin backend propio

Ver [[Architecture]] para el detalle. En resumen: toda la lógica sensible vive en funciones `security definer` de Postgres, invocadas directo desde el cliente con la anon key pública de Supabase. No hay API routes de Next.js custom ni service-role key en el código de la app.

**Por qué**: menos infraestructura que mantener, menos superficie de ataque, y evita la necesidad de un servidor Node dedicado solo para lógica de negocio.

## Decisión: Leaflet + MapTiler en vez de Google Maps

**Evaluado**: Google Maps Platform.

**Descartado por**: riesgo de facturación variable e ilimitada bajo tráfico viral, sin un tope duro fácil de configurar — inaceptable para un proyecto sin presupuesto ni monitoreo de gasto en tiempo real.

**Elegido**: Leaflet (librería open source) + tiles de MapTiler, que tiene un plan gratuito con límite fijo (100.000 tile loads/mes) y sin sorpresas de facturación. Fallback a tiles públicos de OpenStreetMap si falta la key de MapTiler (usado durante desarrollo).

## Decisión: shadcn/ui en vez de una librería de componentes con más opinión

**Por qué**: permite aplicar los tokens de diseño de Stitch directamente vía CSS variables de Tailwind, sin pelear contra el theming de una librería más cerrada (ej. Material UI, Chakra).

## Riesgo técnico activo

Vercel y Supabase están ambos en plan gratuito. Ver [[Risk-Register]] para el detalle de límites y qué pasa si el tráfico crece fuerte.

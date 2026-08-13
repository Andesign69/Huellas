---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-12
updated: 2026-08-13
phase: Construcción
dependencies:
  - "[[Architecture]]"
  - "[[Security-and-Privacy]]"
  - "[[Recommended-Stack]]"
related_documents:
  - "[[Launch-Readiness]]"
  - "[[Risk-Register]]"
  - "[[Development-Plan]]"
---

# Handoff — Apex One

## Propósito del documento

Es el resumen técnico entregado directamente a Apex One para que entiendan el proyecto y sepan qué queda de su lado antes de migrar a su propia VPS/dominio. Se comparte también como archivo suelto fuera de este vault cuando hace falta enviarlo por fuera de Obsidian/GitHub.

Debe ayudar a responder:

- ¿Qué es el proyecto y cómo está construido?
- ¿Qué decisiones técnicas tomó el equipo, y por qué?
- ¿Qué necesita Apex One para migrar la app a su infraestructura?

Se considera suficiente cuando Apex One puede migrar el hosting sin tener que hacer preguntas de arquitectura básicas.

## Qué es esto

Rastrea Huellas es una herramienta ciudadana, gratuita y sin ánimo de lucro, para reportar y buscar mascotas perdidas o encontradas tras el sismo de magnitud 7.4 del 10 de agosto de 2026 en Colombia (epicentro San José del Palmar, Chocó; ciudades más afectadas: Cali, Pereira, Manizales, Quibdó).

No reemplaza a las autoridades ni a la Cruz Roja. No tiene cuentas de usuario — cualquiera puede reportar o buscar sin registrarse, por diseño: en una emergencia nadie quiere crear una cuenta desde el celular para reportar una mascota. Ver [[Project-Brief]].

En producción hoy: **https://huellas-khaki.vercel.app**

## Stack técnico

Ver el detalle completo en [[Recommended-Stack]]. Resumen:

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Estilos / UI | Tailwind CSS v4, shadcn/ui |
| Backend | Supabase (Postgres + Storage) — **sin backend propio, sin API routes custom** |
| Mapa | Leaflet + React-Leaflet, tiles de MapTiler (configurado en producción desde el 12 de agosto de 2026) |
| Hosting actual | Vercel (plan Hobby/gratuito) |
| Repo | https://github.com/Andesign69/Huellas |

No hay servidor Node propio ni contenedor: es un sitio Next.js que se conecta directo a Supabase desde el navegador usando la **anon key pública** (segura de exponer — la seguridad real vive en Postgres, no en el cliente, ver [[Security-and-Privacy]]).

## Decisiones clave (y por qué)

Ver el historial completo con razones en [[Decision-Log]]. Las más relevantes para quien va a operar la infraestructura:

- **Sin cuentas de usuario.** Cualquier fricción de registro mata la adopción en una emergencia.
- **Sin backend propio.** Toda la lógica sensible vive en funciones `security definer` de Postgres. Ver [[Architecture]].
- **Leaflet + MapTiler en vez de Google Maps.** Evita riesgo de facturación ilimitada bajo tráfico viral.
- **Compresión de fotos en el navegador.** Evita que el formulario falle en conexiones malas post-sismo.
- **Filosofía general**: resolver dentro del stack existente antes de sumar un servicio nuevo.

## Seguridad sin cuentas

Ver el detalle completo en [[Security-and-Privacy]]. Todo vive en `supabase/schema.sql`, que es la fuente de verdad completa del esquema y las políticas.

## Dónde vive todo hoy

- **Repo**: github.com/Andesign69/Huellas — Apex One (skolleigen@proton.me) ya tiene acceso de colaborador.
- **Base de datos**: proyecto Supabase propio (plan gratuito), de Andrés. **No necesita migrar** — la VPS de Apex One aloja el frontend Next.js, no la base de datos. Supabase se queda donde está.
- **Hosting actual**: Vercel, plan Hobby (gratuito), deploy automático en cada push a `main`.
- **Dominio**: aún no hay uno conectado — sigue en `huellas-khaki.vercel.app`. Pendiente de definir con Andrés.

## Variables de entorno necesarias

Todas son públicas por diseño (prefijo `NEXT_PUBLIC_`) — no hay secretos de servidor porque no hay servidor. Ver `.env.local.example` en el repo.

```
NEXT_PUBLIC_SUPABASE_URL=       # Project Settings > API en Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Project Settings > API en Supabase (la "anon/public" key, no la service_role)
NEXT_PUBLIC_MAPTILER_KEY=       # cloud.maptiler.com > Keys (plan gratuito)
```

Andrés puede compartir los valores actuales directamente, o Apex One puede crear sus propios proyectos de Supabase/MapTiler si prefieren tener control total de esas cuentas.

## Limitaciones conocidas / deuda técnica

Ver [[Risk-Register]] para el detalle completo con probabilidad/impacto. Resumen:

- Sin monitoreo de errores ni uptime.
- Sin tests automatizados.
- Vercel y Supabase en plan gratuito, con límites de tráfico/ejecución.
- Moderación 100% manual vía Table Editor de Supabase. Ver [[Support-Model]].

## Qué queda del lado de Apex One

1. **Decidir si reemplazan Vercel o lo mantienen.** El proyecto corre hoy en Vercel sin fricción. Migrar a su propia VPS tiene sentido si quieren control total de la infraestructura, pero técnicamente no es un requisito del código — es una decisión de ellos.
2. **Si migran a VPS propia:**
   - Runtime Node.js (o Docker) corriendo `npm run build && npm run start` (Next.js standalone).
   - Reverse proxy (nginx/Caddy) + HTTPS (Let's Encrypt) delante de la app.
   - Configurar las 3 variables de entorno de arriba.
   - Definir el dominio y apuntar su DNS al VPS.
3. **Confirmar con Andrés** si van a usar sus propias cuentas de Supabase/MapTiler o seguir usando las suyas.
4. **Opcional pero recomendado**: agregar monitoreo básico de uptime/errores.

Ver estado actual y checklist de lanzamiento en [[Launch-Readiness]].

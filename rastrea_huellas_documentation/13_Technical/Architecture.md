---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Descubrimiento técnico
dependencies:
  - "[[Recommended-Stack]]"
related_documents:
  - "[[Data-Model]]"
  - "[[Security-and-Privacy]]"
  - "[[Integrations]]"
---

# Architecture — Rastrea Huellas

## Propósito del documento

Describe cómo están conectadas las piezas del sistema y por qué. Es la explicación de más alto nivel de "cómo funciona esto por dentro".

Se considera suficiente cuando alguien puede dibujar el diagrama de componentes de memoria después de leerlo.

## Hecho: forma general

```text
Navegador (Next.js, cliente)
      │
      │  anon key pública (segura de exponer)
      ▼
Supabase (Postgres + Storage)
   ├── Tablas con RLS (reports, shelters, ...)
   ├── Funciones security definer (submit_report, resolve_report)
   └── Storage bucket público (pet-photos)
      │
      ▼
Vercel (hosting estático + SSR de Next.js)
```

No hay servidor Node propio, ni API routes de Next.js con lógica de negocio, ni service-role key en el código de la app. Es, deliberadamente, "solo frontend + Supabase".

## Decisión: seguridad sin backend propio

En vez de montar un backend con una service-role key (que exigiría un servidor, más infraestructura, más superficie de ataque), la lógica sensible vive en funciones de Postgres con `security definer`: corren con privilegios elevados aunque quien las invoca (el navegador, con la anon key) no tenga permiso directo sobre las tablas que tocan.

Esto significa que **la anon key de Supabase es segura de exponer públicamente** — es el diseño intencional, no un descuido. La seguridad real está en:

1. RLS (Row Level Security) en cada tabla.
2. Revocación explícita de `INSERT`/`UPDATE` directo donde importa.
3. Funciones `security definer` como única puerta de entrada para operaciones sensibles.

Ver el detalle completo en [[Security-and-Privacy]].

## Hecho: por qué esta arquitectura y no otra

Se evaluó implícitamente (por descarte, durante la construcción) un modelo con API routes de Next.js + service-role key para hacer rate limiting y validaciones. Se descartó porque:

- Suma una capa de infraestructura (funciones serverless con su propio ciclo de vida) sin necesidad real.
- Postgres ya puede leer el header `x-forwarded-for` vía `current_setting('request.headers', true)`, lo que permite hacer rate limiting por IP **sin backend propio ni servicio externo tipo Redis**.

Esta es la decisión técnica más importante del proyecto — ver [[Decision-Log]].

## Hecho: componentes del cliente

- **Next.js App Router**, todo client-side rendering para las páginas interactivas (`"use client"`), sin necesidad de SSR complejo porque no hay datos sensibles que ocultar del cliente.
- **React-Leaflet** para el mapa, cargado dinámicamente (`next/dynamic`, `ssr: false`) porque Leaflet depende del DOM del navegador.
- **`react-hooks/set-state-in-effect`**: se evitó el patrón `useEffect(() => setState(...))` en favor de valores derivados o inicializadores perezosos de `useState`, para no violar reglas de lint ni introducir mismatches de hidratación SSR.

## Riesgo conocido

Sin backend propio, no hay lugar natural para loguear excepciones del lado del servidor. Ver [[Risk-Register]] — no hay monitoreo de errores implementado.

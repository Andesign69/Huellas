---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Descubrimiento técnico
dependencies:
  - "[[Architecture]]"
related_documents:
  - "[[Security-and-Privacy]]"
  - "[[Product-Requirements]]"
---

# Data Model — Rastrea Huellas

## Propósito del documento

Describe las entidades reales de la base de datos, sus relaciones y reglas de persistencia. Es la traducción legible de `supabase/schema.sql`, que sigue siendo la fuente de verdad — este documento no lo reemplaza, lo explica.

Se considera suficiente cuando alguien entiende el modelo de datos sin leer SQL.

## Hecho: entidades

### `reports`

La entidad central. Un reporte de mascota perdida, encontrada o en refugio.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name`, `breed`, `sex` | text, nullable | Opcionales |
| `species` | text | `perro` \| `gato` \| `otro` |
| `status` | text | `perdido` \| `encontrado` \| `en_refugio` |
| `photo_url` | text, nullable | URL pública en Storage |
| `lat`, `lng` | double precision | Obligatorios |
| `city` | text | Obligatorio |
| `description` | text, nullable | |
| `contact` | text | Obligatorio (WhatsApp/teléfono) |
| `resolved` | boolean | Default `false` |
| `created_at` | timestamptz | Default `now()` |

Lectura pública total. Sin `INSERT`/`UPDATE` directo desde el cliente — solo vía funciones (ver [[Security-and-Privacy]]).

### `report_tokens`

Token secreto de un solo uso por reporte, para permitir "marcar como resuelto" sin cuentas de usuario.

| Campo | Tipo |
|---|---|
| `report_id` | uuid, PK, FK → `reports.id` |
| `token` | text |
| `created_at` | timestamptz |

Sin acceso público de ningún tipo — solo lo tocan las funciones `security definer`.

### `report_rate_limits`

Registro de intentos de publicación por IP hasheada, para el rate limiting.

| Campo | Tipo |
|---|---|
| `id` | bigint identity, PK |
| `ip_hash` | text (SHA-256 de la IP real; la IP nunca se guarda) |
| `created_at` | timestamptz |

Sin acceso público.

### `report_flags`

Reportes de contenido inapropiado.

| Campo | Tipo |
|---|---|
| `id` | uuid, PK |
| `report_id` | uuid, FK → `reports.id` |
| `reason` | text, nullable |
| `created_at` | timestamptz |

Solo `INSERT` público. Se revisa manualmente.

### `shelters`

Directorio de refugios y fundaciones, curado manualmente.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `name`, `city` | text | Obligatorios |
| `zone`, `address`, `contact`, `website`, `notes` | text, nullable | |
| `lat`, `lng` | double precision, nullable | |
| `is_exact_location` | boolean | `false` = ubicación aproximada al centro de la ciudad |

Lectura pública total.

### `shelter_suggestions`

Sugerencias ciudadanas de refugios nuevos, pendientes de revisión manual.

| Campo | Tipo |
|---|---|
| `id` | uuid, PK |
| `name`, `city`, `contact` | text, obligatorios |
| `website`, `notes` | text, nullable |
| `created_at` | timestamptz |

Solo `INSERT` público, sin lectura pública.

### Storage: bucket `pet-photos`

Bucket público. `INSERT` y `SELECT` abiertos a cualquiera (sin autenticación) — es deliberado, coherente con el modelo sin cuentas.

## Hecho: relaciones

```text
reports 1───1 report_tokens   (por report_id)
reports 1───N report_flags    (por report_id)
```

`shelters` y `shelter_suggestions` no tienen relación formal entre sí — la promoción de una sugerencia a refugio real es un proceso manual, no una migración de datos automática.

## Fuente de verdad

`supabase/schema.sql` es el archivo real y ejecutable. Se corre manualmente en el SQL Editor de Supabase cada vez que cambia — no hay migraciones versionadas automáticas todavía.

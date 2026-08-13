---
status: En progreso
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Construcción
dependencies:
  - "[[Development-Plan]]"
related_documents:
  - "[[Security-and-Privacy]]"
  - "[[Decision-Log]]"
---

# Bug Tracker — Rastrea Huellas

## Propósito del documento

Registra errores reales encontrados durante QA manual (no automatizada), su severidad, y cómo se resolvieron. Sustituye a un plan de validación formal — es la evidencia real de que el producto sí se probó, aunque no formalmente.

Debe ayudar a responder:

- ¿Qué problemas reales tuvo el producto antes de llegar a su forma actual?
- ¿Cómo se encontraron (quién, cómo)?

Se considera suficiente cuando incluye los hallazgos con impacto real en seguridad o experiencia, no cada detalle cosmético menor.

## Hallazgos (todos corregidos)

| ID | Hallazgo | Severidad | Cómo se encontró | Resolución |
|---|---|---|---|---|
| BUG-01 | "Marcar como resuelto" era un `UPDATE` abierto — cualquiera podía cerrar el reporte de cualquier otra persona | Crítica (seguridad) | QA manual de Andrés, reportado explícitamente | Sistema de token secreto de un solo uso (`report_tokens` + `resolve_report()`). Ver [[Security-and-Privacy]] |
| BUG-02 | Botón "Contactar" y "Marcar como resuelto" se sobreponían visualmente al mapa y al link de reportar contenido | Media (UI) | Captura de pantalla de Andrés | `sticky bottom-20` residual de un diseño anterior; se quitó |
| BUG-03 | Geolocalización no movía el mapa a la posición GPS obtenida | Media (funcional) | Reporte de Andrés ("no funciona") | El componente `Recenter` solo centraba si no había pin aún; se agregó un `FlyTo` separado siempre activo con la posición GPS |
| BUG-04 | Selector de foto solo permitía cámara, no galería | Baja | Reporte de Andrés | Se quitó el atributo `capture="environment"` del input |
| BUG-05 | Chip de filtro de ciudad mostraba una sola opción confusa ("Todas") cuando solo había una ciudad con reportes | Baja (UX) | Captura de pantalla de Andrés | El filtro de ciudad se oculta por completo si hay 1 o menos ciudades distintas en los datos actuales |
| BUG-06 | Error SQL `policy already exists` al re-ejecutar el script de esquema | Baja (DX) | Ejecución manual del SQL por Andrés | Se agregó `drop policy if exists` antes de cada `create policy`, para que el script sea idempotente |
| BUG-07 | Error `function digest(text, unknown) does not exist` | Baja (DX) | Ejecución manual del SQL | `pgcrypto` vive en el schema `extensions` de Supabase, no en `public`; se corrigió `search_path` en las funciones afectadas |

## No son bugs — limitaciones aceptadas

- Pérdida del `resolve_token` al cambiar de navegador o borrar `localStorage` (ver [[Security-and-Privacy]]).
- Sin moderación automática — es manual por diseño (ver [[Support-Model]]).

## Cómo se actualiza este documento

Ante un hallazgo nuevo: agregar una fila con un ID nuevo (`BUG-XX`), no reescribir el historial. Si un hallazgo reabre un problema ya cerrado, referenciar el ID original en vez de crear uno nuevo, siguiendo la regla de reapertura del playbook.

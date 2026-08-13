---
status: Completada
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: User Flows
dependencies:
  - "[[Scope-and-MVP]]"
  - "[[Product-Requirements]]"
related_documents:
  - "[[Sitemap]]"
  - "[[Security-and-Privacy]]"
---

# Flows — Rastrea Huellas

## Propósito del documento

Describe los pasos reales de los flujos principales y secundarios ya construidos, incluyendo qué pasa en errores y casos límite. Reemplaza la necesidad de diagramar formalmente — el flujo se describe en texto porque son pocos pasos y ya están en producción.

Se considera suficiente cuando cada flujo cubre el camino feliz y al menos sus errores más relevantes.

## Roles (implícitos, no formalizados como personas)

No se crearon personas formales (ver [[PROJECT_APPLICABILITY_MATRIX]]). Dos roles bastan para describir todos los flujos:

- **Quien reporta**: publica un reporte de mascota perdida, encontrada o en refugio.
- **Quien busca**: navega el mapa/lista buscando una mascota, y eventualmente contacta a quien reportó.

Una misma persona puede ser ambos roles en momentos distintos.

## Flow Inventory

| Flujo | Tipo | Ruta principal |
|---|---|---|
| Publicar un reporte | Primario | `/reportar` |
| Buscar y contactar | Primario | `/mapa` → `/mascota/[id]` |
| Marcar como resuelto | Secundario | `/mascota/[id]` |
| Compartir un reporte | Secundario | `/mascota/[id]` |
| Reportar contenido inapropiado | Secundario | `/mascota/[id]` |
| Sugerir un refugio | Secundario | `/refugios` → `/refugios/sugerir` |

## Flujo primario: publicar un reporte

1. Usuario entra a `/reportar` (directo, o con `?status=` prellenado desde el home).
2. Llena estado, especie, nombre/raza/sexo (opcionales), ciudad, ubicación (GPS o mapa manual), foto (opcional, se comprime automáticamente), descripción y contacto.
3. Envía el formulario → llama a `submit_report()` (RPC de Supabase).
4. La función valida honeypot, tiempo mínimo, y rate limit por IP.
   - **Error**: si falla cualquier validación, se muestra el mensaje de la excepción de Postgres tal cual (ej. "Estás publicando reportes muy seguido...").
5. Si todo es válido, se crea el reporte y se genera un `resolve_token` de un solo uso.
6. El token se guarda en `localStorage` del navegador (`saveResolveToken`).
7. Redirige a inicio; el reporte ya es visible para todos.

## Flujo primario: buscar y contactar

1. Usuario entra a `/mapa` (o navega desde el home).
2. Filtra por ciudad (solo visible si hay más de una ciudad con reportes), estado, especie, o busca texto libre.
3. Alterna entre vista de lista (grid 2 columnas) y vista de mapa (con refugios pineados).
4. Toca un reporte → `/mascota/[id]`.
5. Toca "Contactar" → abre WhatsApp con el número que dejó quien reportó.

**Caso límite**: si no hay reportes con los filtros aplicados, la vista de lista muestra un mensaje; la vista de mapa se sigue mostrando (con la leyenda) aunque esté vacía.

## Flujo secundario: marcar como resuelto

1. Solo disponible si el navegador tiene un `resolve_token` guardado para ese reporte específico (es decir, solo para quien lo publicó desde ese mismo navegador).
2. Al tocar "Marcar como resuelto", llama a `resolve_report(report_id, token)`.
3. Si el token no coincide → error 400 con excepción de Postgres ("No tienes permiso...").
4. Si coincide → el reporte se marca `resolved = true` y desaparece de listas/mapa.

**Caso límite documentado y aceptado**: si el usuario cambia de navegador o borra `localStorage`, pierde la capacidad de cerrar su propio reporte. No hay flujo de recuperación implementado — la alternativa es usar "Reportar contenido inapropiado" para pedir revisión manual. Ver [[Risk-Register]].

## Flujo secundario: compartir

1. Desde `/mascota/[id]`, botón "Compartir".
2. Intenta `navigator.share()` (nativo).
3. Si no está disponible, copia el enlace al portapapeles.
4. Si tampoco, abre un enlace de WhatsApp (`wa.me`) con el texto prellenado.

## Flujo secundario: sugerir un refugio

1. Desde `/refugios`, botón para sugerir uno nuevo → `/refugios/sugerir`.
2. Llena nombre, ciudad, contacto, sitio web/Instagram (opcional), notas (opcional).
3. Se guarda en la tabla `shelter_suggestions` (solo `INSERT`, sin lectura pública).
4. **No hay notificación automática** — se revisa manualmente desde el Table Editor de Supabase. Ver [[Support-Model]] y [[Decision-Log]] (Web3Forms se evaluó y se descartó).

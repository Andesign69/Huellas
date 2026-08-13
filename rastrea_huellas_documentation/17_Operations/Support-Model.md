---
status: Completada
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Operaciones
dependencies:
  - "[[Data-Model]]"
related_documents:
  - "[[Integrations]]"
  - "[[Decision-Log]]"
---

# Support Model — Rastrea Huellas

## Propósito del documento

Describe cómo se moderan y operan las partes del producto que requieren revisión humana, ya que no hay panel de administración construido.

Se considera suficiente cuando alguien nuevo (ej. alguien de Apex One) puede hacerse cargo de la moderación sin instrucciones adicionales.

## Hecho: moderación de contenido reportado

Cuando alguien toca "Reportar contenido inapropiado" en un reporte, se guarda una fila en `report_flags` (sin lectura pública por API).

**Proceso real**: revisión manual desde el **Table Editor de Supabase**, tabla `report_flags`, ordenando por `created_at`. No hay panel de administración dedicado ni notificación automática de nuevos flags.

## Hecho: sugerencias de refugios nuevos

Cuando alguien sugiere un refugio en `/refugios/sugerir`, se guarda en `shelter_suggestions` (sin lectura pública por API, sin aviso automático desde que se retiró Web3Forms — ver [[Decision-Log]]).

**Proceso real**: revisión manual periódica desde el Table Editor de Supabase, tabla `shelter_suggestions`, ordenada por `created_at` descendente. Recomendación operativa: guardar esa vista en favoritos del navegador y revisar con regularidad mientras dure la emergencia.

Una vez aprobado, el refugio se agrega manualmente a la tabla `shelters` (no hay flujo automático de "promover" una sugerencia a refugio real).

## Riesgo operativo

Este modelo es manual y depende de que una persona (Andrés, o quien se designe) revise Supabase con regularidad. No escala a un volumen alto de reportes/sugerencias sin alguna forma de notificación o panel dedicado. Ver [[Risk-Register]].

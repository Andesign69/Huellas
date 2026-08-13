---
status: En progreso
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Gobierno
dependencies: []
related_documents:
  - "[[PROJECT_STATUS]]"
  - "[[PROJECT_APPLICABILITY_MATRIX]]"
---

# Project Tracker — Rastrea Huellas

## Propósito del documento

Centraliza el trabajo del proyecto — tanto lo ya completado (documentado retroactivamente) como lo genuinamente pendiente — para identificar qué debe hacerse, por qué, en qué orden, quién es responsable y cuándo una tarea puede considerarse terminada.

Se considera suficiente cuando refleja con precisión lo que está hecho y lo que falta, sin inflar el progreso con tareas ya completadas que no aportan trazabilidad nueva.

## Resumen

- **Proyecto**: Rastrea Huellas
- **Etapa actual**: Lanzamiento (18), con migración de infraestructura en curso
- **Progreso general**: MVP completo y en producción; migración a infraestructura de Apex One sin iniciar técnicamente
- **Principal bloqueo**: ninguno bloqueante — el sitio funciona sin depender de las tareas pendientes
- **Próxima decisión**: Apex One decide si reemplaza Vercel o solo aporta dominio
- **Próxima entrega**: N/A — no hay fecha comprometida

## Tareas — Completadas (referencia histórica)

Agrupadas por etapa, no atomizadas a nivel de commit. Ver [[Development-Plan]] y [[Bug-Tracker]] para el detalle granular.

| ID | Etapa | Tarea | Estado | Prioridad | Responsable | Dependencias | Entregable | Criterio de aceptación |
|---|---|---|---|---|---|---|---|---|
| RH-01 | Alcance | Definir MVP y qué queda fuera de alcance | Completada | Alta | Andrés | — | [[Scope-and-MVP]] | Alcance real coincide con producción |
| RH-02 | Requerimientos | Definir reglas de negocio de seguridad sin cuentas | Completada | Alta | Andrés | RH-01 | [[Product-Requirements]] | Reglas implementadas en `schema.sql` |
| RH-03 | UI Design | Aplicar dirección visual de Stitch (color, tipografía) | Completada | Media | Andrés | — | [[UI-Overview]], [[Foundations]] | Tokens aplicados en `globals.css` |
| RH-04 | Técnico | Definir arquitectura sin backend propio | Completada | Alta | Andrés | RH-02 | [[Architecture]] | Funciones `security definer` en producción |
| RH-05 | Técnico | Elegir Leaflet + MapTiler en vez de Google Maps | Completada | Alta | Andrés | — | [[Recommended-Stack]] | Mapa funcional sin riesgo de facturación variable |
| RH-06 | Construcción | Implementar rate limiting, honeypot y verificación de tiempo | Completada | Alta | Andrés | RH-04 | `submit_report()` | Verificado en vivo: envíos abusivos rechazados |
| RH-07 | Construcción | Corregir vulnerabilidad de "marcar como resuelto" abierto | Completada | Crítica | Andrés | RH-06 | Sistema de `resolve_token` | Token forjado rechazado con error 400, verificado en vivo |
| RH-08 | Construcción | Construir directorio de refugios y flujo de sugerencia | Completada | Media | Andrés | RH-01 | `/refugios`, `/refugios/sugerir` | Sugerencia visible en Supabase tras envío |
| RH-09 | Construcción | Pinear refugios en el mapa | Completada | Media | Andrés | RH-08 | `MapView.tsx` | Verificado en vivo: 5 marcadores (reporte + refugios) |
| RH-10 | Construcción | Agregar botón de compartir en detalle de mascota | Completada | Baja | Andrés | — | `mascota/[id]/page.tsx` | Web Share API con fallback funcional |
| RH-11 | Construcción | Crear página "Cómo funciona" / FAQ | Completada | Baja | Andrés | — | [[Sitemap]] | 8 preguntas publicadas |
| RH-12 | Construcción | Comprimir fotos en el navegador antes de subir | Completada | Media | Andrés | — | `compressImage.ts` | Verificado: 11.6 MB → 0.5 MB en prueba real |
| RH-13 | Técnico | Configurar MapTiler en producción (Vercel) | Completada | Alta | Andrés | RH-05 | Variable de entorno en Vercel | Verificado: tiles de MapTiler sirviendo en producción |
| RH-14 | Técnico | Retirar integración de Web3Forms | Completada | Media | Andrés | — | [[Decision-Log]] D-06 | Código eliminado, formulario sigue funcionando |
| RH-15 | Go-to-Market | Preparar reel de difusión (Arya) | Completada | Media | Andrés | — | [[Communication-Plan]] | Video grabado, según confirmación de Andrés |
| RH-16 | Gobierno | Documentar retroactivamente el proyecto completo | Completada | Alta | Claude Code | RH-01 a RH-15 | Este vault | Matriz de aplicabilidad + documentos aplicables creados |

## Tareas — Pendientes (reales, no inventadas)

| ID | Etapa | Tarea | Estado | Prioridad | Responsable | Dependencias | Entregable | Criterio de aceptación |
|---|---|---|---|---|---|---|---|---|
| RH-17 | Lanzamiento | Decidir si Apex One reemplaza Vercel o solo aporta dominio | No iniciada | Alta | Apex One | RH-16 (handoff entregado) | Decisión registrada en [[Decision-Log]] | Decisión explícita comunicada a Andrés |
| RH-18 | Lanzamiento | Definir y apuntar un dominio propio | No iniciada | Media | Apex One / Andrés | RH-17 | DNS apuntando al hosting definitivo | Dominio resuelve a la app en producción |
| RH-19 | Operaciones | Agregar monitoreo básico de uptime/errores | No iniciada | Media | Andrés / Apex One | — | Herramienta de monitoreo activa | Alerta real ante una caída simulada |
| RH-20 | Operaciones | Definir cadencia de revisión manual de moderación | No iniciada | Baja | Andrés | — | Proceso documentado en [[Support-Model]] | Cadencia acordada y seguida al menos 2 semanas |
| RH-21 | Técnico | Si migran a VPS: levantar runtime Node/Docker + reverse proxy + HTTPS | No iniciada | Alta | Apex One | RH-17 (si eligen migrar) | App corriendo en la VPS | Sitio accesible por HTTPS en el dominio definido |

## Control de transiciones

Ninguna tarea pendiente puede pasar a `En progreso` sin que su dependencia directa esté `Completada`. RH-21 depende de que RH-17 se resuelva a favor de migrar — si Apex One decide mantener Vercel, RH-21 se marca `Cancelada`, no se ejecuta por defecto.

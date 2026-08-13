---
status: En progreso
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Lanzamiento
dependencies:
  - "[[Scope-and-MVP]]"
  - "[[Security-and-Privacy]]"
related_documents:
  - "[[Handoff-ApexOne]]"
  - "[[Risk-Register]]"
---

# Launch Readiness — Rastrea Huellas

## Propósito del documento

Registra el estado real de preparación para producción, qué ya está resuelto y qué sigue pendiente. A diferencia de un checklist pre-lanzamiento clásico, este proyecto **ya está lanzado y en uso real** — este documento se mantiene vivo mientras el proyecto siga activo.

Se considera suficiente cuando refleja el estado actual verificado, no un estado deseado.

## Estado general

- **En producción desde**: fase F1 (ver [[Development-Plan]]).
- **URL**: https://huellas-khaki.vercel.app
- **Salud del proyecto**: Verde — funcional, sin incidentes abiertos conocidos.

## Resuelto

- [x] Seguridad de reportes (rate limiting, honeypot, tokens de resolución) — ver [[Security-and-Privacy]].
- [x] Mapa en producción usando MapTiler (no OSM público) — configurado el 12 de agosto de 2026.
- [x] Compresión de fotos antes de subir.
- [x] Retiro de la integración de Web3Forms (pasó a ser de pago) sin romper el flujo de sugerencia de refugios.
- [x] Acceso de colaborador de GitHub otorgado a Apex One.
- [x] Handoff técnico entregado a Apex One — ver [[Handoff-ApexOne]].

## Pendiente

- [ ] **Dominio propio.** Sigue en `huellas-khaki.vercel.app`. Pendiente de decisión entre Andrés y Apex One.
- [ ] **Migración a VPS de Apex One**, o decisión explícita de quedarse en Vercel. Ver [[Handoff-ApexOne]].
- [ ] **Monitoreo de errores/uptime.** No implementado.
- [ ] **Plan de qué hacer si se supera el tier gratuito de Vercel/Supabase.** No definido.

## Pregunta abierta

- ¿Cuál es el criterio para decidir que la migración a VPS ya no es urgente (ej. porque el tráfico se mantiene bajo el límite gratuito indefinidamente)? No definido.

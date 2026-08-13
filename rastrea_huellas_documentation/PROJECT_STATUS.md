---
status: En progreso
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Lanzamiento
dependencies: []
related_documents:
  - "[[PROJECT_TRACKER]]"
  - "[[PROJECT_APPLICABILITY_MATRIX]]"
  - "[[Launch-Readiness]]"
---

# Project Status — Rastrea Huellas

## Propósito del documento

Resume la situación actual del proyecto para que cualquier persona (o IA) pueda entender rápidamente dónde se encuentra, qué cambió, qué está bloqueado y qué sigue, sin tener que leer todo el historial de conversaciones o commits.

Se considera suficiente cuando alguien nuevo puede retomar el proyecto leyendo solo este archivo y el [[PROJECT_TRACKER]].

## Estado general

- **Etapa actual**: Lanzamiento (18) — en producción, con la migración de infraestructura a Apex One en progreso.
- **Salud del proyecto**: Verde.
- **Porcentaje aproximado**: MVP funcional al 100%. Migración a infraestructura de Apex One, sin avance técnico iniciado (solo handoff entregado).
- **Último avance**: mapa en producción usando MapTiler (no tiles públicos de OSM), compresión de fotos antes de subir, retiro de la integración de Web3Forms, y esta documentación retroactiva del proyecto.
- **Próximo hito**: decisión de Apex One sobre dominio propio y si migran el hosting a su VPS o mantienen Vercel.

## Decisiones recientes

Ver [[Decision-Log]] para el historial completo. Las más recientes:

- Retiro de Web3Forms (D-06) — pasó a ser función de pago.
- Compresión de fotos en el navegador (D-05).
- Configuración de MapTiler en producción (parte de D-04).

## Bloqueos

Ninguno bloqueante hoy. La app funciona en producción sin dependencias pendientes de terceros para seguir operando.

## Preguntas abiertas

- ¿Apex One reemplaza Vercel con su VPS, o solo aporta dominio y mantiene Vercel? Ver [[Handoff-ApexOne]].
- ¿Quién compra y a qué apunta el dominio propio, si se decide tener uno?
- ¿Hasta cuándo se mantiene el proyecto activo? No hay fecha de cierre definida.
- ¿Se necesita algún tipo de analítica básica? No implementada, no decidido si se necesita.

## Riesgos principales

Ver [[Risk-Register]] para el detalle completo. Los de mayor impacto:

- R-01: límites de los planes gratuitos de Vercel/Supabase bajo tráfico alto.
- R-02: sin monitoreo de errores ni uptime.
- R-04: moderación manual no escala si el proyecto gana tracción.

## Documentos actualizados (esta sesión de documentación retroactiva)

Todos los documentos de este vault se crearon el 2026-08-13, documentando trabajo ya construido y en producción. Ver [[PROJECT_APPLICABILITY_MATRIX]] para el detalle de qué se documentó y qué se omitió a propósito.

## Próximas tareas

Ver [[PROJECT_TRACKER]] para el detalle con criterios de aceptación. En orden de prioridad:

1. Definir con Apex One si migran el hosting a su VPS o mantienen Vercel.
2. Definir y apuntar un dominio propio.
3. Agregar monitoreo básico de uptime/errores.
4. Definir cadencia de revisión manual de moderación (`report_flags`, `shelter_suggestions`).

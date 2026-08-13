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
  - "[[Launch-Readiness]]"
  - "[[Security-and-Privacy]]"
  - "[[Support-Model]]"
---

# Risk Register — Rastrea Huellas

## Propósito del documento

Registra riesgos conocidos del proyecto, su probabilidad, impacto y mitigación, para que no se descubran por accidente cuando ya causaron un problema.

Se considera suficiente cuando cada riesgo real identificado en el proyecto está aquí, con una mitigación clara o marcada como "sin mitigar".

## R-01 — Límites de los planes gratuitos de Vercel y Supabase

- **Probabilidad**: Media (depende de cuánto crezca el tráfico).
- **Impacto**: Alto — el sitio podría dejar de funcionar o degradarse en un momento de alta demanda, justo cuando más se necesita.
- **Mitigación actual**: ninguna activa. Es una pregunta abierta para Apex One (ver [[Launch-Readiness]]).
- **Mitigación posible**: subir de plan, o migrar el hosting a la VPS de Apex One manteniendo Supabase igual.

## R-02 — Sin monitoreo de errores ni uptime

- **Probabilidad**: Media.
- **Impacto**: Alto — si algo se cae, nadie se entera hasta que un usuario lo reporte por su cuenta.
- **Mitigación actual**: ninguna.
- **Mitigación posible**: Vercel Analytics, o un uptime checker gratuito (ej. UptimeRobot), agregado sin necesidad de backend propio.

## R-03 — Pérdida del token de resolución

- **Probabilidad**: Media — ocurre cada vez que alguien cambia de navegador/dispositivo o borra `localStorage`.
- **Impacto**: Bajo-Medio — esa persona ya no puede cerrar su propio reporte, pero puede usar "Reportar contenido inapropiado" para pedir revisión manual.
- **Mitigación actual**: aceptado como limitación conocida (ver [[Decision-Log]], D-03).
- **Mitigación posible**: no evaluada — requeriría algún mecanismo de recuperación (ej. verificación por el mismo número de contacto), que reintroduciría complejidad al modelo sin cuentas.

## R-04 — Moderación 100% manual no escala

- **Probabilidad**: Baja hoy, Media si el proyecto gana tracción (ver [[Communication-Plan]], reel de difusión).
- **Impacto**: Medio — contenido inapropiado o sugerencias de refugios podrían acumularse sin revisión oportuna.
- **Mitigación actual**: ninguna. Ver [[Support-Model]].
- **Mitigación posible**: definir una cadencia fija de revisión, o evaluar un panel de administración simple si el volumen lo justifica.

## R-05 — Sin tests automatizados

- **Probabilidad**: Alta — ya es la realidad del proyecto.
- **Impacto**: Medio — cualquier cambio grande depende de QA manual exhaustiva para no introducir regresiones (ver [[Bug-Tracker]] para el historial real de bugs encontrados así).
- **Mitigación actual**: disciplina de verificación manual en vivo antes de cada entrega.
- **Mitigación posible**: agregar tests para los flujos de seguridad críticos (rate limiting, tokens de resolución) sería la prioridad si se invierte en testing.

## R-06 — Dependencia de decisiones externas para el dominio y la VPS

- **Probabilidad**: Baja (ya está en proceso).
- **Impacto**: Bajo — el sitio sigue funcionando en `huellas-khaki.vercel.app` mientras tanto.
- **Mitigación actual**: coordinación activa con Apex One, handoff ya entregado (ver [[Handoff-ApexOne]]).

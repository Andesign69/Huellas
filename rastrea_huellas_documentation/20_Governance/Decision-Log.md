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
  - "[[Architecture]]"
  - "[[Security-and-Privacy]]"
  - "[[Recommended-Stack]]"
  - "[[Scope-and-MVP]]"
---

# Decision Log — Rastrea Huellas

## Propósito del documento

Registra decisiones importantes de producto y técnicas, con su motivo, alternativas consideradas e impacto. Existe para no repetir discusiones ya resueltas — cualquiera que se pregunte "¿por qué no usamos X?" debería encontrar la respuesta aquí antes de reabrir el debate.

Se considera suficiente cuando cubre las decisiones que, si se revirtieran sin contexto, causarían un problema real (de seguridad, costo o experiencia).

## D-01 — Sin cuentas de usuario

- **Decisión**: la app no tiene registro ni login. Cualquiera reporta o busca de forma anónima.
- **Alternativas consideradas**: cuentas de usuario tradicionales.
- **Motivo**: el caso de uso es gente reportando desde el celular en medio de una emergencia. Cualquier fricción de registro reduce la adopción cuando más se necesita rapidez.
- **Impacto**: obligó a resolver "propiedad de un reporte" (ver D-03) sin el mecanismo estándar de autenticación.
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-02 — Sin backend propio, seguridad vía funciones `security definer` de Postgres

- **Decisión**: toda la lógica sensible (rate limiting, validaciones, permisos) vive en funciones de Postgres invocadas directo desde el cliente con la anon key pública, en vez de un backend con service-role key.
- **Alternativas consideradas**: API routes de Next.js + service-role key + posible servicio externo de rate limiting (tipo Redis/Upstash).
- **Motivo**: menos infraestructura que mantener, menos superficie de ataque, y Postgres ya puede leer el header `x-forwarded-for` de PostgREST — no hace falta un servicio externo para rate limiting por IP.
- **Impacto**: arquitectura queda "solo frontend + Supabase", sin servidor Node dedicado. Ver [[Architecture]].
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-03 — Token secreto de un solo uso para "propiedad sin cuentas"

- **Decisión**: cada reporte genera un token secreto al crearse, guardado en `localStorage` del navegador que lo creó; solo ese token permite marcarlo como resuelto.
- **Contexto**: reemplaza un diseño anterior donde "marcar como resuelto" era un `UPDATE` abierto — cualquiera podía cerrar el reporte de cualquier otra persona. Vulnerabilidad real encontrada por Andrés en QA manual (ver [[Bug-Tracker]], BUG-01).
- **Alternativas consideradas**: ninguna formal — la urgencia de cerrar el hueco de seguridad llevó directo a este patrón.
- **Motivo**: es el patrón estándar de "ownership sin autenticación" — funciona sin cuentas, sin exponer nada sensible.
- **Impacto**: limitación aceptada — si el usuario cambia de navegador o borra `localStorage`, pierde la capacidad de cerrar su propio reporte (ver [[Risk-Register]]).
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-04 — Leaflet + MapTiler en vez de Google Maps

- **Decisión**: el mapa usa Leaflet (open source) con tiles de MapTiler.
- **Alternativas consideradas**: Google Maps Platform.
- **Motivo**: Google Maps implica facturación potencialmente ilimitada bajo tráfico viral, sin un tope duro fácil de configurar — riesgo inaceptable sin presupuesto ni monitoreo de gasto en tiempo real. MapTiler tiene plan gratuito con límite fijo (100k tile loads/mes).
- **Impacto**: dependencia de una key de MapTiler en producción (agregada el 12 de agosto de 2026 — antes de eso, producción corría sobre tiles públicos de OpenStreetMap, con riesgo de bloqueo bajo tráfico alto).
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-05 — Compresión de fotos en el navegador antes de subir

- **Decisión**: las fotos se redimensionan a 1600px de lado mayor y se recodifican a JPEG calidad 0.75 con Canvas API nativa, antes de subir a Supabase Storage.
- **Alternativas consideradas**: ninguna librería externa — se evaluó explícitamente no sumar dependencia.
- **Motivo**: fotos de celular sin comprimir (8-12 MB) fallan o tardan mucho en conexiones malas, típico después de un sismo.
- **Impacto**: reduce tamaño de subida en ~95% en pruebas (11.6 MB → 0.5 MB), sin servicio ni librería nueva.
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-06 — Retiro de la integración con Web3Forms

- **Decisión**: se quitó por completo el código que enviaba un correo de aviso al sugerir un refugio nuevo.
- **Contexto**: el flujo de acceso de Web3Forms cambió a requerir cuenta (verificación de correo + Cloudflare check), y la API pasó a ser de pago.
- **Alternativas consideradas**: ninguna evaluada a fondo (Resend, EmailJS quedaron como opciones futuras no exploradas).
- **Motivo**: no vale la pena pagar por o depender de un servicio nuevo para una notificación que puede resolverse revisando Supabase manualmente cada cierto tiempo.
- **Impacto**: el formulario de sugerencia de refugio sigue funcionando igual (guarda en Supabase); solo se perdió el aviso automático. Ver [[Support-Model]].
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente.

## D-07 — Filosofía general: resolver dentro del stack existente antes de sumar un servicio nuevo

- **Decisión**: principio aplicado consistentemente en D-02, D-04, D-05, D-06.
- **Motivo**: preferencia explícita de Andrés — menos infraestructura que mantener, para un proyecto de una sola persona sin presupuesto.
- **Impacto**: guía todas las decisiones técnicas del proyecto, no solo una.
- **Responsable**: Andrés Martínez.
- **Estado**: Vigente — debería consultarse antes de proponer cualquier servicio externo nuevo.

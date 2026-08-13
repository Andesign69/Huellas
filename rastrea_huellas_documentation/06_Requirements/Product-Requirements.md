---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Requerimientos
dependencies:
  - "[[Scope-and-MVP]]"
related_documents:
  - "[[Data-Model]]"
  - "[[Security-and-Privacy]]"
  - "[[Flows]]"
---

# Product Requirements — Rastrea Huellas

## Propósito del documento

Consolida qué debe poder hacer el sistema (requerimientos funcionales), bajo qué condiciones de calidad (no funcionales), y qué reglas de negocio controlan sus decisiones automáticas. Todo lo aquí descrito ya está implementado — no es una propuesta.

Debe ayudar a responder:

- ¿Qué puede hacer cada tipo de visitante?
- ¿Qué reglas automáticas protegen la app del abuso?
- ¿Qué condiciones de calidad se buscaron (seguridad, rendimiento)?

Se considera suficiente cuando alguien puede predecir el comportamiento del sistema sin leer `schema.sql`.

## Requerimientos funcionales (hecho)

Cualquier visitante, sin cuenta, puede:

- Publicar un reporte de mascota (perdida / encontrada / en refugio) con foto, ubicación, ciudad, contacto y descripción.
- Ver todos los reportes activos (no resueltos), en lista o mapa, filtrando por ciudad, estado y especie.
- Buscar por nombre, raza o descripción (texto libre).
- Ver el detalle completo de un reporte.
- Contactar a quien publicó un reporte, vía WhatsApp, usando el número que esa persona dejó.
- Compartir un reporte (Web Share API nativo, con fallback a copiar enlace o abrir WhatsApp).
- Marcar como resuelto **únicamente** el reporte que él mismo publicó (ver regla de negocio de tokens abajo).
- Reportar contenido de un reporte como inapropiado (queda para revisión manual).
- Ver el directorio de refugios/fundaciones y sugerir uno nuevo.

## Requerimientos no funcionales (hecho)

- **Seguridad sin cuentas**: toda operación sensible pasa por funciones `security definer` de Postgres, nunca por INSERT/UPDATE directo del cliente. Ver [[Security-and-Privacy]].
- **Anti-spam**: honeypot + verificación de tiempo mínimo de llenado + rate limiting por IP hasheada.
- **Rendimiento en conexión mala**: fotos se comprimen en el navegador (resize a 1600px, JPEG calidad 0.75) antes de subir, para no fallar en conexiones lentas típicas post-sismo.
- **Sin costo variable descontrolado**: elección de Leaflet + MapTiler (plan gratuito con tope fijo) en vez de Google Maps, específicamente para evitar riesgo de facturación inesperada. Ver [[Decision-Log]].
- **Mobile-first**: la interfaz se diseñó primero para celular, con navegación inferior fija.

## Reglas de negocio (hecho, implementadas en `supabase/schema.sql`)

| Regla | Detalle | Dónde vive |
|---|---|---|
| Límite de reportes por IP | Máximo 6 reportes por IP (hasheada con SHA-256) cada 20 minutos | Función `submit_report()` |
| Honeypot | Campo oculto que, si viene lleno, rechaza el envío (asume bot) | Función `submit_report()` |
| Envío mínimo de tiempo | Rechaza envíos hechos menos de 3 segundos después de cargar el formulario | Función `submit_report()` |
| Token de resolución | Cada reporte genera un token secreto de un solo uso al crearse; solo ese token permite marcarlo como resuelto | Funciones `submit_report()` / `resolve_report()`, tabla `report_tokens` |
| Sin lectura pública de moderación | `report_flags` y `shelter_suggestions` solo aceptan `INSERT` público; nadie puede leerlas por la API | Políticas RLS en `schema.sql` |
| Un reporte no puede reabrirse desde el cliente | `resolved` solo cambia a `true` vía `resolve_report()`, nunca `false` desde el cliente | Función `resolve_report()` |

## Datos requeridos por reporte (hecho)

Campos obligatorios: especie, estado, ubicación (lat/lng), ciudad, contacto.
Campos opcionales: nombre, raza, sexo, foto, descripción.

Ver el modelo completo en [[Data-Model]].

## Pregunta abierta

- ¿Debe existir algún límite de longitud/contenido en el campo de contacto o descripción, más allá de lo que ya impone el formulario? No implementado hoy; no ha sido un problema reportado.

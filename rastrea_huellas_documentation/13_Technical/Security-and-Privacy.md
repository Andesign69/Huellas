---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Descubrimiento técnico
dependencies:
  - "[[Data-Model]]"
  - "[[Architecture]]"
related_documents:
  - "[[Decision-Log]]"
  - "[[Risk-Register]]"
---

# Security and Privacy — Rastrea Huellas

## Propósito del documento

Documenta las amenazas consideradas, los controles implementados, y qué datos sensibles maneja la app. Es especialmente importante porque **no hay cuentas de usuario** — toda la seguridad se resolvió de otra forma, y ese "cómo" no es obvio leyendo solo el código de React.

Se considera suficiente cuando alguien puede explicar por qué la app es segura sin cuentas de usuario.

## Hecho: amenaza — spam / abuso de reportes

**Controles** (todos en la función `submit_report()`, `security definer`):

1. **Honeypot**: campo oculto (`website`) que un humano nunca llena; si llega con contenido, se rechaza.
2. **Tiempo mínimo**: se rechaza cualquier envío hecho menos de 3 segundos después de que el formulario cargó (`p_form_loaded_at`).
3. **Rate limiting por IP**: máximo 6 reportes por IP (hasheada con SHA-256, la IP real nunca se persiste) cada 20 minutos. La IP se lee de `current_setting('request.headers', true)::json ->> 'x-forwarded-for'`, expuesto por PostgREST — no requiere backend propio.

## Hecho: amenaza — cierre no autorizado de reportes ajenos

**Historial real**: esta fue una vulnerabilidad real encontrada por Andrés en QA manual — el primer diseño de "marcar como resuelto" era un `UPDATE` abierto; cualquiera podía cerrar el reporte de cualquier otra persona. Ver [[Bug-Tracker]] y [[Decision-Log]].

**Control implementado**: patrón de "propiedad sin cuentas" mediante token secreto:

1. Al crear un reporte, `submit_report()` genera un token de un solo uso (`encode(gen_random_bytes(16), 'hex')`) y lo devuelve **una sola vez** en la respuesta.
2. El navegador que lo creó lo guarda en `localStorage` (`saveResolveToken`).
3. `resolve_report(report_id, token)` es la única forma de marcar un reporte como resuelto, y exige que el token coincida con el guardado en `report_tokens`.
4. Si no coincide, la función lanza una excepción (`raise exception`) y la operación falla.

**Verificado en vivo** durante el desarrollo: un intento de cierre con token propio funcionó; un intento con token forjado vía `fetch` directo desde la consola del navegador fue rechazado con error 400.

**Limitación aceptada**: si el usuario cambia de navegador o borra `localStorage`, pierde la capacidad de cerrar su propio reporte. No hay recuperación de token implementada — la mitigación es "Reportar contenido inapropiado" para pedir revisión manual. Ver [[Risk-Register]].

## Hecho: RLS (Row Level Security)

Todas las tablas tienen RLS activado. Regla general aplicada de forma consistente:

- Lectura pública solo donde tiene sentido (`reports`, `shelters`).
- `INSERT`/`UPDATE` directo revocado de `anon`/`authenticated` donde la operación necesita validación (reports, resolved).
- Tablas de soporte (`report_rate_limits`, `report_tokens`) completamente cerradas — ni lectura ni escritura directa.
- Tablas de moderación (`report_flags`, `shelter_suggestions`) solo `INSERT` público, sin `SELECT` — se revisan manualmente.

## Hecho: privacidad de datos

- **No se piden datos de identidad** (nombre real, cédula, correo) para reportar.
- **El contacto (WhatsApp/teléfono) es público por diseño** — es necesario para que la comunidad pueda escribir directo. Esto está advertido explícitamente en `/como-funciona`: "Todo lo que pongas en un reporte es público... no compartas datos que no quieras hacer públicos aparte del número para que te escriban."
- **La IP nunca se guarda en texto plano** — solo su hash SHA-256, y solo para rate limiting.
- **La anon key de Supabase es pública por diseño** — no es una fuga de seguridad, es como está pensado el modelo (ver [[Architecture]]).

## Pregunta abierta

- ¿Debería existir un mecanismo de recuperación de `resolve_token` (ej. vía el mismo número de contacto)? No implementado; identificado como limitación aceptada, no como bug.

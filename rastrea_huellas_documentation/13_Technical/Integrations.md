---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Descubrimiento técnico
dependencies:
  - "[[Architecture]]"
related_documents:
  - "[[Recommended-Stack]]"
  - "[[Decision-Log]]"
---

# Integrations — Rastrea Huellas

## Propósito del documento

Lista los sistemas externos que la app usa hoy (y uno que se evaluó y se descartó), con su propósito, datos que maneja, autenticación y riesgos.

Se considera suficiente cuando alguien puede auditar todas las dependencias externas del proyecto desde un solo lugar.

## Activas

### Supabase

- **Propósito**: única base de datos y storage de archivos (fotos). Ver [[Data-Model]].
- **Datos**: reportes, refugios, tokens, rate limits — nada de datos personales sensibles más allá de un número de contacto público.
- **Autenticación**: anon key pública en el cliente (segura de exponer, ver [[Architecture]]). Sin service-role key en el código de la app.
- **Plan**: gratuito.
- **Riesgo**: límites del tier gratuito bajo tráfico alto. Ver [[Risk-Register]].

### MapTiler

- **Propósito**: tiles del mapa (calles, ciudades).
- **Datos**: ninguno sensible — solo solicita tiles de mapa por coordenadas.
- **Autenticación**: API key pública (`NEXT_PUBLIC_MAPTILER_KEY`), incluida en cada request de tile.
- **Plan**: gratuito, 100.000 tile loads/mes.
- **Fallback**: si la key no está configurada, usa tiles públicos de OpenStreetMap (solo apto para desarrollo, no para producción con tráfico real — ver [[Decision-Log]]).
- **Configurado en producción**: sí, desde el 12 de agosto de 2026.

### Vercel

- **Propósito**: hosting del frontend Next.js. Deploy automático en cada push a `main`.
- **Plan**: Hobby (gratuito).
- **Riesgo**: límites de banda/ejecución del tier gratuito. Ver [[Risk-Register]] y [[Launch-Readiness]].

### Vaki

- **Propósito**: campaña de donación externa ("Una Garra por Colombia"), enlazada desde `/ayuda`. No hay integración técnica — es un link externo verificado manualmente.

## Evaluada y descartada

### Web3Forms

- **Propósito evaluado**: enviar un correo de aviso cuando alguien sugiere un refugio nuevo, sin necesitar backend propio.
- **Por qué se descartó**: el flujo de acceso cambió a requerir creación de cuenta (verificación de correo + check de Cloudflare), y la API pasó a ser una función de pago. Se retiró el código que la invocaba (commit `4918a7e`).
- **Estado actual**: el formulario de sugerencia de refugio sigue funcionando — solo guarda en Supabase, sin aviso automático. Ver [[Support-Model]] para el proceso manual que lo reemplaza.
- **Alternativas no evaluadas a fondo** (quedan como opción futura si se decide retomar la idea): Resend (free tier real), EmailJS, Database Webhooks de Supabase.

---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Alcance
dependencies:
  - "[[Project-Brief]]"
related_documents:
  - "[[Product-Requirements]]"
  - "[[Flows]]"
  - "[[Decision-Log]]"
---

# Scope and MVP — Rastrea Huellas

## Propósito del documento

Describe qué se construyó como versión mínima, qué se dejó fuera a propósito, y por qué. Evita que alguien reintroduzca funcionalidad ya descartada sin conocer la razón original.

Debe ayudar a responder:

- ¿Qué hace la app hoy?
- ¿Qué se decidió no construir, y por qué?

Se considera suficiente cuando el alcance real coincide con lo que está en producción.

## Hecho: funcionalidades construidas (MVP real, ya en producción)

| Funcionalidad | Ruta | Estado |
|---|---|---|
| Ver reportes recientes (home) | `/` | Completada |
| Reportar mascota perdida / encontrada / en refugio | `/reportar` | Completada |
| Ver todos los reportes, en lista o mapa, con filtros | `/mapa` | Completada |
| Ver detalle de un reporte | `/mascota/[id]` | Completada |
| Contactar por WhatsApp a quien reportó | `/mascota/[id]` | Completada |
| Compartir un reporte (WhatsApp / portapapeles / share nativo) | `/mascota/[id]` | Completada |
| Marcar un reporte propio como resuelto | `/mascota/[id]` | Completada |
| Reportar contenido inapropiado | `/mascota/[id]` | Completada |
| Ver directorio de refugios | `/refugios` | Completada |
| Sugerir un refugio nuevo | `/refugios/sugerir` | Completada |
| Ver refugios pineados en el mapa | `/mapa` | Completada |
| Donar (Vaki / Bre-B) e info del proyecto | `/ayuda` | Completada |
| Preguntas frecuentes | `/como-funciona` | Completada |
| Compresión de fotos antes de subir | `/reportar` | Completada |

## Hecho: fuera de alcance (decisión explícita)

- **Cuentas de usuario / login.** Ver [[Decision-Log]] — decisión fundacional, no una limitación temporal.
- **Moderación automática de contenido.** La moderación es 100% manual, vía Table Editor de Supabase. Ver [[Support-Model]].
- **Notificaciones push o por correo.** Se evaluó Web3Forms para avisar por correo de sugerencias de refugio nuevas; se descartó cuando pasó a ser una función de pago. Ver [[Decision-Log]].
- **Analítica / medición de uso.** No implementada. Ver [[PROJECT_STATUS]] para el estado de esta pregunta abierta.
- **Multi-idioma.** La app es exclusivamente en español, para el público colombiano afectado.
- **App nativa (iOS/Android).** Es una web app responsive, mobile-first, sin versión nativa.

## Hecho: restricción de plataforma que definió el alcance

El equipo determinó desde el principio que el uso real sería mayoritariamente desde el celular ("nadie va a andar con laptop en la calle reportando"), lo que llevó a un diseño mobile-first con navegación inferior fija (`BottomNav`) en vez de un menú de escritorio tradicional.

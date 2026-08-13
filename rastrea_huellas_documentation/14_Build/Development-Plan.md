---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Construcción
dependencies:
  - "[[Scope-and-MVP]]"
  - "[[Architecture]]"
related_documents:
  - "[[Bug-Tracker]]"
  - "[[Handoff-ApexOne]]"
---

# Development Plan — Rastrea Huellas

## Propósito del documento

Registra en qué orden real se construyó el proyecto, agrupado en fases. No es un plan a futuro — es el historial de cómo se llegó al estado actual, útil para entender por qué ciertas decisiones (como la seguridad de tokens) llegaron "después" en vez de estar desde el día uno.

Se considera suficiente cuando alguien entiende la secuencia real de construcción sin leer el historial completo de commits.

## Hecho: fases de construcción

| Fase | Contenido | Estado |
|---|---|---|
| F0 — Setup | Scaffold Next.js, conexión a Supabase existente, esquema inicial de datos | Completada |
| F1 — MVP base | Formulario de reporte, mapa público con pines filtrable, feed de respaldo, deploy en Vercel | Completada |
| F1b — Diseño | Configuración de shadcn/ui, aplicación de paleta y tipografía de Stitch, rediseño de inicio/formulario/detalle | Completada |
| F2 — Seguridad | Rate limiting, honeypot, verificación de tiempo, y luego (a raíz de un hallazgo de QA) el sistema de tokens de resolución | Completada |
| F3 — Refugios | Página de refugios, formulario de sugerencia, geocodificación de direcciones reales | Completada |
| F3b — Pulido | Botón de compartir, refugios pineados en el mapa, página "Cómo funciona" | Completada |
| F3c / F3d — Ayuda y donaciones | Página de Ayuda con Vaki, Bre-B, créditos y links | Completada |
| F4 — Robustez técnica | Key de MapTiler en producción, compresión de fotos en el navegador, retiro de Web3Forms | Completada |
| F5 — Migración a VPS | Handoff técnico a Apex One para su propia infraestructura | En progreso — ver [[Handoff-ApexOne]] |

## Hecho: patrón de trabajo real

El ciclo típico de cada cambio fue: implementar → correr SQL en Supabase manualmente (cuando aplicaba) → verificar en vivo en el navegador (incluyendo intentos de romper controles de seguridad desde la consola) → confirmar con Andrés. No hubo entorno de staging separado — las pruebas se hicieron contra el proyecto real de Supabase y, para verificación final, contra producción en Vercel.

## Hecho: sin tests automatizados

No existen tests unitarios ni end-to-end automatizados. Toda la validación fue manual, en vivo, en cada entrega. Ver [[Bug-Tracker]] para los hallazgos reales de ese proceso.

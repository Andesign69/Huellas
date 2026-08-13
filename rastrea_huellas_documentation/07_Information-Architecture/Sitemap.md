---
status: Completada
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Arquitectura de información
dependencies:
  - "[[Scope-and-MVP]]"
related_documents:
  - "[[UI-Overview]]"
  - "[[Flows]]"
---

# Sitemap — Rastrea Huellas

## Propósito del documento

Muestra todas las rutas reales de la aplicación y su relación con la navegación principal. Sirve como mapa rápido para ubicar cualquier pantalla sin recorrer el código.

Se considera suficiente cuando cubre el 100% de las rutas existentes en `src/app/`.

No aplica documentación de taxonomía o búsqueda avanzada — la app no las tiene; es navegación plana de pocas rutas.

## Hecho: rutas reales

| Ruta | Pantalla | En nav inferior |
|---|---|---|
| `/` | Inicio — hero, accesos rápidos (Perdí / Encontré), reportes recientes | Sí — "Inicio" |
| `/reportar` | Formulario de reporte (acepta `?status=perdido\|encontrado` por query param) | Sí — "Reportar" |
| `/mapa` | Todos los reportes, lista o mapa, con filtros y refugios pineados | Sí — "Reportes" |
| `/mascota/[id]` | Detalle de un reporte — contacto, compartir, marcar resuelto, reportar contenido | No (se llega desde tarjetas/pines) |
| `/refugios` | Directorio de refugios y fundaciones | Sí — "Refugios" |
| `/refugios/sugerir` | Formulario para sugerir un refugio nuevo | No (se llega desde `/refugios`) |
| `/ayuda` | Donaciones (Vaki, Bre-B), créditos, links a andresmartinez.tech y apexone.tech | Sí — "Ayuda" |
| `/como-funciona` | Preguntas frecuentes (8 preguntas) | No (se llega desde `/ayuda`) |

## Hecho: navegación

Navegación inferior fija (`BottomNav.tsx`), 5 ítems, siempre visible, patrón estándar de app móvil:

```text
Inicio · Reportar · Reportes · Refugios · Ayuda
```

No hay navegación de escritorio separada — el mismo patrón se usa en todos los tamaños de pantalla porque el diseño es mobile-first.

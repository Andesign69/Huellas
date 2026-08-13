---
status: Completada
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: UI Design
dependencies:
  - "[[Sitemap]]"
related_documents:
  - "[[Foundations]]"
  - "[[Recommended-Stack]]"
---

# UI Overview — Rastrea Huellas

## Propósito del documento

Resume la dirección visual real del proyecto y el inventario de pantallas construidas. No sustituye al [[Foundations|sistema de diseño]] — lo complementa con contexto de origen y de inventario.

Se considera suficiente cuando cualquier persona entiende de dónde salió la dirección visual y qué pantallas existen, sin abrir Figma ni el código.

## Hecho: origen de la dirección visual

La paleta de color y tipografía se diseñaron en **Stitch** (herramienta de IA de Google para UI), a partir de mockups que Andrés generó y ajustó. El naming original de Stitch fue "Refugiosismo"; el proyecto se quedó con **Rastrea Huellas** por disponibilidad y simplicidad del dominio.

Intención declarada de la paleta: transmitir calma, evitar colores alarmistas — coherente con ser una herramienta usada en medio de una emergencia.

## Hecho: inventario de pantallas

8 pantallas, todas construidas y en producción (ver [[Sitemap]] para las rutas):

1. Inicio
2. Reportar
3. Reportes (lista/mapa)
4. Detalle de mascota
5. Refugios
6. Sugerir refugio
7. Ayuda
8. Cómo funciona / FAQ

## Hecho: patrones visuales recurrentes

- **Chips/pills** para filtros y selección de opciones (`PillGroup`), con soporte de deselección en campos opcionales como sexo.
- **Cards redondeadas** (`rounded-2xl`) como contenedor estándar de sección.
- **Grid de 2 columnas** para listas de reportes — decisión explícita para aprovechar espacio con muchos reportes simultáneos, en vez de tarjetas grandes de una columna.
- **Navegación inferior fija** en todas las pantallas.
- **Mapa con leyenda de color**: rojo/verde/azul según estado del reporte (perdido/encontrado/en refugio), naranja para refugios.

## Hecho: componentes shadcn/ui usados

Button, Input, Textarea, Label, Select, Badge, Card — ver [[Foundations]] para el detalle de tokens.

## Supuesto

- Supuesto: no existe un archivo Figma vivo mantenido — el diseño de Stitch fue el punto de partida, y desde ahí se iteró directo en código.
- Motivo: no se mencionó ni compartió un archivo Figma en ningún momento del proyecto.
- Nivel de confianza: Alto.
- Riesgo si es incorrecto: Bajo — no bloquea nada, solo afecta si alguien busca un Figma que no existe.
- Estado: No validado explícitamente con Andrés.

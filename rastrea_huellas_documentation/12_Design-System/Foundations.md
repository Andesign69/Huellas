---
status: Completada
applicability: Recomendado
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Sistema de diseño
dependencies:
  - "[[UI-Overview]]"
related_documents:
  - "[[Recommended-Stack]]"
---

# Foundations — Rastrea Huellas

## Propósito del documento

Documenta los tokens de diseño reales (color, tipografía, radios) tal como están definidos en `src/app/globals.css`. No es un sistema de diseño construido desde cero — es la adopción de shadcn/ui con tokens propios.

Se considera suficiente cuando alguien puede recrear la identidad visual sin abrir el CSS.

No aplica documentación extensa de componentes — se usa shadcn/ui tal cual, sin librería propia de componentes.

## Hecho: paleta de color (modo claro)

| Token | Valor | Uso |
|---|---|---|
| `background` | `#F0EAD6` | Fondo general (crema) |
| `foreground` | `#1F2A20` | Texto principal |
| `primary` | `#5F7A61` | Acento principal (verde salvia) |
| `secondary` | `#D4A373` | Acento secundario (tostado) |
| `tertiary` | `#E9EDC9` | Superficies suaves (verde pálido) |
| `card` | `#FFFFFF` | Fondo de tarjetas |
| `destructive` | `#C0392B` | Errores, acciones destructivas |
| `border` / `input` | `#DDD5BC` | Bordes |

Existe modo oscuro completo (`.dark`) con la misma estructura de tokens.

## Hecho: tipografía

- **Heading**: Plus Jakarta Sans (`next/font/google`)
- **Body**: Be Vietnam Pro (`next/font/google`)
- **Mono**: Geist Mono (para datos como la llave Bre-B)

## Hecho: radios y forma

`--radius: 1rem` como base, con escalas derivadas (`sm` a `4xl`). Todo el UI usa esquinas redondeadas consistentemente — es parte deliberada de la identidad de marca (calma, accesibilidad visual).

## Hecho: librería de componentes

**shadcn/ui** (no un sistema propio). Componentes en uso: Button, Input, Textarea, Label, Select, Badge, Card. Configuración en `components.json`.

## Decisión: por qué no un sistema de diseño propio

Evaluado implícitamente y descartado por tamaño del proyecto — un MVP de una sola persona/equipo pequeño no justifica construir una librería de componentes desde cero cuando shadcn/ui ya cubre las necesidades. Consistente con la regla del playbook de no sobredimensionar el sistema para un MVP pequeño.

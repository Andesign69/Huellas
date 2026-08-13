---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Contexto
dependencies: []
related_documents:
  - "[[PROJECT_APPLICABILITY_MATRIX]]"
  - "[[Scope-and-MVP]]"
  - "[[Communication-Plan]]"
---

# Project Brief — Rastrea Huellas

## Propósito del documento

Resume el contexto inicial, los objetivos, los involucrados, las restricciones y el resultado esperado del proyecto. Sirve como punto de entrada para cualquier persona (o IA) que se sume después.

Debe ayudar a responder:

- ¿Qué problema resuelve esto y para quién?
- ¿Quién está involucrado?
- ¿Qué límites reales tiene el proyecto?
- ¿Cuál es la visión de fondo?

Se considera suficiente cuando alguien nuevo puede entender el "qué" y el "por qué" sin necesitar leer el código.

## Hecho: el problema

El 10 de agosto de 2026 ocurrió un sismo de magnitud 7.4 en Colombia (epicentro en San José del Palmar, Chocó). Las ciudades más afectadas fueron Cali, Pereira, Manizales y Quibdó. Además de personas, muchas mascotas quedaron perdidas o separadas de sus familias.

No existía una herramienta específica para que la comunidad reportara y buscara mascotas perdidas o encontradas en esta emergencia.

## Hecho: la solución

Rastrea Huellas es una aplicación web gratuita y sin ánimo de lucro que permite a cualquier persona, sin necesidad de crear cuenta:

- Reportar una mascota perdida, encontrada o en un refugio.
- Buscar reportes por ciudad, estado y especie, en lista o en mapa.
- Consultar un directorio de refugios y fundaciones de rescate.
- Sugerir un refugio nuevo para la lista.

En producción: **https://huellas-khaki.vercel.app**

## Hecho: involucrados

| Rol | Quién |
|---|---|
| Creador / product owner | Andrés Martínez |
| Colaborador | Diego Peña |
| Infraestructura futura (VPS + dominio) | Apex One (colaborador de repo: skolleigen@proton.me) |
| Desarrollo | Andrés Martínez con asistencia de Claude Code |

## Hecho: restricciones reales

- **Tiempo**: se construyó bajo presión, en días, por la naturaleza de la emergencia. No hubo margen para investigación o validación formal.
- **Equipo**: sin equipo dedicado más allá de Andrés y Diego. Sin presupuesto para herramientas pagas.
- **Infraestructura**: cuenta gratuita de Supabase (la única que existía antes del proyecto), sin plan de escalar a un tier pago todavía.
- **Sin cuentas de usuario**: decisión de producto explícita — ver [[Decision-Log]] — no una limitación técnica.

## Supuesto: referencia informal

- Supuesto: la app colombiana "Colombia te busca" (enfocada en personas desaparecidas, no mascotas) fue la inspiración conceptual inicial.
- Motivo: mencionada al inicio de las conversaciones de planeación como punto de partida.
- Nivel de confianza: Alto (mencionado directamente por el creador).
- Riesgo si es incorrecto: Ninguno — es solo contexto de inspiración, no una dependencia funcional.
- Método de validación: No aplica.
- Estado: No validado formalmente, pero no es crítico.

## Hecho: visión y propuesta de valor

Del copy real de la app (`/ayuda`, `/como-funciona`):

> "Rastrea Huellas fue creada por Andrés Martínez con ayuda de Diego Peña y Apex One para ayudar a reunir mascotas perdidas y encontradas tras el sismo del 10 de agosto de 2026 en Colombia. Es una app gratuita y sin ánimo de lucro, construida por voluntad propia para apoyar a la comunidad afectada. No reemplaza a las autoridades, a la Cruz Roja ni a los organismos oficiales de emergencia."

Principios de producto observables en las decisiones tomadas (no un documento formal, pero consistentes en todo el proyecto):

- Cero fricción para reportar — nada de cuentas, nada de pasos innecesarios.
- Gratis siempre, sin publicidad, sin monetización.
- Seguridad real (no cosmética), incluso sin cuentas de usuario.
- Resolver dentro del stack existente antes de sumar un servicio nuevo — ver [[Recommended-Stack]].

## Pregunta abierta

- ¿Hasta cuándo se mantiene el proyecto activo? No hay una fecha de cierre definida — depende de cuánto dure la necesidad post-sismo.

---
status: Completada
applicability: Requerido
owner: Andrés Martínez
reviewers: Apex One
created: 2026-08-13
updated: 2026-08-13
phase: Gobierno
dependencies: []
related_documents:
  - "[[PRODUCT_PROJECT_PLAYBOOK]]"
  - "[[AGENTS]]"
  - "[[PROJECT_STATUS]]"
  - "[[PROJECT_TRACKER]]"
---

# Project Applicability Matrix — Rastrea Huellas

## Propósito del documento

Esta matriz clasifica cada etapa del [[PRODUCT_PROJECT_PLAYBOOK]] según si aplica a Rastrea Huellas, y por qué. Es la base para decidir qué documentos se crean y cuáles no.

Debe ayudar a responder:

- ¿Qué etapas del playbook tienen contenido real que vale la pena documentar?
- ¿Qué etapas se omitieron a propósito, y por qué?
- ¿Qué queda pendiente de decidir?

Se considera suficiente cuando cada etapa tiene una clasificación y una justificación basada en lo que realmente ocurrió, no en lo que "debería" haber ocurrido.

No aplica como documento de planeación futura — es retroactivo. Rastrea Huellas se construyó bajo presión de tiempo (sismo del 10 de agosto de 2026) sin pasar formalmente por las primeras etapas del playbook. Este documento existe para dejar constancia de eso, no para simular que sí se hicieron.

## Nota de contexto

El playbook estaba pensado para usarse desde el inicio del proyecto (Etapa 0 → Etapa 19, en orden). En la práctica, el equipo empezó a construir de inmediato por la urgencia de la emergencia, sin pasar por investigación formal, personas, wireframes o validación de usabilidad. Esta matriz documenta el proyecto **tal como se construyó**, no un plan ideal.

## Matriz

| Etapa | Aplicabilidad | Justificación | Riesgo de omitirla | Decisión |
|---|---|---|---|---|
| 0. Intake y organización | Requerido | Hay contexto real (sismo, urgencia, stakeholders, restricciones) disperso en conversaciones que vale la pena consolidar | Bajo — el contexto vive en la memoria del equipo, se pierde con el tiempo | Crear `01_Contexto/Project-Brief.md` |
| 1. Definición del problema | Requerido | El problema está claro y ya resuelto en la práctica; documentarlo da trazabilidad para quien llegue después | Bajo | Incluido dentro de `Project-Brief.md` |
| 2. Investigación | No aplica | No se hizo investigación formal. Única referencia informal: la app "Colombia te busca" (enfocada en personas, no mascotas) como precedente conceptual | Bajo — el caso de uso es simple y no ambiguo | Omitir; la referencia se menciona en `Project-Brief.md` |
| 3. Usuarios | No aplica | No se crearon personas ni Jobs to Be Done formales. Los dos roles (quien reporta / quien busca) son autoevidentes por el dominio | Bajo — dominio de un solo caso de uso claro | Omitir como etapa separada; los roles se documentan dentro de `Flows.md` |
| 4. Estrategia de producto | Recomendado (simplificada) | Existen visión y propuesta de valor reales, ya escritas en el copy de la app ("Sobre esta app", `/ayuda`) | Medio — sin registrarlo, decisiones futuras (ej. cobrar, agregar cuentas) podrían contradecir el principio fundacional sin que nadie note la ruptura | Resumida dentro de `Project-Brief.md`, sin documento propio |
| 5. Alcance y MVP | Requerido | El alcance real del MVP, y lo explícitamente descartado (cuentas de usuario), son decisiones ya tomadas y con razones concretas | Alto — sin esto, alguien podría reintroducir cuentas de usuario sin saber por qué se evitaron a propósito | Crear `05_Scope/Scope-and-MVP.md` |
| 6. Requerimientos | Requerido | Reglas de negocio reales (rate limiting, tokens de resolución, honeypot) ya implementadas en `supabase/schema.sql` | Alto — son reglas de seguridad; deben quedar legibles fuera del SQL también | Crear `06_Requirements/Product-Requirements.md` |
| 7. Arquitectura de información | Recomendado | Sitemap real y pequeño (8 rutas), vale la pena tenerlo en un solo lugar | Bajo | Crear `07_Information-Architecture/Sitemap.md` |
| 8. User Flows | Recomendado | Flujos reales ya construidos y en producción (reportar, resolver, sugerir refugio, compartir) | Medio — sin esto es difícil auditar los flujos de seguridad sin leer el código | Crear `08_User-Flows/Flows.md` |
| 9. UX y wireframes | No aplica | Se pasó directo de mockups de Stitch a UI final; no hubo fase de wireframe independiente, por la urgencia | Bajo — ya construido y probado en producción | Omitir |
| 10. Validación | No aplica (formal) | No hubo pruebas de usabilidad formales. Sí hubo QA manual real (Andrés probando cada entrega y reportando bugs con capturas) | Bajo — esa evidencia real se documenta como Bug Tracker en Construcción, no como Validation Plan | Omitir como etapa; el contenido real va en `14_Build/Bug-Tracker.md` |
| 11. UI Design | Recomendado | Dirección visual real (paleta y tipografía de Stitch) e inventario real de pantallas (8) | Bajo | Crear `11_UI-Design/UI-Overview.md` |
| 12. Sistema de diseño | Recomendado (simplificado) | Tokens de color/tipografía reales + shadcn/ui como librería adoptada — no se construyó un sistema propio desde cero | Bajo | Crear `12_Design-System/Foundations.md`, liviano |
| 13. Descubrimiento técnico | Requerido | Es la etapa con más decisiones reales y de mayor riesgo si se pierden (seguridad sin cuentas, Leaflet vs. Google Maps, etc.) | Alto — perderlo significa que futuros mantenedores (Apex One) no entienden el "por qué" de la arquitectura | Crear `13_Technical/Architecture.md`, `Data-Model.md`, `Security-and-Privacy.md`, `Recommended-Stack.md`, `Integrations.md` |
| 14. Construcción | Requerido | Fases reales de build, bugs reales encontrados y corregidos, y un handoff ya entregado a Apex One | Alto | Crear `14_Build/Development-Plan.md`, `Bug-Tracker.md`; mover el handoff existente a `Handoff-ApexOne.md` |
| 15. Go-to-Market | Recomendado (simplificado) | Existen decisiones reales de difusión (Vaki, Bre-B, cuentas de Arya en IG/TikTok, guion de reel) | Bajo — es difusión orgánica, no una estrategia comercial compleja | Crear `15_Go-To-Market/Communication-Plan.md` |
| 16. Analítica | No aplica | No hay ningún tipo de analítica implementada todavía | Bajo por ahora — puede volverse importante si crece el tráfico | No crear documento vacío; queda como pregunta abierta en `PROJECT_STATUS.md` |
| 17. Operaciones | Recomendado (simplificado) | Existe un modelo real de soporte/moderación (manual, vía Table Editor de Supabase) | Medio — sin documentarlo, nadie más sabe cómo se moderan reportes o sugerencias de refugios | Crear `17_Operations/Support-Model.md` |
| 18. Lanzamiento | Requerido | El proyecto ya está lanzado y en producción; hay estado real y vigente que registrar | Alto — es la referencia de estado más consultada | Crear `18_Launch/Launch-Readiness.md` |
| 19. Iteración | Pendiente de decisión | Hay feedback real (bugs reportados por Andrés) pero se solapa con `Bug-Tracker.md`; no está claro si merece documento propio todavía | Bajo | Omitir por ahora; reevaluar si crece el volumen de feedback post-lanzamiento |
| 20. Gobierno | Requerido | Hay un historial real y valioso de decisiones técnicas y de producto, con su razón de ser, que ya evitó al menos una regresión de seguridad | Alto — es el documento que evita repetir discusiones ya resueltas | Crear `20_Governance/Decision-Log.md`, `Risk-Register.md` |
| Design QA (transversal) | No aplica | No se usó el framework de Design QA de este paquete durante la construcción; la QA fue manual y directa (ver `Bug-Tracker.md`) | Bajo | Omitir por ahora; se puede activar para pantallas nuevas que se agreguen después |

## Resumen de documentos a crear

**Raíz:**
- `PROJECT_STATUS.md`
- `PROJECT_TRACKER.md`

**Por carpeta:**

```text
01_Contexto/Project-Brief.md
05_Scope/Scope-and-MVP.md
06_Requirements/Product-Requirements.md
07_Information-Architecture/Sitemap.md
08_User-Flows/Flows.md
11_UI-Design/UI-Overview.md
12_Design-System/Foundations.md
13_Technical/Architecture.md
13_Technical/Data-Model.md
13_Technical/Security-and-Privacy.md
13_Technical/Recommended-Stack.md
13_Technical/Integrations.md
14_Build/Development-Plan.md
14_Build/Bug-Tracker.md
14_Build/Handoff-ApexOne.md
15_Go-To-Market/Communication-Plan.md
17_Operations/Support-Model.md
18_Launch/Launch-Readiness.md
20_Governance/Decision-Log.md
20_Governance/Risk-Register.md
```

## Etapas explícitamente omitidas

- Investigación (2)
- Usuarios / Personas (3)
- UX y wireframes (9)
- Validación formal (10)
- Analítica (16)
- Iteración como etapa propia (19)
- Design QA transversal

Ninguna de estas tiene contenido real que documentar — crear archivos para ellas violaría la regla del playbook de no producir documentación por producir documentación.

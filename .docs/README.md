# Documentación Oficial — HabitApp (Plataforma Integral de Hábitos y Bienestar)

Esta carpeta centraliza toda la documentación técnica, reglas de arquitectura, esquemas de base de datos, diseños oficiales y matrices de calidad de **HabitApp**.

## 📂 Estructura de `.docs`

* `0-contexto-y-vision/` — Visión del producto, módulos funcionales (Usuarios, Hábitos, Comunidad, Entrenadores y Administración) y políticas de privacidad.
* `1-nuevo-plan-refactor/` — Documentación viva de la arquitectura vigente:
  * [Bitácora de Reglas de Oro y Directrices de Arquitectura](file:///home/kairos/Proyectos/habitapp-web/.docs/1-nuevo-plan-refactor/bitacora-reglas-y-directrices-arquitectura.md) (**Lectura obligatoria**).
  * [Plan de Migración y Refactorización Clean Architecture](file:///home/kairos/Proyectos/habitapp-web/.docs/1-nuevo-plan-refactor/plan-migracion-y-refactor.md).
  * [Prompt de Sincronización para Nuevas Sesiones](file:///home/kairos/Proyectos/habitapp-web/.docs/1-nuevo-plan-refactor/prompt-para-nuevo-chat.md).
* `2-arquitectura-frontend/` — Reglas de Arquitectura Limpia en Next.js 16 (App Router), separación en 4 capas (`UI -> Server Actions -> Services -> BaseRepository`) y flujo de trabajo Gitflow.
* `3-base-datos-y-sql/` — Scripts SQL de esquemas (`gestion`, `seguimiento`, `comunidad`), restricciones, índices, políticas RLS y consultas analíticas.
* `4-diseno-y-assets/` — Sistema de diseño (`DESIGN.md`), diagramas de casos de uso y pantallas organizadas por módulo en `assets/disenos/Escritorio/` (`1.Pre-inicio` a `12.Administrador`) y `assets/disenos/Movil/`.
* `5-calidad-qa/` — Historias de usuario definitivas, matriz de riesgo, formato QA y reporte de pruebas.
* `6-historico-legacy/` — Archivo histórico de versiones preliminares (v0.1, v1.0 y planes iniciales).

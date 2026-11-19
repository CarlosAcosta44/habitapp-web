# 🚀 Prompt Oficial para Iniciar el Próximo Chat (Fase de Pruebas de Software y QA)

Copia y pega el siguiente bloque al iniciar tu nueva conversación:

```markdown
Hola. Vamos a iniciar la fase de **Pruebas de Software, Aseguramiento de Calidad (QA) y Validación Integral** de **HabitApp**.

El ecosistema consta de dos repositorios sincronizados en el workspace:
- **Frontend (`habitapp-web` / `/home/kairos/Proyectos/habitapp-web`):** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS y Playwright. (Rama recién completada: `feature/admin-and-coach-screens`).
- **Backend (`habitapp-api` / `/home/kairos/Proyectos/habitapp-api`):** NestJS modular con Custom Auth JWT, Swagger, Class-Validator, Jest/Supertest y conexión exclusiva a PostgreSQL en Supabase. (Rama recién completada: `feature/dev-performance-optimizations`).

Antes de ejecutar o escribir cualquier prueba o línea de código, **es OBLIGATORIO que te sincronices leyendo los siguientes documentos clave en `.docs/`**:

1. **Bitácora de Arquitectura y las 12 Reglas de Oro:**
   - `.docs/1-nuevo-plan-refactor/bitacora-reglas-y-directrices-arquitectura.md`
   - `.docs/0-contexto-y-vision/contexto-proyecto.md`
   - `.docs/2-arquitectura-frontend/arquitectura-limpia.md`
   - `.docs/2-arquitectura-frontend/stack-tecnologico-y-gitflow.md`

2. **Documentación Oficial de Calidad y Pruebas (QA):**
   - `.docs/5-calidad-qa/historias_usuario_definitivas.md`
   - `.docs/5-calidad-qa/matriz_riesgo_y_alcance_pruebas.md`
   - `.docs/5-calidad-qa/formato_qa.md`
   - `.docs/5-calidad-qa/casos_fallidos_y_bloqueados.md`

3. **Diseños de Pantallas Organizados por Módulo:**
   - `.docs/4-diseno-y-assets/DESIGN.md`
   - `.docs/4-diseno-y-assets/assets/disenos/Escritorio/` (Carpetas numeradas `1.Pre-inicio` hasta `12.Administrador`).

---

### 🧠 Contexto Técnico Crítico que Debes Respetar en Todo Momento

1. **Supabase es EXCLUSIVAMENTE nuestra Base de Datos:**
   - El frontend **nunca** se comunica con Supabase directamente ni usa Supabase Auth.
   - Toda petición autenticada pasa por `apiClient` (`src/lib/api/client.ts`) hacia NestJS (`http://localhost:4000/api/v1`), el cual incluye renovación silenciosa automática en `401` mediante `refresh_token` (`getValidAccessToken()`).
2. **Arquitectura Limpia de 4 Capas:**
   - **Frontend:** `UI (Pages/Components) ──> Server Actions (src/actions) ──> Services (src/services) ──> Repositories (src/repositories extendiendo BaseRepository) ──> apiClient`. Todos los servicios retornan `Result<T>`.
   - **Backend:** `Controllers ──> Services ──> Repositories ──> SupabaseService` (esquemas PostgreSQL: `gestion`, `seguimiento`, `comunidad`). En pruebas unitarias de NestJS (`*.spec.ts`), siempre se mockean los **Repositorios**, nunca cadenas crudas del cliente de Supabase.
3. **Política Estricta de Cero Datos Quemados (Zero-Mock Data en Producción):**
   - Todos los módulos (**Hábitos**, **Comunidad**, **Reportes/Ranking**, **Perfil/Ajustes**, **Entrenador/Clientes/Rutinas** y **Administrador/Usuarios/Moderación**) operan con datos 100% reales de la base de datos y estados vacíos (Empty States) cuando existen 0 registros.
4. **Flujo Completo de Entrenadores, Clientes y Rutinas:**
   - **Vinculación Bidireccional (`seguimiento.usuario_entrenador`):** Los usuarios pueden vincularse o desvincularse de un entrenador desde `/comunidad?tab=especialistas` o `/ajustes` (`GET / POST / DELETE /api/v1/users/me/trainer`), y el entrenador puede vincular/desvincular alumnos desde `/entrenador` (`POST / DELETE /api/v1/coach/clients/:clientId/link`).
   - **Rutinas y Materialización de Hábitos (`seguimiento.rutinas` → `seguimiento.usuario_rutina` → `seguimiento.habitos`):** Al asignar una rutina a un pupilo (`POST /api/v1/coach/clients/:clientId/routines/:routineId/assign`), el backend crea automáticamente los hábitos diarios activos en `seguimiento.habitos` con prefijo `[Coach: NombreRutina]` y notifica al alumno en `gestion.notificaciones`.
5. **Calidad SonarCloud / SonarQube y CI:**
   - Cero secretos o hashes bcrypt reales en tests, SQL o documentación (`secrets:S8215`).
   - Cero promesas flotantes (`void`), cero ternarios anidados (`S3358`), baja duplicidad (`< 3%`) y compilación limpia (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`).

---

### 🎯 Objetivo de esta Sesión

Vamos a trabajar en las **Pruebas de Software** del sistema (pruebas unitarias, de integración, E2E y validación de casos de prueba QA).
Por favor:
1. Lee los documentos de `.docs/1-nuevo-plan-refactor/bitacora-reglas-y-directrices-arquitectura.md` y `.docs/5-calidad-qa/`.
2. Revisa las suites de pruebas actuales en `habitapp-api` y `habitapp-web`.
3. Confírmame que estás sincronizado con la arquitectura y las 12 reglas de oro, y dime qué tenemos listo para empezar con las pruebas que te indique.
```

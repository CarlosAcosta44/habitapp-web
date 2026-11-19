# Plan de Migración y Refactorización (Frontend Web & Backend API) — Estado Completado

**Objetivo Principal:** Desconectar completamente el frontend de HabitApp de llamadas directas a Supabase, integrarlo con el Backend NestJS (Custom Auth JWT) bajo Arquitectura Limpia de 4 capas, eliminar el 100% de datos mockeados y completar los módulos de Usuario, Comunidad, Entrenador y Administrador.

---

## 1. Desconexión de Supabase Auth y Consolidación de Custom Auth (✅ Completado)
1. **Supabase exclusivamente como Base de Datos:** El frontend `habitapp-web` no realiza llamadas directas a Supabase Auth ni PostgREST. Todo el acceso ocurre mediante `habitapp-api` (NestJS).
2. **Cliente HTTP Centralizado (`src/lib/api/client.ts`):**
   - Inyecta automáticamente `Authorization: Bearer <access_token>` y `x-timezone-offset`.
   - **Renovación Silenciosa en `401`:** Si el `access_token` expira, `apiClient` invoca automáticamente `/api/v1/auth/refresh` usando el `refresh_token`, actualiza la caché en memoria para renders concurrentes de Server Components, persiste las nuevas cookies `HttpOnly` y reintenta la petición original sin pedirle al usuario que vuelva a iniciar sesión.

## 2. Arquitectura Limpia de 4 Capas en Frontend (✅ Completado)
* **Capa 1: UI / Presentación (`src/app` y `src/components`)** — Server Components para carga inicial paralela (`Promise.all`) y Client Components interactivos sin datos quemados.
* **Capa 2: Server Actions (`src/actions/*.actions.ts`)** — Validación con Zod, control de sesión (`requireUser`) y revalidación de rutas (`revalidatePath`).
* **Capa 3: Services (`src/services/*.service.ts`)** — Lógica de dominio retornando objetos `Result<T>`.
* **Capa 4: Repositories (`src/repositories/*.repository.ts`)** — Heredan de `BaseRepository`, encapsulando las peticiones HTTP hacia NestJS.

## 3. Módulos Integrados con Datos 100% Reales (✅ Completado)
1. **Dashboard de Hábitos (`/habitos`) y Progreso (`/reportes`, `/ranking`):** CRUD de hábitos, soft-delete para preservar historial, cálculo real de rachas y mapas de calor.
2. **Comunidad y Bienestar (`/comunidad`):** Foros, comentarios anidados con imágenes, hábitos compartidos clonables, retos comunitarios con check-in diario y directorio de especialistas con vinculación real de entrenador.
3. **Perfil (`/perfil`) y Ajustes (`/ajustes`):** Datos reales de cuenta, correo, logros, amigos y sección de *Acompañamiento Profesional* conectada al entrenador y rutinas reales del usuario.
4. **Portal del Entrenador (`/entrenador` y `/entrenador/clientes/[id]`):** Gestión de pupilos vinculados, creación de plantillas de rutinas con hábitos modulares, asignación con materialización automática en `seguimiento.habitos`, heatmap real de 70 días y envío de recomendaciones in-app.
5. **Panel de Administración (`/admin`, `/admin/usuarios`, `/admin/moderacion`):** KPIs globales reales, gestión de roles (`Usuario`, `Entrenador`, `Administrador`) y estados de cuenta (`Activo`, `Suspendido`), y moderación de foros/comentarios.

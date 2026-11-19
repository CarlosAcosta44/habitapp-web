# 🛡️ Bitácora de Cambios, Reglas de Oro y Directrices de Arquitectura

Este documento consolida la arquitectura vigente de **HabitApp** en `habitapp-web` (Frontend Next.js 16) y `habitapp-api` (Backend NestJS), así como las **Reglas de Oro**, el flujo completo de **Entrenadores, Clientes y Rutinas**, el sistema de **Renovación Silenciosa de Sesión JWT** y la organización oficial de `.docs`.

---

## 📌 1. Estado Actual de los Módulos del Sistema

### A. Autenticación Custom Auth (NestJS) y Renovación Silenciosa en `apiClient`
- **Supabase sólo como Base de Datos:** El frontend no utiliza `@supabase/supabase-js` para autenticación ni consultas. Toda comunicación ocurre vía HTTP REST hacia NestJS (`NEXT_PUBLIC_API_URL`, por defecto `http://localhost:4000/api/v1`).
- **Renovación Automática de Tokens en `src/lib/api/client.ts`:**
  - Las cookies `access_token` y `refresh_token` (`HttpOnly`, 7 días) autentican cada petición.
  - Si cualquier petición en `apiClient` recibe `401 Unauthorized` (por expiración del `access_token`), `apiClient` invoca automáticamente `/auth/refresh` usando el `refresh_token`, almacena el nuevo token en una caché en memoria deduplicada (`refreshedAccessTokens`) para que los renders paralelos de Server Components utilicen el token fresco de inmediato, actualiza las cookies cuando el contexto lo permite y reintenta la petición original de forma transparente.
  - Los endpoints `multipart/form-data` (`updateAvatar` en `usuario.service.ts` y `uploadComunidadImageAction` en `comunidad.actions.ts`) utilizan `getValidAccessToken()` con reintento automático en `401`.

### B. Módulo de Entrenadores, Clientes y Rutinas (`/entrenador` y `/entrenador/clientes/[id]`)
- **Cero Datos Quemados (Zero-Mock Policy):**
  - Eliminados todos los clientes semilla, rutinas ficticias, hábitos de respaldo (`"Hidratación consciente"`, etc.), fórmulas simuladas de heatmap (`offset % 3 === 0`), recomendaciones estáticas y porcentajes de adherencia por defecto (`80%`/`85%`).
  - Cuando un entrenador inicia sesión, solo visualiza los alumnos legítimamente vinculados a su `identrenador` en `seguimiento.usuario_entrenador` y las rutinas creadas por él en `seguimiento.rutinas`.
- **Flujo Bidireccional de Vinculación Cliente ↔ Entrenador:**
  1. **Desde el Usuario (`/comunidad?tab=especialistas` y `/ajustes`):** Cualquier usuario puede vincularse o desvincularse de un entrenador certificado mediante `POST / DELETE /api/v1/users/me/trainer/:trainerId`. En `/ajustes` (sección *Acompañamiento Profesional*), el usuario consulta su entrenador real activo y las rutinas asignadas (reemplazando el antiguo mock de *"Dra. Elena Vidal"*).
  2. **Desde el Entrenador (`/entrenador`):** El coach puede vincular usuarios disponibles (`GET /coach/available-clients`, `POST /coach/clients/:clientId/link`) o desvincularlos (`DELETE /coach/clients/:clientId/link`).
- **Ciclo Completo de Rutinas (`seguimiento.rutinas` → `seguimiento.usuario_rutina` → `seguimiento.habitos`):**
  - El entrenador crea plantillas de rutina con **Título/Objetivo**, **Categoría** (`tipo`), **Nivel** (`nivel`), **Duración en días** (`duracion`), **Descripción** y **Hábitos Diarios Modulares**.
  - Al asignar una rutina a un pupilo (`POST /coach/clients/:clientId/routines/:routineId/assign`), el backend:
    1. Registra la relación activa en `seguimiento.usuario_rutina`.
    2. Materializa los hábitos de la rutina en `seguimiento.habitos` para el alumno con el prefijo `[Coach: NombreRutina]`.
    3. Envía una notificación in-app al alumno en `gestion.notificaciones`.
  - En `/entrenador/clientes/[id]`, `ReportsService.getUserSummary` clasifica automáticamente los hábitos con `[Coach:` como `tipo: 'Asignado'`, permitiendo filtrar entre **Todos**, **Asignados por Coach** y **Personales**.

### C. Módulo de Administración (`/admin`, `/admin/usuarios`, `/admin/moderacion`)
- **Dashboard Analítico (`/admin`):** Métricas 100% reales desde `gestion.usuarios`, `seguimiento.habitos`, `seguimiento.registro_habitos` y `comunidad.foros`.
- **Gestión de Usuarios y Roles (`/admin/usuarios`):**
  - Paginación y búsqueda real sobre `gestion.usuarios`.
  - Cambio de rol (`PATCH /users/:id/role`) compatible con `{ nombrerol, role }` insensible a mayúsculas/minúsculas (`Usuario`, `Entrenador`, `Administrador`). Si un usuario es promovido a `Entrenador`, se asegura automáticamente su registro en `seguimiento.entrenadores`.
  - Suspensión/reactivación de cuentas (`PATCH /users/:id/status`) con protección contra auto-bloqueo o auto-degradación de rol del propio administrador.
- **Moderación Comunitaria (`/admin/moderacion`):** Inspección y eliminación real de foros y comentarios con registro de acciones en sesión.

### D. Navegación por Rol y Perfil de Usuario (`/perfil`)
- `Sidebar.tsx` normaliza `user.nombrerol` y `user.role`, habilitando enlaces a **Entrenador** (`/entrenador`) para entrenadores y ambos enlaces (**Administrador** `/admin` y **Entrenador** `/entrenador`) para administradores.
- `PerfilPage` (`/perfil`) muestra exclusivamente datos reales del usuario autenticado (correo real desde `gestion.usuarios.email`, racha real, hábitos activos, tasa de cumplimiento mensual, puntos, logros desbloqueados de `gestion.usuario_logro` y amigos reales de `gestion.amigos`).

---

## ⚠️ 2. Las 12 Reglas de Oro de Ingeniería (¡OBLIGATORIAS!)

### Regla 1: Supabase es EXCLUSIVAMENTE nuestra Base de Datos
- **Prohibido** usar Supabase Auth o el cliente de Supabase directamente desde `habitapp-web`.
- Toda operación debe pasar por `apiClient` hacia `habitapp-api` (NestJS), y sólo los Repositorios de NestJS interactúan con PostgreSQL/Storage en Supabase.

### Regla 2: Política de Cero Datos Quemados (Zero-Mock Data)
- **Prohibido** inicializar estados de React con arrays de clientes, hábitos, recomendaciones, especialistas (como *"Dra. Elena Vidal"*) o estadísticas inventadas (como rachas de `24` días o adherencias del `80%`/`85%`).
- Si una consulta devuelve `0` registros, la interfaz debe renderizar un **Estado Vacío (Empty State)** claro y accionable.

### Regla 3: Renovación Silenciosa de Tokens vía `apiClient` y `getValidAccessToken()`
- Nunca leer `cookies().get("access_token")` manualmente para hacer `fetch()` crudos sin respaldo de refresh.
- Usar siempre `apiClient` (para JSON) o `getValidAccessToken()` (para `multipart/form-data`), garantizando que cualquier expiración de token se renueve silenciosamente mediante `refresh_token`.

### Regla 4: Preservación Sagrada del Historial de Hábitos
- **Prohibido** hacer `DELETE` físico de hábitos con historial o de `seguimiento.registro_habitos`. Usar siempre Soft-Delete (`estado = 'Inactivo'`).
- Al registrar cumplimiento diario, enviar siempre la fecha local `YYYY-MM-DD` (nunca `new Date().toISOString()` directo sin ajustar zona horaria).

### Regla 5: Restricciones de Longitud en PostgreSQL (`VARCHAR`)
- `seguimiento.habitos`: `nombre` es `VARCHAR(45)`, `descripcion` es `VARCHAR(200)`.
- `comunidad.foros`: `titulo` y `categoria` son `VARCHAR(45)`.
- `seguimiento.rutinas`: `tipo` es `VARCHAR(30)`, `nivel` es `VARCHAR(20)`, `objetivo` es `VARCHAR(200)`, `descripcion` es `VARCHAR(500)`.
- Validar y truncar siempre antes de insertar para evitar errores `22001 (value too long)`.

### Regla 6: Vinculación Bidireccional y Verificación en Entrenadores
- Todo acceso del entrenador al progreso o recomendaciones de un alumno en `CoachService` debe verificar primero `getClientTrainerRelationship(trainerId, clientId)` en `seguimiento.usuario_entrenador`.
- Toda asignación de rutina debe materializar sus hábitos en `seguimiento.habitos` con prefijo `[Coach: ...]` para que el alumno pueda cumplirlos y el coach pueda auditarlos.

### Regla 7: Arquitectura Limpia Estricta en Frontend (4 Capas)
- `UI (Components/Pages) ──> Server Actions (src/actions) ──> Services (src/services) ──> Repositories (BaseRepository / apiClient)`.
- Todos los servicios y repositorios devuelven `Result<T>` (`{ success: boolean, data?: T, error?: string }`).

### Regla 8: Subida Nativa de Archivos Multimedia
- Usar siempre `<input type="file" accept="image/*">` procesado mediante Server Actions hacia NestJS (`POST /users/me/avatar` o `POST /users/community/upload-image`).

### Regla 9: Pruebas Unitarias Desacopladas en Backend
- Los servicios de NestJS inyectan Repositorios (`UsersRepository`, `CoachRepository`, `AdminRepository`, etc.). En pruebas unitarias (`*.spec.ts`), mockear siempre el Repositorio correspondiente.

### Regla 10: Cero Secretos o Hashes Reales en Documentación o SQL (`secrets:S8215`)
- Nunca incluir hashes bcrypt reales ni tokens en archivos `.sql` o `.md`. Usar placeholders como `<HASH_DE_CONTRASEÑA_TEMPORAL>`.

### Regla 11: Manejo Estricto de Promesas Flotantes (`typescript:S9383`)
- En eventos de UI, envolver llamadas asíncronas con `void funcionAsincrona()` o `startTransition(async () => { await ... })`.

### Regla 12: Accesibilidad WCAG y Reutilización con `BaseRepository`
- Iconos decorativos con `aria-hidden="true"` y todos los repositorios extendiendo de `BaseRepository`.

---

## 🎨 3. Estructura Organizada de Diseños de Pantalla (`.docs/4-diseno-y-assets/`)

Los diseños de referencia (`screen.png` + `code.html`) están organizados por módulo dentro de `.docs/4-diseno-y-assets/assets/disenos/Escritorio/` (y su contraparte en `Movil/`):

1. `1.Pre-inicio/` — Landing page de bienvenida.
2. `2.Iniciar sesion/` — Login, autenticación y recuperación de contraseña.
3. `3.Crear cuenta/` — Registro de nuevos usuarios.
4. `4.Dashboard/` — `habitapp_dashboard_diario_escritorio` y `habitapp_detalle_del_h_bito_modal_escritorio`.
5. `5.Crear-habitos/` — `habitapp_crear_h_bito_modal_escritorio`.
6. `6.Retos/` — `habitapp_retos_y_desaf_os_escritorio`.
7. `7.Comunidad/` — Vista general, foros, detalle de foro con hilos anidados, crear foro, hábitos comunitarios, compartir hábito, artículos/guías y directorio de especialistas.
8. `8.Reportes-ranking/` — `habitapp_progreso_y_m_tricas_escritorio` y `ranking.png`.
9. `9.Perfil/` — `habitapp_perfil_de_usuario_escritorio` y `habitapp_editar_perfil_escritorio`.
10. `10.Ajustes/` — `habitapp_ajustes_escritorio`.
11. `11.Entrenador/` — `habitapp_portal_del_entrenador_escritorio` y `habitapp_detalle_y_progreso_del_cliente_escritorio`.
12. `12.Administrador/` — `habitapp_panel_principal_admin_escritorio`, `habitapp_gesti_n_de_usuarios_y_roles_escritorio` y `habitapp_centro_de_moderaci_n_comunitaria_escritorio`.

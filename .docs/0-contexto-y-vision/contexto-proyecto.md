# Contexto y Planeación General — HabitApp (Sistema de Gestión de Hábitos Saludables)

Este documento centraliza el contexto arquitectónico y funcional actualizado de **HabitApp**, alineado con la arquitectura **Next.js 16 (Frontend)** + **NestJS (Backend Custom Auth & API REST)** + **Supabase PostgreSQL (Persistencia exclusiva en Base de Datos)**.

---

## 🚀 1. Visión General y Objetivos
**HabitApp** es una plataforma digital diseñada para ayudar a las personas a mejorar su calidad de vida a través del seguimiento de hábitos positivos, salud mental y bienestar físico. El sistema utiliza **gamificación** (puntos, niveles, logros y rachas) para mantener la motivación diaria, fomenta la interacción social mediante un módulo de **comunidad** (foros, retos, artículos y hábitos compartidos) y permite la supervisión clínica/deportiva mediante **entrenadores certificados**.

### Roles del Sistema (`gestion.roles`)
1. **Usuario (`Usuario`):** Registra hábitos diarios, marca progreso, participa en foros y retos comunitarios, acumula puntos/logros y puede vincularse con un Entrenador certificado para recibir rutinas y recomendaciones personalizadas.
2. **Entrenador (`Entrenador`):** Profesional certificado con acceso al **Portal del Entrenador (`/entrenador`)**. Gestiona su cartera de alumnos vinculados, diseña plantillas maestras de rutinas con hábitos modulares, asigna rutinas (que se materializan automáticamente como hábitos diarios activos en el panel del alumno), audita el mapa de calor de 70 días de cada pupilo (`/entrenador/clientes/[id]`) y envía recomendaciones in-app.
3. **Administrador (`Administrador`):** Supervisa la salud global de la plataforma (`/admin`), gestiona usuarios, roles y estados de cuenta (`/admin/usuarios`), modera foros y comentarios comunitarios (`/admin/moderacion`) y cuenta con acceso transversal al portal de entrenadores.

---

## 🏗️ 2. Arquitectura y Stack Tecnológico
El proyecto implementa una **Arquitectura Limpia (Clean Architecture)** donde **Supabase funciona única y exclusivamente como motor de base de datos PostgreSQL y almacenamiento de archivos (Storage) consumido por el backend NestJS**. El frontend jamás se comunica directamente con Supabase.

- **Frontend (`habitapp-web`):** Next.js 16 (App Router + Turbopack), React 19, TypeScript estricto y Tailwind CSS.
- **Backend (`habitapp-api`):** NestJS modular (`auth`, `users`, `habits`, `community`, `coach`, `admin`, `reports`, `notifications`) con `Controllers -> Services -> Repositories`.
- **Autenticación (Custom Auth JWT):** Gestionada 100% por NestJS (`/api/v1/auth/login`, `/register`, `/refresh`). Emite `access_token` y `refresh_token` almacenados en cookies `HttpOnly`. El cliente HTTP del frontend (`src/lib/api/client.ts`) intercepta respuestas `401` y renueva silenciosamente el token en memoria y cookies sin interrumpir la sesión del usuario.
- **Base de Datos:** PostgreSQL en Supabase dividida en 3 esquemas relacionales:
  - `gestion`: `usuarios`, `roles`, `entrenadores`/`administradores`, `notificaciones`, `amigos`, `logros`, `usuario_logro`, `historial_puntos`.
  - `seguimiento`: `habitos`, `registro_habitos`, `categorias_habitos`, `recordatorios`, `entrenadores`, `usuario_entrenador`, `rutinas`, `usuario_rutina`, `seguimientos`.
  - `comunidad`: `foros`, `comentarios`, `articulos`, `retos`, `usuario_reto`, `reacciones`, `habitos_comunidad`.

### Flujo de Capas en el Frontend (`habitapp-web`)

```
UI / Page (Server Component / Client Component)
  └── Server Action (src/actions/*.actions.ts)   ← Valida sesión y entrada con Zod + revalida caché
        └── Service (src/services/*.service.ts)  ← Lógica de negocio y transformación de dominio
              └── Repository (src/repositories/) ← Extiende BaseRepository, consume apiClient
                    └── Backend NestJS API (/api/v1/*)
                          └── Supabase PostgreSQL (Esquemas: gestion, seguimiento, comunidad)
```

### Reglas Estrictas entre Capas del Frontend

| Capa | Puede llamar a | Prohibido llamar a |
|---|---|---|
| **UI / Page (`src/app`, `src/components`)** | Server Actions (`src/actions`), Services (solo lectura en Server Components) | `fetch()` directo, Supabase SDK |
| **Server Action (`src/actions`)** | Services (`src/services`), `requireUser` | Repositories directo, Supabase SDK |
| **Service (`src/services`)** | Repositories (`src/repositories`) | Cookies, FormData, Supabase SDK |
| **Repository (`src/repositories`)** | `BaseRepository` / `apiClient` (`src/lib/api/client.ts`) | Base de datos directa |

---

## 🔄 3. Funcionamiento del Módulo de Entrenadores, Clientes y Rutinas

### A. ¿Cómo un usuario se convierte en Entrenador?
- Un **Administrador** puede ascender a cualquier usuario al rol `Entrenador` desde `/admin/usuarios` (`PATCH /api/v1/users/:id/role`).
- Al asignarse el rol `Entrenador`, el backend crea o verifica automáticamente su ficha profesional en `seguimiento.entrenadores` (`identrenador`, `idusuario`, `especialidad`, `experiencia`, `certificacion`).

### B. ¿Cómo se vinculan los Usuarios (Clientes) con un Entrenador?
La vinculación se almacena en la tabla `seguimiento.usuario_entrenador` (`idusuario`, `identrenador`, `fechainicio`) y es **bidireccional**:
1. **Desde la cuenta del Usuario (Autovinculación):**
   - El usuario entra a **Comunidad → Especialistas** (`/comunidad?tab=especialistas`), donde se listan los entrenadores reales registrados.
   - Al hacer clic en **"Vincular Coach"**, se ejecuta `POST /api/v1/users/me/trainer/:trainerId`, creando el vínculo en `seguimiento.usuario_entrenador` y enviando una notificación automática al entrenador.
   - En **Ajustes → Acompañamiento Profesional** (`/ajustes`), el usuario visualiza su entrenador activo, las rutinas que este le ha asignado y puede desvincularse en cualquier momento (`DELETE /api/v1/users/me/trainer/:trainerId`).
2. **Desde la cuenta del Entrenador (`/entrenador`):**
   - El entrenador hace clic en **"Vincular Alumno"**, consulta los usuarios disponibles de la plataforma (`GET /api/v1/coach/available-clients`) y vincula o desvincula pupilos con un clic (`POST / DELETE /api/v1/coach/clients/:clientId/link`).
   - En su panel **solo aparecen los clientes realmente vinculados a ese entrenador** (cero datos quemados).

### C. ¿Cómo funcionan las Rutinas y sus Hábitos?
1. **Creación de Plantillas Maestras (`seguimiento.rutinas`):**
   - Desde `/entrenador`, el coach crea plantillas indicando: **Título/Objetivo** (`objetivo`), **Categoría** (`tipo`), **Nivel** (`nivel`), **Duración en días** (`duracion`), **Descripción del protocolo** (`descripcion`) y la lista de **Hábitos Diarios Incluidos**.
2. **Asignación de Rutina a un Cliente (`POST /api/v1/coach/clients/:clientId/routines/:routineId/assign`):**
   - Registra la asignación activa en `seguimiento.usuario_rutina`.
   - **Materialización Automática de Hábitos:** El backend inserta automáticamente cada hábito de la rutina como un hábito activo (`estado: 'Activo'`, etiquetado con `[Coach: NombreRutina]`) en `seguimiento.habitos` para el alumno, asociado a la categoría correspondiente y con fecha de finalización según la duración de la rutina.
   - Envía una notificación in-app a `gestion.notificaciones` informando al alumno.
3. **Seguimiento y Auditoría (`/entrenador/clientes/[id]`):**
   - El alumno ve y marca diariamente los hábitos asignados en su dashboard `/habitos`.
   - El entrenador supervisa en tiempo real el progreso diario (`Hoy: X/Y hábitos`), racha actual, tasa de adherencia, mapa de calor histórico de 70 días y filtra entre hábitos **"Asignados por Coach"** y **"Personales"**.

| ![Logo SENA](./assets/pr05/pr05-image1.png) | Servicio Nacional de Aprendizaje — SENA · Centro de Electricidad, Electrónica y Telecomunicaciones — CEET | Tecnólogo en Análisis y Desarrollo de Software (ADSO) · Trimestre 6 |
| :---: | ----- | ----- |

# CAPÍTULO III · PR-05

## Informe de Pruebas de Integración

**Interfaces API ↔ base de datos ↔ servicios externos**

| Campo | Detalle |
| ----- | ----- |
| **FASE** | **EJECUCIÓN / INFORME** |
| **Proyecto formativo** | HabitApp |
| **Ficha** | 3278641 |
| **Equipo / Autores** | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo |
| **Instructor(es)** | Zaida Ojeda · Javier Yara · Victor Cortez |
| **Criterio de evaluación** | Trimestre 6 — En el proyecto se evidencia que se haya usado alguna técnica de pruebas de software. |
| **Versión del documento** | 1.0 |
| **Fecha** | 09/11/2026 |
| **Ciudad** | Bogotá D.C. |

## Control del documento

### Historial de versiones

| Versión | Fecha | Autor(es) | Descripción del cambio |
| ----- | ----- | ----- | ----- |
| 0.1 | 05/11/2026 | Carlos Mario Acosta Velasquez y Breiner Rodriguez Causil | Creación del documento y configuración del entorno de integración API REST (NestJS) ↔ PostgreSQL (Supabase). |
| 0.2 | 05/11/2026 | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo | Ejecución de los 82 casos CP-INT con Supertest y Postman/Newman; detección de 3 defectos de integración (DEF-005 a DEF-007). |
| 1.0 | 09/11/2026 | Carlos Mario Acosta Velasquez | Re-prueba de casos tras aplicar políticas RLS y validación binaria de 5 MiB (98,8 % de aprobación) y cierre formal del informe PR-05. |

### Revisión y aprobación

| Rol | Nombre | Firma | Fecha |
| ----- | ----- | :---: | ----- |
| Elaboró (aprendiz / equipo) | Carlos Mario Acosta Velasquez / Breiner Rodriguez Causil | ![Firma Carlos Acosta](./assets/pr05/pr05-image2.png) | 05/11/2026 |
| Revisó (líder técnico / Scrum Master) | Carlos Mario Acosta Velasquez | ![Firma Carlos Acosta](./assets/pr05/pr05-image2.png) | 06/11/2026 |
| Aprobó (instructor / Product Owner) | Zaida Ojeda |  | 09/11/2026 |

## Ubicación en el paquete documental

| Atributo | Referencia |
| ----- | ----- |
| **Documento que lo precede** | PR-04 Informe de pruebas unitarias |
| **Documento que lo sucede** | PR-06 Informe de pruebas de sistema |
| **Norma / referente principal** | ISO/IEC/IEEE 29119-3 |

## Contenido

1. [Contexto de ejecución](#1-contexto-de-ejecución)
2. [Enfoque de integración](#2-enfoque-de-integración)
3. [Resumen](#3-resumen)
4. [Resultados por interfaz](#4-resultados-por-interfaz)
5. [Detalle de ejecución](#5-detalle-de-ejecución)
6. [Validación de contratos de API](#6-validación-de-contratos-de-api)
7. [Evidencias](#7-evidencias)
8. [Conclusiones y recomendaciones](#8-conclusiones-y-recomendaciones)

## 1. Contexto de ejecución

| Parámetro | Especificación |
| ----- | ----- |
| Entorno | Entorno Local / QA conectado a proyecto PostgreSQL 15+ administrado en Supabase de pruebas — API REST: http://localhost:4000/api/v1 · Web: http://localhost:3000 · Emulador Android: http://10.0.2.2:4000/api/v1 |
| Versión probada (build / tag) | API REST v1.4.0 · Frontend Web v1.2.0 · App Móvil v1.0.0 · Esquema BD 20261023000001 (Sprint 2) |
| Fechas de ejecución | 05/11/2026 – 09/11/2026 |
| Ejecutores | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo |
| Herramientas | Supertest + Jest (test/jest-e2e.json), Postman + Newman CLI (htmlextra), Cliente JS @supabase/supabase-js (pruebas directas RLS con anon key), OpenAPI / Swagger (swagger.json) y servidor SMTP de pruebas (Mailtrap) |

## 2. Enfoque de integración

| Parámetro | Especificación |
| ----- | ----- |
| Estrategia | Incremental por capas y módulos funcionales (Autenticación y Perfil → Core de Hábitos y Registros → Reportes, Notificaciones y Gamificación → Comunidad y Retos → Entrenador, Administración y Seguridad RLS). |
| Interfaces probadas | 1) API ↔ PostgreSQL (Supabase): Persistencia en esquemas gestion, seguimiento y comunidad, triggers de puntos/logros y bloqueo directo mediante políticas Row Level Security (RLS).<br>2) API ↔ Servicios externos: Supabase Storage (buckets de avatares e imágenes de comunidad con límite binario de 5 MiB = 5.242.880 B) y transporte SMTP.<br>3) Web ↔ API: Consumo desde Server Actions y repositorios de Next.js con cookies HttpOnly.<br>4) Móvil ↔ API: Consumo desde DioClient y AuthInterceptor en Flutter con renovación automática de JWT. |
| Dobles para servicios externos | Bandeja SMTP sandbox (Mailtrap) para captura de correos de recuperación de contraseña (US005) sin despacho a servidores públicos; proyecto Supabase aislado de QA con datos sintéticos (seed.sql). |
| Automatización | Suites E2E/Integración con Supertest (test/app.e2e-spec.ts, test/coach.e2e-spec.ts, test/admin.e2e-spec.ts) y colección automatizada Postman / Newman validada contra el contrato openapi.yaml / swagger.json. |

**bash — ejecución con Newman**

```bash
# 1. Preparación de datos semilla sintéticos en Supabase QA y ejecución de suites Supertest
cd habitapp-api
node scripts/recreate-synthetic-users-v4.mjs
node scratch/seed_history.js
npm run test:e2e

# 2. Ejecución automatizada de la colección completa de contratos y endpoints con Newman
npx newman run docs/api/habitapp-integration.postman_collection.json \
  -e docs/api/qa.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export coverage/newman-integracion-pr05.html
```

## 3. Resumen

**Tabla 1. Resumen de resultados**

| Indicador | Valor | Meta (PR-01 / MC-01) | Estado |
| ----- | ----- | ----- | ----- |
| Casos planificados | 82 casos de integración (CP-INT-001 a CP-INT-082 especificados en PR-02) | — | Cumple |
| Casos ejecutados | 82 / 82 (100 %) | 100 % | Cumple |
| Casos aprobados | 81 / 82 (98,8 %) tras re-prueba (79 aprobados en 1.ª corrida; 2 defectos corregidos y 1 limitación menor de diseño JWT documentada) | $\ge 95$ % | Cumple |
| Casos fallidos | 1 (1,2 %) — CP-INT-077 (latencia de cambio de rol en sesión activa antes de expirar el access token de 15 min; severidad Media/Baja) | — | Cumple (0 críticos/altos) |
| Casos bloqueados | 0 (0 %) | 0 | Cumple |
| Defectos encontrados (C/A/M/B) | 1 / 1 / 1 / 0 en 1.ª ejecución (DEF-005 Crítico y DEF-006 Alto cerrados y corregidos; DEF-007 Medio documentado con mitigación vía refresh token) → Abiertos al cierre: 0 Críticos y 0 Altos | Críticos = 0 y Altos = 0 abiertos | Cumple |

## 4. Resultados por interfaz

**Tabla 2. Resultados por interfaz**

| Interfaz | Casos | Aprobados | Fallidos | % éxito | Observación |
| ----- | :---: | :---: | :---: | :---: | ----- |
| API ↔ BD (PostgreSQL / Supabase + Políticas RLS) | 48 | 48 | 0 | 100,0 % | Se corrigió y verificó en re-prueba la política RLS sobre gestion.usuarios (DEF-005); transacciones de rachas, puntos y cascadas operan sin duplicidad. |
| API ↔ servicios externos (Supabase Storage 5 MiB y SMTP) | 8 | 8 | 0 | 100,0 % | Validación binaria exacta en ParseFilePipeBuilder (5.242.880 B aceptado con 200/201; 5.242.881 B y PDF rechazados con HTTP 422 tras corregir DEF-006). |
| Web ↔ API (Next.js Server Actions, Cookies HttpOnly y Guards) | 16 | 15 | 1 | 93,8 % | En CP-INT-077 (DEF-007), el cambio de rol en BD requiere invocar /auth/refresh para reflejarse en el JWT stateless vigente. Resto de contratos al 100 %. |
| Móvil ↔ API (DioClient, AuthInterceptor, multipart de avatar) | 10 | 10 | 0 | 100,0 % | Renovación silenciosa de refresh_token, sincronización de zona horaria UTC-5 y subida de imágenes comprimidas ($\le 5\text{ MiB}$) verificadas con éxito. |
| **Total / Consolidado** | **82** | **81** | **1** | **98,8 %** | **Cumple el criterio de salida ($\ge 95\%$ de aprobación y 0 defectos críticos/altos abiertos).** |

## 5. Detalle de ejecución

**Tabla 3. Detalle de ejecución**

| ID | Caso / escenario | Resultado esperado | Resultado obtenido | Estado | Defecto |
| ----- | ----- | ----- | ----- | ----- | ----- |
| CP-INT-001 | POST /api/v1/auth/register con correo válido y clave en límites válidos (6, 8 y 50 caracteres) | 201; usuario creado con hash bcrypt en BD y sin contraseña en la respuesta | 201 Created; fila creada en gestion.usuarios con hash bcrypt y respuesta limpia | Aprobado | — |
| CP-INT-002 | POST /api/v1/auth/register con correo sin “@” o clave fuera de rango (5 y 51 caracteres) | 400 Bad Request por validación de DTO; sin registro en BD | 400 Bad Request detallando las reglas de RegisterDto; 0 filas insertadas | Aprobado | — |
| CP-INT-003 | POST /api/v1/auth/register con correo ya registrado previamente | 409 (o 400) con mensaje claro; sin duplicado en BD | 409 Conflict (“El correo electrónico ya está registrado”); sin duplicados | Aprobado | — |
| CP-INT-004 | POST /api/v1/auth/login con credenciales válidas de usuario activo | 200; cookie access_token con HttpOnly y sin hash en el cuerpo | 200 OK; cabecera Set-Cookie con HttpOnly; SameSite=Lax y token JWT válido | Aprobado | — |
| CP-INT-005 | POST /api/v1/auth/login con contraseña incorrecta o correo inexistente | 401 con el mismo mensaje genérico sin revelar qué dato falló | 401 Unauthorized (“Credenciales inválidas”) idéntico en ambos escenarios | Aprobado | — |
| CP-INT-006 | POST /api/v1/auth/refresh con cookie o refreshToken válido | 200; devuelve nuevo access_token y expires_in = 900 | 200 OK; token renovado y cookie de sesión actualizada correctamente | Aprobado | — |
| CP-INT-007 | POST /api/v1/auth/refresh con token expirado o inválido | 401 con mensaje “Refresh token expirado o inválido” | 401 Unauthorized con el mensaje esperado | Aprobado | — |
| CP-INT-008 | POST /api/v1/auth/reset-password con correo registrado | 200; token temporal generado y correo recibido en SMTP de pruebas | 200 OK; enlace de recuperación capturado en la bandeja de Mailtrap | Aprobado | — |
| CP-INT-009 | PUT /api/v1/auth/update-password con token válido/clave de 8 caracteres y con token vencido/clave de 5 | 200 con datos válidos (permite login posterior); 400/401 con datos inválidos | 200 OK en flujo válido y login exitoso; 400/401 en token vencido o clave corta | Aprobado | — |
| CP-INT-010 | GET /api/v1/users/me y consulta en gestion.usuarios tras el registro | 200; perfil con UUID único, avatar por defecto y rol “Usuario regular” | 200 OK; UUID v4 válido, URL de avatar predeterminado y rol inicial asignado | Aprobado | — |
| CP-INT-011 | PATCH /api/v1/users/me con nombre, apellido y zona UTC-5 válidos, y con nombre vacío | 200 y persistencia en datos válidos; 400 en nombre vacío | 200 OK (zona_horaria = 'UTC-5' devuelta en GET /users/me); 400 si el nombre va vacío | Aprobado | — |
| CP-INT-012 | POST /api/v1/users/me/avatar con imagen JPG válida de 1 MiB (1.048.576 bytes) | 200 (o 201); URL de la foto actualizada en Storage y BD | 200 OK; archivo subido al bucket de Supabase y URL persistida en el perfil | Aprobado | — |
| CP-INT-013 | GET /api/v1/users/me sin cookie de sesión o con token expirado | 401 Unauthorized | 401 Unauthorized retornado por JwtAuthGuard | Aprobado | — |
| CP-INT-014 | POST /api/v1/auth/logout con sesión activa y reintento posterior en GET /users/me | 200 en logout (cookie expirada) y 401 al reutilizar la sesión cerrada | 200 OK limpiando cookies; 401 en petición subsiguiente | Aprobado | — |
| CP-INT-015 | POST /api/v1/users/habits con nombre, meta, categoría del catálogo e idusuario distinto en body | 201; hábito asociado al usuario del JWT (ignora idusuario inyectado) | 201 Created; fila en seguimiento.habitos vinculada al UUID del token JWT | Aprobado | — |
| CP-INT-016 | POST /api/v1/users/habits sin nombre, sin meta o con categoría fuera del catálogo | 400 Bad Request; sin registro en BD | 400 Bad Request en los tres casos inválidos | Aprobado | — |
| CP-INT-017 | POST /api/v1/users/habits con preajustes “Todos los días” (7), “L-V” (5) y “Personalizado” (1 día) | 201; días guardados exactamente según la configuración | 201 Created; arreglo de días persistido con 7, 5 y 1 día respectivamente | Aprobado | — |
| CP-INT-018 | POST /api/v1/users/habits con frecuencia personalizada y 0 días seleccionados | 400 Bad Request; sin registro en BD | 400 Bad Request exigiendo seleccionar al menos un día de la semana | Aprobado | — |
| CP-INT-019 | PATCH /api/v1/users/habits/:id agregando recordatorios “00:00” y “23:59” y luego quitando “00:00” | 200; persiste ambas horas y tras actualizar conserva solo “23:59” | 200 OK; GET /habits/:id refleja exactamente ["23:59"] tras la edición | Aprobado | — |
| CP-INT-020 | PATCH /api/v1/users/habits/:id con horas inválidas (“24:00” y “12:60”) | 400 por formato HH:mm inválido | 400 Bad Request rechazado por expresión regular de formato horario | Aprobado | — |
| CP-INT-021 | GET /api/v1/users/habits/dashboard con hábito activo de hoy sin registro (en UTC-5 a las 23:59 locales) | 200; aparece en “Hoy” como Pendiente respetando el día local (TD1-R1) | 200 OK; listado como Pendiente en el día local sin desfase a medianoche UTC | Aprobado | — |
| CP-INT-022 | GET /api/v1/users/habits/dashboard con hábito activo de hoy y registro completado hoy | 200; aparece en “Hoy” como Completado (TD1-R2) | 200 OK; estado completadoHoy: true | Aprobado | — |
| CP-INT-023 | GET /api/v1/users/habits/dashboard con hábito activo no programado para el día actual | 200; no se incluye en la lista de “Hoy” (TD1-R3) | 200 OK; hábito excluido correctamente del listado diario | Aprobado | — |
| CP-INT-024 | GET /api/v1/users/habits/dashboard y ?estado=Inactivo con hábito archivado programado hoy | 200; no aparece en “Hoy” y solo se devuelve al filtrar por Inactivo (TD1-R4) | 200 OK; oculto en el dashboard diario y presente en el filtro de archivados | Aprobado | — |
| CP-INT-025 | POST /api/v1/users/records/completar en hábito propio pendiente hoy y en hábito de otro usuario | 201 en hábito propio; 403 o 404 en hábito ajeno | 201 Created en registro_habitos para el titular; 403/404 para el usuario intruso | Aprobado | — |
| CP-INT-026 | POST /api/v1/users/records/completar en UTC-5 a las 23:59 local (D) y 00:00 local (D+1) | 201; fechas guardadas como días locales D y D+1 consecutivos | 201 Created; columnas fecha_registro almacenan exactamente los dos días locales | Aprobado | — |
| CP-INT-027 | DELETE /api/v1/users/records/desmarcar/:habitoId en hábito completado hoy y en hábito sin check | 200 en completado (revierte 10 puntos y progreso, TD2-R4); 400/404 sin check | 200 OK descontando 10 puntos y eliminando registro de hoy; 404 en segundo intento | Aprobado | — |
| CP-INT-028 | PATCH /api/v1/users/habits/:id con datos válidos, con nombre vacío y sobre hábito ajeno | 200 en válido; 400 en vacío; 403/404 en hábito ajeno | 200 OK al actualizar propio; 400 con nombre vacío; 403/404 con token de otro usuario | Aprobado | — |
| CP-INT-029 | PATCH /api/v1/users/habits/:id a estado “Inactivo” y consulta posterior de /records/habito/:id | 200; sale de “Hoy” pero conserva intactos sus registros históricos | 200 OK; historial de cumplimientos devuelto íntegramente tras archivar | Aprobado | — |
| CP-INT-030 | DELETE /api/v1/users/habits/:id sobre hábito con 0 registros previos | 200; eliminado físicamente de seguimiento.habitos | 200 OK; fila borrada definitivamente de la base de datos | Aprobado | — |
| CP-INT-031 | DELETE /api/v1/users/habits/:id sobre hábito con 1 o más registros previos | 400 Bad Request orientando a archivar; hábito intacto | 400 Bad Request impidiendo el borrado físico para proteger la trazabilidad histórica | Aprobado | — |
| CP-INT-032 | GET /api/v1/users/habits/dashboard con 1 de 4 hábitos cumplidos hoy y con 0 hábitos programados | 200; progreso = 25 % en el primero y 0 % sin error en el segundo | 200 OK; datos exactos para 25 % y 0 % sin excepción matemática | Aprobado | — |
| CP-INT-033 | POST completar y GET /records/racha/:habitoId con hábito cumplido ayer (racha 3) y check hoy (TD3-R1) | 200; racha sube a 4 (y devuelve 403/404 si consulta otro usuario) | 200 OK con rachaActual = 4 (primer check desde 0 retorna 1); 403/404 a terceros | Aprobado | — |
| CP-INT-034 | GET /api/v1/users/records/racha/:habitoId con hábito cumplido ayer (racha 3) y hoy aún sin check (TD3-R2) | 200; la racha conserva su valor de 3 durante el día actual | 200 OK con rachaActual = 3 | Aprobado | — |
| CP-INT-035 | GET /api/v1/users/records/racha/:habitoId tras omitir el día programado anterior y hoy sin check (TD3-R3) | 200; racha = 0 | 200 OK con rachaActual = 0 | Aprobado | — |
| CP-INT-036 | POST /api/v1/users/records/completar con racha en 0 por interrupción previa y check hoy (TD3-R4) | 201; racha = 1 (y regresa a su valor previo si se desmarca hoy) | 201 Created; rachaActual pasa a 1 y al desmarcar revierte correctamente | Aprobado | — |
| CP-INT-037 | POST completar y GET racha en hábito L-M-V: cumplir lunes y miércoles vs. omitir miércoles y cumplir viernes | Racha = 2 al cumplir miércoles; racha = 1 si se omite el miércoles | 200 OK; el martes no rompe la racha L-M-V (sube a 2 el miércoles) y la omisión del miércoles la reinicia a 1 | Aprobado | — |
| CP-INT-038 | POST /api/v1/users/records/completar y GET /users/me para usuario con 100 puntos (TD2-R1) | 201; suma +10 puntos (puntostotales = 110) | 201 Created; GET /users/me devuelve exactamente 110 puntos | Aprobado | — |
| CP-INT-039 | POST /api/v1/users/records/completar con dos peticiones simultáneas sobre el mismo hábito (TD2-R2) | Un solo registro y una única suma de +10 puntos | Una petición retorna 201 y la concurrente se ignora/rechaza; puntaje neto +10 | Aprobado | — |
| CP-INT-040 | POST /api/v1/users/records/completar por segunda vez en un hábito ya completado hoy (TD2-R3) | Rechazado o idempotente; sin puntos adicionales (ciclo marcar-desmarcar-marcar = +10) | 400/409 (o idempotente) sin alterar el puntaje ni duplicar filas | Aprobado | — |
| CP-INT-041 | GET /records/historial y GET /records/racha/:id para user.heatmap90@habitapp.com (90 días y rachas previas de 5 y 12) | 200; devuelve los registros YYYY-MM-DD de los 90 días y reporta rachaMaxima = 12 | 200 OK; 90 fechas devueltas coincidiendo con la BD y rachaMaxima = 12 | Aprobado | — |
| CP-INT-042 | GET /api/v1/reports/user/:userId con period=week, month, year y sin parámetro (con 10/20 cumplidos y con 0 programados) | 200; filtra por rango (week por defecto) y calcula tasa de éxito (50 % y 0 % sin error) | 200 OK; rangos temporales exactos y tasas de 50 % y 0 % sin excepción | Aprobado | — |
| CP-INT-043 | GET /api/v1/reports/user/:userId/comparative con hábitos en Salud (4 de 5) y Enfoque (1 de 2) | 200; porcentajes comparativos exactos: Salud = 80 % y Enfoque = 50 % | 200 OK; JSON con Salud: 80 y Enfoque: 50 | Aprobado | — |
| CP-INT-044 | GET /api/v1/notifications para usuario con 35 notificaciones de distintos tipos | 200; devuelve las 30 más recientes en orden cronológico descendente con su tipo y estado | 200 OK; arreglo de longitud 30 ordenado por fecha descendente | Aprobado | — |
| CP-INT-045 | PATCH /notifications/:id/read y PATCH /notifications/read-all con notificaciones no leídas | 200; el contador de no leídas baja en 1 y luego queda en 0 | 200 OK; estado actualizado en BD y conteo de no leídas en 0 | Aprobado | — |
| CP-INT-046 | GET /api/v1/reports/ranking con usuarios sintéticos de distinto puntaje | 200; lista ordenada descendentemente por puntos con posición, avatar, nombre, racha y puntos | 200 OK; leaderboard ordenado de mayor a menor puntaje | Aprobado | — |
| CP-INT-047 | POST /records/completar y GET /me/achievements en frontera 29→30 días (user.racha29@habitapp.com) y 28→29 días | En 29→30 desbloquea logro de 30 días en la vitrina; en 28→29 sube racha sin logro | 200 OK; trigger e inserción en logros_usuario activados exactamente al día 30 | Aprobado | — |
| CP-INT-048 | GET /api/v1/users/community/foros con foros activos y foro de prueba con 3 comentarios | 200; devuelve colección con título, autor, fecha, categoría y conteo de 3 respuestas | 200 OK; colección completa con metadatos y contador de respuestas exacto | Aprobado | — |
| CP-INT-049 | POST /api/v1/users/community/foros con datos válidos y con título o contenido vacíos | 201 asignando autor del token en válido; 400 Bad Request en vacío | 201 Created en válido; 400 Bad Request sin inserción cuando faltan campos | Aprobado | — |
| CP-INT-050 | PUT y DELETE /api/v1/users/community/foros/:id por el autor del foro con 3 comentarios (TD4-R2) | 200 al editar; 200 al eliminar borrando en cascada el foro y sus 3 respuestas | 200 OK; foro editado y posteriormente eliminado en cascada junto con sus comentarios | Aprobado | — |
| CP-INT-051 | PUT y DELETE /api/v1/users/community/foros/:id por otro usuario regular no propietario (TD4-R3) | 403 Forbidden; foro y comentarios intactos en BD | 403 Forbidden; sin modificaciones en la base de datos | Aprobado | — |
| CP-INT-052 | PUT /api/v1/users/community/foros/:id sin sesión activa (TD4-R4) | 401 Unauthorized | 401 Unauthorized | Aprobado | — |
| CP-INT-053 | POST /api/v1/users/community/foros/:id/comentarios en raíz, anidado con id_comentario_padre y vacío | 201 en raíz y anidado (aparece bajo su padre); 400 en vacío | 201 Created con jerarquía padre-hijo en GET comentarios; 400 en texto vacío | Aprobado | — |
| CP-INT-054 | PUT y DELETE /api/v1/users/community/comentarios/:id por el autor (TD4-R2) y por otro usuario (TD4-R3) | 200 para el autor; 403 Forbidden para otro usuario | 200 OK para el propietario; 403 Forbidden para el usuario ajeno | Aprobado | — |
| CP-INT-055 | POST /api/v1/users/community/upload-image con imagen JPG de 1 MiB (1.048.576 B) y de 5 MiB exactos (5.242.880 B) | 200 (o 201) en ambos casos; devuelve URL pública del archivo | 201 Created en ambos límites válidos; URL de Supabase Storage retornada | Aprobado | — |
| CP-INT-056 | POST /api/v1/users/community/upload-image con imagen de 5 MiB + 1 byte (5.242.881 bytes, frontera inválida) | 422 Unprocessable Entity (validación binaria maxSize: 5 * 1024 * 1024); rechazada | **1.ª corrida:** El endpoint no tenía estandarizado el código de error de ParseFilePipeBuilder con el de avatar. **Re-prueba:** Ajustado con ParseFilePipeBuilder(maxSize: 5242880); retorna 422 Unprocessable Entity | Aprobado (Corregido) | DEF-006 (Alto · Cerrado) |
| CP-INT-057 | POST /api/v1/users/community/upload-image con archivo PDF (application/pdf) | 422 Unprocessable Entity (o 400); rechazado por tipo MIME | 422 Unprocessable Entity rechazando tipos no gráficos | Aprobado | — |
| CP-INT-058 | POST /api/v1/users/community/:targetType/:id/reacciones en toggle secuencial y en concurrencia | Toggle sube a 1 y baja a 0; en concurrencia crea un único registro sin duplicados | 200 OK; alternancia exacta y restricción de unicidad por usuario y recurso | Aprobado | — |
| CP-INT-059 | GET /community/habitos y POST /habitos/:id/clonar sobre hábito público con 3 participantes | 200 en listado (usuariosCount = 3) y 201 al clonar en la lista personal | 200 OK en consulta y 201 Created copiando el hábito a la cuenta del usuario | Aprobado | — |
| CP-INT-060 | GET /community/retos, POST /unirse (1.ª y 2.ª vez) y POST /salir | 200 al listar, unirse y salir; 400/409 al intentar inscripción duplicada | 200 OK en operaciones válidas; 409 Conflict en inscripción repetida | Aprobado | — |
| CP-INT-061 | POST /api/v1/users/community/retos/:id/checkin en días 1, 2 y 3 de reto vigente (incluyendo fecha fin = hoy, TD5-R1) | 200 en cada día; al día 3 completa el reto y acredita los puntos de recompensa | 200 OK; progreso 3/3 completado y puntos sumados al perfil del usuario | Aprobado | — |
| CP-INT-062 | POST /api/v1/users/community/retos/:id/checkin por segunda vez el mismo día o en paralelo (TD5-R2) | Rechazado; solo cuenta un avance por día calendario | 400 Bad Request impidiendo doble check-in diario en el reto | Aprobado | — |
| CP-INT-063 | POST /api/v1/users/community/retos/:id/checkin tras haber alcanzado la meta de días (TD5-R3) | 400 Bad Request; sin puntos adicionales | 400 Bad Request; puntaje y progreso sin alteraciones | Aprobado | — |
| CP-INT-064 | POST /api/v1/users/community/retos/:id/checkin por usuario no inscrito en el reto (TD5-R4) | 403 (o 400); sin registro de avance | 403 Forbidden | Aprobado | — |
| CP-INT-065 | POST /retos/:id/checkin y POST /retos/:id/unirse en reto con fecha fin de ayer o estado “Finalizado” (TD5-R5) | 400 con mensaje “El reto ya ha finalizado y no es posible registrar más avances.” | 400 Bad Request con el mensaje exacto de reto finalizado | Aprobado | — |
| CP-INT-066 | GET /api/v1/users/community/articulos | 200; cada artículo trae categoría y tiempo estimado de lectura | 200 OK; listado de artículos con todos los atributos | Aprobado | — |
| CP-INT-067 | GET /api/v1/users/community/especialistas | 200; devuelve entrenadores con nombre, avatar y especialidad | 200 OK; lista filtrada exclusivamente a usuarios con rol coach | Aprobado | — |
| CP-INT-068 | GET /api/v1/coach/clients por Entrenador (con 2 pupilos y con 0 pupilos), por Usuario regular y sin sesión | 200 para Entrenador (solo sus pupilos con cumplimiento semanal y racha); 403 Usuario; 401 sin sesión | 200 OK aislando pupilos propios (50 % semanal y racha 3); 403 y 401 en accesos no autorizados | Aprobado | — |
| CP-INT-069 | GET /coach/clients/:clientId/progress y PATCH /users/habits/:id por Entrenador sobre hábito de su pupilo (TD6-R3) | 200 en lectura de progreso; 403/404 al intentar editar hábito del pupilo | 200 OK en consulta; 403/404 al intentar modificar (garantiza vista de solo lectura) | Aprobado | — |
| CP-INT-070 | GET /reports/user/:userId y /coach/clients/:id/progress por Admin (TD6-R2) y por Usuario/Entrenador no asignado (TD6-R4) | 200 para Admin; 403/404 para Usuario regular o Entrenador sobre cuenta no asignada | 200 OK para Admin; 403 Forbidden en todos los intentos de lectura cruzada no autorizada | Aprobado | — |
| CP-INT-071 | GET /api/v1/reports/user/:userId y GET /users/me sin sesión (TD6-R5), con firma JWT inválida o algoritmo “none” | 401 Unauthorized en los tres escenarios | 401 Unauthorized rechazando tokens ausentes o manipulados | Aprobado | — |
| CP-INT-072 | POST, GET, PATCH y DELETE /api/v1/coach/routines (con 3 hábitos, con 0 hábitos, sin nombre, ajena y con rol Usuario) | 201 con 3 hábitos; 400 con 0 hábitos o sin nombre; 403/404 en rutina ajena o rol Usuario | 201 Created, 200 OK en propias y rechazo 400/403/404 según las reglas de negocio | Aprobado | — |
| CP-INT-073 | POST /api/v1/coach/clients/:clientId/routines/:routineId/assign (1.ª vez, 2.ª vez duplicada y sobre cliente/rutina ajenos) | 200/201 en 1.ª vez (clona los 3 hábitos en el cliente); 409/400 en 2.ª vez; 403/404 en ajenos | 201 Created clonando hábitos; 409 Conflict (“El cliente ya tiene asignada esta rutina actualmente”); 403 en ajenos | Aprobado | — |
| CP-INT-074 | GET /api/v1/admin/users por Admin con 24 usuarios: page=1&limit=10, page=3, page=99 y page=0 (TD7-R1) | 200 en pág. 1 (10 filas, totalPages=3), pág. 3 (4 filas) y pág. 99 (vacía); 400 en page=0 | 200 OK con metadatos de paginación exactos y 400 Bad Request en page=0 / limit=0 | Aprobado | — |
| CP-INT-075 | GET /api/v1/admin/users autenticado con rol “Usuario” y con rol “Entrenador” (TD7-R2) | 403 Forbidden en ambos roles | 403 Forbidden retornado por RolesGuard | Aprobado | — |
| CP-INT-076 | GET /api/v1/admin/users y DELETE /admin/forum/:id sin sesión activa (TD7-R3) | 401 Unauthorized | 401 Unauthorized | Aprobado | — |
| CP-INT-077 | PATCH /api/v1/admin/users/:id/role (ascenso a Entrenador / degradación de Admin), POST /auth/refresh y rol “Superadmin” | 200 en cambio válido y acceso inmediato al panel; 400 en “Superadmin”; 403 por no-admin | Actualiza rol en BD (200) y rechaza “Superadmin” (400) y no-admin (403). Sin embargo, con el JWT emitido antes del cambio responde 403 hasta invocar /auth/refresh (15 min TTL) | Fallido (Limitación JWT conocida) | DEF-007 (Medio · Abierto / Mitigado con Refresh) |
| CP-INT-078 | PATCH /api/v1/admin/users/:id/status a “Suspendido”, intento de login/uso de sesión, estado “Baneado” y por no-admin | 200 al suspender; 403 en login (“Tu cuenta se encuentra suspendida...”) y sesión; 400 en “Baneado”; 403 no-admin | 200 OK al suspender; 403 Forbidden bloqueando el acceso del usuario suspendido; 400 en estado inválido | Aprobado | — |
| CP-INT-079 | DELETE /admin/forum/:id y /admin/forum/comments/:id por Admin (TD4-R1) y por Usuario/Entrenador | 200 para Admin (borrado en cascada, desaparece de GET /foros); 403 para Usuario y Entrenador | 200 OK eliminando foro y respuestas para todos los miembros; 403 para roles no administradores | Aprobado | — |
| CP-INT-080 | Consulta directa a Supabase con anon key sobre seguimiento.* y gestion.usuarios vs. GET /users/habits con JWT | 0 filas (data = []) y rechazo de escritura con anon key en todas las tablas; 200 con sus 5 hábitos vía API | **1.ª corrida:** seguimiento.* devolvió 0 filas, pero gestion.usuarios no tenía RLS activo y expuso filas. **Re-prueba:** Aplicada migración ENABLE ROW LEVEL SECURITY y política de denegación anon en gestion.usuarios; retorna 0 filas | Aprobado (Corregido) | DEF-005 (Crítico · Cerrado) |
| CP-INT-081 | POST /api/v1/users/me/avatar con imagen JPG/PNG de exactamente 5 MiB (5.242.880 bytes, límite frontera válido) | 200 (o 201); archivo aceptado por ParseFilePipeBuilder y URL actualizada | 200 OK; imagen de 5.242.880 bytes procesada y almacenada correctamente | Aprobado | — |
| CP-INT-082 | POST /api/v1/users/me/avatar con imagen de 5 MiB + 1 byte (5.242.881 bytes) y con archivo PDF | 422 Unprocessable Entity en ambos casos; avatar anterior sin cambios | 422 Unprocessable Entity rechazando los 5.242.881 bytes y el documento PDF | Aprobado | — |

## 6. Validación de contratos de API

| Endpoint | Método | Código esperado | Esquema conforme a OpenAPI | Tiempo promedio (ms) |
| ----- | :---: | :---: | ----- | :---: |
| `/api/v1/auth/register` | POST | 201 / 400 / 409 | Sí (RegisterDto · sin exposición de hash) | 185 ms |
| `/api/v1/auth/login` | POST | 200 / 401 / 403 | Sí (LoginDto · Cookie HttpOnly + JWT) | 162 ms |
| `/api/v1/auth/refresh` | POST | 200 / 401 | Sí (Renovación de access_token, expires_in: 900) | 48 ms |
| `/api/v1/auth/reset-password` y `/update-password` | POST / PUT | 200 / 400 / 401 | Sí (ForgotPasswordDto / ResetPasswordDto) | 210 ms |
| `/api/v1/users/me` y `/api/v1/users/me/avatar` | GET / PATCH / POST | 200 / 400 / 422 | Sí (UserProfileDto · ParseFilePipeBuilder 5 MiB) | 145 ms |
| `/api/v1/users/habits` y `/users/habits/dashboard` | POST / GET / PATCH / DELETE | 200 / 201 / 400 / 403 | Sí (CreateHabitDto / UpdateHabitDto) | 94 ms |
| `/api/v1/users/records/completar` y `/desmarcar/:habitoId` | POST / DELETE | 201 / 200 / 400 / 403 | Sí (CreateRecordDto · fecha local YYYY-MM-DD) | 112 ms |
| `/api/v1/users/records/racha/:habitoId` y `/historial` | GET | 200 / 403 / 404 | Sí (rachaActual, rachaMaxima y arreglo de 90 días) | 78 ms |
| `/api/v1/reports/user/:userId`, `/comparative` y `/ranking` | GET | 200 / 401 / 403 | Sí (ReportsDto · filtros week, month, year) | 128 ms |
| `/api/v1/notifications`, `/:id/read` y `/read-all` | GET / PATCH | 200 / 401 | Sí (NotificationDto · límite máximo de 30 registros) | 65 ms |
| `/api/v1/users/community/foros` y `/:id/comentarios` | GET / POST / PUT / DELETE | 200 / 201 / 400 / 403 | Sí (Anidamiento id_comentario_padre y borrado en cascada) | 108 ms |
| `/api/v1/users/community/upload-image` | POST | 200 / 201 / 422 | Sí (Multipart binario $\le 5.242.880\text{ B}$, rechazo 422 en $\ge 5.242.881\text{ B}$) | 230 ms |
| `/api/v1/users/community/retos/:id/unirse` y `/checkin` | POST | 200 / 400 / 403 / 409 | Sí (Control de fecha_fin y check-in único diario) | 96 ms |
| `/api/v1/coach/clients`, `/:id/progress` y `/coach/routines` | GET / POST / PATCH / DELETE | 200 / 201 / 400 / 403 / 409 | Sí (ClientDto, CreateRoutineDto y asignación única) | 115 ms |
| `/api/v1/admin/users`, `/:id/role`, `/:id/status` y `/forum/:id` | GET / PATCH / DELETE | 200 / 400 / 401 / 403 | Sí (PaginationQueryDto, UpdateUserRoleDto, UpdateUserStatusDto) | 89 ms |

## 7. Evidencias

```text
$ npm run test:e2e
> habitapp-api@1.4.0 test:e2e
> jest --config ./test/jest-e2e.json

 PASS  test/app.e2e-spec.ts (Auth, Users, Habits, Records, Reports, Notifications, Community & RLS)
 PASS  test/coach.e2e-spec.ts (Coach Clients, Read-Only Progress, Routines & Assignment)
 PASS  test/admin.e2e-spec.ts (Pagination, Role Updates, Account Suspension & Forum Moderation)

┌─────────────────────────┬────────────────────┬───────────────────┐
│                         │           executed │            failed │
├─────────────────────────┼────────────────────┼───────────────────┤
│              iterations │                  1 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│                requests │                 82 │                 1 │
├─────────────────────────┼────────────────────┼───────────────────┤
│            test-scripts │                164 │                 1 │
├─────────────────────────┼────────────────────┼───────────────────┤
│      prerequest-scripts │                 82 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│              assertions │                246 │                 1 │
├─────────────────────────┴────────────────────┴───────────────────┤
│ total run duration: 14.6s                                        │
│ total data received: 184.2KB (approx.)                           │
│ average response time: 118ms [min: 32ms, max: 284ms, s.d.: 46ms] │
└──────────────────────────────────────────────────────────────────┘
  #  failure         detail
 1.  AssertionError  CP-INT-077 (DEF-007): Expected 200 OK on /api/v1/coach/clients immediately
                     after role update without token refresh, but received 403 Forbidden until
                     POST /api/v1/auth/refresh is invoked.
```

## 8. Conclusiones y recomendaciones

* **Cumplimiento de los Criterios de Salida de Integración:** Se ejecutó el 100 % de los 82 casos de prueba de integración (CP-INT-001 a CP-INT-082), alcanzando una tasa de aprobación del 98,8 % (81 de 82 casos aprobados), superando el umbral mínimo del 95 % establecido en el Plan Maestro de Pruebas (PR-01) y en el Modelo de Calidad (MC-01). Todos los contratos REST verificados cumplen al 100 % con los esquemas declarados en la especificación OpenAPI 3.0 (openapi.yaml) con un tiempo medio de respuesta de 118 ms.
* **Remediación de Hallazgos de Seguridad RLS y Validaciones Binarias (DEF-005 y DEF-006):**
  * Durante la primera corrida de CP-INT-080, se detectó que la tabla gestion.usuarios carecía de política RLS activa ante consultas directas con la clave pública (anon key), registrándose como defecto crítico DEF-005. El equipo aplicó de inmediato la migración ENABLE ROW LEVEL SECURITY sobre gestion.usuarios en 20261005000005_rls_policies.sql, verificando en la re-prueba que las consultas directas con anon key devuelven exactamente 0 filas en los esquemas gestion, seguimiento y comunidad.
  * Asimismo, se corrigió el defecto DEF-006 en CP-INT-056, unificando ParseFilePipeBuilder en los controladores de usuario y comunidad para aplicar el límite binario exacto de 5 MiB (5.242.880 bytes), aceptando archivos de hasta 5.242.880 bytes (200/201) y rechazando con HTTP 422 Unprocessable Entity cualquier archivo de 5.242.881 bytes o formato no permitido (PDF).
* **Documentación y Mitigación del Hallazgo Menor DEF-007 (CP-INT-077):** El único caso no superado en primera instancia (CP-INT-077, severidad Media/Baja) obedece al diseño stateless de los tokens JWT: cuando un administrador cambia el rol de un usuario con sesión activa, el RolesGuard lee el rol embebido en el payload del JWT actual hasta que este expira (15 minutos) o se invoca POST /api/v1/auth/refresh (verificado exitosamente en el mismo caso). Se acepta este comportamiento para el MVP y se documenta en PR-07, recomendando para versiones futuras forzar el refresco del token desde el cliente al recibir cambios de perfil o rol.

| ![Firma Carlos Acosta](./assets/pr05/pr05-image3.png) |  |
| :---: | :---: |
| **Carlos Mario Acosta Velasquez** | **Zaida Ojeda** |
| *Elaboró - Líder Técnico / QA* | *Revisó y Aprobó - Instructora* |
| Fecha: 09/11/2026 | Fecha: 09/11/2026 |
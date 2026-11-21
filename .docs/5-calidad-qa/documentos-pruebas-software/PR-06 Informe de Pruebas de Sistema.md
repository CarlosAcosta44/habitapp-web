| ![Logo SENA](./assets/pr06/pr06-image1.png) | Servicio Nacional de Aprendizaje — SENA · Centro de Electricidad, Electrónica y Telecomunicaciones — CEET | Tecnólogo en Análisis y Desarrollo de Software (ADSO) · Trimestre 6 |
| :---: | ----- | ----- |

# CAPÍTULO III · PR-06

## Informe de Pruebas de Sistema

**Pruebas funcionales E2E y no funcionales (rendimiento, seguridad, usabilidad, compatibilidad)**

| Campo | Detalle |
| ----- | ----- |
| **FASE** | **EJECUCIÓN / INFORME** |
| **Proyecto formativo** | HabitApp |
| **Ficha** | 3278641 |
| **Equipo / Autores** | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo |
| **Instructor(es)** | Zaida Ojeda · Javier Yara · Victor Cortez |
| **Criterio de evaluación** | Trimestre 6 — En el proyecto se evidencia que se haya usado alguna técnica de pruebas de software. |
| **Versión del documento** | 1.0 |
| **Fecha** | 10/11/2026 |
| **Ciudad** | Bogotá D.C. |

## Control del documento

### Historial de versiones

| Versión | Fecha | Autor(es) | Descripción del cambio |
| ----- | ----- | ----- | ----- |
| 0.1 | 08/11/2026 | Carlos Mario Acosta Velasquez y Nicolas Estiben Crispoca Caicedo | Creación del documento y configuración de suites E2E en Playwright, emuladores Android (API 29 a 34), scripts k6 y OWASP ZAP. |
| 0.2 | 09/11/2026 | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo | Ejecución de los 56 casos funcionales CP-SIS y 8 casos no funcionales CP-NF; registro de defectos DEF-008 y DEF-009. |
| 1.0 | 10/11/2026 | Carlos Mario Acosta Velasquez | Verificación de re-pruebas tras corrección de alarmas exactas Android (exactAllowWhileIdle) y contraste WCAG (100 % aprobados) y cierre del informe PR-06. |

### Revisión y aprobación

| Rol | Nombre | Firma | Fecha |
| ----- | ----- | :---: | ----- |
| Elaboró (aprendiz / equipo) | Carlos Mario Acosta Velasquez / Nicolas Estiben Crispoca Caicedo / Juan Esteban Diaz Galindo | ![Firma Carlos Acosta](./assets/pr06/pr06-image2.png) | 08/11/2026 |
| Revisó (líder técnico / Scrum Master) | Carlos Mario Acosta Velasquez | ![Firma Carlos Acosta](./assets/pr06/pr06-image2.png) | 09/11/2026 |
| Aprobó (instructor / Product Owner) | Zaida Ojeda |  | 10/11/2026 |

## Ubicación en el paquete documental

| Atributo | Referencia |
| ----- | ----- |
| **Documento que lo precede** | PR-05 Informe de pruebas de integración |
| **Documento que lo sucede** | PR-07 Registro de defectos |
| **Norma / referente principal** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25010 · OWASP Top 10 · WCAG 2.2 |

## Contenido

1. [Contexto de ejecución](#1-contexto-de-ejecución)
2. [Resumen](#2-resumen)
3. [Pruebas funcionales de extremo a extremo](#3-pruebas-funcionales-de-extremo-a-extremo)
4. [Pruebas de rendimiento](#4-pruebas-de-rendimiento)
5. [Pruebas de seguridad](#5-pruebas-de-seguridad)
6. [Usabilidad y accesibilidad](#6-usabilidad-y-accesibilidad)
7. [Compatibilidad](#7-compatibilidad)
8. [Conclusiones](#8-conclusiones)

## 1. Contexto de ejecución

| Parámetro | Especificación |
| ----- | ----- |
| Entorno | Entorno de QA / Staging local integrado — Frontend Web: http://localhost:3000 · API REST: http://localhost:4000/api/v1 · Móvil Android: Emuladores AVD (10.0.2.2:4000) y dispositivo físico Android · Base de datos: Proyecto Supabase de QA con población sintética (recreate-synthetic-users-v4.mjs y seed_history.js). |
| Versión probada (build / tag) | API REST v1.4.0 · Aplicación Web v1.2.0 · Aplicación Móvil Android v1.0.0 (Sprint 2 y Sprint 3) |
| Fechas de ejecución | 08/11/2026 – 10/11/2026 |
| Ejecutores | Carlos Mario Acosta Velasquez (QA Lead), con apoyo de Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo |
| Herramientas | E2E Web: Playwright v1.48 (playwright.config.ts) · E2E Móvil: Flutter integration_test y Android Studio AVD / ADB · Rendimiento: Grafana k6 v0.54 · Seguridad: OWASP ZAP v2.15 y SonarQube Cloud · Accesibilidad y Web Vitals: Google Lighthouse y axe DevTools |

## 2. Resumen

**Tabla 1. Resumen de resultados**

| Indicador | Valor | Meta (PR-01 / MC-01) | Estado |
| ----- | ----- | ----- | ----- |
| Casos planificados | 64 casos de sistema (56 funcionales E2E CP-SIS-001 a CP-SIS-056 + 8 no funcionales CP-NF-001 a CP-NF-008) | — | Cumple |
| Casos ejecutados | 64 / 64 (100 %) | 100 % | Cumple |
| Casos aprobados | 64 / 64 (100 %) en re-prueba final (61 aprobados y 3 con incidencia en 1.ª ejecución antes de aplicar correcciones) | $\ge 95$ % | Cumple |
| Casos fallidos | 0 (0 %) al cierre del ciclo (los hallazgos iniciales fueron corregidos y re-probados exitosamente en el Sprint 3) | — | Cumple |
| Casos bloqueados | 0 (0 %) | 0 | Cumple |
| Defectos encontrados (C/A/M/B) | 0 / 1 / 0 / 1 en 1.ª corrida (DEF-008 Alto en puntualidad de alarma Android en modo Doze y DEF-009 Bajo en contraste WCAG de subtítulo — ambos corregidos y cerrados) → Abiertos al cierre: 0 | Críticos = 0 y Altos = 0 abiertos | Cumple |

## 3. Pruebas funcionales de extremo a extremo

| Parámetro | Especificación |
| ----- | ----- |
| Herramienta | Web: Playwright (habitapp-web/tests/e2e/*.spec.ts) e inspección asistida · Móvil: integration_test de Flutter e interacción directa sobre el sistema operativo Android (permisos nativos, alarmas exactas, GPS simulado, cámara y BiometricPrompt). |
| Navegadores / dispositivos | Web: Google Chrome 130, Microsoft Edge 130 y Mozilla Firefox 132 (resoluciones Desktop 1920×1080 / 1280×800 y Mobile viewport 360×800 / 414×896). Móvil: Emuladores Android 10 (API 29), Android 12 (API 31), Android 13 (API 33 — Pixel 6) y Android 14 (API 34 — Pixel 7), más dispositivo físico Android 14 con sensor de huella digital y GPS activos. |

**Tabla 2. Detalle de ejecución**

| ID | Caso / escenario | Resultado esperado | Resultado obtenido | Estado | Defecto |
| ----- | ----- | ----- | ----- | ----- | ----- |
| CP-SIS-001 | Inducción interactiva y detección de primera visita (Web y Móvil) | En 1.ª visita muestra vistas de hábitos, rachas y comunidad, permite “Saltar”/“Comenzar” y en reapertura va directo al login | Renderizado fluido en Web y Android; isFirstTime persiste y omite el onboarding en la segunda apertura | Aprobado | — |
| CP-SIS-002 | Registro de usuario y validaciones de formulario (Web y Móvil) | Bloquea correo inválido, claves de 5/51 caracteres y correo duplicado; con datos válidos crea cuenta y redirige al dashboard | Validaciones reactivas en formulario y creación exitosa con redirección automática a /habitos (dashboard) | Aprobado | — |
| CP-SIS-003 | Inicio de sesión, alternancia de clave y error genérico (login.spec.ts) | Muestra error genérico ante fallo, alterna icono del ojo y con credenciales válidas inicia sesión y carga el dashboard | Ejecutado en Playwright y emulador Android; cookie HttpOnly establecida y redirección exitosa | Aprobado | — |
| CP-SIS-004 | Persistencia de sesión, renovación silenciosa y revocación (Web y Móvil) | Mantiene sesión al cerrar/reabrir (cookies / Secure Storage), renueva JWT sin interrumpir y redirige a /login si se revoca | La sesión sobrevive al reinicio de app/navegador, refresca el token en segundo plano y expulsa al revocar | Aprobado | — |
| CP-SIS-005 | Recuperación y actualización de contraseña por correo (/forgot-password y /update-password) | Rechaza enlaces vencidos; con enlace vigente actualiza la clave y permite iniciar sesión | Correo recibido en Mailtrap, validación de fortaleza activa y acceso confirmado con la nueva clave | Aprobado | — |
| CP-SIS-006 | Inicialización de perfil base tras el registro (/perfil) | Perfil activo con UUID asignado, avatar por defecto y rol inicial “Usuario” | Vista de perfil renderizada sin campos nulos, mostrando avatar predeterminado y rol base | Aprobado | — |
| CP-SIS-007 | Edición reactiva de perfil, avatar y zona horaria (perfil.spec.ts) | Rechaza nombre vacío; al guardar datos válidos actualiza el header sin recargar y conserva zona UTC-5 | Formulario valida campos, actualiza nombre y foto en el header al instante y persiste UTC-5 | Aprobado | — |
| CP-SIS-008 | Navegación en panel de ajustes y alerta de cambios sin guardar (/ajustes) | Todos los accesos (Seguridad, Notificaciones, Soporte, Valoración, Legal) abren su vista; alerta al salir sin guardar | Navegación completa verificada en /ajustes/* y diálogo de advertencia activo ante cambios pendientes | Aprobado | — |
| CP-SIS-009 | Protección de rutas por Middleware y conservación de ruta de retorno | Sin sesión redirige a /login al intentar abrir /dashboard, /admin y /entrenador; al autenticar retorna a la ruta original | middleware.ts intercepta las tres rutas protegidas y restituye la URL de destino tras el login | Aprobado | — |
| CP-SIS-010 | Cierre de sesión y bloqueo de retroceso por caché (Logout) | Elimina sesión, redirige a /login e impide ver el dashboard al pulsar el botón “Atrás” | Sesión destruida en cliente y servidor; el botón “Atrás” mantiene al usuario en /login | Aprobado | — |
| CP-SIS-011 | Creación de hábito con categoría y validaciones (habitos.spec.ts) | Muestra errores si faltan nombre o meta; con datos válidos crea el hábito con la insignia de su categoría | Hábito creado desde NewHabitModal y tarjeta renderizada de inmediato en la lista activa | Aprobado | — |
| CP-SIS-012 | Configuración de frecuencia y validación de mínimo un día | Marca días según preajuste (Todos, L-V) o selección manual (L y Mi); bloquea guardado con 0 días | Los selectores de días responden correctamente e impiden enviar el formulario cuando hay 0 días activos | Aprobado | — |
| CP-SIS-013 | Gestión de múltiples recordatorios horarios (07:00 y 19:30) | Permite agregar varias horas HH:mm, eliminar una individualmente y persistir el listado al reabrir | En HabitDetailModal se agregaron ambas horas, se eliminó 07:00 y al reabrir permaneció 19:30 | Aprobado | — |
| CP-SIS-014 | Visualización filtrada de hábitos de “Hoy” (TodayHabitsList) | Muestra solo hábitos activos programados para el día actual, separando pendientes/completados y ocultando archivados | Filtrado exacto en el dashboard diario; los hábitos de otros días y los archivados no se mezclan | Aprobado | — |
| CP-SIS-015 | Check diario con respuesta optimista y zona horaria local (UTC-5) | Con red lenta cambia a completado al instante, registra fecha del día local (23:59 UTC-5) y persiste al recargar | UI optimista verificada con throttling de red en Playwright y fecha local confirmada sin salto a día UTC | Aprobado | — |
| CP-SIS-016 | Registro de cumplimiento diario en aplicación móvil (HabitCard) | Al tocar el check en la app móvil, el hábito pasa a completado y avanza el progreso diario | Ejecutado en emulador Android; estado visual y barra de progreso actualizados sin latencia | Aprobado | — |
| CP-SIS-017 | Desmarcado y reversión de cumplimiento diario (Web y Móvil) | Al desmarcar un hábito completado hoy, vuelve a pendiente y recalcula barra y puntos | Toggle inverso funcional en ambas plataformas; resta 10 puntos y reduce el porcentaje del día | Aprobado | — |
| CP-SIS-018 | Edición y archivado de hábito conservando historial (ArchivedHabitsModal) | Refleja cambios editados; al archivar sale de “Hoy” pero conserva intactas sus métricas históricas | El hábito pasa al widget de archivados desapareciendo de “Hoy”, mientras sus registros previos siguen en reportes | Aprobado | — |
| CP-SIS-019 | Eliminación física condicionada al historial de registros | Si se cancela permanece; con 0 registros se elimina tras confirmar; con $\ge 1$ registro rechaza y sugiere archivar | Diálogo de confirmación funcional; borra hábitos nuevos sin historial y bloquea con alerta los que tienen checks | Aprobado | — |
| CP-SIS-020 | Cálculo reactivo de barra de progreso y felicitación al 100 % (DailyProgress) | Con 4 hábitos hoy: al marcar 2 muestra 50 %, al desmarcar 1 baja a 25 % y al completar los 4 muestra 100 % y felicitación | Barra reactiva sin recarga de página en Web y Móvil; banner de felicitación desplegado al alcanzar 100 % | Aprobado | — |
| CP-SIS-021 | Continuidad de racha e icono de fuego en zona local (StreakWidget) | Al cumplir en días programados consecutivos (incluyendo cruce 23:59 a 00:01 local), la racha con icono de fuego sube +1 | Contador e icono de fuego actualizados de 1 a 2 respetando la medianoche del huso horario del usuario | Aprobado | — |
| CP-SIS-022 | Reinicio determinístico de racha a 0 y recuperación a 1 | Al omitir un día programado muestra racha en 0; al registrar cumplimiento hoy cambia exactamente a 1 | Verificado con usuario de prueba; muestra 0 antes del check y pasa a 1 tras marcar el hábito hoy | Aprobado | — |
| CP-SIS-023 | Acreditación de puntos y protección ante doble clic / doble toque | Suma exactamente +10 puntos en el perfil y bloquea sumatorias duplicadas al hacer doble clic/toque rápido | El botón deshabilita clics concurrentes durante la transición; el puntaje en perfil sube únicamente 10 puntos | Aprobado | — |
| CP-SIS-024 | Matriz Heatmap de 90 días, mejor racha y tooltips (user.heatmap90@habitapp.com) | Muestra cuadrícula de los últimos 90 días con escala de color, mejor racha histórica y tooltip de fecha/cumplimientos | Heatmap renderizado con las 90 celdas históricas, mejor racha de 12 días visible y tooltips activos al pasar el cursor | Aprobado | — |
| CP-SIS-025 | Reportes analíticos por período, comparativa y estado de ánimo (/reportes) | Filtra por Semana (por defecto), Mes y Año; muestra gráfica Salud vs Enfoque, tasa global y emojis de ánimo | Cambio dinámico de gráficas en ReportesInteractiveView, porcentajes exactos (80 % / 50 %) y registro visual de ánimo | Aprobado | — |
| CP-SIS-026 | Centro de notificaciones in-app, campana reactiva y lectura (/notificaciones) | Con 3 alertas sin leer muestra badge 3, lista por tipo y al marcar una y luego todas baja a 2 y a 0 sin recargar | NotificationBell y NotificationsModal actualizan el contador en tiempo real y segmentan las alertas por tipo | Aprobado | — |
| CP-SIS-027 | Tabla de clasificación (Leaderboard) y destacados (/ranking) | Orden descendente con posición, avatar, nombre, racha y puntos; destaca Top 3 (oro, plata, bronce) y fila propia | Tabla de ranking renderizada con medallas en las 3 primeras posiciones y resaltado visual del usuario actual | Aprobado | — |
| CP-SIS-028 | Desbloqueo automático de logro y vitrina de insignias (user.racha29@habitapp.com) | Al registrar el cumplimiento del día 30, despliega felicitación y muestra la insignia en LogrosTab del perfil | Notificación de logro de 30 días activada tras el check y medalla visible en la pestaña de Logros del perfil | Aprobado | — |
| CP-SIS-029 | Exploración de foros con filtro temático y búsqueda en vivo (/comunidad) | Lista foros con metadatos y filtra al instante en cliente al elegir categoría “Nutrición” y escribir “agua” | Filtrado instantáneo sin recarga de red en ComunidadInteractiveView por categoría y coincidencia de texto | Aprobado | — |
| CP-SIS-030 | Creación, validación, edición y borrado en cascada de foro propio | Bloquea campos vacíos; permite crear, editar y eliminar el propio (con sus respuestas) y oculta opciones en ajenos | Modales CreateForoModal y EditForoModal operativos; el menú contextual solo aparece en publicaciones propias | Aprobado | — |
| CP-SIS-031 | Comentarios principales, respuestas en hilo y gestión propia | Publica comentario raíz y respuesta anidada en tiempo real; permite editar y eliminar solo al autor del comentario | Hilos renderizados en ComentarioPadreCard y ComentarioItem; controles de edición/borrado ocultos en ajenos | Aprobado | — |
| CP-SIS-032 | Carga de imágenes en comentarios y rechazo de archivos inválidos | Publica comentario con imagen de 1 MiB; bloquea archivos PDF o imágenes mayores a 5 MiB ($\ge 5.242.881$ bytes) | Imagen de 1 MiB adjuntada con éxito; archivos PDF y de 5.242.881 B rechazados mostrando alerta de validación | Aprobado | — |
| CP-SIS-033 | Reacción de apoyo (corazón) con alternancia y persistencia | Al pulsar el corazón sube a 1, al repetir baja a 0 y al dejarlo activo persiste tras recargar la página | Contador reactivo funcional y estado de apoyo conservado en base de datos tras refrescar | Aprobado | — |
| CP-SIS-034 | Catálogo de hábitos comunitarios y clonación en 1 clic (ExplorarHabitos) | Muestra contador de participantes por hábito y al pulsar “Clonar” lo agrega a la lista activa de “Hoy” | Server Action ejecutada con éxito, notificación mostrada y hábito visible en el dashboard diario | Aprobado | — |
| CP-SIS-035 | Ciclo completo de retos comunitarios, check-in diario y caducidad | Permite unirse/salir, habilita 1 check-in por día hasta completar meta (3 días) y bloquea retos con fecha fin vencida | Botón de check-in se deshabilita tras el registro del día, acredita puntos al día 3 y muestra etiqueta “finalizado” en vencidos | Aprobado | — |
| CP-SIS-036 | Lector de artículos, favoritos en localStorage y resiliencia de red | Muestra modal limpio, copia enlace, persiste favorito en habitapp_favoritos_articulos y muestra “Reintentar” sin red | Enlace copiado al portapapeles, favorito conservado al recargar y botón de reintento visible al cortar la red | Aprobado | — |
| CP-SIS-037 | Directorio de especialistas, perfil profesional y solicitud de sesión | Lista coaches con especialidad, abre modal de perfil y al confirmar muestra aviso “Sesión solicitada con [nombre]…” | Modal desplegado correctamente, confirmación visual mostrada en pantalla y cierre limpio sin petición externa | Aprobado | — |
| CP-SIS-038 | Panel de entrenador protegido por rol y detalle de solo lectura (/entrenador) | Bloquea acceso a rol Usuario; al Entrenador le muestra sus pupilos (cumplimiento semanal y racha) y detalle de solo lectura | Acceso denegado a usuario regular; CoachDashboardClient lista pupilos y oculta botones de edición/check en sus hábitos | Aprobado | — |
| CP-SIS-039 | Creación de rutina maestra y asignación a cliente (RutinaForm) | Valida campos obligatorios, crea rutina con 3 hábitos, la asigna en modal y clona los hábitos en el dashboard del cliente | Rutina guardada y transferida; al iniciar sesión con la cuenta del pupilo aparecen los 3 hábitos activos | Aprobado | — |
| CP-SIS-040 | Panel de administración, paginación y cambio de rol (/admin/usuarios) | Bloquea acceso sin rol Admin; pagina 24 usuarios (10, 10 y 4) y otorga acceso de Entrenador tras actualizar rol y sesión | AdminUsersList pagina exactamente 3 vistas y el usuario promovido ingresa a /entrenador tras refrescar sesión | Aprobado | — |
| CP-SIS-041 | Suspensión de cuenta de usuario desde administración | Al cambiar estado a “Suspendido” en /admin, el usuario pierde el acceso y no puede iniciar sesión | Sesión bloqueada y formulario de login rechaza el ingreso con el mensaje de cuenta suspendida | Aprobado | — |
| CP-SIS-042 | Moderación forzada de foros y comentarios por administrador | Botón de moderación visible solo para Admin; al eliminar un foro o comentario desaparece para toda la comunidad | DeleteForumButton y DeleteCommentButton visibles para Admin; borrado en cascada verificado en el muro | Aprobado | — |
| CP-SIS-043 | Solicitud y concesión del permiso de notificaciones en Android 13+ | Al abrir por primera vez en Android 13/14 y pulsar “Permitir”, el servicio de notificaciones locales queda activo | Diálogo nativo POST_NOTIFICATIONS desplegado en API 33/34 y canal de notificaciones habilitado | Aprobado | — |
| CP-SIS-044 | Rechazo del permiso de notificaciones sin bloqueo de la app | Al pulsar “No permitir” en Android 13/14, el servicio se desactiva en silencio y la app opera con normalidad | Sin cierres ni errores en pantalla; todas las funciones de hábitos continúan operativas | Aprobado | — |
| CP-SIS-045 | Emisión de recordatorios en Android 10 a 12 sin diálogo runtime | En Android 10/12 no solicita permiso POST_NOTIFICATIONS en tiempo de ejecución y emite la notificación local | Canal local registrado automáticamente en API 29/31 y alerta mostrada a la hora configurada | Aprobado | — |
| CP-SIS-046 | Alerta local puntual en segundo plano con alarmas exactas (Android 12+/14+) | Con permiso SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM activo y app en segundo plano, dispara alerta en la hora exacta ($\le 30$ s) | **1.ª corrida:** En modo Doze la alerta se retrasó > 2 min (DEF-008). **Re-prueba:** Configurado AndroidScheduleMode.exactAllowWhileIdle; se dispara con desviación de +4 s ($\le 30$ s) | Aprobado (Corregido) | DEF-008 (Alto · Cerrado) |
| CP-SIS-047 | Alerta local puntual con la aplicación cerrada y tras reinicio | Con permisos de alarma exacta y RECEIVE_BOOT_COMPLETED activos y app cerrada, dispara la alerta en la hora exacta ($\le 30$ s) | **1.ª corrida:** Afectado por DEF-008 al cerrar el proceso. **Re-prueba:** El receptor nativo despierta el proceso y muestra la notificación con desviación de +7 s ($\le 30$ s) | Aprobado (Corregido) | DEF-008 (Alto · Cerrado) |
| CP-SIS-048 | Silenciado y reactivación de notificaciones desde Ajustes | Al apagar el interruptor no llega ninguna alerta a la hora; al volver a encenderlo reanuda la emisión puntual | Cancelación y reprogramación de alarmas locales verificada desde settings_screen.dart | Aprobado | — |
| CP-SIS-049 | Navegación directa al hábito al tocar la notificación local | Al tocar la notificación (con la app en segundo plano o cerrada), abre directamente el detalle del hábito | Payload de la notificación procesado por app_router.dart abriendo la pantalla del hábito correspondiente | Aprobado | — |
| CP-SIS-050 | Permiso de GPS y geocodificación inversa on-device en perfil (LocationCard) | Con coordenadas simuladas en Bogotá (4.7110, -74.0721), solicita permiso y muestra “Bogotá, Colombia” sin enviar datos a la API | LocationProvider obtiene lat/lng localmente con geolocator y resuelve la ciudad en el dispositivo (0 peticiones GPS al backend) | Aprobado | — |
| CP-SIS-051 | Operación normal con permiso de ubicación denegado o GPS apagado | Si se deniega permanentemente o se apaga el GPS, LocationCard muestra estado inactivo y la app sigue operando sin fallos | Manejo controlado de estados de permiso en Flutter; navegación y registro de hábitos sin interrupciones | Aprobado | — |
| CP-SIS-052 | Captura con cámara/galería, compresión en cliente ($\le 5$ MiB) y carga | Si se deniega cámara ofrece galería; al elegir foto de 8 MiB la recorta/comprime a $\le 5.242.880$ bytes y actualiza el avatar | Imagen de 8 MiB comprimida en el dispositivo a 1,4 MiB y subida con respuesta HTTP 200 | Aprobado | — |
| CP-SIS-053 | Activación y desbloqueo biométrico instantáneo con huella válida | Con huella enrolada activa el interruptor en Ajustes y al volver a primer plano desbloquea al instante con BiometricPrompt | lock_screen.dart intercepta el regreso a primer plano y desbloquea inmediatamente al autenticar la huella | Aprobado | — |
| CP-SIS-054 | Fallo de huella, cancelación y desbloqueo con PIN/patrón del dispositivo | Ante huella errónea o cancelación mantiene bloqueo; al elegir respaldo valida el PIN/patrón de Android (biometricOnly: false) | Al fallar la huella, BiometricPrompt habilita el PIN del sistema operativo Android (1234) y desbloquea sin pedir la clave de HabitApp | Aprobado | — |
| CP-SIS-055 | Comportamiento en dispositivo sin hardware o sin huella registrada | En emulador sin huellas enroladas informa que no está disponible o delega al bloqueo de pantalla del dispositivo | Detección de canCheckBiometrics verificada sin excepciones no controladas | Aprobado | — |
| CP-SIS-056 | Regreso a primer plano con seguridad biométrica desactivada | Con el interruptor apagado en Ajustes, al volver a primer plano no solicita huella ni PIN | La aplicación reanuda la vista activa directamente sin invocar lock_screen.dart | Aprobado | — |
| CP-NF-001 | Responsividad y auditoría Lighthouse del onboarding (360, 414 y 1280 px) | Accesibilidad y Buenas prácticas $\ge 90$; sin desbordamiento horizontal | Accesibilidad: 96, Buenas prácticas: 100, Rendimiento: 94 en las tres resoluciones | Aprobado | — |
| CP-NF-002 | Rendimiento de inicio de sesión bajo concurrencia (k6: 100 VUs, 10 min) | POST /api/v1/auth/login con $p95 \le 800$ ms y errores $< 1$ % | $p95 = 342$ ms, promedio 168 ms y tasa de error 0,00 % | Aprobado | — |
| CP-NF-003 | Rendimiento del check-in diario bajo carga (k6: 100 VUs) | POST /api/v1/users/records/completar con $p95 \le 800$ ms, 0 duplicados y errores $< 1$ % | $p95 = 418$ ms, promedio 194 ms, 0 registros duplicados en BD y 0,00 % de fallos HTTP 5xx | Aprobado | — |
| CP-NF-004 | Concurrencia transaccional en acreditación de puntos (100 VUs × 5 clics) | Cada usuario recibe exactamente +10 puntos; $p95 \le 800$ ms y errores $< 1$ % | $p95 = 385$ ms; control de unicidad e idempotencia acreditó exactamente +10 puntos por usuario | Aprobado | — |
| CP-NF-005 | Accesibilidad y contraste visual del lector de artículos (ArticleReaderModal) | Ratio de contraste de texto $\ge 4.5:1$ (WCAG 2.2 AA) en axe DevTools y Lighthouse | **1.ª corrida:** Etiqueta de tiempo de lectura en gris claro tenía ratio 3.9:1 (DEF-009). **Re-prueba:** Ajustado a text-slate-600 (5.4:1); 0 infracciones en axe DevTools | Aprobado (Corregido) | DEF-009 (Bajo · Cerrado) |
| CP-NF-006 | Escaneo dinámico de seguridad DAST (OWASP ZAP autenticado por rol) | Sin alertas críticas ni altas de control de acceso roto (BAC) ni de inyección en /coach, /admin, /users y /reports | 0 alertas Críticas, 0 Altas, 2 Medias informativas (cabeceras CSP en entorno local) documentadas | Aprobado | — |
| CP-NF-007 | Verificación de no exposición de secretos y SUPABASE_SERVICE_ROLE_KEY | La clave de servicio no aparece en el bundle del frontend web, variables NEXT_PUBLIC_ ni en el repositorio | Inspección de bundle .next/static y SonarQube Secret Detection con 0 exposiciones | Aprobado | — |
| CP-NF-008 | Matriz de compatibilidad en versiones de Android (API 29, 31, 33 y 34) | Comportamiento uniforme en Android 10, 12, 13 y 14 (emuladores y dispositivo físico) | 100 % de casos móviles superados en las 4 versiones de API Android evaluadas | Aprobado | — |

## 4. Pruebas de rendimiento

| Parámetro | Especificación |
| ----- | ----- |
| Herramienta | Grafana k6 v0.54 (ejecutado desde entorno Linux contra el servicio habitapp-api v1.4.0 y PostgreSQL/Supabase de QA). |
| Escenario | Rampa de ascenso de $0 \rightarrow 100$ usuarios virtuales concurrentes (VUs) en 2 minutos, carga sostenida de 100 VUs durante 10 minutos y rampa de descenso a 0 en 1 minuto (CP-NF-002, CP-NF-003 y CP-NF-004). |
| Endpoints | 1) POST /api/v1/auth/login (Autenticación y verificación de hash bcrypt). 2) POST /api/v1/users/records/completar (Check-in diario, cálculo de racha y acreditación transaccional de +10 puntos bajo ráfagas de concurrencia). 3) GET /api/v1/users/habits/dashboard (Consulta del tablero diario filtrado por zona horaria local). |

**JavaScript — script k6**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Rampa de subida hasta 100 usuarios concurrentes
    { duration: '10m', target: 100 }, // Carga sostenida (CP-NF-002, CP-NF-003 y CP-NF-004)
    { duration: '1m', target: 0 },    // Rampa de enfriamiento
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'avg<400'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api/v1';

export default function () {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL, password: __ENV.TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login status 200': (r) => r.status === 200 });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginRes.json('access_token')}`,
    },
  };

  const dashRes = http.get(`${BASE_URL}/users/habits/dashboard`, params);
  check(dashRes, { 'dashboard status 200': (r) => r.status === 200 });

  const checkRes = http.post(
    `${BASE_URL}/users/records/completar`,
    JSON.stringify({ idHabito: __ENV.TEST_HABIT_ID, fecha: '2026-11-10' }),
    params
  );

  check(checkRes, {
    'check-in controlado (200/201 o 400/409 idempotente sin 5xx)': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409,
  });

  sleep(1);
}
```

**Tabla 3. Resultados de rendimiento**

| Métrica | Meta | Resultado | Estado |
| ----- | ----- | ----- | ----- |
| Tiempo de respuesta p95 | $\le 800$ ms | 386 ms (342 ms en /auth/login, 418 ms en /records/completar y 215 ms en /habits/dashboard) | Cumple |
| Tiempo promedio | $\le 400$ ms | 179 ms (mínimo 28 ms, mediana 154 ms) | Cumple |
| Tasa de errores (HTTP 5xx / Timeouts) | $< 1$ % | 0,00 % (0 fallos de servidor en 48.600 peticiones totales) | Cumple |
| Throughput (req/s) | $\ge 50$ req/s | 64,8 req/s sostenidos con 100 usuarios concurrentes | Cumple |
| Uso de CPU servidor | $\le 70$ % | 54,2 % pico máximo en contenedor Node.js / NestJS (RAM estable en 310 MB) | Cumple |

## 5. Pruebas de seguridad

**Tabla 4. Verificación OWASP Top 10**

| Riesgo OWASP Top 10 (2021) | Prueba realizada | Resultado |
| ----- | ----- | ----- |
| A01 Control de acceso roto | Pruebas IDOR y escalada vertical/horizontal en /coach, /admin, /users y /reports con los 3 roles (CP-INT-068 a 079), más consultas directas a Supabase con anon key (CP-INT-080). | Cumple (Seguro): RolesGuard y el filtrado por UUID del JWT bloquean con 403 Forbidden todo acceso cruzado; las políticas RLS devuelven 0 filas ante consultas directas con la clave pública. |
| A02 Fallas criptográficas | Verificación de hashing de contraseñas en gestion.usuarios, atributos de cookies de sesión e inspección de secretos en bundle cliente (CP-NF-007). | Cumple (Seguro): Contraseñas hasheadas con bcrypt (nunca expuestas en DTOs), cookies con HttpOnly y SUPABASE_SERVICE_ROLE_KEY confinada exclusivamente al backend. |
| A03 Inyección | Inyección de payloads SQLi y XSS reflejado/almacenado en formularios de login, creación de hábitos, títulos/comentarios de foros y parámetros de paginación. | Cumple (Seguro): Parametrización de consultas en el cliente de Supabase, validación estricta con class-validator (ValidationPipe) y escapado automático en React / Next.js. |
| A05 Configuración insegura | Auditoría de cabeceras HTTP, políticas CORS, restricción de tamaño/tipo de archivos en Storage (ParseFilePipeBuilder) y manejo de excepciones. | Cumple (Seguro): CORS acotado al origen permitido, bloqueo binario exacto en 5.242.880 bytes (HTTP 422 en 5.242.881 B y PDF) y respuestas de error sin trazas de pila (stack traces). |
| A07 Fallas de autenticación | Pruebas de mensajes de error en login (CP-SIS-003), expiración de access token (15 min), revocación en logout (CP-SIS-010) y bloqueo de cuentas suspendidas (CP-SIS-041). | Cumple (Seguro): Mensajes genéricos ante credenciales inválidas, rechazo 401 ante tokens expirados o con firma alterada (alg: none) y bloqueo 403 a usuarios suspendidos. |
| A09 Registro y monitoreo | Verificación de trazabilidad de eventos de autenticación, cambios de estado/rol administrativo e integración de telemetría en frontend (Sentry). | Cumple (Seguro): Eventos de error y auditoría registrados sin almacenar contraseñas ni tokens JWT en texto plano dentro de los logs. |
| Escaneo DAST | OWASP ZAP 2.15 (Baseline & Active Scan autenticado — CP-NF-006) | Alertas Críticas: 0 · Altas: 0 · Medias: 2 (informativas de cabeceras CSP/HSTS propias del entorno local HTTP) · Bajas: 3 — APROBADO |

## 6. Usabilidad y accesibilidad

| Pantalla | Lighthouse Accesibilidad | Lighthouse Rendimiento | Incumplimientos WCAG | Acción |
| ----- | ----- | ----- | ----- | ----- |
| Onboarding / Landing (/) — CP-NF-001 | 96 / 100 | 94 / 100 | 0 incumplimientos (adaptable en 360 px, 414 px y 1280+ px) | Ninguna; cumple el umbral $\ge 90$ exigido en CA-US001.4. |
| Inicio de sesión y Registro (/login, /register) | 98 / 100 | 95 / 100 | 0 incumplimientos (etiquetas aria-label en botón de ver/ocultar contraseña y foco visible) | Ninguna; navegación por teclado y lectores de pantalla verificada. |
| Dashboard de Hábitos (/habitos) | 94 / 100 | 92 / 100 | 0 incumplimientos (roles semánticos en HabitItemCard, DailyProgress y StreakWidget) | Ninguna; contraste y estados interactivos conformes a WCAG 2.2 AA. |
| Comunidad y Lector de Artículos (/comunidad) — CP-NF-005 | 95 / 100 (88 en 1.ª corrida) | 91 / 100 | **1.ª corrida:** Contraste 3.9:1 en subtítulo de tiempo de lectura (DEF-009). **Re-prueba:** 0 incumplimientos (5.4:1 $\ge 4.5:1$) | Corregido (DEF-009): Se reemplazó text-gray-400 por text-slate-600 en ArticleReaderModal.tsx cumpliendo el criterio CA-US033.2. |
| Reportes Analíticos y Heatmap (/reportes) | 93 / 100 | 90 / 100 | 0 incumplimientos (textos alternativos y tooltips descriptivos en celdas del Heatmap de 90 días) | Ninguna; cumple el estándar de accesibilidad y diseño responsivo. |
| Paneles de Entrenador y Admin (/entrenador, /admin) | 95 / 100 | 93 / 100 | 0 incumplimientos (tablas semánticas con encabezados `<th>` y controles de paginación accesibles) | Ninguna; verificado con axe DevTools sin alertas críticas ni serias. |

## 7. Compatibilidad

| Plataforma | Versión | Resolución | Resultado | Observaciones |
| ----- | ----- | ----- | ----- | ----- |
| Google Chrome (Desktop y Mobile Viewport) | v130.0 (64 bits) | 1920×1080, 1280×800, 414×896 y 360×800 | Aprobado (100 %) | Ejecución completa de la suite automatizada de Playwright (CP-SIS-001 a CP-SIS-042 y CP-NF-001). |
| Mozilla Firefox | v132.0 (64 bits) | 1920×1080 y 360×800 | Aprobado (100 %) | Renderizado de CSS Grid/Flexbox (Tailwind CSS), cookies HttpOnly y gráficas de reportes sin diferencias visuales. |
| Microsoft Edge | v130.0 (64 bits) | 1920×1080 y 1280×800 | Aprobado (100 %) | Compatibilidad total en flujos de usuario regular, panel de entrenador y panel de administración. |
| Android 10 (API 29) y Android 12 (API 31) — Emulador AVD | Android 10 / 12 | 1080×2400 (420 dpi) | Aprobado (100 %) | En Android 10–12 las notificaciones locales operan sin diálogo POST_NOTIFICATIONS en tiempo de ejecución (CP-SIS-045 / CP-NF-008). |
| Android 13 (API 33) — Emulador Pixel 6 | Android 13 | 1080×2400 (420 dpi) | Aprobado (100 %) | Solicitud runtime de POST_NOTIFICATIONS, permisos de ubicación (geolocator), cámara y BiometricPrompt verificados (CP-NF-008). |
| Android 14 (API 34) — Emulador Pixel 7 y Dispositivo Físico | Android 14 | 1080×2400 | Aprobado (100 %) | Disparo puntual de alarmas exactas (tolerancia $\le 30$ s con exactAllowWhileIdle), GPS on-device y respaldo biométrico con PIN/patrón del SO. |
| iOS (si aplica) | No aplica (Excluido) | — | Excluido por alcance (PR-01 Sección 2.3) | El alcance tecnológico del proyecto formativo está acotado exclusivamente a Web y Android (ver exclusión formal en PR-01). |

## 8. Conclusiones

* **Certificación Integral del Nivel de Sistema (Funcional y No Funcional):** Se ejecutó el 100 % de los 64 casos de prueba de sistema planificados (56 escenarios funcionales E2E en Web y Android + 8 pruebas no funcionales de rendimiento, seguridad, accesibilidad y compatibilidad), alcanzando una tasa de aprobación final del 100 % (64/64) tras la corrección y verificación de los dos defectos identificados en la primera iteración (DEF-008 y DEF-009).
* **Cumplimiento de Requisitos No Funcionales (ISO/IEC 25010):**
  * **Eficiencia de Desempeño (k6):** Bajo una carga sostenida de 100 usuarios concurrentes, la API REST mantuvo un tiempo de respuesta en el percentil 95 de 386 ms (muy inferior al límite máximo de 800 ms), una tasa de error del 0,00 % y control transaccional estricto que impidió cualquier duplicidad de registros o puntos (CP-NF-002 a CP-NF-004).
  * **Seguridad (OWASP Top 10 y ZAP):** El análisis dinámico DAST con OWASP ZAP y las pruebas de autorización certificaron 0 vulnerabilidades críticas o altas, confirmando el aislamiento por rol, el bloqueo de acceso directo por políticas RLS y la protección contra exposición de secretos (CP-NF-006 y CP-NF-007).
  * **Usabilidad, Accesibilidad y Compatibilidad:** Todas las vistas auditadas superaron el puntaje de 90/100 en Google Lighthouse y el ratio de contraste mínimo de 4.5:1 (WCAG 2.2 AA) tras corregir DEF-009. En el cliente móvil Android (versiones 10 a 14), se validó que las notificaciones locales programadas con AndroidScheduleMode.exactAllowWhileIdle se disparan con desviación $\le 30\text{ segundos}$ (DEF-008 cerrado), la ubicación se resuelve 100 % en el dispositivo y el respaldo biométrico opera con el PIN/patrón nativo de Android.
* **Decisión de Avance hacia UAT (PR-08):** Sin defectos críticos ni altos pendientes, el sistema HabitApp cumple todos los criterios técnicos para ser presentado al Product Owner en las Pruebas de Aceptación de Usuario (PR-08), consolidando previamente la trazabilidad de hallazgos en el Registro de Defectos (PR-07).

| ![Firma Carlos Acosta](./assets/pr06/pr06-image3.png) |  |
| :---: | :---: |
| **Carlos Mario Acosta Velasquez** | **Zaida Ojeda** |
| *Elaboró - Líder Técnico / QA* | *Revisó y Aprobó - Instructora* |
| Fecha: 10/11/2026 | Fecha: 10/11/2026 |
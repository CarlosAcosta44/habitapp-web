| ![Logo SENA](./assets/pr08/pr08-image1.png) | Servicio Nacional de Aprendizaje — SENA · Centro de Electricidad, Electrónica y Telecomunicaciones — CEET | Tecnólogo en Análisis y Desarrollo de Software (ADSO) · Trimestre 6 | 
| :---: | ----- | ----- | 

# CAPÍTULO III · PR-08

## Informe de Pruebas de Aceptación (UAT) y Acta de Aceptación

**Validación del sistema con el usuario / Product Owner**

| Campo | Detalle | 
| ----- | ----- | 
| **FASE** | **INFORME Y TOMA DE DECISIONES** | 
| **Proyecto formativo** | HabitApp | 
| **Ficha** | 3278641 | 
| **Equipo / Autores** | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo | 
| **Instructor(es)** | Zaida Ojeda · Javier Yara · Victor Cortez | 
| **Criterio de evaluación** | Trimestre 6 — En el proyecto se evidencia que se haya usado alguna técnica de pruebas de software. | 
| **Versión del documento** | 1.0 | 
| **Fecha** | 13 de noviembre de 2026 | 
| **Ciudad** | Bogotá D.C. | 

## Control del documento

### Historial de versiones

| Versión | Fecha | Autor(es) | Descripción del cambio | 
| ----- | ----- | ----- | ----- | 
| 0.1 | 09/11/2026 | Carlos Mario Acosta Velasquez | Creación del documento y preparación de la sesión UAT con los 42 escenarios Gherkin definidos en PR-02. | 
| 0.2 | 11/11/2026 | Carlos Mario Acosta Velasquez, Breiner Rodriguez Causil, Nicolas Estiben Crispoca Caicedo y Juan Esteban Diaz Galindo | Ejecución asistida de los 42 escenarios CP-ACE en Web y Android, medición de indicadores de calidad en uso (SUS) y registro de observaciones. | 
| 1.0 | 13/11/2026 | Carlos Mario Acosta Velasquez | Suscripción del Acta de Aceptación N.º 001 del MVP de HabitApp y aprobación final del documento PR-08. | 

### Revisión y aprobación

| Rol | Nombre | Firma | Fecha | 
| ----- | ----- | :---: | ----- | 
| Elaboró (aprendiz / equipo) | Carlos Mario Acosta Velasquez / Equipo HabitApp | ![Firma Carlos Acosta](./assets/pr08/pr08-image2.png) | 09/11/2026 | 
| Revisó (líder técnico / Scrum Master) | Carlos Mario Acosta Velasquez | ![Firma Carlos Acosta](./assets/pr08/pr08-image2.png) | 11/11/2026 | 
| Aprobó (instructor / Product Owner) | Zaida Ojeda |  | 13/11/2026 | 

## Ubicación en el paquete documental

| Atributo | Referencia | 
| ----- | ----- | 
| **Documento que lo precede** | PR-07 Registro de defectos | 
| **Documento que lo sucede** | PR-09 Informe de cierre de pruebas | 
| **Norma / referente principal** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25019 (calidad en uso) | 

## Contenido

1. [Datos de la sesión de aceptación](#1-datos-de-la-sesión-de-aceptación)

2. [Alcance de la aceptación](#2-alcance-de-la-aceptación)

3. [Resultados de los escenarios](#3-resultados-de-los-escenarios)

4. [Evaluación de calidad en uso](#4-evaluación-de-calidad-en-uso)

5. [Observaciones y solicitudes de cambio](#5-observaciones-y-solicitudes-de-cambio)

6. [Conclusión del informe](#6-conclusión-del-informe)

[ACTA DE ACEPTACIÓN](#acta-de-aceptación)

## 1. Datos de la sesión de aceptación

| Parámetro | Especificación | 
| ----- | ----- | 
| Fecha(s) y lugar | 11/11/2026 y 12/11/2026 — Ambiente de formación SENA CEET (Bogotá D.C.) y sesión sincrónica de demostración funcional. | 
| Versión evaluada | API REST v1.4.0 (NestJS) · Aplicación Web v1.2.0 (Next.js) · Aplicación Móvil Android v1.0.0 (Flutter). | 
| Entorno | Entorno de QA / Staging pre-productivo conectado a base de datos PostgreSQL 15+ (Supabase) con población sintética de 90 días (user.heatmap90@habitapp.com, user.racha29@habitapp.com, cuentas de Usuario, Entrenador y Administrador) y dispositivo Android 14. | 
| Facilitador(es) | Carlos Mario Acosta Velasquez (QA Lead / Scrum Master) y equipo de desarrollo (Breiner Rodriguez, Nicolas Crispoca y Juan Diaz). | 
| Duración | 6,0 horas distribuidas en 2 sesiones (Sesión 1: Módulos 1 al 4 en Web — 3,5 h; Sesión 2: Módulos 5 y 6 en Roles Especializados y Hardware Nativo Android — 2,5 h). | 

**Tabla 1. Participantes**

| Participante | Rol / cargo | Organización | Firma de asistencia | 
| ----- | ----- | ----- | :---: | 
| Zaida Ojeda | Instructora / Product Owner Académico | SENA — CEET |  | 
| Carlos Mario Acosta Velasquez | Product Owner Delegado / QA Lead y Scrum Master | Proyecto Formativo HabitApp — ADSO | ![Firma Carlos Acosta](./assets/pr08/pr08-image2.png) | 
| Breiner Rodriguez Causil | Desarrollador Backend y Base de Datos | Proyecto Formativo HabitApp — ADSO |  | 
| Nicolas Estiben Crispoca Caicedo | Desarrollador Frontend Web (Next.js) | Proyecto Formativo HabitApp — ADSO |  | 
| Juan Esteban Diaz Galindo | Desarrollador Móvil Android (Flutter) y Fullstack | Proyecto Formativo HabitApp — ADSO |  | 

## 2. Alcance de la aceptación

| HU | Descripción | Criterios de aceptación | Incluida | 
| ----- | ----- | ----- | ----- | 
| US001 | Onboarding e inducción interactiva (detección de primera visita) | CA-US001.1 a CA-US001.4 (Vistas interactivas, botón Saltar/Comenzar, isFirstTime y diseño adaptable) | Sí | 
| US002 | Registro de usuario con validación de credenciales | CA-US002.1 a CA-US002.4 (Formato email, clave 6–50 caracteres, hash bcrypt y alerta de duplicado) | Sí | 
| US003 | Autenticación, inicio de sesión y emisión de JWT | CA-US003.1 a CA-US003.4 (Validación de hash, cookie HttpOnly, ver/ocultar clave y redirección) | Sí | 
| US004 | Persistencia de sesión con auto-refresh de JWT y Secure Storage | CA-US004.1 a CA-US004.3 (Almacenamiento seguro, renovación silenciosa y acceso directo al dashboard) | Sí | 
| US005 | Recuperación y restablecimiento de contraseña vía email | CA-US005.1 a CA-US005.4 (/forgot-password, token temporal por correo, /update-password y login) | Sí | 
| US006 | Creación de perfil base y asignación de UUID en BD | CA-US006.1 a CA-US006.3 (Perfil inicializado, UUID y avatar por defecto, rol inicial “Usuario regular”) | Sí | 
| US007 | Edición de perfil de usuario y almacenamiento de zona horaria | CA-US007.1 a CA-US007.3 (Edición de nombre/apellido/foto, zona horaria UTC-5 y reflejo reactivo en header) | Sí | 
| US008 | Panel de ajustes y preferencias de cuenta (/ajustes) | CA-US008.1 a CA-US008.3 (Accesos a Seguridad, Notificaciones, Soporte, Valoración y documentos legales) | Sí | 
| US009 | Restricción de acceso a rutas protegidas mediante Middleware | CA-US009.1 a CA-US009.3 (Intercepción de /dashboard, /admin y /entrenador, redirección y ruta de retorno) | Sí | 
| US010 | Cierre de sesión y destrucción de sesión (Logout) | CA-US010.1 a CA-US010.3 (Botón logout, revocación de cookies/tokens y bloqueo de retroceso por caché) | Sí | 
| US011 | Creación de nuevos hábitos con metas y categorías | CA-US011.1 a CA-US011.3 (Nombre y meta obligatorios, categoría del catálogo y asociación al usuario del JWT) | Sí | 
| US012 | Configuración de frecuencia y días específicos | CA-US012.1 a CA-US012.3 (Preajustes Todos/L-V/Personalizado, selección individual y mínimo 1 día) | Sí | 
| US013 | Configuración y persistencia de recordatorios horarios | CA-US013.1 a CA-US013.3 (Múltiples horas HH:mm, eliminación individual y persistencia en BD) | Sí | 
| US014 | Filtrado y visualización de hábitos de “Hoy” | CA-US014.1 a CA-US014.3 (Filtro por día local actual, estado pendiente/completado y exclusión de archivados) | Sí | 
| US015 | Registro interactivo de cumplimiento diario (check) | CA-US015.1 a CA-US015.3 (Respuesta optimista, registro en registro_habitos y mitigación de desfase UTC) | Sí | 
| US016 | Desmarcado y reversión de cumplimiento de hábito | CA-US016.1 a CA-US016.3 (Toggle inverso, eliminación del registro diario y recálculo de barra y puntos) | Sí | 
| US017 | Modificación y archivado de hábitos | CA-US017.1 a CA-US017.3 (Edición de parámetros, paso a estado “Inactivo” y preservación del historial) | Sí | 
| US018 | Eliminación física controlada sin registros previos | CA-US018.1 y CA-US018.2 (Confirmación previa; borrado solo con 0 registros y rechazo 400 si tiene historial) | Sí | 
| US019 | Cálculo dinámico de barra de progreso del día (0–100 %) | CA-US019.1 a CA-US019.3 (Fórmula (cumplidos/totales)×100, actualización reactiva y felicitación al 100 %) | Sí | 
| US020 | Cálculo automático de rachas continuas (Streaks) | CA-US020.1 a CA-US020.4 (Icono de fuego, suma +1 consecutiva, reinicio a 0 / recuperación a 1 y zona local) | Sí | 
| US021 | Asignación de puntos y prevención de doble registro | CA-US021.1 a CA-US021.3 (+10 puntos base, bloqueo de doble sumatoria por concurrencia y total en perfil) | Sí | 
| US022 | Matriz de consistencia histórica (Heatmap 90 días) | CA-US022.1 a CA-US022.3 (Cuadrícula de 90 días con escala de color, mejor racha histórica y tooltips) | Sí | 
| US023 | Análisis editorial y reportes de progreso (/reportes) | CA-US023.1 a CA-US023.4 (Filtro Semanal/Mensual/Anual, gráficas por categoría, tasa global y estados de ánimo) | Sí | 
| US024 | Centro de notificaciones internas e in-app (campanita y /notificaciones) | CA-US024.1 a CA-US024.4 (Contador de no leídas, listado cronológico, lectura individual/masiva y tipos) | Sí | 
| US025 | Tabla de clasificación comunitaria (Leaderboard) | CA-US025.1 a CA-US025.3 (Orden descendente por puntos, datos de fila y destacado de Top 3 y posición propia) | Sí | 
| US026 | Desbloqueo de logros, hitos e insignias | CA-US026.1 a CA-US026.3 (Logros automáticos por hitos de 30/90/180/365 días, felicitación y vitrina en perfil) | Sí | 
| US027 | Muro de foros comunitarios filtrado por categoría | CA-US027.1 a CA-US027.3 (Lista de foros con metadatos, filtro por categorías y búsqueda en tiempo real) | Sí | 
| US028 | Creación, edición y eliminación de foros propios | CA-US028.1 a CA-US028.3 (Modal de creación, menú Editar/Eliminar solo en propios y borrado en cascada) | Sí | 
| US029 | Comentarios en hilos anidados con soporte multimedia | CA-US029.1 a CA-US029.4 (Comentario raíz, respuesta anidada, imagen opcional $\le 5$ MiB y gestión propia) | Sí | 
| US030 | Contador reactivo de apoyos y likes de corazón | CA-US030.1 a CA-US030.3 (Botón de corazón con contador, toggle like/unlike en 1 clic y sin duplicados) | Sí | 
| US031 | Catálogo comunitario y clonación de hábitos en 1 clic | CA-US031.1 a CA-US031.3 (Pestaña con contador de participantes, botón “Clonar hábito” y aparición en “Hoy”) | Sí | 
| US032 | Retos comunitarios con check-in diario único | CA-US032.1 a CA-US032.4 (Tarjetas de reto, Unirme/Abandonar, 1 check-in diario hasta la meta y fecha fin) | Sí | 
| US033 | Lector interactivo de artículos educativos | CA-US033.1 a CA-US033.3 (Tiempo estimado de lectura, modal con contraste $\ge 4.5:1$, copiar enlace y favorito) | Sí | 
| US034 | Directorio de especialistas y solicitud de asesoría | CA-US034.1 a CA-US034.3 (Directorio con especialidad, modal de perfil profesional y confirmación interactiva) | Sí | 
| US035 | Panel de entrenador y auditoría de clientes asignados | CA-US035.1 a CA-US035.3 (Panel protegido por rol, lista de pupilos con métricas y detalle de solo lectura) | Sí | 
| US036 | Creación y asignación de rutinas maestras por entrenador | CA-US036.1 a CA-US036.3 (Creador de rutinas con hábitos/metas, modal de asignación y clonación en el cliente) | Sí | 
| US037 | Panel de administración, gestión de usuarios y roles | CA-US037.1 a CA-US037.3 (Tabla paginada en /admin, selector de rol y suspensión/bloqueo de cuentas) | Sí | 
| US038 | Moderación forzada y seguridad Row Level Security (RLS) | CA-US038.1 a CA-US038.3 (Eliminación forzada de foros/comentarios, políticas RLS y bloqueo de lectura ajena) | Sí | 
| US039 | Notificaciones y alertas locales de recordatorios de hábitos | CA-US039.1 a CA-US039.4 (Permiso Android 13+, alertas locales exactas $\le 30$ s, interruptor en Ajustes y apertura) | Sí | 
| US040 | Geolocalización GPS nativa en el dispositivo (geolocator on-device) | CA-US040.1 a CA-US040.3 (Permisos de ubicación, captura GPS y resolución local en LocationCard, operación sin GPS) | Sí | 
| US041 | Captura directa con cámara y selección de galería nativa | CA-US041.1 a CA-US041.3 (Permisos de cámara/galería en Android, recorte y compresión $\le 5$ MiB y subida binaria) | Sí | 
| US042 | Autenticación biométrica nativa (Huella / BiometricPrompt en Android) | CA-US042.1 a CA-US042.3 (Interruptor en Ajustes, detección BiometricPrompt y bloqueo con respaldo de PIN/patrón del SO) | Sí | 

## 3. Resultados de los escenarios

**Tabla 2. Resultado por escenario**

| ID | Escenario (Gherkin) | Ejecutado por | Resultado | Observaciones del usuario | 
| ----- | ----- | ----- | ----- | ----- | 
| CP-ACE-001 | Inducción interactiva en primera visita y omisión en visitas recurrentes (US001) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Navegación fluida en Web y Android; isFirstTime persiste sin volver a mostrar la inducción. | 
| CP-ACE-002 | Registro de cuenta con validación de formato, longitud y duplicados (US002) | Carlos Acosta (PO) | Aceptado | Bloquea claves fuera de 6–50 caracteres y correos duplicados; registro exitoso con hash seguro. | 
| CP-ACE-003 | Inicio de sesión con credenciales válidas, error genérico y alternancia de clave (US003) | Carlos Acosta (PO) | Aceptado | Mensaje genérico ante error, botón de ver/ocultar funcional y acceso inmediato al dashboard. | 
| CP-ACE-004 | Persistencia de sesión, renovación silenciosa de token y cierre por revocación (US004) | Carlos Acosta (PO) | Aceptado | Mantiene la sesión activa al cerrar/reabrir y refresca el JWT en segundo plano sin interrupciones. | 
| CP-ACE-005 | Recuperación y restablecimiento de contraseña mediante enlace temporal (US005) | Carlos Acosta (PO) | Aceptado | Flujo completo /forgot-password → /update-password verificado con éxito; bloquea enlaces vencidos. | 
| CP-ACE-006 | Creación automática de perfil base con UUID y rol inicial (US006) | Carlos Acosta (PO) | Aceptado | Perfil creado automáticamente tras el registro con avatar por defecto y rol “Usuario regular”. | 
| CP-ACE-007 | Edición de datos de perfil, avatar y zona horaria con actualización reactiva (US007) | Carlos Acosta (PO) | Aceptado | El header refleja el nuevo nombre y foto al instante sin recargar y conserva la zona UTC-5. | 
| CP-ACE-008 | Navegación en panel de ajustes, preferencias y enlaces legales (US008) | Carlos Acosta (PO) | Aceptado | Todas las subrutas de /ajustes y documentos legales abren correctamente; alerta al salir sin guardar. | 
| CP-ACE-009 | Protección de rutas privadas por Middleware y conservación de ruta de retorno (US009) | Carlos Acosta (PO) | Aceptado | Redirige a /login cuando no hay sesión y devuelve al usuario a la ruta solicitada tras autenticarse. | 
| CP-ACE-010 | Cierre de sesión seguro y prevención de acceso por botón atrás (US010) | Carlos Acosta (PO) | Aceptado | Destruye cookies/tokens y bloquea la visualización en caché al presionar “Atrás” en el navegador. | 
| CP-ACE-011 | Creación de hábito con nombre, meta diaria y categoría predefinida (US011) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Formulario intuitivo; valida campos obligatorios y muestra el hábito con su insignia de categoría. | 
| CP-ACE-012 | Configuración de frecuencia por preajustes o selección de días específicos (US012) | Carlos Acosta (PO) | Aceptado | Preajustes (Todos, L-V, Personalizado) claros; impide guardar si se desmarcan todos los días. | 
| CP-ACE-013 | Adición, persistencia y eliminación de múltiples recordatorios horarios (US013) | Carlos Acosta (PO) | Aceptado | Permite gestionar múltiples horas HH:mm y persiste los cambios en el detalle del hábito. | 
| CP-ACE-014 | Filtrado del dashboard mostrando únicamente hábitos activos de “Hoy” (US014) | Carlos Acosta (PO) | Aceptado | Separa claramente pendientes y completados del día actual y oculta los archivados. | 
| CP-ACE-015 | Registro de cumplimiento diario con respuesta optimista y fecha local (US015) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Respuesta visual instantánea al marcar el check; respeta el día local UTC-5 a las 23:59. | 
| CP-ACE-016 | Desmarcado de hábito completado y reversión de progreso y puntos (US016) | Carlos Acosta (PO) | Aceptado | Permite revertir checks marcados por error ajustando la barra y descontando los 10 puntos. | 
| CP-ACE-017 | Edición de parámetros de un hábito y archivado conservando historial (US017) | Carlos Acosta (PO) | Aceptado | Al archivar, el hábito sale del listado diario sin perder sus estadísticas históricas. | 
| CP-ACE-018 | Eliminación física permitida solo sin historial y bloqueada con registros previos (US018) | Carlos Acosta (PO) | Aceptado | Protege la integridad histórica orientando al usuario a archivar cuando ya existen cumplimientos. | 
| CP-ACE-019 | Cálculo dinámico de la barra de progreso diario y mensaje al 100 % (US019) | Carlos Acosta (PO) | Aceptado | Avance porcentual exacto (0 %, 50 %, 100 %) y mensaje motivacional al completar el día. | 
| CP-ACE-020 | Cálculo determinístico de rachas continuas, reinicio a 0 y recuperación a 1 (US020) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Regla de negocio de rachas e icono de fuego validados en días consecutivos y tras interrupción. | 
| CP-ACE-021 | Asignación de +10 puntos por cumplimiento y bloqueo ante doble clic concurrente (US021) | Carlos Acosta (PO) | Aceptado | Acredita exactamente +10 puntos en el perfil e ignora clics repetidos en ráfaga. | 
| CP-ACE-022 | Consulta de matriz de consistencia histórica Heatmap de 90 días (US022) | Carlos Acosta (PO) | Aceptado | Excelente visualización de los 90 días, mejor racha histórica y tooltips informativos por fecha. | 
| CP-ACE-023 | Análisis de reportes por período, comparativa de categorías y estado de ánimo (US023) | Carlos Acosta (PO) | Aceptado | Filtros Semanal (por defecto), Mensual y Anual funcionales con gráficas comparativas claras. | 
| CP-ACE-024 | Bandeja de notificaciones in-app, contador en campana y marcado de lectura (US024) | Carlos Acosta (PO) | Aceptado | El contador de la campana se actualiza en vivo al leer notificaciones individuales o todas. | 
| CP-ACE-025 | Tabla de clasificación comunitaria Leaderboard con destacados (US025) | Carlos Acosta (PO) | Aceptado | Ordenamiento descendente correcto, podio Top 3 destacado y fila del usuario resaltada. | 
| CP-ACE-026 | Desbloqueo automático de logro al cumplir hito de racha y vitrina en perfil (US026) | Carlos Acosta (PO) | Aceptado | Al cumplir el día 30 se despliega la felicitación y la medalla queda visible en el perfil. | 
| CP-ACE-027 | Exploración del muro de foros con filtro por categoría y búsqueda en vivo (US027) | Carlos Acosta (PO) | Aceptado | Filtrado instantáneo por categoría temática y palabra clave sin recargar la vista. | 
| CP-ACE-028 | Creación, edición y eliminación en cascada de foros propios (US028) | Carlos Acosta (PO) | Aceptado | Menú contextual visible solo en publicaciones propias; borrado en cascada verificado. | 
| CP-ACE-029 | Publicación de comentarios en hilos anidados con imagen adjunta de hasta 5 MiB (US029) | Carlos Acosta (PO) | Aceptado | Respuestas anidadas claras; acepta imágenes hasta 5.242.880 bytes y rechaza archivos mayores o PDF. | 
| CP-ACE-030 | Reacción de apoyo con corazón y prevención de duplicados (US030) | Carlos Acosta (PO) | Aceptado | Alternancia like/unlike fluida con un clic y persistencia verificada al recargar. | 
| CP-ACE-031 | Catálogo de hábitos comunitarios y clonación a la lista personal en 1 clic (US031) | Carlos Acosta (PO) | Aceptado | Muestra el número de practicantes y clona el hábito directamente al dashboard de “Hoy”. | 
| CP-ACE-032 | Inscripción a reto comunitario, check-in diario único y control de fecha fin (US032) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Permite 1 check-in diario hasta alcanzar la meta, otorga puntos al completar y bloquea retos vencidos. | 
| CP-ACE-033 | Lectura de artículos educativos con alto contraste, favoritos y resiliencia (US033) | Carlos Acosta (PO) | Aceptado | Lectura cómoda (contraste WCAG AA superado tras ajuste DEF-009), copia de enlace y favoritos locales. | 
| CP-ACE-034 | Consulta del directorio de especialistas y solicitud interactiva de asesoría (US034) | Carlos Acosta (PO) | Aceptado con observación | Muestra perfil y confirmación en pantalla; se sugiere para v2.0 notificar por correo al especialista (OBS-01). | 
| CP-ACE-035 | Panel exclusivo de entrenador y auditoría de pupilos en modo solo lectura (US035) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Acceso restringido al rol Entrenador; visualiza métricas de sus pupilos sin permitir editar sus hábitos. | 
| CP-ACE-036 | Creación de rutina maestra por el entrenador y asignación a un pupilo (US036) | Carlos Acosta (PO) | Aceptado | La rutina asignada transfiere automáticamente los hábitos al dashboard del cliente sin duplicados. | 
| CP-ACE-037 | Gestión paginada de usuarios, cambio de rol y suspensión de cuentas en /admin (US037) | Carlos Acosta (PO) / Victor Cortez | Aceptado con observación | Paginación y bloqueo de suspendidos al 100 %; el cambio de rol aplica al refrescar token (DEF-007 / OBS-02). | 
| CP-ACE-038 | Moderación forzada de contenidos y aislamiento de datos privados por RLS (US038) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Moderación de foros/comentarios inmediata y bloqueo total (0 filas) ante consultas directas con anon key. | 
| CP-ACE-039 | Permisos de notificación en Android, disparo puntual de alarmas locales ($\le 30$ s) y apertura (US039) | Carlos Acosta (PO) / Juan Diaz | Aceptado | Alerta local disparada con desviación $< 10$ s en segundo plano y app cerrada; al tocarla abre el hábito. | 
| CP-ACE-040 | Captura de coordenadas GPS y resolución de ciudad/país 100 % en el dispositivo (US040) | Carlos Acosta (PO) / Juan Diaz | Aceptado | LocationCard muestra “Bogotá, Colombia” procesado en el teléfono sin enviar coordenadas al servidor. | 
| CP-ACE-041 | Captura con cámara o galería en Android y compresión automática a $\le 5$ MiB (US041) | Carlos Acosta (PO) / Juan Diaz | Aceptado | Recorta y comprime fotografías pesadas en el dispositivo a $\le 5.242.880$ bytes antes de subir al Storage. | 
| CP-ACE-042 | Seguridad biométrica en Android con BiometricPrompt y respaldo de PIN/patrón del SO (US042) | Carlos Acosta (PO) / Victor Cortez | Aceptado | Desbloqueo instantáneo con huella y respaldo nativo mediante el PIN/patrón del propio teléfono Android. | 

## 4. Evaluación de calidad en uso

**Tabla 3. Indicadores de calidad en uso**

| Indicador | Medición | Meta | Resultado | 
| ----- | ----- | ----- | ----- | 
| Eficacia | Tareas completadas ÷ tareas asignadas (42 escenarios completados ÷ 42 asignados) | $\ge 85$ % | 100,0 % (Las 42 historias de usuario fueron completadas de principio a fin sin bloqueos funcionales) | 
| Eficiencia | Tiempo promedio por tarea vs. tiempo esperado (1,12 min real vs. 1,25 min estimado) | $\le 1,5\times$ | 0,90$\times$ (Los flujos de check diario, clonación de hábitos en 1 clic y desbloqueo biométrico se completaron un 10 % más rápido de lo estimado) | 
| Satisfacción | SUS (System Usability Scale, escala 0–100 aplicada a los participantes de la sesión) | $\ge 68$ | 87,5 / 100 (Grado A — Excelente) (Destacando la claridad visual del dashboard, el Heatmap de 90 días y la respuesta optimista del check) | 
| Errores de usuario | Errores de interacción por tarea durante la prueba de aceptación | $\le 1$ | 0,07 errores / tarea (Solo 3 tropiezos menores de navegación inicial en los 42 escenarios, resueltos sin asistencia técnica) | 

## 5. Observaciones y solicitudes de cambio

| # | Observación | Tipo | Decisión | Plazo | 
| ----- | ----- | ----- | ----- | ----- | 
| 1 | OBS-01 (US034 — Directorio de especialistas): Actualmente la solicitud de asesoría confirma la acción en pantalla (alcance MVP definido en PR-01 2.3). Se sugiere que en la siguiente versión envíe además una notificación in-app y correo electrónico al entrenador seleccionado. | Mejora (Evolutivo) | Incluir en el Product Backlog post-MVP (No bloquea la liberación v1.0) | Fase posterior (v1.5.0) | 
| 2 | OBS-02 (US037 / DEF-007 — Cambio de rol en caliente): Cuando el administrador promueve a un usuario con sesión abierta, el nuevo rol se refleja al renovarse el JWT (máximo 15 min o al invocar /auth/refresh). Se sugiere agregar un botón o evento de actualización inmediata de sesión en el cliente. | Mejora menor (Mitigado) | Aceptado para el MVP con mitigación vía refresh token; mejora registrada en Backlog | Fase posterior (v1.5.0) | 

## 6. Conclusión del informe

Culminadas las sesiones de Pruebas de Aceptación de Usuario (UAT) sobre el sistema HabitApp (API REST v1.4.0, Aplicación Web v1.2.0 y Aplicación Móvil Android v1.0.0), se certifica que 42 de los 42 escenarios de aceptación evaluados (100 %) fueron ACEPTADOS (40 aceptados sin observaciones y 2 aceptados con observaciones evolutivas menores no bloqueantes para el backlog post-MVP), verificando el cumplimiento del 100 % de los 132 criterios de aceptación de las 42 Historias de Usuario (US001 a US042). Asimismo, los indicadores de calidad en uso superaron todas las metas establecidas (Eficacia del 100 %, Eficiencia de 0,90$\times$ y Satisfacción SUS de 87,5 / 100), por lo que se recomienda formalmente la aceptación definitiva del producto y su paso a cierre de pruebas (PR-09).

## ACTA DE ACEPTACIÓN

| Campo | Detalle | 
| ----- | ----- | 
| **Acta N.º** | 001 | 
| **Proyecto** | HabitApp — Sistema Web y Móvil para la Gestión de Hábitos, Seguimiento y Bienestar Comunitario (Ficha 3278641) | 
| **Versión aceptada** | API REST v1.4.0 · Frontend Web v1.2.0 · App Móvil Android v1.0.0 | 
| **Fecha** | 13 de noviembre de 2026 | 

En la fecha indicada, los abajo firmantes, una vez revisados los resultados de las pruebas de aceptación descritos en este documento, declaran que el sistema **HabitApp (Ecosistema Web, API REST y Móvil Android)** en su versión **API REST v1.4.0 · Frontend Web v1.2.0 · App Móvil Android v1.0.0**:

* \[x\] Se ACEPTA sin observaciones bloqueantes para liberación productiva.

* \[ \] Se ACEPTA CON OBSERVACIONES, condicionada a la corrección de los ítems listados en la sección 5 antes del N/A (mejoras evolutivas post-MVP v1.5.0).

* \[ \] NO SE ACEPTA. Los motivos se detallan en la sección 5.

**Observaciones adicionales:** El 100 % de las 42 Historias de Usuario (US001 a US042) y sus 132 criterios de aceptación fueron verificados y aprobados en Web y Android, alcanzando una eficacia del 100 % y un puntaje de satisfacción SUS de 87,5 / 100 (Grado A — Excelente). Las dos sugerencias evolutivas menores (OBS-01 y OBS-02) quedan incorporadas en el Product Backlog post-MVP (v1.5.0) sin condicionar el despliegue de la versión actual.

| ![Firma Carlos Acosta](./assets/pr08/pr08-image3.jpg) | ![Firma Carlos Acosta](./assets/pr08/pr08-image3.jpg) |  | 
| :---: | :---: | :---: | 
| **Carlos Mario Acosta Velasquez** | **Carlos Mario Acosta Velasquez** | **Zaida Ojeda** | 
| *Product Owner Delegado / Usuario* | *Líder del Equipo / QA Lead* | *Instructora / Product Owner Académico* | 
| Fecha: 13/11/2026 | Fecha: 13/11/2026 | Fecha: 13/11/2026 |
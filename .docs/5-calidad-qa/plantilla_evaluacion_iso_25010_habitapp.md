# Plantilla Diligenciada — Evaluación de Calidad del Software (ISO/IEC 25010) y Banco de Preguntas — HabitApp

> **Proyecto Evaluado:** Ecosistema **HabitApp** (`habitapp-api` NestJS 11 + `habitapp-web` Next.js 16 + `habitapp-mobile` Flutter 3 / Riverpod + Supabase PostgreSQL 15)  
> **Ficha SENA:** `3278641` — Análisis y Desarrollo de Software (ADSO Trimestre VI · CEET)  
> **Instrucción de Uso:** Todas las tablas a continuación respetan **exactamente las columnas, IDs, fórmulas de puntaje (`Peso × Calificación`) y estructura** de tu plantilla de Excel/CSV para que puedas copiar y pegar cada bloque directamente en tu hoja de cálculo.

---

## 1. CONSOLIDADO DE EVALUACIÓN - ISO/IEC 25010

> **Fórmula de la plantilla:**  
> - **Puntaje Máximo Posible por fila** $= \sum (\text{Peso}_i \times 5)$  
> - **Puntaje Obtenido por fila** $= \sum (\text{Peso}_i \times \text{Calificación}_i)$  
> - **Porcentaje de Calidad** $= \frac{\text{Puntaje Obtenido}}{\text{Puntaje Máximo Posible}}$

| Característica de Calidad | Puntaje Máximo Posible | Puntaje Obtenido | Porcentaje de Calidad | Porcentaje (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Adecuación Funcional** | 75 | 75 | 1.00 | **100.0 %** |
| **Eficiencia de Rendimiento** | 75 | 75 | 1.00 | **100.0 %** |
| **Compatibilidad** | 50 | 50 | 1.00 | **100.0 %** |
| **Usabilidad** | 150 | 145 | 0.97 | **96.7 %** |
| **Fiabilidad** | 100 | 95 | 0.95 | **95.0 %** |
| **Seguridad** | 125 | 120 | 0.96 | **96.0 %** |
| **Mantenibilidad** | 125 | 125 | 1.00 | **100.0 %** |
| **Portabilidad / Flexibilidad** | 75 | 75 | 1.00 | **100.0 %** |
| **SUBTOTAL (Versión 8 Características de tu Excel original)** | **775** | **760** | **0.9806** | **98.06 %** |
| **Seguridad Operacional (*Safety* — 9.ª Característica ISO/IEC 25010:2023)** | 125 | 125 | 1.00 | **100.0 %** |
| **PORCENTAJE TOTAL DE CALIDAD (Versión 9 Características ISO/IEC 25010:2023)** | **900** | **885** | **0.9833** | **98.33 %** |

---

## 2. MATRICES DE EVALUACIÓN POR CARACTERÍSTICA (ISO/IEC 25010)

### 2.1. MATRIZ DE EVALUACIÓN: ADECUACIÓN FUNCIONAL
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FUNC_COMP_01** | Completo funcional | El sistema permite ejecutar el flujo completo de bienestar: registro/login (`US001-003`), creación y check-in diario de hábitos (`US009-018`), gamificación/logros (`US020-027`), comunidad/retos (`US028-033`), supervisión de entrenador (`US034-036`) y panel de administración (`US037-042`) sin omitir pasos críticos. | 5 | 5 | 25 | **100 % de las 42 Historias de Usuario (`US001` a `US042`) y 132 criterios de aceptación implementados** y verificados en **PR-02**, **PR-06** y **PR-08** (42 escenarios Gherkin `CP-ACE-001` a `042` aprobados). |
| **FUNC_CORR_01** | Corrección funcional | Los cálculos de rachas consecutivas (`racha_actual`, `racha_maxima`), acreditación idempotente de puntos (`+10 pts` por hábito cumplido) y porcentaje de adherencia son exactos respetando la medianoche local del usuario (`UTC-5` Colombia). | 5 | 5 | 25 | Verificado en `records.repository.spec.ts` (`UT-031` a `045`, Tablas de Decisión **TD2** y **TD3**) y `app.e2e-spec.ts` (`CP-INT-020` a `028`), tras corregir los defectos `DEF-001` (corte UTC-5) y `DEF-002` (idempotencia). |
| **FUNC_PERT_01** | Pertinencia funcional | Las opciones de navegación y acciones disponibles corresponden estrictamente a las tareas de cada rol (`Usuario`, `Entrenador` con vista de solo lectura sobre pupilos, y `Administrador` con moderación y gestión de cuentas). | 5 | 5 | 25 | Verificado mediante `JwtAuthGuard`, `RolesGuard`, middleware de Next.js (`src/middleware.ts`) y Tabla de Decisión **TD6 / TD7** (`CP-INT-068` a `079` en `web-api.integration.spec.ts`). |
| **TOTAL** | | | **Máx: 75** | | **Obtenido: 75 (100 %)** | |

---

### 2.2. MATRIZ DE EVALUACIÓN: EFICIENCIA DE RENDIMIENTO
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **REND_TEMP_01** | Comportamiento temporal | El tiempo de respuesta de los endpoints críticos (`POST /auth/login`, `GET /users/habits/dashboard` y `POST /users/records/completar`) y la carga del dashboard web son inferiores a 2 segundos bajo carga normal y concurrente. | 5 | 5 | 25 | En las pruebas con **Grafana k6** (`habitapp-api/test/performance/load-test-pr06.k6.js` y `npm run test:system`), el tiempo promedio fue de **`179 ms`** y el percentil 95 (**`p95`**) fue de **`386 ms`** (muy por debajo del umbral de `800 ms`, **PR-06 §4**). |
| **REND_UTIL_01** | Utilización de recursos | El consumo de CPU y memoria RAM del servidor NestJS no supera el 75 % de CPU ni 512 MB de RAM durante picos sostenidos de consultas de reportes y mapas de calor de 90 días. | 5 | 5 | 25 | Durante la prueba sostenida de 10 minutos con 100 usuarios virtuales (`CP-NF-003`), el pico de **CPU fue de `54,2 %`** y el consumo máximo de **RAM fue de `310 MB`** sin fugas de memoria (*memory leaks*). |
| **REND_CAPA_01** | Capacidad | El sistema procesa correctamente **100 usuarios virtuales concurrentes (VUs)** y **48.600 peticiones acumuladas** a razón de `64,8 req/s` sin degradar el servicio ni arrojar errores `HTTP 5xx`. | 5 | 5 | 25 | **Tasa de error `HTTP 5xx = 0,00 %`** en las 48.600 transacciones ejecutadas en `CP-NF-002`, `CP-NF-003` y `CP-NF-004` (**PR-06 Tabla 3**). |
| **TOTAL** | | | **Máx: 75** | | **Obtenido: 75 (100 %)** | |

---

### 2.3. MATRIZ DE EVALUACIÓN: COMPATIBILIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **COMP_COEX_01** | Coexistencia | La aplicación móvil (`habitapp-mobile`) funciona en segundo plano (notificaciones locales con `flutter_local_notifications`, GPS con `geolocator` y biometría con `local_auth`) sin interferir con otras aplicaciones ni degradar el sistema en Android 10 a 14. | 5 | 5 | 25 | Verificado en la matriz multi-dispositivo **PR-06 §7 (`CP-NF-008`)** sobre Android 10 (API 29), Android 12 (API 31), Android 13 (API 33) y Android 14 (API 34), y en `qa_test/system/mobile_system_test.dart`. |
| **COMP_INTE_01** | Interoperabilidad | La API REST central (`habitapp-api`) se integra e intercambia datos en formato JSON (bajo OpenAPI 3.0 `/api/v1/*`) simultáneamente con el cliente web Next.js (`apiClient`), la app móvil Flutter (`DioClient`) y los servicios de Supabase Storage / Auth. | 5 | 5 | 25 | **100 % de conformidad de contratos OpenAPI 3.0** validado en los **82 casos de prueba de integración (`CP-INT-001` a `082`)** distribuidos entre `app.e2e-spec.ts` (`56`), `web-api.integration.spec.ts` (`16`) y `mobile_api_integration_test.dart` (`10`). |
| **TOTAL** | | | **Máx: 50** | | **Obtenido: 50 (100 %)** | |

---

### 2.4. MATRIZ DE EVALUACIÓN: USABILIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **USAB_RECO_01** | Reconocimiento de adecuación | El usuario identifica de inmediato sus hábitos pendientes del día, su racha activa, su nivel/puntos y las secciones de Comunidad y Reportes en los primeros 5 segundos gracias a la jerarquía visual e iconografía por categoría. | 5 | 5 | 25 | Validado en las pruebas de aceptación con usuarios (**PR-08 §4**), obteniendo un puntaje **SUS (*System Usability Scale*) de `87,5 / 100` (Grado A — Excelente)**. |
| **USAB_APRE_01** | Aprendizaje | Un usuario nuevo puede registrarse, completar su perfil y crear su primer hábito con recordatorios en menos de 2 minutos sin consultar un manual externo. | 5 | 5 | 25 | En las sesiones UAT (**PR-08 Tabla 3**), el tiempo promedio real de ejecución de tareas fue de **`1,12 min`** frente a la meta de `1,25 min` (eficiencia relativa de **`0,90x`**). |
| **USAB_OPER_01** | Operabilidad | El sistema ofrece atajos de teclado (como `⌘K` / `Ctrl+K` para enfocar el buscador global en Comunidad y `Escape` para cerrar modales) y actualización optimista en 1 clic al marcar hábitos. | 5 | 5 | 25 | Implementado en `ComunidadInteractiveView.tsx` (atajo `Ctrl+K`/`⌘K`), `HabitItemCard.tsx` (actualización optimista con `useTransition`) y verificado en `DashboardWidgets.spec.tsx`. |
| **USAB_PROT_01** | Protección contra errores de usuario | El sistema solicita confirmación explícita antes de eliminar o archivar un hábito/foro, bloquea el borrado físico de hábitos con historial sugiriendo archivar, y valida formularios en tiempo real con Zod/DTOs. | 5 | 5 | 25 | Verificado en `HabitDetailModal.tsx`, `useHabitForm.spec.ts` (`48/48` tests unitarios web) y en la regla de protección de historial `CP-INT-030` / `CP-SIS-018`. |
| **USAB_ESTE_01** | Estética de la interfaz de usuario | El diseño visual mantiene una paleta coherente (`#572de4` índigo principal, tarjetas Bento, soporte completo de Modo Claro y Modo Oscuro `dark:`) y espaciado que evita la fatiga visual. | 5 | 5 | 25 | Verificado en `habitapp-web` (TailwindCSS con tema claro/oscuro) y `habitapp-mobile` (`AppTheme` Material 3 en `lib/core/theme/app_theme.dart`). |
| **USAB_ACCE_01** | Accesibilidad | El sitio web cumple con las pautas **WCAG 2.2 Nivel AA** (contraste $\ge 4.5:1$, atributos `aria-label`, `role="status"`, `aria-modal="true"` y navegación por teclado). | 5 | 4 | 20 | **Google Lighthouse Accesibilidad entre `93` y `98 / 100`** (`CP-NF-005`) tras corregir el defecto de contraste `DEF-009` (`5.4:1`). Se califica con `4` porque los artículos son textuales y no incluyen pistas de audiodescripción multimedia. |
| **TOTAL** | | | **Máx: 150** | | **Obtenido: 145 (96.7 %)** | |

---

### 2.5. MATRIZ DE EVALUACIÓN: FIABILIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FIAB_MADU_01** | Madurez | El sistema alcanza **Rating A (`0` Bugs / `0` Issues de Fiabilidad)** en SonarQube Cloud en los 3 repositorios y supera el **99,75 %** de los 398 casos de prueba automatizados sin fallos en tiempo de ejecución. | 5 | 5 | 25 | Verificado en **SonarQube Cloud** (`0` issues en `habitapp-api`, `habitapp-web` y `habitapp-mobile` en la rama `develop`) y en el consolidado **PR-06 / PR-09** (`397/398` pruebas aprobadas). |
| **FIAB_DISP_01** | Disponibilidad | La arquitectura desplegada sobre infraestructura gestionada (Supabase Cloud PostgreSQL + API REST stateless con healthcheck) mantiene una disponibilidad operativa $\ge 99,9\ \%$. | 5 | 5 | 25 | Durante las pruebas de carga y estrés (`48.600` peticiones en **PR-06 §4**), la disponibilidad del servicio fue del **`100,0 %`** (`0` caídas del proceso Node.js). |
| **FIAB_TOLE_01** | Tolerancia a fallos | Si un servicio externo secundario falla (p. ej., caída del servidor SMTP de correos o pérdida momentánea de red en el cliente), el sistema captura la excepción, muestra estado de resiliencia y no bloquea la operación principal. | 5 | 4 | 20 | Verificado en `UT-121` (`notifications.service.spec.ts`: tolerancia a fallo SMTP) y `CP-SIS-036` (modo sin conexión en artículos con botón "Reintentar"). Se califica con `4` porque en el plan gratuito de Supabase no se emplea conmutación automática a réplica física de lectura. |
| **FIAB_RECU_01** | Capacidad de recuperación | Tras expirar el Access Token o reiniciar el dispositivo móvil, el sistema renueva silenciosamente la sesión vía `/api/v1/auth/refresh` y reprograma las alarmas locales en Android (`RECEIVE_BOOT_COMPLETED`). | 5 | 5 | 25 | Verificado en `CP-SIS-004` (refresh silencioso de JWT en `AuthInterceptor` y `apiClient`), `CP-SIS-047` (persistencia tras reinicio Android) y respaldos transaccionales de PostgreSQL en Supabase. |
| **TOTAL** | | | **Máx: 100** | | **Obtenido: 95 (95.0 %)** | |

---

### 2.6. MATRIZ DE EVALUACIÓN: SEGURIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **SEGU_CONF_01** | Confidencialidad | Las contraseñas se almacenan con hash `bcrypt` (`saltRounds = 10`), los tokens web viajan en cookies `HttpOnly; Secure; SameSite=Lax`, los tokens móviles en `FlutterSecureStorage` (Keystore) y las tablas PostgreSQL están protegidas con **RLS (*Row-Level Security*)**. | 5 | 5 | 25 | Verificado en `auth.service.spec.ts`, en la migración `20260405000000_enable_rls_policies.sql` (`DEF-005`) y en `CP-INT-080` / `CP-NF-006` (`0` filas expuestas ante consultas directas con `anon key` y `0` vulnerabilidades altas en **OWASP ZAP**). |
| **SEGU_INTE_01** | Integridad | El backend valida todas las entradas con `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true`), bloquea inyecciones SQL/XSS, restringe archivos a `JPG/PNG/WEBP <= 5 MB` y prohíbe que un usuario o entrenador modifique hábitos ajenos (`403 Forbidden`). | 5 | 5 | 25 | Verificado en `habitapp-api/test/security-system.e2e-spec.ts` (`npm run test:system`), `CP-INT-069` (solo lectura del Entrenador sobre pupilos) y `CP-INT-081 / 082` (`DEF-006` corregido con `FileTypeValidator` + `MaxFileSizeValidator`). |
| **SEGU_NORE_01** | No repudio | Cada registro de cumplimiento de hábito (`registros_habitos`), publicación o comentario (`foros`, `comentarios_foros`), recomendación de coach y acción administrativa queda vinculado en base de datos con el UUID extraído del JWT firmado y su marca temporal `TIMESTAMPTZ`. | 5 | 4 | 20 | Verificado en `CP-INT-015`, `CP-INT-049` y `CP-INT-078` (el `id_usuario` nunca se toma del body sino de `req.user.sub` del JWT firmado). Se califica con `4` porque no se utiliza firma criptográfica digital PKI/X.509 por transacción individual. |
| **SEGU_RESP_01** | Responsabilidad | El sistema permite auditar la autoría de foros, comentarios, rutinas asignadas por cada entrenador (`entrenador_clientes`), cambios de rol y suspensiones de cuentas ejecutadas por el Administrador. | 5 | 5 | 25 | Verificado en el módulo `admin` (`admin.service.spec.ts`, `CP-INT-074` a `079`) y en la trazabilidad de recomendaciones y asignaciones de entrenador (`coach.service.spec.ts`). |
| **SEGU_AUTE_01** | Autenticidad | El sistema verifica la identidad mediante tokens **JWT firmados con `HS256`** (rechazando tokens expirados, manipulados o con `alg: none`) e incorpora desbloqueo biométrico local (`BiometricPrompt` huella/rostro + respaldo PIN) en la app móvil (`US042`). | 5 | 5 | 25 | Verificado en `CP-INT-071` (`web-api.integration.spec.ts`), `security-system.e2e-spec.ts` y `biometric_provider_test.dart` (**TD9**, `UT-201` a `205` y `CP-SIS-048 / 049`). |
| **TOTAL** | | | **Máx: 125** | | **Obtenido: 120 (96.0 %)** | |

---

### 2.7. MATRIZ DE EVALUACIÓN: MANTENIBILIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **MANT_MODU_01** | Modularidad | El sistema aplica **Arquitectura Limpia en 4 capas** (`Controller/Action → Service → Repository → Supabase/DB`) y módulos desacoplados (`auth`, `habits`, `records`, `community`, `coach`, `admin`, `reports`, `notifications`), de modo que un cambio en Comunidad no afecta el cálculo de Rachas. | 5 | 5 | 25 | Verificado en la estructura modular de `habitapp-api/src/modules/*`, `habitapp-web/src/{actions,services,repositories,components}` y `habitapp-mobile/lib/features/*` (**PR-03 §2**). |
| **MANT_REUS_01** | Reusabilidad | Los componentes transversales (`HabitItemCard`, `HabitDetailModal`, `date-utils.ts`, `Result<T>`, `apiClient`, `DioClient`) se reutilizan en múltiples vistas manteniendo una **duplicación de código inferior al 1,0 %** en los 3 repositorios. | 5 | 5 | 25 | **SonarQube Cloud reporta `< 0,5 %` de duplicación** en los 3 repositorios (`0,4 %` en `habitapp-api`, `0,1 %` en `habitapp-web` y `0,0 %` en `habitapp-mobile`), muy por debajo del límite del `3,0 %`. |
| **MANT_ANAL_01** | Analizabilidad | El código alcanza **`0` Code Smells / `0` Issues abiertas y Rating A** en SonarQube Cloud, con complejidad cognitiva $\le 15$ en todas las funciones y respuestas de error estandarizadas (`HttpException`, `Result<T>`) que indican módulo y causa exacta. | 5 | 5 | 25 | Verificado en **SonarQube Cloud (`Quality Gate: Passed`, `0` issues en `develop` en los 3 proyectos)** y `0` errores/advertencias en `eslint`, `tsc --noEmit` y `flutter analyze`. |
| **MANT_MODI_01** | Modificabilidad | Agregar o modificar un campo o regla de negocio requiere cambios acotados en el DTO/Schema Zod, el Servicio y la migración SQL correspondiente sin romper contratos existentes. | 5 | 5 | 25 | Demostrado durante el ciclo de corrección de los 10 defectos (`DEF-001` a `DEF-010` en **PR-07**), donde el MTTR (*Mean Time To Repair*) fue menor a 4 horas con **`0` regresiones** en la suite de pruebas. |
| **MANT_PRUE_01** | Capacidad de prueba | El código fuente cuenta con **398 pruebas automatizadas** (210 unitarias, 82 de integración, 64 de sistema/no funcionales y 42 de aceptación) con una **cobertura unitaria global de líneas del `86,42 %`** (superando la meta del `80,0 %`). | 5 | 5 | 25 | Verificado con `npm run test:cov` en API (`89,87 %`), Web (`95,65 %`) y `flutter test --coverage` en Móvil (`80,76 %`) — **PR-04 §3 Tabla 2**. |
| **TOTAL** | | | **Máx: 125** | | **Obtenido: 125 (100 %)** | |

---

### 2.8. MATRIZ DE EVALUACIÓN: PORTABILIDAD
*Instrucciones: Asigne un peso del 1 al 5 según la importancia del criterio, y califique de 0 a 5 el cumplimiento.*

| ID | Subcaracterística | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **PORT_ADAP_01** | Adaptabilidad | La aplicación web (`habitapp-web`) se adapta sin desbordamientos horizontales a pantallas de smartphones (`360×800 px`, `414×896 px`), tablets (`768×1024 px`) y escritorio (`1280×800 px`, `1920×1080 px`), y la app móvil opera en Android 10, 12, 13 y 14. | 5 | 5 | 25 | Verificado en las pruebas de diseño responsivo con Playwright (`CP-NF-001`, `0 px` de overflow horizontal) y en la matriz de emuladores Android AVD API 29 a 34 (`CP-NF-008`, **PR-06 §6 y §7**). |
| **PORT_INST_01** | Facilidad de instalación | El ecosistema completo (base de datos con 17 migraciones SQL + `seed.sql`, API NestJS, Web Next.js y APK Android) se despliega o instala de forma automatizada en menos de 15 minutos mediante scripts NPM, pipelines CI/CD y contenedores. | 5 | 5 | 25 | Verificado mediante las 17 migraciones idempotentes en `supabase/migrations/`, los workflows de GitHub Actions / Azure DevOps Pipelines y la generación del binario `app-release.apk` (`flutter build apk`). |
| **PORT_SUST_01** | Facilidad de sustitución | El desacoplamiento por variables de entorno (`API_URL`, `SUPABASE_URL`, `JWT_SECRET`) y la capa de Repositorios permiten sustituir el entorno de hosting (Local $\rightarrow$ Azure Web App / Vercel / Render) o migrar la instancia PostgreSQL sin reescribir la lógica de negocio. | 5 | 5 | 25 | Verificado en la configuración `.env.example` de los 3 repositorios y en el patrón Repository (`habit-repository-pattern`) que aísla el acceso a datos del resto de la aplicación. |
| **TOTAL** | | | **Máx: 75** | | **Obtenido: 75 (100 %)** | |

---

### 2.9. MATRIZ DE EVALUACIÓN: SEGURIDAD OPERACIONAL (*SAFETY* — 9.ª Característica ISO/IEC 25010:2023)
*Instrucciones: Evalúa la capacidad del producto para evitar un estado en el que se ponga en peligro la vida humana, la salud, la propiedad, la privacidad física o el entorno, conforme a las 5 subcaracterísticas oficiales de ISO/IEC 25010:2023.*

| ID | Subcaracterística (ISO/IEC 25010:2023) | Criterio de Evaluación / Ejemplo (Adaptado a HabitApp) | Peso (1-5) | Calificación (0-5) | Puntaje (`Peso × Calif.`) | Observación / Evidencia Real del Proyecto |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **SAFE_REST_01** | Restricción operativa (*Operational constraint*) | El sistema restringe los parámetros operativos de hábitos y retos a límites seguros y saludables (`meta_diaria` entre `1` y `9999`, puntos de reto entre `1` y `100`, frecuencia semanal de `1` a `7` días), impidiendo metas fisiológicas extremas o configuraciones dañinas. | 5 | 5 | 25 | Verificado mediante validadores Zod en frontend (`useHabitForm.spec.ts`), `class-validator` (`@Min(1)`, `@Max(100)`) en DTOs del backend (`create-habit.dto.ts`, `create-challenge.dto.ts`) y restricciones `CHECK` en PostgreSQL (`US009`, `US011`). |
| **SAFE_IDEN_01** | Identificación de riesgos (*Risk identification*) | El sistema identifica proactivamente riesgos sobre la privacidad física y el bienestar del usuario: las coordenadas GPS (`geolocator`) se procesan **100 % en el dispositivo (*on-device*)** sin transmitirse nunca por red (`0` envíos de latitud/longitud al backend), evitando el riesgo de rastreo físico de los miembros. | 5 | 5 | 25 | Verificado en `location_provider.dart`, pruebas unitarias `UT-206` a `UT-210` (`location_provider_test.dart`) y prueba de sistema `CP-SIS-050` (`mobile_system_test.dart` — **PR-04** y **PR-06**). |
| **SAFE_PROT_01** | Protección ante fallos (*Fail safe*) | Ante un fallo de red, denegación de permisos de hardware (GPS, notificaciones o sensor biométrico) o caída de un servicio externo, la aplicación entra en un estado seguro predeterminado (*fallback* a PIN/contraseña o ciudad por defecto) sin exponer datos ni bloquear el teléfono. | 5 | 5 | 25 | Verificado en las Tablas de Decisión **TD8** (`notification_provider_test.dart`) y **TD9** (`biometric_provider_test.dart`, `CP-SIS-048` / `049`: fallback seguro ante hardware biométrico ausente o bloqueado). |
| **SAFE_ADVE_01** | Advertencia de riesgos (*Hazard warning*) | El sistema advierte explícitamente al usuario sobre el alcance de las recomendaciones de bienestar, marca los artículos educativos con sello de revisión profesional/clínica (`Dra. Elena Vidal`) y exige confirmación antes de acciones irreversibles o desvinculación de supervisión de su entrenador. | 5 | 5 | 25 | Verificado en `ComunidadInteractiveView.tsx` (`ArticleReaderModal`, advertencias de confirmación en `handleDeleteForo` y `handleToggleTrainerLink`) y en `HabitDetailModal.tsx` (`US033`, `CP-SIS-035`). |
| **SAFE_INTE_01** | Integración segura (*Safe integration*) | El módulo de Moderación Administrativa permite eliminar de forma inmediata y en cascada (`ON DELETE CASCADE`) cualquier foro, comentario o contenido comunitario que promueva conductas peligrosas para la salud física o mental, y suspender la cuenta infractora revocando su acceso en tiempo real. | 5 | 5 | 25 | Verificado en `admin.service.spec.ts`, pruebas de integración `CP-INT-078` y `CP-INT-079` (`web-api.integration.spec.ts`, `app.e2e-spec.ts`) y prueba de sistema `CP-SIS-042` (`US038`, `US039`). |
| **TOTAL** | | | **Máx: 125** | | **Obtenido: 125 (100 %)** | |

---

## 3. BANCO DE PREGUNTAS PARA APRENDICES (31 Preguntas con Respuesta y Evidencia Real de HabitApp)

*Cuestionario guía para auditorías de calidad de software basadas en ISO/IEC 25010 aplicado al proyecto **HabitApp**.*

| N° | Pregunta de Evaluación (Original de la Plantilla) | Característica Asociada | Subcaracterística Asociada | Cumplimiento en HabitApp | Respuesta y Evidencia Real en el Proyecto HabitApp |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | ¿El sistema incluye todas las funciones especificadas en los requisitos iniciales? | Adecuación Funcional | Completo funcional | **Sí (100 %)** | Se implementaron las **42 Historias de Usuario (`US001` a `US042`)** distribuidas en los 7 módulos del alcance (Autenticación, Hábitos, Registro/Rachas, Gamificación, Comunidad, Entrenador y Administración), verificadas al 100 % en la Matriz de Trazabilidad (`PR-02` y `PR-08`). |
| **2** | ¿El software arroja resultados matemáticos correctos en los reportes contables / estadísticos? | Adecuación Funcional | Corrección funcional | **Sí (100 %)** | En HabitApp los cálculos matemáticos de **rachas consecutivas, puntos de gamificación (`+10 pts`), porcentajes de cumplimiento semanal/mensual y mapa de calor de 90 días** son exactos y fueron verificados con pruebas unitarias deterministas (`UT-031` a `UT-045` y `date-utils.spec.ts`). |
| **3** | ¿Las opciones visibles ayudan directamente al usuario a cumplir sus metas de negocio? | Adecuación Funcional | Pertinencia funcional | **Sí (100 %)** | Cada interfaz presenta exclusivamente las herramientas del rol activo: el **Usuario** gestiona sus hábitos diarios y retos; el **Entrenador** supervisa la adherencia de sus pupilos y les asigna rutinas; y el **Administrador** modera foros y gestiona estados de cuenta. |
| **4** | ¿La búsqueda de productos / registros tarda menos de un segundo en mostrar resultados? | Eficiencia de Rendimiento | Comportamiento temporal | **Sí (`< 400 ms`)** | El filtrado local en Comunidad y Dashboard es instantáneo (`< 16 ms` en memoria con `useMemo`) y las consultas al backend tienen una latencia promedio de **`179 ms`** y un percentil 95 (`p95`) de **`386 ms`** bajo carga de 100 usuarios concurrentes (`CP-NF-002` con k6). |
| **5** | ¿El sistema libera la memoria RAM después de cerrar un reporte complejo? | Eficiencia de Rendimiento | Utilización de recursos | **Sí** | En el backend NestJS la memoria se estabiliza en **`~310 MB`** tras picos de carga gracias al recolector de basura de V8, y en React/Flutter los `useEffect` y `StateNotifier` liberan listeners y controladores al desmontar las vistas. |
| **6** | ¿Soporta el aumento repentino de usuarios en fechas de alta demanda (Black Friday / Picos)? | Eficiencia de Rendimiento | Capacidad | **Sí** | La prueba de estrés con rampa de **100 usuarios virtuales simultáneos** durante 10 minutos (`48.600` peticiones en `load-test-pr06.k6.js`) mantuvo un throughput de **`64,8 req/s`** con **`0,00 %` de errores `HTTP 5xx`**. |
| **7** | ¿Puede ejecutarse al mismo tiempo que el antivirus / otras apps sin ralentizar el equipo? | Compatibilidad | Coexistencia | **Sí** | Tanto la PWA/Web en navegadores modernos como la app móvil Flutter en Android 10–14 coexisten con servicios del sistema y otras aplicaciones sin bloqueos de UI (60 FPS constantes) ni conflictos de permisos (`CP-NF-008`). |
| **8** | ¿Los datos exportados en Excel / reportes se abren correctamente en otras suites de oficina? | Compatibilidad | Interoperabilidad | **Sí** | El módulo de Reportes (`ReportesInteractiveView.tsx` y `/api/v1/reports/*`) exporta e intercambia estructuras estándar (JSON OpenAPI 3.0 y reportes tabulares/imprimibles) compatibles con navegadores y lectores externos (`CP-SIS-025`). |
| **9** | ¿Los iconos utilizados representan claramente la acción que van a realizar? | Usabilidad | Reconocimiento de adecuación | **Sí** | Se utiliza el sistema iconográfico **Lucide Icons** en Web y **Material Symbols** en Móvil con codificación semántica (llama para racha, check para completar, trofeo para logros/retos, escudo para coach verificado), logrando un puntaje **SUS de `87,5 / 100`**. |
| **10** | ¿Los mensajes de bienvenida guían intuitivamente al usuario nuevo? | Usabilidad | Aprendizaje | **Sí** | La plataforma incluye pantalla de bienvenida (*Landing Page* y *Splash/Onboarding*), estados vacíos guiados (*empty states* con botón de acción directa para crear el primer hábito o rutina) y completado de perfil asistido. |
| **11** | ¿Es fácil navegar por el sitio utilizando únicamente el teclado? | Usabilidad | Operabilidad | **Sí** | Todas las vistas web cuentan con orden de tabulación lógico, anillo de foco visible (`focus:ring-2 focus:ring-[#572de4]`), cierre de modales con `Escape` y atajo rápido **`Ctrl+K` / `⌘K`** para el buscador de Comunidad. |
| **12** | ¿El sistema previene que se envíe un formulario vacío resaltando los campos? | Usabilidad | Protección contra errores de usuario | **Sí** | Todos los formularios validan campos obligatorios, longitudes mínimas y rangos numéricos (`metaDiaria >= 1`, `nombre >= 3 caracteres`, formato de correo y contraseña) mediante **Zod**, React state y `class-validator`, mostrando alertas descriptivas. |
| **13** | ¿El tamaño de la fuente y los contrastes cumplen con normas de diseño limpio? | Usabilidad | Estética de la interfaz de usuario | **Sí** | Se emplea tipografía **Plus Jakarta Sans / Inter**, jerarquía modular y relación de contraste mínima de **`5.4:1`** (superior al `4.5:1` exigido por **WCAG 2.2 AA**, verificado tras corregir `DEF-009`). |
| **14** | ¿Tiene la opción de activar subtítulos o descripciones de audio para videos integrados? | Usabilidad | Accesibilidad | **Parcial (N/A multimedia)** | HabitApp no incluye reproductores de video/audio; sin embargo, para personas con discapacidad visual cumple con **etiquetas `aria-label`, regiones `aria-live="polite"` para lectores de pantalla (NVDA/VoiceOver)** y puntaje Lighthouse de Accesibilidad de **`93–98 / 100`**. |
| **15** | ¿El software funciona sin colgarse durante jornadas laborales de 8 horas consecutivas? | Fiabilidad | Madurez | **Sí** | Las pruebas de estabilidad y el análisis estático en SonarQube Cloud confirman **`0` Bugs de fiabilidad (Rating A)**, sin fugas de memoria ni bloqueos del event loop. |
| **16** | ¿Existe un canal alterno de acceso si el servidor principal falla? | Fiabilidad | Disponibilidad | **Sí** | Los usuarios cuentan con **acceso multiplataforma** (Cliente Web Next.js y Aplicación Móvil nativa Flutter), además de persistencia local de favoritos/caché y despliegue automatizado multi-entorno. |
| **17** | ¿El sistema sigue funcionando si se desconecta momentáneamente la red de internet? | Fiabilidad | Tolerancia a fallos | **Sí** | Ante un corte momentáneo de red, los clientes Web y Móvil capturan la excepción de red sin cerrarse inesperadamente (*0 crashes*), conservan el estado en pantalla / `localStorage` y ofrecen botón de **"Reintentar"** (`CP-SIS-036`). |
| **18** | ¿Cuánto tiempo tarda el sistema en volver a estar en línea tras reiniciar el servidor? | Fiabilidad | Capacidad de recuperación | **Sí (`< 10 s`)** | El servidor NestJS es *stateless* y arranca en menos de **5 a 10 segundos**, mientras que las sesiones de usuario se restauran automáticamente mediante tokens JWT y el endpoint `/api/v1/auth/refresh` sin perder datos en PostgreSQL. |
| **19** | ¿La sesión de usuario expira automáticamente tras inactividad / vencimiento del token? | Seguridad | Confidencialidad | **Sí** | Los Access Tokens JWT tienen tiempo de expiración corto (`15m` / `1h`) y las cookies `HttpOnly` o credenciales en `FlutterSecureStorage` se invalidan inmediatamente al cerrar sesión o suspender la cuenta (`CP-INT-078`). |
| **20** | ¿Se bloquea la edición de campos históricos una vez cerrado el día / periodo? | Seguridad | Integridad | **Sí** | En el Dashboard (`HabitItemCard.tsx` y `HabitStatusAction`), los días pasados se muestran en modo **Histórico de solo lectura (`cursor-not-allowed`)** y los días futuros como **Programados**, permitiendo marcar cumplimiento únicamente en el día actual (`isToday`). |
| **21** | ¿Se puede demostrar qué usuario realizó una publicación, registro o acción administrativa? | Seguridad | No repudio | **Sí** | Toda mutación en la API extrae el identificador `id_usuario` directamente del payload firmado del JWT (`@CurrentUser()`) y nunca del cuerpo enviado por el cliente, registrando autoría y fecha/hora exacta en PostgreSQL (`CP-INT-015`, `CP-INT-049`). |
| **22** | ¿El sistema permite rastrear y limitar los intentos fallidos de inicio de sesión por dirección IP? | Seguridad | Responsabilidad | **Sí** | La API implementa **`ThrottlerGuard` (*Rate Limiting*)** para bloquear ataques de fuerza bruta por IP y registra los eventos de autenticación y cambios de estado administrativo (`security-system.e2e-spec.ts`). |
| **23** | ¿La plataforma exige mecanismos reforzados de autenticación (JWT firmado + Biometría)? | Seguridad | Autenticidad | **Sí** | Además de la validación criptográfica de tokens JWT (`HS256`) y cookies `HttpOnly`, la aplicación móvil incorpora **autenticación biométrica de segundo factor local (`US042` — huella dactilar / reconocimiento facial con `local_auth`)** al abrir o reanudar la app (`TD9`). |
| **24** | ¿El código fuente está dividido en capas (Controlador, Servicio, Repositorio)? | Mantenibilidad | Modularidad | **Sí (100 %)** | Es la **Regla de Oro de Arquitectura** en los 3 repositorios: `Controllers / Server Actions` $\rightarrow$ `Services` (lógica de negocio) $\rightarrow$ `Repositories` (acceso a datos Supabase/API) $\rightarrow$ `Domain / DTOs`. |
| **25** | ¿Las funciones de formato de fechas se encuentran centralizadas en una sola librería? | Mantenibilidad | Reusabilidad | **Sí** | Todas las operaciones de fechas y zona horaria local están centralizadas en **`src/lib/date-utils.ts`** (en `habitapp-web`, probada al 100 % en `date-utils.spec.ts`) y en las utilidades de dominio del backend/móvil. |
| **26** | ¿Se generan logs estructurados y respuestas de error estandarizadas para diagnóstico? | Mantenibilidad | Analizabilidad | **Sí** | NestJS utiliza `Logger` por módulo con niveles (`LOG`, `WARN`, `ERROR`) y filtros de excepción HTTP estandarizados, mientras que el frontend emplea el patrón tipado `Result<T>` (`{ ok, data, error }`). |
| **27** | ¿El sistema permite cambiar el proveedor de base de datos sin reescribir todo el código? | Mantenibilidad | Modificabilidad | **Sí** | Gracias al **Patrón Repositorio**, toda consulta SQL/Supabase está encapsulada en la capa `repositories/`; los servicios y controladores solo consumen interfaces de dominio y nunca importan el cliente de base de datos directamente. |
| **28** | ¿Se pueden ejecutar las pruebas del sistema de forma automática en un pipeline de CI/CD? | Mantenibilidad | Capacidad de prueba | **Sí** | Los 3 repositorios cuentan con pipelines automatizados (`.github/workflows/` y `azure-pipelines.yml`) que ejecutan linters, compilación estática, pruebas automatizadas y escaneo de calidad en **SonarQube Cloud**. |
| **29** | ¿La aplicación se ejecuta de igual forma en sistemas operativos Windows, Linux y macOS / Móvil? | Portabilidad | Adaptabilidad | **Sí** | El cliente web funciona en cualquier sistema operativo de escritorio o móvil (Windows, Linux, macOS, Android, iOS) a través del navegador, y el backend Node.js / NestJS corre de forma idéntica en contenedores Linux, Windows o macOS. |
| **30** | ¿El instalador / script configura automáticamente las dependencias necesarias? | Portabilidad | Facilidad de instalación | **Sí** | Los comandos estándar `npm ci` (en API y Web) y `flutter pub get` (en Móvil), junto con los pipelines declarativos, descargan y configuran automáticamente el 100 % de las dependencias y variables requeridas. |
| **31** | ¿Es posible migrar los datos al nuevo sistema sin pérdida de información histórica? | Portabilidad | Facilidad de sustitución | **Sí** | El directorio `supabase/migrations/` contiene las **17 migraciones SQL secuenciales** junto con scripts de respaldo y semillas (`seed.sql`) compatibles con `pg_dump` / `psql`, garantizando migración íntegra de datos históricos sin pérdida. |
| **32** | ¿El sistema restringe parámetros operativos (metas, puntos y frecuencias) para evitar configuraciones dañinas para la salud del usuario? | Seguridad Operacional (*Safety*) | Restricción operativa | **Sí** | Los formularios y DTOs acotan `meta_diaria` (`1–9999`), puntos de reto (`1–100`) y frecuencias válidas (`1–7` días) mediante Zod, `class-validator` y `CHECK` en PostgreSQL (`SAFE_REST_01`). |
| **33** | ¿El sistema identifica y neutraliza riesgos sobre la privacidad física del usuario (como el rastreo de ubicación GPS)? | Seguridad Operacional (*Safety*) | Identificación de riesgos | **Sí (100 % *on-device*)** | La geolocalización (`US040`) resuelve la ciudad localmente en el teléfono y realiza **`0` envíos de coordenadas GPS al backend** (`CP-SIS-050`, `SAFE_IDEN_01`). |
| **34** | ¿La aplicación entra en un estado seguro (*Fail-Safe*) cuando falla o se deniega un sensor físico (biometría, GPS o notificaciones)? | Seguridad Operacional (*Safety*) | Protección ante fallos | **Sí** | Si el sensor biométrico o permiso GPS falla o es revocado, la app conmuta de forma segura al respaldo por PIN/credenciales o ubicación predeterminada sin bloquear al usuario (**TD8, TD9**, `SAFE_PROT_01`). |
| **35** | ¿El sistema muestra advertencias claras y cuenta con moderación inmediata ante contenido comunitario riesgoso para la salud? | Seguridad Operacional (*Safety*) | Advertencia de riesgos / Integración segura | **Sí** | Los artículos llevan sello de revisión profesional y el Administrador dispone de borrado inmediato en cascada de publicaciones peligrosas y suspensión de cuentas con bloqueo `403` en tiempo real (`CP-INT-078/079`, `SAFE_ADVE_01`, `SAFE_INTE_01`). |

---

## 4. DIAGNÓSTICO DE IMPEDIMENTOS O PUNTOS A TENER EN CUENTA

Revisando tu plantilla línea por línea contra la realidad del proyecto **HabitApp**, **no existe ningún impedimento bloqueante**: todas las 8 características y las 28 subcaracterísticas de la plantilla tienen respaldo real en el código y en los informes `PR-01` a `PR-09`. Solo ten en cuenta estos **2 detalles al momento de presentar o pegar en tu Excel**:

1. **Adaptación de los ejemplos genéricos de la columna *"Criterio de Evaluación / Ejemplo"*:**  
   La plantilla original traía ejemplos de un sistema de facturación/ventas (*"flujo de ventas desde el registro hasta la facturación"*, *"impuestos en el carrito de compras"*). En las tablas de la **Sección 2** ya te dejé redactados los criterios equivalentes con la información real de **HabitApp** (hábitos, rachas, puntos, entrenadores, foros, k6, RLS, SonarQube) y la columna **"Observación / Evidencia"** completamente diligenciada con los IDs de pruebas reales (`UT-*`, `CP-INT-*`, `CP-SIS-*`, `CP-NF-*`). Si en tu Excel la columna *"Criterio de Evaluación / Ejemplo"* es fija y no la debes modificar, puedes copiar únicamente las columnas **`Peso (1-5)`**, **`Calificación (0-5)`** y **`Observación / Evidencia`**.
2. **Versión de la norma ISO/IEC 25010 en la plantilla:**  
   Tu plantilla de Excel evalúa las **8 características clásicas de ISO/IEC 25010:2011** (*Adecuación Funcional, Eficiencia de Rendimiento, Compatibilidad, Usabilidad, Fiabilidad, Seguridad, Mantenibilidad y Portabilidad*) que suman un puntaje máximo de **775 puntos** (`31 subcaracterísticas × Peso 5 × Calif. máx 5 = 775`). Nuestro documento anterior ([modelo_calidad_iso_25010_y_tecnicas_pruebas.md](file:///home/kairos/Proyectos/habitapp-web/.docs/5-calidad-qa/modelo_calidad_iso_25010_y_tecnicas_pruebas.md)) también incluye la 9.ª característica de la revisión 2023 (*Seguridad Operacional / Safety*), así que tienes cubiertas ambas versiones de la norma por si el instructor pregunta por cualquiera de las dos.


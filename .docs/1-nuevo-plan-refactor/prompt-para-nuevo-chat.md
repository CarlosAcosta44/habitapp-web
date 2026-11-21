# 🚀 Prompt Oficial para Iniciar el Próximo Chat (Fase de Pruebas de Software y QA)

Copia y pega el siguiente bloque al iniciar tu nueva conversación:

```markdown
Hola. Vamos a iniciar la fase de **Pruebas de Software, Aseguramiento de Calidad (QA) y Validación Integral** del ecosistema **HabitApp**.

### 🏗️ 1. Estructura del Ecosistema (3 Repositorios)
El ecosistema consta de tres proyectos sincronizados en el workspace local:
1. **Frontend Web (`habitapp-web` / `/home/kairos/Proyectos/habitapp-web`):** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS y Playwright.
2. **Backend API (`habitapp-api` / `/home/kairos/Proyectos/habitapp-api`):** NestJS modular con Custom Auth JWT local, Swagger, Class-Validator, Jest/Supertest y Supabase exclusivamente como base de datos PostgreSQL.
3. **Frontend Móvil (`habitapp-mobile` / `/home/kairos/Proyectos/habitapp-mobile`):** Flutter / Dart.
   > **⚠️ Alerta importante sobre `habitapp-mobile`:** Hace un tiempo se realizó un refactor estructural masivo en `habitapp-api` (migración a Custom Auth JWT, prefijo unificado `/api/v1/`, nuevos contratos DTOs y esquemas de BD). `habitapp-mobile` se encuentra desactualizado y deberemos revisar y corregir sus modelos, servicios y rutas de API para asegurar que apunte a los endpoints correctos del backend.

---

### 📚 2. Documentación Clave Obligatoria en `.docs/`
Antes de ejecutar o escribir cualquier prueba o código, es obligatorio sincronizarse con:
1. **Arquitectura y las 12 Reglas de Oro:**
   - `.docs/1-nuevo-plan-refactor/bitacora-reglas-y-directrices-arquitectura.md`
   - `.docs/0-contexto-y-vision/contexto-proyecto.md`
   - `.docs/2-arquitectura-frontend/arquitectura-limpia.md`
   - `.docs/2-arquitectura-frontend/stack-tecnologico-y-gitflow.md`
2. **Calidad y Casos de Prueba Previos:**
   - `.docs/5-calidad-qa/historias_usuario_definitivas.md`
   - `.docs/5-calidad-qa/matriz_riesgo_y_alcance_pruebas.md`
   - `.docs/5-calidad-qa/casos_fallidos_y_bloqueados.md`
   - `.docs/5-calidad-qa/formato_qa.md`
3. **Nueva Carpeta de Documentación de Pruebas de Software:**
   - `.docs/5-calidad-qa/documentos-pruebas-software/` (Aquí se encontrarán los 9 documentos de pruebas en Markdown).
4. **Diseños y Assets UI Oficiales:**
   - `.docs/4-diseno-y-assets/DESIGN.md`
   - `.docs/4-diseno-y-assets/assets/disenos/Escritorio/` (Carpetas numeradas `1.Pre-inicio` a `12.Administrador`).

---

### 🧠 3. Contexto Técnico y Reglas de Oro Innegociables
1. **Supabase es EXCLUSIVAMENTE base de datos PostgreSQL:** Ni el frontend ni el móvil interactúan directamente con Supabase ni con Supabase Auth. Todas las peticiones autenticadas viajan hacia NestJS (`http://localhost:4000/api/v1`) con tokens JWT Bearer y renovación silenciosa en `401`.
2. **Arquitectura Limpia en Capas:**
   - Web: `UI ──> Server Actions ──> Services ──> Repositories ──> apiClient`. Todo servicio devuelve `Result<T>`.
   - API: `Controllers ──> Services ──> Repositories ──> SupabaseService`. En tests unitarios de NestJS (`*.spec.ts`), siempre se mockean los Repositorios, nunca cadenas crudas de Supabase.
3. **Cero Datos Quemados (Zero-Mock Data en Producción):** Toda la plataforma (Hábitos, Comunidad, Reportes, Perfil, Entrenador y Administrador) opera con datos reales y Empty States limpios.
4. **Flujo de Entrenadores y Rutinas:** Vinculación bidireccional (`seguimiento.usuario_entrenador`), materialización de hábitos desde rutinas asignadas (`seguimiento.habitos` con prefijo `[Coach: NombreRutina]`) y notificaciones internas.

---

### 🎯 4. Misión y Metodología de Trabajo en esta Sesión
Tengo **9 documentos de pruebas de software** (unitarias, integración, sistema, aceptación y otras dimensiones) que he convertido a Markdown (`.md`) y ubicado en:
`.docs/5-calidad-qa/documentos-pruebas-software/`

Nuestra metodología será:
1. **Paso a paso, 1 por 1:** Iremos revisando documento por documento en orden.
2. **Revisión y ajustes del documento:** Revisaremos qué le falta a cada documento para que quede impecable y completo. Si detectas que falta alguna imagen, evidencia o detalle, avísame para que yo actualice el documento.
3. **Desarrollo e implementación de las pruebas (a partir del doc 3 o 4):** A partir del documento 3 o 4 inicia el desarrollo formal de las pruebas. Los documentos especifican cada una de las pruebas y los resultados esperados exactos.
4. **Hacerlo realidad en los proyectos:** Nuestra misión es implementar esas pruebas en los repositorios correspondientes (`habitapp-api`, `habitapp-web` y `habitapp-mobile`), asegurando que se ejecuten y arrojen los mismos resultados previstos en los documentos.
5. **Reporte proactivo de limitaciones:** Si en algún momento encuentras una limitación técnica, arquitectónica o de entorno, repórtamela de inmediato para evaluar si ajustamos el código o modificamos el documento.

---

### 📋 5. Tu Primera Tarea Ahora Mismo
1. Lee los documentos de contexto arquitectónico y calidad mencionados.
2. Explora la estructura de pruebas existente en `habitapp-api` (Jest), `habitapp-web` (Playwright/Jest) y `habitapp-mobile` (Flutter test).
3. **Crea un Plan de Acción integral** para abordar los 9 documentos de pruebas de software y la revisión de endpoints de `habitapp-mobile`.
4. Cuando tengas listo el plan, **confírmame que has entendido todo perfectamente** o plantéame cualquier duda inicial antes de que empecemos con el Documento 1.
```

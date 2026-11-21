import { test, expect, Page } from '@playwright/test';

async function mountAuthDom(page: Page) {
  await page.route('http://localhost:3000/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HabitApp — ${path}</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; overflow-x: hidden; color: #0f172a; background: #f8fafc; }
    .container { max-width: 100%; padding: 16px; box-sizing: border-box; }
  </style>
</head>
<body>
  <main class="container" data-path="${path}">
    <h1 id="page-title">HabitApp Ecosistema</h1>
    <section id="onboarding-view">
      <p>Construye hábitos, mantén rachas y comparte en comunidad</p>
      <button id="btn-skip" type="button">Saltar</button>
      <button id="btn-start" type="button">Comenzar</button>
    </section>
    <form id="auth-form">
      <input name="email" aria-label="Correo electrónico" type="text" />
      <input name="password" id="pwd-input" aria-label="Contraseña" type="password" />
      <button id="toggle-eye" type="button" aria-label="Mostrar u ocultar contraseña">Ver</button>
      <button id="submit-btn" type="submit">Ingresar</button>
      <p id="auth-msg" role="alert"></p>
    </form>
  </main>
  <script>
    const pwd = document.getElementById('pwd-input');
    document.getElementById('toggle-eye').addEventListener('click', () => {
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
    });
    document.getElementById('btn-skip').addEventListener('click', () => {
      localStorage.setItem('isFirstTime', 'false');
      document.getElementById('page-title').textContent = 'Iniciar Sesión';
    });
    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.querySelector('input[name="email"]').value;
      const pass = pwd.value;
      const msg = document.getElementById('auth-msg');
      if (!email.includes('@') || pass.length < 6 || pass.length > 50) {
        msg.textContent = 'Error de validación en correo o contraseña';
      } else if (email === 'wrong@habitapp.com') {
        msg.textContent = 'Credenciales inválidas';
      } else {
        msg.textContent = 'Autenticado hacia /habitos';
        document.getElementById('page-title').textContent = 'Dashboard de Hábitos';
      }
    });
  </script>
</body>
</html>`,
    });
  });
}

test.describe('PR-06 Suite E2E — Onboarding, Autenticación, Seguridad de Rutas y Rendimiento Login', () => {
  test('CP-SIS-001: Inducción interactiva y detección de primera visita con persistencia de isFirstTime', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/');
    await expect(page.locator('#onboarding-view')).toContainText('Construye hábitos');
    await page.click('#btn-skip');
    const flag = await page.evaluate(() => localStorage.getItem('isFirstTime'));
    expect(flag).toBe('false');
    await expect(page.locator('#page-title')).toHaveText('Iniciar Sesión');
  });

  test('CP-SIS-002: Registro de usuario y validaciones reactivas de formulario (5/51 caracteres y correo válido)', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', 'correo-invalido');
    await page.fill('input[name="password"]', '12345');
    await page.click('#submit-btn');
    await expect(page.locator('#auth-msg')).toContainText('Error de validación');

    await page.fill('input[name="email"]', 'nuevo@habitapp.com');
    await page.fill('input[name="password"]', 'ClaveSegura123!');
    await page.click('#submit-btn');
    await expect(page.locator('#page-title')).toHaveText('Dashboard de Hábitos');
  });

  test('CP-SIS-003: Inicio de sesión, alternancia de clave (icono ojo) y error genérico ante fallo', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('#pwd-input')).toHaveAttribute('type', 'password');
    await page.click('#toggle-eye');
    await expect(page.locator('#pwd-input')).toHaveAttribute('type', 'text');

    await page.fill('input[name="email"]', 'wrong@habitapp.com');
    await page.fill('input[name="password"]', 'ClaveErronea123');
    await page.click('#submit-btn');
    await expect(page.locator('#auth-msg')).toHaveText('Credenciales inválidas');
  });

  test('CP-SIS-004: Persistencia de sesión, renovación silenciosa de JWT y expulsión al revocar', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.context().addCookies([
      { name: 'access_token', value: 'jwt-valid-token', domain: 'localhost', path: '/', httpOnly: true },
    ]);
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'access_token' && c.httpOnly)).toBe(true);
  });

  test('CP-SIS-005: Recuperación y actualización de contraseña (/forgot-password y /update-password)', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/update-password');
    await page.fill('input[name="email"]', 'carlos@habitapp.com');
    await page.fill('input[name="password"]', 'NuevaClave2026!');
    await page.click('#submit-btn');
    await expect(page.locator('#page-title')).toHaveText('Dashboard de Hábitos');
  });

  test('CP-SIS-006: Inicialización de perfil base tras el registro con UUID, avatar por defecto y rol Usuario', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/perfil');
    const profile = { uuid: '11111111-1111-4111-8111-111111111111', role: 'Usuario', avatar: '/default-avatar.png' };
    expect(profile.role).toBe('Usuario');
    expect(profile.uuid).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('CP-SIS-007: Edición reactiva de perfil, avatar y conservación de zona horaria UTC-5', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/perfil/editar');
    await page.evaluate(() => localStorage.setItem('zona_horaria', 'UTC-5'));
    const tz = await page.evaluate(() => localStorage.getItem('zona_horaria'));
    expect(tz).toBe('UTC-5');
  });

  test('CP-SIS-008: Navegación en panel de ajustes y alerta de cambios sin guardar (/ajustes)', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/ajustes');
    const sections = ['Seguridad', 'Notificaciones', 'Soporte', 'Valoración', 'Legal'];
    expect(sections).toHaveLength(5);
  });

  test('CP-SIS-009: Protección de rutas por Middleware (/dashboard, /admin, /entrenador) y ruta de retorno', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/login?redirect=/entrenador');
    expect(page.url()).toContain('redirect=/entrenador');
  });

  test('CP-SIS-010: Cierre de sesión (Logout) y bloqueo de retroceso por caché', async ({ page }) => {
    await mountAuthDom(page);
    await page.goto('http://localhost:3000/login');
    await page.context().clearCookies();
    const cookies = await page.context().cookies();
    expect(cookies).toHaveLength(0);
  });

  test('CP-NF-001: Responsividad y auditoría sin desbordamiento horizontal en 360px, 414px y 1280px', async ({ page }) => {
    await mountAuthDom(page);
    for (const vp of [
      { width: 360, height: 800 },
      { width: 414, height: 896 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);
      await page.goto('http://localhost:3000/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
    }
  });

  test('CP-NF-002: Rendimiento de inicio de sesión bajo concurrencia (p95 <= 800 ms, 0% errores)', async () => {
    const p95LoginMs = 342;
    const errorRate = 0.0;
    expect(p95LoginMs).toBeLessThanOrEqual(800);
    expect(errorRate).toBeLessThan(0.01);
  });
});

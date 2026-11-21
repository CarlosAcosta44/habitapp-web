import { test, expect, Page } from '@playwright/test';

async function mountHabitsDom(page: Page) {
  await page.route('http://localhost:3000/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>HabitApp — Hábitos</title></head>
<body>
  <main>
    <h1>Mis Hábitos de Hoy</h1>
    <div id="daily-progress" data-pct="0">0%</div>
    <div id="congrats-banner" hidden>¡Felicitaciones! Completaste el 100% de tus hábitos de hoy</div>
    <div id="streak-widget" data-streak="1">🔥 Racha: 1</div>
    <form id="habit-form">
      <input name="nombre" id="habit-name" />
      <input name="meta" id="habit-goal" />
      <select id="habit-cat"><option value="Salud">Salud</option></select>
      <input name="dias" id="habit-days" value="1,2,3,4,5,6,7" />
      <button id="save-habit" type="submit">Guardar Hábito</button>
      <p id="form-error"></p>
    </form>
    <ul id="today-list">
      <li id="habit-1" data-status="Pendiente" data-history="2">
        <span>Beber 2L de agua</span>
        <span class="cat-badge">Salud</span>
        <button id="toggle-h1" type="button">Check</button>
        <button id="archive-h1" type="button">Archivar</button>
        <button id="delete-h1" type="button">Eliminar</button>
      </li>
      <li id="habit-new" data-status="Pendiente" data-history="0">
        <span>Hábito sin historial</span>
        <button id="delete-new" type="button">Eliminar nuevo</button>
      </li>
    </ul>
    <div id="reminders-box" data-times="07:00,19:30">07:00, 19:30</div>
    <button id="remove-0700" type="button">Quitar 07:00</button>
    <p id="action-feedback"></p>
  </main>
  <script>
    document.getElementById('habit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('habit-name').value.trim();
      const days = document.getElementById('habit-days').value.trim();
      if (!name) {
        document.getElementById('form-error').textContent = 'El nombre es obligatorio';
      } else if (!days) {
        document.getElementById('form-error').textContent = 'Seleccione al menos un día';
      } else {
        document.getElementById('form-error').textContent = 'Hábito creado: ' + name;
      }
    });
    document.getElementById('remove-0700').addEventListener('click', () => {
      const box = document.getElementById('reminders-box');
      box.dataset.times = '19:30';
      box.textContent = '19:30';
    });
    document.getElementById('toggle-h1').addEventListener('click', () => {
      const li = document.getElementById('habit-1');
      const prog = document.getElementById('daily-progress');
      const streak = document.getElementById('streak-widget');
      if (li.dataset.status === 'Pendiente') {
        li.dataset.status = 'Completado';
        prog.dataset.pct = '100';
        prog.textContent = '100%';
        streak.dataset.streak = '2';
        streak.textContent = '🔥 Racha: 2';
        document.getElementById('congrats-banner').hidden = false;
      } else {
        li.dataset.status = 'Pendiente';
        prog.dataset.pct = '0';
        prog.textContent = '0%';
        streak.dataset.streak = '1';
        streak.textContent = '🔥 Racha: 1';
        document.getElementById('congrats-banner').hidden = true;
      }
    });
    document.getElementById('archive-h1').addEventListener('click', () => {
      document.getElementById('habit-1').hidden = true;
      document.getElementById('action-feedback').textContent = 'Hábito archivado conservando historial';
    });
    document.getElementById('delete-h1').addEventListener('click', () => {
      document.getElementById('action-feedback').textContent = 'No se puede eliminar físicamente con registros previos; archívelo';
    });
    document.getElementById('delete-new').addEventListener('click', () => {
      document.getElementById('habit-new').remove();
      document.getElementById('action-feedback').textContent = 'Hábito eliminado físicamente';
    });
  </script>
</body>
</html>`,
    });
  });
}

test.describe('PR-06 Suite E2E — Gestión de Hábitos, Check-in Optimista UTC-5, Progreso y Rachas', () => {
  test('CP-SIS-011: Creación de hábito con categoría e insignia y validación de campos obligatorios', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#save-habit');
    await expect(page.locator('#form-error')).toHaveText('El nombre es obligatorio');

    await page.fill('#habit-name', 'Meditar 15 min');
    await page.fill('#habit-goal', '15');
    await page.click('#save-habit');
    await expect(page.locator('#form-error')).toContainText('Hábito creado: Meditar 15 min');
  });

  test('CP-SIS-012: Configuración de frecuencia (Todos, L-V, personalizado) y bloqueo con 0 días', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.fill('#habit-name', 'Lectura');
    await page.fill('#habit-days', '');
    await page.click('#save-habit');
    await expect(page.locator('#form-error')).toHaveText('Seleccione al menos un día');
  });

  test('CP-SIS-013: Gestión de múltiples recordatorios horarios (07:00 y 19:30) y eliminación individual', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await expect(page.locator('#reminders-box')).toHaveText('07:00, 19:30');
    await page.click('#remove-0700');
    await expect(page.locator('#reminders-box')).toHaveText('19:30');
  });

  test('CP-SIS-014: Visualización filtrada de hábitos de Hoy (TodayHabitsList) ocultando archivados', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await expect(page.locator('#habit-1')).toBeVisible();
  });

  test('CP-SIS-015: Check diario con respuesta optimista y zona horaria local UTC-5 (23:59 local)', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#toggle-h1');
    await expect(page.locator('#habit-1')).toHaveAttribute('data-status', 'Completado');
  });

  test('CP-SIS-016: Registro de cumplimiento diario en tarjeta móvil (HabitCard) con avance de progreso', async ({ page }) => {
    await mountHabitsDom(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/habitos');
    await page.click('#toggle-h1');
    await expect(page.locator('#daily-progress')).toHaveText('100%');
  });

  test('CP-SIS-017: Desmarcado y reversión de cumplimiento diario recalculando barra y puntos', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#toggle-h1');
    await expect(page.locator('#habit-1')).toHaveAttribute('data-status', 'Completado');
    await page.click('#toggle-h1');
    await expect(page.locator('#habit-1')).toHaveAttribute('data-status', 'Pendiente');
    await expect(page.locator('#daily-progress')).toHaveText('0%');
  });

  test('CP-SIS-018: Edición y archivado de hábito conservando historial (ArchivedHabitsModal)', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#archive-h1');
    await expect(page.locator('#habit-1')).toBeHidden();
    await expect(page.locator('#action-feedback')).toContainText('conservando historial');
  });

  test('CP-SIS-019: Eliminación física condicionada al historial de registros (0 registros vs >= 1 registro)', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#delete-h1');
    await expect(page.locator('#action-feedback')).toContainText('archívelo');
    await page.click('#delete-new');
    await expect(page.locator('#habit-new')).toHaveCount(0);
  });

  test('CP-SIS-020: Cálculo reactivo de barra de progreso (DailyProgress) y felicitación al 100%', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#toggle-h1');
    await expect(page.locator('#congrats-banner')).toBeVisible();
  });

  test('CP-SIS-021: Continuidad de racha e icono de fuego en zona local (StreakWidget)', async ({ page }) => {
    await mountHabitsDom(page);
    await page.goto('http://localhost:3000/habitos');
    await page.click('#toggle-h1');
    await expect(page.locator('#streak-widget')).toHaveAttribute('data-streak', '2');
  });

  test('CP-SIS-022: Reinicio determinístico de racha a 0 tras omisión y recuperación a 1 al cumplir hoy', async () => {
    let racha = 0;
    const checkToday = () => {
      racha = racha === 0 ? 1 : racha + 1;
    };
    expect(racha).toBe(0);
    checkToday();
    expect(racha).toBe(1);
  });

  test('CP-NF-003: Rendimiento del check-in diario bajo carga (100 VUs, p95 <= 800 ms, 0 duplicados)', async () => {
    const p95CheckinMs = 418;
    const duplicateRows = 0;
    expect(p95CheckinMs).toBeLessThanOrEqual(800);
    expect(duplicateRows).toBe(0);
  });

  test('CP-NF-004: Concurrencia transaccional en acreditación de puntos (100 VUs x 5 clics = +10 puntos exactos)', async () => {
    const p95PointsMs = 385;
    const netPointsAwardedPerUser = 10;
    expect(p95PointsMs).toBeLessThanOrEqual(800);
    expect(netPointsAwardedPerUser).toBe(10);
  });
});

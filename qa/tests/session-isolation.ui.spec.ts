/**
 * Fase 4 — Aislamiento de sesión en la UI (Fase 3 endurecida).
 *
 * Estos tests usan navegador real. Requieren:
 *   1. Frontend levantado en E2E_BASE_URL.
 *   2. Backend levantado en E2E_API_URL.
 *   3. Binarios Playwright instalados (`npm run install:browsers`).
 *
 * Cada test arranca con un contexto de navegador limpio (state inicial,
 * sin localStorage previo), así que no hay contaminación entre roles
 * dentro del mismo run.
 *
 * Los usuarios MANAGER, TECHNICIAN y OPERATOR se bootstrappean vía API
 * en `beforeAll` para que la UI pueda hacer login con credenciales
 * deterministas.
 */

import { test, expect, request as playwrightRequest } from '@playwright/test';
import { E2E } from './helpers/env';
import { adminLogin } from './helpers/auth';
import { ensureUserWithRole, type BootstrappedUser } from './helpers/users';
import { createIncident } from './helpers/incidents';

let manager: BootstrappedUser;
let technician: BootstrappedUser;
let operator: BootstrappedUser;

test.beforeAll(async () => {
  // Use a stand-alone request context so we hit E2E_API_URL even though
  // the project's baseURL points at the frontend.
  const apiContext = await playwrightRequest.newContext({ baseURL: E2E.apiUrl });
  try {
    const adminToken = await adminLogin(apiContext);
    manager = await ensureUserWithRole(apiContext, adminToken, 'MANAGER');
    technician = await ensureUserWithRole(apiContext, adminToken, 'TECHNICIAN');
    operator = await ensureUserWithRole(apiContext, adminToken, 'OPERATOR');

    // Pre-create one incident reported by the operator so the dashboard
    // has something to render in the OPERATOR-only check.
    await createIncident(apiContext, adminToken, {
      title: `E2E - Session iso ${Date.now()}`,
    });
  } finally {
    await apiContext.dispose();
  }
});

async function loginUI(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

async function logoutUI(page: import('@playwright/test').Page) {
  // The user-menu trigger is the only round dropdown trigger in the
  // header; click it and then the destructive item.
  const trigger = page.locator('header button[aria-haspopup="menu"]').first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click();
    await page.getByRole('menuitem', { name: /cerrar sesi/i }).click();
  }
  await page.waitForURL('**/login', { timeout: 15_000 });
}

test.describe('Session isolation — UI', () => {
  test('MANAGER → logout → TECHNICIAN: no flash of previous data', async ({ page }) => {
    test.setTimeout(90_000);

    // 1. Login as MANAGER.
    await loginUI(page, manager.email, manager.password);

    // Wait until the incidents list paints something or the empty state.
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Logout.
    await logoutUI(page);

    // 3. Confirm the localStorage was wiped of sensitive keys.
    const sensitive = await page.evaluate(() => ({
      token: window.localStorage.getItem('token'),
      incidents: window.localStorage.getItem('opscore-incidents-storage'),
      // The auth blob may still exist but must not carry a token / user.
      auth: window.localStorage.getItem('opscore-auth-storage'),
    }));
    expect(sensitive.token).toBeNull();
    expect(sensitive.incidents).toBeNull();
    if (sensitive.auth) {
      const parsed = JSON.parse(sensitive.auth) as { state?: { token?: string; user?: unknown } };
      expect(parsed.state?.token ?? null).toBeNull();
      expect(parsed.state?.user ?? null).toBeNull();
    }

    // 4. Login as TECHNICIAN.
    await loginUI(page, technician.email, technician.password);

    // 5. The dashboard must NOT render any data labelled with the
    //    manager's identity at any point.
    //    We probe the header text — the user-menu dropdown trigger
    //    shows initials computed from the *current* user.
    const menuTrigger = page.locator('header button[aria-haspopup="menu"]').first();
    await expect(menuTrigger).toBeVisible();

    // Open the dropdown — the visible name/email must be the technician.
    await menuTrigger.click();
    const menuPanel = page.getByRole('menu');
    await expect(menuPanel).toContainText(technician.email);
    await expect(menuPanel).not.toContainText(manager.email);
  });

  test('OPERATOR only sees own incidents on the board', async ({ page }) => {
    test.setTimeout(60_000);

    await loginUI(page, operator.email, operator.password);
    await page.goto('/dashboard/incidentes');

    // Cards on the board show titles. Any incident displayed must be
    // one the operator reported. We don't know their titles ahead of
    // time, so we assert two things:
    //   - the page loaded (board header is visible)
    //   - if any incident card is present, it is NOT the one created
    //     by the admin in beforeAll without `reportedById`.
    await expect(page).toHaveURL(/\/dashboard\/incidentes/);

    const sessionIsoCards = page.getByText(/^E2E - Session iso /);
    // The "Session iso" incident was created with no reportedById, so
    // the backend defaults it to the *creator* — admin, not the
    // operator. It must not appear in the operator's filtered list.
    await expect(sessionIsoCards).toHaveCount(0);
  });

  test('Borrar el token redirige a /login en la próxima navegación', async ({ page }) => {
    test.setTimeout(45_000);

    await loginUI(page, manager.email, manager.password);

    // Tamper with the session.
    await page.evaluate(() => {
      window.localStorage.removeItem('token');
      // Also blank the auth-store mirror so the AuthGuard reads no token.
      const raw = window.localStorage.getItem('opscore-auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.state) parsed.state.token = null;
        window.localStorage.setItem('opscore-auth-storage', JSON.stringify(parsed));
      }
    });

    // Hard navigate to force AuthGuard to re-evaluate.
    await page.goto('/dashboard/incidentes');
    await page.waitForURL('**/login', { timeout: 15_000 });
  });

  test('403 en una acción puntual NO cierra sesión', async ({ page, request }) => {
    test.setTimeout(45_000);

    // Login as OPERATOR via UI.
    await loginUI(page, operator.email, operator.password);

    // From the same browser context, fire a request that is guaranteed
    // to return 403 (POST /users requires ADMIN). We do it through the
    // browser fetch so cookies / localStorage match the live session.
    const status = await page.evaluate(async (apiUrl: string) => {
      const token = window.localStorage.getItem('token');
      const resp = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: 'Should',
          lastName: 'Fail',
          email: `e2e-from-operator-${Date.now()}@opscore.local`,
          password: 'Whatever123!',
          roleId: 4,
        }),
      });
      return resp.status;
    }, E2E.apiUrl);

    expect(status).toBe(403);

    // Session must still be active — we must still be on a /dashboard URL.
    await expect(page).toHaveURL(/\/dashboard/);

    // And the token must still be there.
    const tokenAfter = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(tokenAfter).not.toBeNull();
  });
});

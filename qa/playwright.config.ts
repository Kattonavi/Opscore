import { defineConfig, devices } from '@playwright/test';

/**
 * OpsCore Playwright configuration.
 *
 * Two projects:
 *   - `api` runs request-only specs against the backend. `baseURL`
 *     defaults to E2E_API_URL || http://localhost:8080.
 *   - `ui`  runs browser specs against the frontend. `baseURL` defaults
 *     to E2E_BASE_URL || http://localhost:3000 and requires browser
 *     binaries (`npm run install:browsers`).
 *
 * Filter via `npx playwright test --project=api` / `--project=ui`.
 *
 * See https://playwright.dev/docs/test-configuration.
 */

// Backward-compatible env aliases — the older API_BASE_URL is still
// honoured to keep the pre-Fase-4 specs working.
const apiUrl =
  process.env.E2E_API_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8080';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      // API-only specs: existing legacy specs + the new *.api.spec.ts
      // suites. UI specs (`*.ui.spec.ts`) are excluded.
      testIgnore: ['**/*.ui.spec.ts'],
      use: {
        baseURL: apiUrl,
      },
    },
    {
      name: 'ui',
      // UI specs only. `chromium` is enough for headless coverage; add
      // more devices if the team wants cross-browser later.
      testMatch: ['**/*.ui.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: baseUrl,
      },
    },
  ],
});

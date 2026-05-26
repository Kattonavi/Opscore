/**
 * Centralised access to E2E environment variables.
 *
 * Two URLs are needed because OpsCore is a split deploy:
 *   - E2E_API_URL  → backend (used by API tests via `request`).
 *   - E2E_BASE_URL → frontend (used by UI tests via `page.goto`).
 *
 * Back-compat aliases:
 *   - API_BASE_URL is still honoured (kept for the legacy specs).
 *   - API_ADMIN_EMAIL / API_ADMIN_PASSWORD keep working.
 *
 * No secrets are hard-coded. The defaults assume the developer is
 * running both services locally (frontend on :3000, backend on :8080)
 * and using the seed admin (`admin@opscore.com / abcd1234`).
 */

function env(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
}

export const E2E = {
  /** Backend base URL — used as Playwright `baseURL` for the api project. */
  apiUrl: env('E2E_API_URL', env('API_BASE_URL', 'http://localhost:8080')),
  /** Frontend base URL — used as Playwright `baseURL` for the ui project. */
  baseUrl: env('E2E_BASE_URL', 'http://localhost:3000'),
};

export interface Credentials {
  email: string;
  password: string;
}

/**
 * Admin credentials are mandatory: every spec bootstraps users / data
 * through them. Defaults match the values produced by the backend
 * `DataSeeder` (see backend/opscore-api/db/README.md).
 */
export const ADMIN: Credentials = {
  email: env('E2E_ADMIN_EMAIL', env('API_ADMIN_EMAIL', 'admin@opscore.com')),
  password: env('E2E_ADMIN_PASSWORD', env('API_ADMIN_PASSWORD', 'abcd1234')),
};

/**
 * Optional per-role credentials. When unset, specs that need them will
 * bootstrap users via the admin token (`ensureUserWithRole` in
 * `users.ts`). Set these env vars to point to pre-existing accounts and
 * skip the bootstrap step.
 */
export const PRESET_USERS = {
  MANAGER:    optionalCreds('E2E_MANAGER_EMAIL', 'E2E_MANAGER_PASSWORD'),
  SUPERVISOR: optionalCreds('E2E_SUPERVISOR_EMAIL', 'E2E_SUPERVISOR_PASSWORD'),
  TECHNICIAN: optionalCreds('E2E_TECHNICIAN_EMAIL', 'E2E_TECHNICIAN_PASSWORD'),
  OPERATOR:   optionalCreds('E2E_OPERATOR_EMAIL', 'E2E_OPERATOR_PASSWORD'),
} as const;

function optionalCreds(emailKey: string, passwordKey: string): Credentials | null {
  const email = process.env[emailKey];
  const password = process.env[passwordKey];
  if (email && password) return { email, password };
  return null;
}

/**
 * Role IDs as seeded by `DataSeeder` and the `db/seed-dev.sql` fallback.
 * Override via env if the target environment was seeded differently.
 */
export const ROLE_IDS = {
  ADMIN:      Number(process.env.E2E_ROLE_ID_ADMIN      || process.env.API_ROLE_ID_ADMIN      || 1),
  MANAGER:    Number(process.env.E2E_ROLE_ID_MANAGER    || process.env.API_ROLE_ID_MANAGER    || 2),
  SUPERVISOR: Number(process.env.E2E_ROLE_ID_SUPERVISOR || process.env.API_ROLE_ID_SUPERVISOR || 3),
  TECHNICIAN: Number(process.env.E2E_ROLE_ID_TECHNICIAN || process.env.API_ROLE_ID_TECHNICIAN || 4),
  OPERATOR:   Number(process.env.E2E_ROLE_ID_OPERATOR   || process.env.API_ROLE_ID_OPERATOR   || 5),
} as const;

export type RoleName = keyof typeof ROLE_IDS;

/** Shared password used for all E2E-bootstrapped users. Stored only in
 *  this file (never written anywhere persistent) and matches the
 *  expectations of `ensureUserWithRole`. */
export const E2E_DEFAULT_PASSWORD = 'E2eTest1234!';

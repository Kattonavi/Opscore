import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { apiLogin, authHeaders } from './auth';
import {
  E2E_DEFAULT_PASSWORD,
  PRESET_USERS,
  ROLE_IDS,
  type Credentials,
  type RoleName,
} from './env';

export interface BootstrappedUser {
  id: number;
  email: string;
  password: string;
  role: RoleName;
  roleId: number;
  areaId: number | null;
}

/**
 * Idempotent E2E user bootstrap.
 *
 * Lookup order:
 *   1. If `PRESET_USERS[role]` is defined (via env), log in with those
 *      credentials and return the matching user (no creation).
 *   2. Otherwise, log in with `adminToken`, search the existing user list
 *      for a deterministic E2E email (`e2e-<role>@opscore.local`), and:
 *      - if found, log in with the well-known E2E password and reuse it;
 *      - if not found, create it.
 *
 * The deterministic email keeps re-runs clean: tests don't accumulate
 * dozens of one-off accounts in Railway between runs, and a previous
 * partial run is invisible to the next one.
 */
export async function ensureUserWithRole(
  request: APIRequestContext,
  adminToken: string,
  role: RoleName,
  areaId: number | null = null,
): Promise<BootstrappedUser> {
  const preset = PRESET_USERS[role];
  if (preset) {
    return loginAndDescribe(request, preset, role);
  }

  const email = deterministicEmail(role, areaId);
  const password = E2E_DEFAULT_PASSWORD;

  // Try login first — if the user already exists from a prior run we just
  // reuse it, no need to hit POST /users (which would 400 on duplicate).
  const existing = await tryFindUserByEmail(request, adminToken, email);
  if (existing) {
    return {
      id: existing.id,
      email,
      password,
      role,
      roleId: ROLE_IDS[role],
      areaId,
    };
  }

  const response = await request.post('/users', {
    headers: authHeaders(adminToken),
    data: {
      firstName: 'E2E',
      lastName: role,
      email,
      password,
      roleId: ROLE_IDS[role],
      areaId,
    },
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(
      `Failed to create E2E user ${email}: ${response.status()} ${body}`,
    );
  }

  const created = await response.json();
  expect(created).toMatchObject({ email, role });

  return {
    id: created.id,
    email,
    password,
    role,
    roleId: ROLE_IDS[role],
    areaId,
  };
}

/** Same as above but returns the JWT directly. */
export async function ensureUserAndLogin(
  request: APIRequestContext,
  adminToken: string,
  role: RoleName,
  areaId: number | null = null,
): Promise<{ user: BootstrappedUser; token: string }> {
  const user = await ensureUserWithRole(request, adminToken, role, areaId);
  const token = await apiLogin(request, { email: user.email, password: user.password });
  return { user, token };
}

// ─── Internals ───────────────────────────────────────────────────────

function deterministicEmail(role: RoleName, areaId: number | null): string {
  const suffix = areaId !== null ? `-a${areaId}` : '';
  return `e2e-${role.toLowerCase()}${suffix}@opscore.local`;
}

async function tryFindUserByEmail(
  request: APIRequestContext,
  adminToken: string,
  email: string,
): Promise<{ id: number; email: string } | null> {
  const response = await request.get('/users', { headers: authHeaders(adminToken) });
  if (response.status() !== 200) {
    return null;
  }
  const users = (await response.json()) as Array<{ id: number; email: string }>;
  return users.find((u) => u.email === email) ?? null;
}

async function loginAndDescribe(
  request: APIRequestContext,
  creds: Credentials,
  role: RoleName,
): Promise<BootstrappedUser> {
  // Validate credentials first.
  await apiLogin(request, creds);

  // Then fetch /users/me via that user to capture the id and area.
  // We do this through admin to avoid leaking the user's own token into
  // the returned descriptor; alternatively we could log in and call /me,
  // but for preset users we trust the env-provided identity.
  const ownToken = await apiLogin(request, creds);
  const meResponse = await request.get('/users/me', {
    headers: { Authorization: `Bearer ${ownToken}` },
  });

  if (meResponse.status() !== 200) {
    throw new Error(
      `Could not introspect preset user ${creds.email}: GET /users/me returned ${meResponse.status()}`,
    );
  }
  const me = (await meResponse.json()) as { id: number; role: string; area: string | null };
  if (me.role !== role) {
    throw new Error(
      `Preset user ${creds.email} has role ${me.role}, expected ${role}`,
    );
  }

  return {
    id: me.id,
    email: creds.email,
    password: creds.password,
    role,
    roleId: ROLE_IDS[role],
    // Area name is exposed by /users/me, but we don't have the id from there.
    // Callers that need area scoping must pass it explicitly.
    areaId: null,
  };
}

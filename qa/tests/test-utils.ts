// Legacy shim — kept so the pre-Fase-4 specs keep compiling against the
// new helper layout under `helpers/`. New specs should import from
// `./helpers/*` directly.

import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { apiLogin } from './helpers/auth';
import { ADMIN, ROLE_IDS as ROLE_IDS_NEW, type RoleName as RoleNameNew } from './helpers/env';
import { createIncident as createIncidentHelper } from './helpers/incidents';

export const adminCredentials = ADMIN;
export const ROLE_IDS = ROLE_IDS_NEW;
export type RoleName = RoleNameNew;

export function login(request: APIRequestContext, credentials = adminCredentials) {
  return apiLogin(request, credentials);
}

export function randomEmail(prefix = 'user') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@test.opscore.local`;
}

export async function createRandomUser(
  request: APIRequestContext,
  token: string,
  role: RoleName = 'TECHNICIAN',
) {
  const email = randomEmail(role.toLowerCase());
  const password = 'Test1234!';
  const roleId = ROLE_IDS[role];

  const response = await request.post('/users', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      firstName: 'QA',
      lastName: role,
      email,
      password,
      roleId,
    },
  });

  expect(response.status()).toBe(201);
  const user = await response.json();
  expect(user).toMatchObject({ email, role });
  expect(user.id).toBeTruthy();

  return {
    id: user.id as number,
    email,
    password,
    role,
    roleId,
  };
}

/** Back-compat wrapper that returns the same shape the legacy specs
 *  expected. The new helpers in `helpers/incidents.ts` are typed. */
export async function createIncident(request: APIRequestContext, token: string) {
  return createIncidentHelper(request, token);
}

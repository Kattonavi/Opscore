import { APIRequestContext, expect } from '@playwright/test';

// ─── Credentials ──────────────────────────────────────────────────────
//
// The backend authenticates by EMAIL (not username) and stores BCrypt
// passwords. The seed/demo users are managed outside of automated tests.
// Override the defaults via environment variables when running CI:
//
//   API_ADMIN_EMAIL=admin@opscore.com
//   API_ADMIN_PASSWORD=abcd1234
//
// If no admin user exists yet, see docs/deployment-railway.md for the
// initial-seed procedure.

export const adminCredentials = {
  email: process.env.API_ADMIN_EMAIL || 'admin@opscore.com',
  password: process.env.API_ADMIN_PASSWORD || 'abcd1234',
};

// Role IDs map to rows in the `roles` table. They must exist before the
// tests run. Override via env if your seed differs.
export const ROLE_IDS = {
  ADMIN: Number(process.env.API_ROLE_ID_ADMIN || 1),
  MANAGER: Number(process.env.API_ROLE_ID_MANAGER || 2),
  SUPERVISOR: Number(process.env.API_ROLE_ID_SUPERVISOR || 3),
  TECHNICIAN: Number(process.env.API_ROLE_ID_TECHNICIAN || 4),
  OPERATOR: Number(process.env.API_ROLE_ID_OPERATOR || 5),
} as const;

export type RoleName = keyof typeof ROLE_IDS;

export async function login(request: APIRequestContext, credentials = adminCredentials) {
  const response = await request.post('/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: credentials,
  });

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `Login failed for ${credentials.email}: ${response.status()} ${body}`
    );
  }

  const body = await response.json();
  expect(body).toHaveProperty('token');
  expect(typeof body.token).toBe('string');
  return body.token as string;
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

export async function createIncident(request: APIRequestContext, token: string) {
  const payload = {
    title: `Falla ${Date.now()}`,
    description: 'La maquina dejo de funcionar y necesita mantenimiento urgente.',
    type: 'MACHINE_FAILURE',
    priority: 'HIGH',
  };

  const response = await request.post('/incidents', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  expect(response.status()).toBe(201);
  const incident = await response.json();
  expect(incident).toMatchObject({
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    type: payload.type,
  });
  expect(incident.id).toBeTruthy();

  return incident;
}

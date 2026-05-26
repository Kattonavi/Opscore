import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { ADMIN, type Credentials } from './env';

/**
 * Calls `POST /auth/login` and returns the JWT. Throws a descriptive
 * error if the backend rejects the credentials so the test report shows
 * the HTTP status and body — never just "expect failed".
 */
export async function apiLogin(
  request: APIRequestContext,
  credentials: Credentials = ADMIN,
): Promise<string> {
  const response = await request.post('/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: credentials,
  });

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `Login failed for ${credentials.email}: ${response.status()} ${body}`,
    );
  }

  const body = await response.json();
  expect(body, 'login response should contain a JWT').toHaveProperty('token');
  expect(typeof body.token).toBe('string');
  return body.token as string;
}

/** Convenience — log in as the admin defined by E2E env vars. */
export function adminLogin(request: APIRequestContext): Promise<string> {
  return apiLogin(request, ADMIN);
}

/** Convenience header builder. */
export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

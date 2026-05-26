/**
 * Tests para los endpoints de gestión propia y administrativa de usuarios:
 *
 *   PATCH /users/me                       — actualiza firstName/lastName del
 *                                            usuario autenticado.
 *   PATCH /users/{userId}/change-password — reset administrativo (ADMIN, y
 *                                            SUPERVISOR dentro de su área).
 *
 * Cubre los casos mínimos pedidos en la fase de reforzamiento RBAC:
 *   - usuario puede actualizar firstName/lastName con /users/me;
 *   - /users/me rechaza nombres con números;
 *   - usuario autorizado puede cambiar contraseña vía /users/{userId}/change-password.
 */

import { test, expect } from '@playwright/test';
import { adminLogin, apiLogin, authHeaders } from './helpers/auth';
import {
  ensureUserAndLogin,
  ensureUserWithRole,
} from './helpers/users';
import { E2E_DEFAULT_PASSWORD } from './helpers/env';

test.describe('PATCH /users/me', () => {
  test('Usuario puede actualizar firstName y lastName', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token } = await ensureUserAndLogin(request, adminToken, 'TECHNICIAN');

    const resp = await request.patch('/users/me', {
      headers: authHeaders(token),
      data: { firstName: 'María José', lastName: "O'Connor" },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstName).toBe('María José');
    expect(body.lastName).toBe("O'Connor");
  });

  test('PATCH /users/me rechaza nombres con números', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token } = await ensureUserAndLogin(request, adminToken, 'TECHNICIAN');

    const resp = await request.patch('/users/me', {
      headers: authHeaders(token),
      data: { firstName: 'Pedro123', lastName: 'Lopez' },
    });
    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body.message).toMatch(/letras|nombre/i);
  });

  test('PATCH /users/me rechaza nombres vacíos', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token } = await ensureUserAndLogin(request, adminToken, 'TECHNICIAN');

    const resp = await request.patch('/users/me', {
      headers: authHeaders(token),
      data: { firstName: '   ', lastName: 'Lopez' },
    });
    expect(resp.status()).toBe(400);
  });

  test('PATCH /users/me no modifica rol ni email aunque vengan en el body', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user, token } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );

    const resp = await request.patch('/users/me', {
      headers: authHeaders(token),
      data: {
        firstName: 'Nuevo',
        lastName: 'Apellido',
        email: 'hacker@evil.com',
        role: 'ADMIN',
        active: false,
      },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.email).toBe(user.email);
    expect(body.role).toBe('TECHNICIAN');
    expect(body.active).toBe(true);
  });
});

test.describe('PATCH /users/{userId}/change-password — admin/supervisor reset', () => {
  test('ADMIN puede resetear la contraseña de cualquier usuario', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const target = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');

    const newPassword = 'AdminReset123!';
    const resp = await request.patch(`/users/${target.id}/change-password`, {
      headers: authHeaders(adminToken),
      data: { newPassword },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.message).toContain('actualizada');

    // El usuario puede loguearse con la nueva contraseña.
    const newToken = await apiLogin(request, {
      email: target.email,
      password: newPassword,
    });
    expect(typeof newToken).toBe('string');

    // Restablecer credenciales para que las próximas corridas sigan
    // funcionando con el password determinístico de E2E.
    await request.patch(`/users/${target.id}/change-password`, {
      headers: authHeaders(adminToken),
      data: { newPassword: E2E_DEFAULT_PASSWORD },
    });
  });

  test('ADMIN reset rechaza newPassword corto', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const target = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');

    const resp = await request.patch(`/users/${target.id}/change-password`, {
      headers: authHeaders(adminToken),
      data: { newPassword: 'short' },
    });
    expect(resp.status()).toBe(400);
  });

  test('ADMIN reset retorna 404 si el usuario no existe', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const resp = await request.patch('/users/99999999/change-password', {
      headers: authHeaders(adminToken),
      data: { newPassword: 'Whatever12345!' },
    });
    expect(resp.status()).toBe(404);
  });

  test('TECHNICIAN no puede usar el endpoint admin de reset — 403', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: technician, token: technicianToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );
    const target = await ensureUserWithRole(request, adminToken, 'OPERATOR');

    const resp = await request.patch(`/users/${target.id}/change-password`, {
      headers: authHeaders(technicianToken),
      data: { newPassword: 'NewPass123!' },
    });
    expect(resp.status()).toBe(403);
    // Defensive: verifica que el técnico no se haya promovido por accidente.
    expect(technician.role).toBe('TECHNICIAN');
  });

  test('OPERATOR no puede usar el endpoint admin de reset — 403', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );
    const target = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');

    const resp = await request.patch(`/users/${target.id}/change-password`, {
      headers: authHeaders(operatorToken),
      data: { newPassword: 'NewPass123!' },
    });
    expect(resp.status()).toBe(403);
  });
});

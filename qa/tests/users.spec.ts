import { test, expect } from '@playwright/test';
import { login, createRandomUser, ROLE_IDS } from './test-utils';

test.describe('Endpoints de usuarios', () => {
  test('admin puede crear un usuario nuevo', async ({ request }) => {
    const token = await login(request);
    await createRandomUser(request, token, 'TECHNICIAN');
  });

  test('admin puede listar usuarios', async ({ request }) => {
    const token = await login(request);

    const response = await request.get('/users', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('admin puede actualizar el rol de un usuario', async ({ request }) => {
    const token = await login(request);
    const createdUser = await createRandomUser(request, token, 'TECHNICIAN');

    const roleResponse = await request.patch(`/users/${createdUser.id}/role`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { roleId: ROLE_IDS.SUPERVISOR },
    });

    expect(roleResponse.status()).toBe(200);
    const updatedUser = await roleResponse.json();
    expect(updatedUser).toMatchObject({
      id: createdUser.id,
      email: createdUser.email,
      role: 'SUPERVISOR',
    });
  });

  test('admin puede actualizar el estado de un usuario', async ({ request }) => {
    const token = await login(request);
    const createdUser = await createRandomUser(request, token, 'TECHNICIAN');

    const statusResponse = await request.patch(`/users/${createdUser.id}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { active: false },
    });

    expect(statusResponse.status()).toBe(200);
    const updatedUser = await statusResponse.json();
    expect(updatedUser).toMatchObject({
      id: createdUser.id,
      email: createdUser.email,
    });
    expect(updatedUser.active).toBe(false);
  });

  test('un técnico no puede crear usuarios y recibe FORBIDDEN', async ({ request }) => {
    const adminToken = await login(request);
    const technician = await createRandomUser(request, adminToken, 'TECHNICIAN');

    const technicianLoginResponse = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: technician.email, password: technician.password },
    });

    expect(technicianLoginResponse.status()).toBe(200);
    const technicianToken = (await technicianLoginResponse.json()).token as string;

    const unauthorizedResponse = await request.post('/users', {
      headers: {
        Authorization: `Bearer ${technicianToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        firstName: 'No',
        lastName: 'Admin',
        email: `no-admin-${Date.now()}@test.opscore.local`,
        password: 'Test1234!',
        roleId: ROLE_IDS.TECHNICIAN,
      },
    });

    expect(unauthorizedResponse.status()).toBe(403);
    const errorBody = await unauthorizedResponse.json();
    expect(errorBody).toMatchObject({
      status: 403,
      error: 'FORBIDDEN',
    });
  });

  test('un usuario puede cambiar su contraseña', async ({ request }) => {
    const adminToken = await login(request);
    const createdUser = await createRandomUser(request, adminToken, 'TECHNICIAN');

    const userTokenResponse = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: createdUser.email, password: createdUser.password },
    });

    expect(userTokenResponse.status()).toBe(200);
    const userToken = (await userTokenResponse.json()).token as string;

    const newPassword = 'NewPass123!';
    const changePasswordResponse = await request.patch('/users/change-password', {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      data: { currentPassword: createdUser.password, newPassword },
    });

    expect(changePasswordResponse.status()).toBe(204);

    const reloginResponse = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: createdUser.email, password: newPassword },
    });

    expect(reloginResponse.status()).toBe(200);
    const reloginBody = await reloginResponse.json();
    expect(reloginBody).toHaveProperty('token');
  });
});

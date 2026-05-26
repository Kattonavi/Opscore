import { test } from '@playwright/test';
import { login } from './test-utils';

test.describe('Test al endpoint de login', () => {
  test('admin obtiene token desde /auth/login', async ({ request }) => {
    await login(request);
  });
});

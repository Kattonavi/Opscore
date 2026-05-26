/**
 * Reglas de creación de incidentes — bloque de negocio nuevo.
 *
 *   1. Solo OPERATOR puede crear incidentes (POST /incidents).
 *   2. El reportedBy del incidente es siempre el usuario autenticado:
 *      cualquier reportedById/assignedToId/supervisorId enviado en el body
 *      es IGNORADO por el backend.
 *   3. Los roles ADMIN, MANAGER, SUPERVISOR y TECHNICIAN reciben 403 con
 *      mensaje explícito al intentar crear.
 *   4. Asignar a un usuario que no sea TECHNICIAN devuelve 409 con
 *      mensaje claro.
 *
 * Los actores se reusan vía el bootstrap idempotente (helpers/users.ts).
 */

import { test, expect } from '@playwright/test';
import { adminLogin } from './helpers/auth';
import {
  ensureUserAndLogin,
  ensureUserWithRole,
} from './helpers/users';

const CREATE_FORBIDDEN_MESSAGE =
  'Solo los usuarios con rol operador pueden crear incidentes.';

async function postIncident(
  request: import('@playwright/test').APIRequestContext,
  token: string,
  body: Record<string, unknown> = {},
) {
  return request.post('/incidents', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      title: body.title ?? `E2E - creation ${Date.now()}`,
      description:
        body.description ??
        'Incidente E2E generado para validar la regla de creación.',
      type: body.type ?? 'MACHINE_FAILURE',
      priority: body.priority ?? 'HIGH',
      areaId: body.areaId,
      reportedById: body.reportedById,
      assignedToId: body.assignedToId,
      supervisorId: body.supervisorId,
    },
  });
}

test.describe('Incident creation — RBAC y reportedBy automático', () => {
  test('OPERATOR puede crear un incidente y queda como reportante', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: operator, token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );

    const resp = await postIncident(request, operatorToken, {
      title: `E2E - Op create OK ${Date.now()}`,
    });
    expect(resp.status()).toBe(201);
    const incident = await resp.json();
    expect(incident.status).toBe('OPEN');
    expect(incident.reportedById).toBe(operator.id);
  });

  test('Cualquier reportedById/assignedToId/supervisorId del body es ignorado', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: operator, token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );
    const technician = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');
    const otherOperator = await ensureUserWithRole(
      request,
      adminToken,
      'OPERATOR',
      1,
    );

    const resp = await postIncident(request, operatorToken, {
      title: `E2E - Op ignore body ${Date.now()}`,
      reportedById: otherOperator.id, // intenta suplantar
      assignedToId: technician.id,    // intenta autoasignar
      supervisorId: technician.id,    // intenta autoasignar supervisor
    });
    expect(resp.status()).toBe(201);
    const incident = await resp.json();
    expect(incident.reportedById).toBe(operator.id);
    expect(incident.assignedToId ?? null).toBeNull();
    expect(incident.supervisorId ?? null).toBeNull();
  });

  for (const role of ['ADMIN', 'MANAGER', 'SUPERVISOR', 'TECHNICIAN'] as const) {
    test(`${role} no puede crear incidentes — 403 con mensaje claro`, async ({ request }) => {
      const adminToken = await adminLogin(request);
      const token =
        role === 'ADMIN'
          ? adminToken
          : (await ensureUserAndLogin(request, adminToken, role)).token;

      const resp = await postIncident(request, token, {
        title: `E2E - ${role} blocked ${Date.now()}`,
      });
      expect(resp.status()).toBe(403);
      const body = await resp.json();
      expect(body).toMatchObject({
        status: 403,
        error: 'FORBIDDEN',
      });
      expect(body.message).toContain(CREATE_FORBIDDEN_MESSAGE);
    });
  }
});

test.describe('Incident assignment — solo a TECHNICIAN', () => {
  // El selector frontend ya filtra; estos tests confirman que el backend
  // también rechaza intentos por API directa.

  async function bootstrapAssignableIncident(
    request: import('@playwright/test').APIRequestContext,
  ) {
    const adminToken = await adminLogin(request);
    const { token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );
    const createResp = await postIncident(request, operatorToken, {
      title: `E2E - assign target ${Date.now()}`,
    });
    expect(createResp.status()).toBe(201);
    const incident = await createResp.json();
    return { adminToken, incidentId: incident.id as number };
  }

  for (const role of ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] as const) {
    test(`Asignar a un ${role} es rechazado (409) por el backend`, async ({ request }) => {
      const { adminToken, incidentId } = await bootstrapAssignableIncident(request);
      // Bootstrap a non-technician target.
      const target = await ensureUserWithRole(request, adminToken, role);

      const resp = await request.post(`/incidents/${incidentId}/assign`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        data: { assignedToId: target.id },
      });
      expect(resp.status()).toBe(409);
      const body = await resp.json();
      expect(body.message).toMatch(/técnico/i);
    });
  }

  test('No se puede asignar un incidente RESOLVED', async ({ request }) => {
    // Setup: OPERATOR crea → MANAGER asigna → TECHNICIAN start+resolve.
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'MANAGER',
    );
    const { user: technician, token: technicianToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );
    const { token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );

    const createResp = await postIncident(request, operatorToken, {
      title: `E2E - assign on RESOLVED ${Date.now()}`,
    });
    expect(createResp.status()).toBe(201);
    const incident = await createResp.json();

    // Assign + start + resolve to leave it in RESOLVED.
    const firstAssign = await request.post(`/incidents/${incident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: technician.id },
    });
    expect(firstAssign.status()).toBe(200);

    const startResp = await request.patch(`/incidents/${incident.id}/start`, {
      headers: {
        Authorization: `Bearer ${technicianToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'iniciado' },
    });
    expect(startResp.status()).toBe(200);

    const resolveResp = await request.patch(`/incidents/${incident.id}/resolve`, {
      headers: {
        Authorization: `Bearer ${technicianToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'resuelto' },
    });
    expect(resolveResp.status()).toBe(200);
    expect((await resolveResp.json()).status).toBe('RESOLVED');

    // Reasignación tras RESOLVED debe ser rechazada con 409.
    const reassignResp = await request.post(`/incidents/${incident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: technician.id },
    });
    expect(reassignResp.status()).toBe(409);
    const body = await reassignResp.json();
    expect(body.message).toMatch(/resuelto/i);
  });

  test('No se puede asignar un incidente CANCELED', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'MANAGER',
    );
    const technician = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');
    const { token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );

    const createResp = await postIncident(request, operatorToken, {
      title: `E2E - assign on CANCELED ${Date.now()}`,
    });
    expect(createResp.status()).toBe(201);
    const incident = await createResp.json();

    // Cancelar y luego intentar asignar.
    const cancelResp = await request.patch(`/incidents/${incident.id}/cancel`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'cancelado para test' },
    });
    expect(cancelResp.status()).toBe(200);

    const assignResp = await request.post(`/incidents/${incident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: technician.id },
    });
    expect(assignResp.status()).toBe(409);
    const body = await assignResp.json();
    expect(body.message).toMatch(/cancel|cerrad/i);
  });
});

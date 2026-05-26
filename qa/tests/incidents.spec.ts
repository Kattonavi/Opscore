import { test, expect } from '@playwright/test';
import { login, createRandomUser } from './test-utils';
import { adminLogin } from './helpers/auth';
import { createIncident, createIncidentViaOperator } from './helpers/incidents';
import { ensureUserAndLogin } from './helpers/users';

test.describe('Endpoints de incidentes', () => {
  test('OPERATOR puede crear un incidente y el reportedBy queda en el usuario autenticado', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: operator, token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );
    const incident = await createIncident(request, operatorToken, {
      title: `E2E - Operator create ${Date.now()}`,
    });
    expect(incident.status).toBe('OPEN');
    expect(incident.reportedById).toBe(operator.id);
  });

  test('admin puede listar incidentes', async ({ request }) => {
    const token = await login(request);
    const incident = await createIncidentViaOperator(request, token);

    const listResponse = await request.get('/incidents', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(listResponse.status()).toBe(200);
    const incidents = await listResponse.json();
    expect(Array.isArray(incidents)).toBe(true);
    expect(incidents.some((item: any) => item.id === incident.id)).toBe(true);
  });

  test('admin puede obtener un incidente por id', async ({ request }) => {
    const token = await login(request);
    const incident = await createIncidentViaOperator(request, token);

    const response = await request.get(`/incidents/${incident.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const incidentById = await response.json();
    expect(incidentById).toMatchObject({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      type: incident.type,
    });
  });

  test('admin puede consultar el historial de assignments de un incidente', async ({ request }) => {
    const token = await login(request);
    const incident = await createIncidentViaOperator(request, token);

    const response = await request.get(`/incidents/${incident.id}/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const assignments = await response.json();
    expect(Array.isArray(assignments)).toBe(true);
  });

  test('TECHNICIAN asignado puede resolver un incidente respetando la state machine', async ({ request }) => {
    // Fase 2 enforces OPEN → ASSIGNED → IN_PROGRESS → RESOLVED. Driving an
    // incident straight from OPEN to RESOLVED is rejected with 409 now,
    // so the test walks the full happy path before asserting RESOLVED.
    // After the OPERATOR-only creation rule, the incident is reported by
    // an operator (helper). Admin still drives the assignment.
    const token = await login(request);
    const technician = await createRandomUser(request, token, 'TECHNICIAN');
    const incident = await createIncidentViaOperator(request, token);

    const assignResp = await request.post(`/incidents/${incident.id}/assign`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { assignedToId: technician.id },
    });
    expect(assignResp.status()).toBe(200);

    const technicianLogin = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: technician.email, password: technician.password },
    });
    expect(technicianLogin.status()).toBe(200);
    const technicianToken = (await technicianLogin.json()).token as string;

    const startResp = await request.patch(`/incidents/${incident.id}/start`, {
      headers: { Authorization: `Bearer ${technicianToken}`, 'Content-Type': 'application/json' },
      data: { comment: 'Iniciado por QA' },
    });
    expect(startResp.status()).toBe(200);

    const resolveResponse = await request.patch(`/incidents/${incident.id}/resolve`, {
      headers: { Authorization: `Bearer ${technicianToken}`, 'Content-Type': 'application/json' },
      data: { comment: 'Resuelto por QA' },
    });
    expect(resolveResponse.status()).toBe(200);
    const resolved = await resolveResponse.json();
    expect(resolved.status).toBe('RESOLVED');
  });

  test('admin puede asignar un incidente a un técnico', async ({ request }) => {
    const token = await login(request);
    const technician = await createRandomUser(request, token, 'TECHNICIAN');
    const incident = await createIncidentViaOperator(request, token);

    const assignResponse = await request.post(`/incidents/${incident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: technician.id },
    });

    expect(assignResponse.status()).toBe(200);

    const historyResponse = await request.get(`/incidents/${incident.id}/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(historyResponse.status()).toBe(200);
    const assignments = await historyResponse.json();
    expect(Array.isArray(assignments)).toBe(true);
    expect(assignments.some((item: any) => item.assignedToId === technician.id)).toBe(true);
  });
});

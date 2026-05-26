import { test, expect } from '@playwright/test';
import { login, createIncident, createRandomUser } from './test-utils';

test.describe('Endpoints de incidentes', () => {
  test('admin puede crear un incidente', async ({ request }) => {
    const token = await login(request);
    await createIncident(request, token);
  });

  test('admin puede listar incidentes', async ({ request }) => {
    const token = await login(request);
    const incident = await createIncident(request, token);

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
    const incident = await createIncident(request, token);

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
    const incident = await createIncident(request, token);

    const response = await request.get(`/incidents/${incident.id}/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const assignments = await response.json();
    expect(Array.isArray(assignments)).toBe(true);
  });

  test('admin puede resolver un incidente', async ({ request }) => {
    const token = await login(request);
    const incident = await createIncident(request, token);

    const resolveResponse = await request.patch(`/incidents/${incident.id}/resolve`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'Resuelto por QA' },
    });

    expect(resolveResponse.status()).toBe(200);
    const resolved = await resolveResponse.json();
    expect(resolved.status).toBe('RESOLVED');
  });

  test('admin puede asignar un incidente a un técnico', async ({ request }) => {
    const token = await login(request);
    const technician = await createRandomUser(request, token, 'TECHNICIAN');
    const incident = await createIncident(request, token);

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

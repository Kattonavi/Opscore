/**
 * Fase 4 — Restricciones de rol (RBAC) verificadas por API directa.
 *
 * Las reglas que estos tests fijan provienen de:
 *   - `lib/rbac.ts` en el frontend (Fase 1).
 *   - `IncidentAccessService` + `@PreAuthorize` en el backend (Fase 2).
 *
 * Cada test crea o reutiliza usuarios E2E deterministas. La creación de
 * usuarios sigue siendo SOLO ADMIN, así que cualquier rol no-admin que
 * intente `POST /users` debe recibir 403.
 */

import { test, expect } from '@playwright/test';
import { adminLogin } from './helpers/auth';
import { ensureUserAndLogin, ensureUserWithRole } from './helpers/users';
import {
  assignIncident,
  createIncident,
  createIncidentViaOperator,
  transitionIncident,
} from './helpers/incidents';
import { ROLE_IDS } from './helpers/env';

test.describe('Incident RBAC — by role', () => {
  test('MANAGER puede asignar y cancelar incidentes', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(request, adminToken, 'MANAGER');
    const technician = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');

    const incident = await createIncidentViaOperator(request, adminToken, {
      title: `E2E - Manager assigns ${Date.now()}`,
    });

    const assigned = await assignIncident(
      request,
      managerToken,
      incident.id,
      technician.id,
    );
    expect(assigned.status).toBe('ASSIGNED');

    const canceled = await transitionIncident(
      request,
      managerToken,
      incident.id,
      'cancel',
    );
    expect(canceled.status).toBe('CANCELED');
  });

  test('MANAGER no puede crear usuarios — 403', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(request, adminToken, 'MANAGER');

    const resp = await request.post('/users', {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        firstName: 'Should',
        lastName: 'Fail',
        email: `e2e-forbidden-${Date.now()}@opscore.local`,
        password: 'Whatever123!',
        roleId: ROLE_IDS.TECHNICIAN,
      },
    });
    expect(resp.status()).toBe(403);
  });

  test('SUPERVISOR puede asignar (scope área documentado abajo)', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: supervisorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'SUPERVISOR',
    );
    const technician = await ensureUserWithRole(request, adminToken, 'TECHNICIAN');

    const incident = await createIncidentViaOperator(request, adminToken, {
      title: `E2E - Supervisor assigns ${Date.now()}`,
    });

    // NOTE: el SUPERVISOR sembrado por defecto no tiene área (ni el técnico
    // bootstrap tampoco). En Fase 2 la regla server-side exige misma área
    // para asignar; por eso este caso "feliz" sólo pasa cuando los actores
    // no tienen área asignada O comparten área. Si tu Railway tiene el
    // SUPERVISOR con área, fuerza `E2E_SUPERVISOR_EMAIL` a uno cuya área
    // coincida con el técnico bootstrap, o crea técnicos con `areaId`
    // adelante (helper `ensureUserWithRole(..., areaId)`).
    const resp = await request.post(`/incidents/${incident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${supervisorToken}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: technician.id },
    });

    // Aceptamos 200 (ambos sin área o misma área) o 403 (Fase 2 endurecido).
    // El test queda como verificación de comportamiento documentado.
    expect([200, 403]).toContain(resp.status());
    if (resp.status() === 403) {
      const body = await resp.json();
      expect(body.message).toMatch(/area/i);
    }
  });

  test('TECHNICIAN asignado puede start / hold / resolve', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(request, adminToken, 'MANAGER');
    const { user: technician, token: technicianToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );

    const incident = await createIncidentViaOperator(request, adminToken);
    await assignIncident(request, managerToken, incident.id, technician.id);

    expect((await transitionIncident(request, technicianToken, incident.id, 'start')).status)
      .toBe('IN_PROGRESS');
    expect((await transitionIncident(request, technicianToken, incident.id, 'hold')).status)
      .toBe('ON_HOLD');
    expect((await transitionIncident(request, technicianToken, incident.id, 'start')).status)
      .toBe('IN_PROGRESS');
    expect((await transitionIncident(request, technicianToken, incident.id, 'resolve')).status)
      .toBe('RESOLVED');
  });

  test('TECHNICIAN no asignado recibe 403 al intentar operar', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(request, adminToken, 'MANAGER');

    // Asignamos el incidente al técnico "oficial"…
    const { user: assignedTech } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );

    // …pero la acción la intenta un técnico distinto (otro deterministic).
    const otherTech = await ensureUserWithRole(request, adminToken, 'TECHNICIAN', 5);
    const otherTechToken = await (
      await request.post('/auth/login', {
        headers: { 'Content-Type': 'application/json' },
        data: { email: otherTech.email, password: otherTech.password },
      })
    ).json();

    // Regla #1: sólo OPERATOR crea incidentes. Antes este test usaba el
    // token de ADMIN; ahora delega al wrapper que bootea un operator.
    const incident = await createIncidentViaOperator(request, adminToken);
    await assignIncident(request, managerToken, incident.id, assignedTech.id);

    const resp = await request.patch(`/incidents/${incident.id}/start`, {
      headers: {
        Authorization: `Bearer ${otherTechToken.token}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'unauthorized attempt' },
    });
    expect(resp.status()).toBe(403);
  });

  test('OPERATOR no puede asignar / cancelar / cerrar / resolver', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: operator, token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );

    // El operator crea su propio incidente (lo cual sí está permitido).
    const ownIncident = await createIncident(request, operatorToken, {
      title: `E2E - Operator self-report ${Date.now()}`,
    });
    expect(ownIncident.status).toBe('OPEN');
    expect(ownIncident.reportedById).toBe(operator.id);

    // Intento de asignar → 403 (frontend lo oculta, backend lo prohíbe).
    const assignResp = await request.post(`/incidents/${ownIncident.id}/assign`, {
      headers: {
        Authorization: `Bearer ${operatorToken}`,
        'Content-Type': 'application/json',
      },
      data: { assignedToId: operator.id },
    });
    expect(assignResp.status()).toBe(403);

    // Intento de cancelar → 403.
    const cancelResp = await request.patch(`/incidents/${ownIncident.id}/cancel`, {
      headers: {
        Authorization: `Bearer ${operatorToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'no debería poder' },
    });
    expect(cancelResp.status()).toBe(403);

    // Intento de cerrar → 403.
    const closeResp = await request.patch(`/incidents/${ownIncident.id}/close`, {
      headers: {
        Authorization: `Bearer ${operatorToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'no debería poder' },
    });
    expect(closeResp.status()).toBe(403);

    // Intento de resolver → 403.
    const resolveResp = await request.patch(`/incidents/${ownIncident.id}/resolve`, {
      headers: {
        Authorization: `Bearer ${operatorToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'no debería poder' },
    });
    expect(resolveResp.status()).toBe(403);
  });

  test('OPERATOR solo ve incidentes propios en GET /incidents', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { user: operator, token: operatorToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'OPERATOR',
    );

    // Incidente reportado por otro operator (regla #1: sólo OPERATOR crea).
    // `createIncidentViaOperator` arranca un operator distinto (areaId 1).
    const foreign = await createIncidentViaOperator(request, adminToken, {
      title: `E2E - Foreign ${Date.now()}`,
    });

    // Incidente propio del operator.
    const own = await createIncident(request, operatorToken, {
      title: `E2E - Own ${Date.now()}`,
    });

    const listResp = await request.get('/incidents', {
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    expect(listResp.status()).toBe(200);
    const incidents = (await listResp.json()) as Array<{
      id: number;
      reportedById?: number;
    }>;

    // El propio debe estar.
    expect(incidents.some((i) => i.id === own.id)).toBe(true);
    // El ajeno no debe estar.
    expect(incidents.some((i) => i.id === foreign.id)).toBe(false);
    // Cualquier incidente listado debe ser del propio operator.
    for (const inc of incidents) {
      expect(inc.reportedById).toBe(operator.id);
    }
  });
});

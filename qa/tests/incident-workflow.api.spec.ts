/**
 * Fase 4 — Flujo completo del ciclo de vida de incidentes.
 *
 *   ADMIN crea       → OPEN
 *   MANAGER asigna   → ASSIGNED
 *   TECHNICIAN start → IN_PROGRESS
 *   TECHNICIAN hold  → ON_HOLD
 *   TECHNICIAN start → IN_PROGRESS  (reanuda)
 *   TECHNICIAN resolve → RESOLVED
 *   MANAGER close    → CLOSED
 *
 * Driver: HTTP requests (API-first). UI coverage of this same flow lives
 * in `session-isolation.ui.spec.ts` for the parts that the UI controls
 * directly (login session, store cleanup, no flash between users).
 *
 * Bootstrapping:
 *   - The admin is read from E2E_ADMIN_EMAIL/PASSWORD (defaults from the
 *     backend seeder).
 *   - The MANAGER and TECHNICIAN are either taken from preset env vars
 *     or created on the fly with deterministic E2E emails:
 *       e2e-manager@opscore.local
 *       e2e-technician@opscore.local
 *     so subsequent runs reuse them instead of accumulating accounts.
 */

import { test, expect } from '@playwright/test';
import { adminLogin, apiLogin } from './helpers/auth';
import { ensureUserAndLogin } from './helpers/users';
import {
  createIncident,
  createIncidentViaOperator,
  assignIncident,
  transitionIncident,
  getIncident,
  getAssignments,
  getTimeline,
} from './helpers/incidents';

test.describe('Incident workflow — full lifecycle', () => {
  test('OPEN → ASSIGNED → IN_PROGRESS → ON_HOLD → IN_PROGRESS → RESOLVED → CLOSED', async ({ request }) => {
    test.setTimeout(60_000);

    // ── Bootstrap actors ─────────────────────────────────────────────
    const adminToken = await adminLogin(request);
    const { user: manager, token: managerToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'MANAGER',
    );
    const { user: technician, token: technicianToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'TECHNICIAN',
    );

    // ── 1. ADMIN crea incidente (estado inicial OPEN) ────────────────
    const initial = await createIncidentViaOperator(request, adminToken, {
      title: `E2E - Workflow ${Date.now()}`,
    });
    expect(initial.status).toBe('OPEN');

    // ── 2. MANAGER asigna al TECHNICIAN (OPEN → ASSIGNED) ────────────
    const afterAssign = await assignIncident(
      request,
      managerToken,
      initial.id,
      technician.id,
    );
    expect(afterAssign.status).toBe('ASSIGNED');
    expect(afterAssign.assignedToId).toBe(technician.id);

    // Asignación persistida en el historial.
    const assignments = await getAssignments(request, adminToken, initial.id);
    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments[0]).toMatchObject({
      assignedToId: technician.id,
      assignedById: manager.id,
    });

    // Timeline registró ASSIGNED.
    const timelineAfterAssign = await getTimeline(request, adminToken, initial.id);
    expect(timelineAfterAssign.some((e) => e.action === 'ASSIGNED')).toBe(true);

    // ── 3. TECHNICIAN inicia (ASSIGNED → IN_PROGRESS) ────────────────
    const afterStart = await transitionIncident(
      request,
      technicianToken,
      initial.id,
      'start',
    );
    expect(afterStart.status).toBe('IN_PROGRESS');

    // ── 4. TECHNICIAN pone en espera y reanuda ───────────────────────
    const afterHold = await transitionIncident(
      request,
      technicianToken,
      initial.id,
      'hold',
    );
    expect(afterHold.status).toBe('ON_HOLD');

    const afterResume = await transitionIncident(
      request,
      technicianToken,
      initial.id,
      'start',
    );
    expect(afterResume.status).toBe('IN_PROGRESS');

    // ── 5. TECHNICIAN resuelve (IN_PROGRESS → RESOLVED) ──────────────
    const afterResolve = await transitionIncident(
      request,
      technicianToken,
      initial.id,
      'resolve',
    );
    expect(afterResolve.status).toBe('RESOLVED');

    // Acciones de trabajo deben dejar de aceptarse en RESOLVED.
    const startOnResolved = await request.patch(`/incidents/${initial.id}/start`, {
      headers: {
        Authorization: `Bearer ${technicianToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'should fail' },
    });
    expect(startOnResolved.status()).toBe(409);

    // ── 6. MANAGER cierra (RESOLVED → CLOSED) ────────────────────────
    const afterClose = await transitionIncident(
      request,
      managerToken,
      initial.id,
      'close',
    );
    expect(afterClose.status).toBe('CLOSED');

    // CLOSED es terminal: ninguna acción posterior debe pasar.
    for (const action of ['start', 'hold', 'resolve', 'cancel'] as const) {
      const resp = await request.patch(`/incidents/${initial.id}/${action}`, {
        headers: {
          Authorization: `Bearer ${managerToken}`,
          'Content-Type': 'application/json',
        },
        data: { comment: 'should be rejected' },
      });
      expect(resp.status(), `CLOSED should reject ${action}`).toBe(409);
    }

    // Timeline contiene los hitos clave (ASSIGNED + STARTED + RESOLVED + CLOSED).
    const finalTimeline = await getTimeline(request, adminToken, initial.id);
    const actions = finalTimeline.map((e) => e.action);
    expect(actions).toContain('ASSIGNED');
    expect(actions).toContain('STARTED');
    expect(actions).toContain('PUT_ON_HOLD');
    expect(actions).toContain('RESOLVED');
    expect(actions).toContain('CLOSED');

    // Estado consistente al re-leer el incidente.
    const finalState = await getIncident(request, adminToken, initial.id);
    expect(finalState.status).toBe('CLOSED');
  });

  test('Cancelación: OPEN → CANCELED por MANAGER', async ({ request }) => {
    const adminToken = await adminLogin(request);
    const { token: managerToken } = await ensureUserAndLogin(
      request,
      adminToken,
      'MANAGER',
    );

    const incident = await createIncidentViaOperator(request, adminToken, {
      title: `E2E - Cancel ${Date.now()}`,
    });
    expect(incident.status).toBe('OPEN');

    const canceled = await transitionIncident(
      request,
      managerToken,
      incident.id,
      'cancel',
    );
    expect(canceled.status).toBe('CANCELED');

    // CANCELED es terminal.
    const reCancel = await request.patch(`/incidents/${incident.id}/cancel`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      data: { comment: 'duplicate cancel' },
    });
    expect(reCancel.status()).toBe(409);
  });
});

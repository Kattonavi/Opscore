import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { authHeaders } from './auth';

/** Default payload used to create incidents in E2E specs. */
export interface CreateIncidentInput {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  areaId?: number;
  reportedById?: number;
}

export interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  areaId?: number;
  areaName?: string;
  reportedById?: number;
  reportedByName?: string;
  assignedToId?: number;
  assignedToName?: string;
  supervisorId?: number;
  supervisorName?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createIncident(
  request: APIRequestContext,
  token: string,
  input: CreateIncidentInput = {},
): Promise<IncidentResponse> {
  const payload = {
    title: input.title ?? `E2E - Falla ${Date.now()}`,
    description:
      input.description ??
      'Incidente E2E generado automaticamente para validar el flujo completo.',
    type: input.type ?? 'MACHINE_FAILURE',
    priority: input.priority ?? 'HIGH',
    areaId: input.areaId,
    reportedById: input.reportedById,
  };

  const response = await request.post('/incidents', {
    headers: authHeaders(token),
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(
      `Failed to create incident: ${response.status()} ${body}`,
    );
  }
  const incident = (await response.json()) as IncidentResponse;
  expect(incident.id, 'created incident should have an id').toBeTruthy();
  return incident;
}

export async function assignIncident(
  request: APIRequestContext,
  token: string,
  incidentId: number,
  assignedToId: number,
): Promise<IncidentResponse> {
  const response = await request.post(`/incidents/${incidentId}/assign`, {
    headers: authHeaders(token),
    data: { assignedToId },
  });
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `Assign failed for incident ${incidentId} → user ${assignedToId}: ${response.status()} ${body}`,
    );
  }
  return (await response.json()) as IncidentResponse;
}

type TransitionAction = 'start' | 'hold' | 'resolve' | 'close' | 'cancel';

export async function transitionIncident(
  request: APIRequestContext,
  token: string,
  incidentId: number,
  action: TransitionAction,
  comment = `E2E transition: ${action}`,
): Promise<IncidentResponse> {
  const response = await request.patch(`/incidents/${incidentId}/${action}`, {
    headers: authHeaders(token),
    data: { comment },
  });
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `Transition '${action}' failed for incident ${incidentId}: ${response.status()} ${body}`,
    );
  }
  return (await response.json()) as IncidentResponse;
}

export async function getIncident(
  request: APIRequestContext,
  token: string,
  incidentId: number,
): Promise<IncidentResponse> {
  const response = await request.get(`/incidents/${incidentId}`, {
    headers: authHeaders(token),
  });
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `GET /incidents/${incidentId} failed: ${response.status()} ${body}`,
    );
  }
  return (await response.json()) as IncidentResponse;
}

export async function getAssignments(
  request: APIRequestContext,
  token: string,
  incidentId: number,
): Promise<Array<{ id: number; assignedToId: number; assignedById: number }>> {
  const response = await request.get(`/incidents/${incidentId}/assignments`, {
    headers: authHeaders(token),
  });
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `GET /incidents/${incidentId}/assignments failed: ${response.status()} ${body}`,
    );
  }
  return (await response.json()) as Array<{
    id: number;
    assignedToId: number;
    assignedById: number;
  }>;
}

export async function getTimeline(
  request: APIRequestContext,
  token: string,
  incidentId: number,
): Promise<Array<{ id: number; action: string; userName: string; createdAt: string }>> {
  const response = await request.get(`/incidents/${incidentId}/timeline`, {
    headers: authHeaders(token),
  });
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `GET /incidents/${incidentId}/timeline failed: ${response.status()} ${body}`,
    );
  }
  return (await response.json()) as Array<{
    id: number;
    action: string;
    userName: string;
    createdAt: string;
  }>;
}

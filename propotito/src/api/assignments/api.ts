import apiClient from '../client';
import type { AssignmentRequestDTO, AssignmentResponseDTO } from './types';

/**
 * API de Asignaciones
 * Requiere rol SUPERVISOR o ADMIN
 */
export const assignmentsApi = {
  // POST /incidents/{id}/assign - Asignar incidente a técnico
  assign: async (incidentId: number, assignmentData: AssignmentRequestDTO): Promise<AssignmentResponseDTO> => {
    const response = await apiClient.post(`/incidents/${incidentId}/assign`, assignmentData);
    return response.data;
  },

  // GET /incidents/{id}/assignments - Obtener historial de asignaciones
  getHistory: async (incidentId: number): Promise<AssignmentResponseDTO[]> => {
    const response = await apiClient.get(`/incidents/${incidentId}/assignments`);
    return response.data;
  },
};

// Exportar tipo para uso en hooks/components
export type AssignmentsApi = typeof assignmentsApi;

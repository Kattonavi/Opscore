import apiClient from '../client';
import type { 
  IncidentRequestDTO, 
  IncidentResponseDTO
} from './types';
import type { AssignmentResponseDTO } from '../assignments/types';

/**
 * API de Incidentes
 * Todos los endpoints requieren autenticación
 */
export const incidentsApi = {
  // POST /incidents - Crear incidente (cualquier usuario autenticado)
  create: async (incidentData: IncidentRequestDTO): Promise<IncidentResponseDTO> => {
    try {
      console.log('[incidentsApi] Creating incident:', incidentData);
      const response = await apiClient.post('/incidents', incidentData);
      console.log('[incidentsApi] Incident created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[incidentsApi] Error creating incident:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // GET /incidents - Obtener todos los incidentes (cualquier usuario autenticado)
  getAll: async (): Promise<IncidentResponseDTO[]> => {
    try {
      console.log('[incidentsApi] Fetching all incidents');
      const response = await apiClient.get('/incidents');
      console.log('[incidentsApi] Incidents fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[incidentsApi] Error fetching incidents:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // GET /incidents/{id} - Obtener incidente por ID (cualquier usuario autenticado)
  getById: async (id: number): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Fetching incident ${id}`);
      const response = await apiClient.get(`/incidents/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error fetching incident ${id}:`, error);
      throw error;
    }
  },

  // GET /incidents/{id}/assignments - Obtener historial de asignaciones
  getAssignmentHistory: async (id: number): Promise<AssignmentResponseDTO[]> => {
    try {
      const response = await apiClient.get(`/incidents/${id}/assignments`);
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error fetching assignments for incident ${id}:`, error);
      throw error;
    }
  },

  // PATCH /incidents/{id}/start - Iniciar incidente (TECHNICIAN o ADMIN)
  start: async (id: number): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Starting incident ${id}`);
      const response = await apiClient.patch(`/incidents/${id}/start`);
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error starting incident ${id}:`, error);
      throw error;
    }
  },

  // PATCH /incidents/{id}/hold - Poner en espera (TECHNICIAN o ADMIN)
  hold: async (id: number, reason?: string): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Putting incident ${id} on hold`);
      const response = await apiClient.patch(`/incidents/${id}/hold`, { reason });
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error putting incident ${id} on hold:`, error);
      throw error;
    }
  },

  // PATCH /incidents/{id}/resolve - Resolver incidente (TECHNICIAN o ADMIN)
  resolve: async (id: number, resolution?: string): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Resolving incident ${id}`);
      const response = await apiClient.patch(`/incidents/${id}/resolve`, { resolution });
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error resolving incident ${id}:`, error);
      throw error;
    }
  },

  // PATCH /incidents/{id}/close - Cerrar incidente (SUPERVISOR o ADMIN)
  close: async (id: number, notes?: string): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Closing incident ${id}`);
      const response = await apiClient.patch(`/incidents/${id}/close`, { notes });
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error closing incident ${id}:`, error);
      throw error;
    }
  },

  // PATCH /incidents/{id}/cancel - Cancelar incidente (SUPERVISOR o ADMIN)
  cancel: async (id: number, reason?: string): Promise<IncidentResponseDTO> => {
    try {
      console.log(`[incidentsApi] Canceling incident ${id}`);
      const response = await apiClient.patch(`/incidents/${id}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      console.error(`[incidentsApi] Error canceling incident ${id}:`, error);
      throw error;
    }
  },
};

// Exportar tipo para uso en hooks/components
export type IncidentsApi = typeof incidentsApi;

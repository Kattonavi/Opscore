import apiClient from "../client";
import type {
  IncidentRequestDTO,
  IncidentResponseDTO,
  AssignmentRequestDTO,
  AssignmentResponseDTO,
  IncidentTimelineEntryDTO,
} from "./types";

/**
 * Incidentes API
 * Todos los endpoints requieren autenticación (JWT via interceptor)
 */
export const incidentsApi = {
  /** GET /incidents — listar todos */
  getAll: async (): Promise<IncidentResponseDTO[]> => {
    const response = await apiClient.get("/incidents");
    return response.data;
  },

  /** GET /incidents/{id} — obtener por ID */
  getById: async (id: number): Promise<IncidentResponseDTO> => {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  },

  /** POST /incidents — crear nuevo */
  create: async (
    data: IncidentRequestDTO,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.post("/incidents", data);
    return response.data;
  },

  /** PATCH /incidents/{id}/start */
  start: async (
    id: number,
    comment: string,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.patch(`/incidents/${id}/start`, {
      comment,
    });
    return response.data;
  },

  /** PATCH /incidents/{id}/hold */
  hold: async (
    id: number,
    comment: string,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.patch(`/incidents/${id}/hold`, {
      comment,
    });
    return response.data;
  },

  /** PATCH /incidents/{id}/resolve */
  resolve: async (
    id: number,
    comment: string,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.patch(`/incidents/${id}/resolve`, {
      comment,
    });
    return response.data;
  },

  /** PATCH /incidents/{id}/close */
  close: async (
    id: number,
    comment: string,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.patch(`/incidents/${id}/close`, {
      comment,
    });
    return response.data;
  },

  /** PATCH /incidents/{id}/cancel */
  cancel: async (
    id: number,
    comment: string,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.patch(`/incidents/${id}/cancel`, {
      comment,
    });
    return response.data;
  },

  // ── Assignment ─────────────────────────────────

  /** POST /incidents/{id}/assign — asignar técnico */
  assign: async (
    id: number,
    data: AssignmentRequestDTO,
  ): Promise<IncidentResponseDTO> => {
    const response = await apiClient.post(
      `/incidents/${id}/assign`,
      data,
    );
    return response.data;
  },

  /** GET /incidents/{id}/assignments — historial de asignaciones */
  getAssignments: async (
    id: number,
  ): Promise<AssignmentResponseDTO[]> => {
    const response = await apiClient.get(
      `/incidents/${id}/assignments`,
    );
    return response.data;
  },

  // ── Timeline ────────────────────────────────────

  /** GET /incidents/{id}/timeline — historial de acciones */
  getTimeline: async (
    id: number,
  ): Promise<IncidentTimelineEntryDTO[]> => {
    const response = await apiClient.get(
      `/incidents/${id}/timeline`,
    );
    return response.data;
  },

  // ── Comments / Annotations ──────────────────────

  /** POST /incidents/{id}/annotations — agregar comentario */
  addAnnotation: async (
    id: number,
    comment: string,
  ): Promise<IncidentTimelineEntryDTO> => {
    const response = await apiClient.post(
      `/incidents/${id}/annotations`,
      { comment },
    );
    return response.data;
  },
};

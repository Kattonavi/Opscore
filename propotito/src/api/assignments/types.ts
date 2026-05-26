// Tipos para Asignaciones de Incidentes

export interface AssignmentRequestDTO {
  technicianId: number;
  supervisorId: number;
}

export interface AssignmentResponseDTO {
  id: number;
  incidentId: number;
  technicianId: number;
  supervisorId: number;
  assignedAt: string;
}

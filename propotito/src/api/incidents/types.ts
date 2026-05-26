// Enums que coinciden con el backend Java - Incidentes

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// IncidentStatus según backend (7 estados)
export enum IncidentStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
}

// IncidentType según backend (reemplaza Category)
export enum IncidentType {
  MACHINE_FAILURE = 'MACHINE_FAILURE',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  ACCIDENT = 'ACCIDENT',
  NETWORK = 'NETWORK',
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  SECURITY = 'SECURITY',
  ACCESS = 'ACCESS',
  OTHER = 'OTHER',
}

// DTOs de Incidentes

export interface IncidentRequestDTO {
  title: string;
  description: string;
  type: IncidentType;           // Backend usa 'type', no 'category'
  priority: Priority;
  isFalseAlarm?: boolean;
  areaId?: number;
  reportedById?: number;
  assignedToId?: number;
  supervisorId?: number;
}

export interface IncidentResponseDTO {
  id: number;
  title: string;
  description: string;
  type: IncidentType;           // Backend usa 'type', no 'category'
  status: IncidentStatus;
  priority: Priority;
  isFalseAlarm: boolean;
  areaId?: number;
  areaName?: string;
  reportedById?: number;
  reportedByName?: string;
  assignedToId?: number;
  assignedToName?: string;
  supervisorId?: number;
  supervisorName?: string;
  createdAt: string;            // ISO 8601 format
  updatedAt: string;            // ISO 8601 format
  // resolvedAt no existe en backend actualmente (comentado)
}

// Estados para UI (mapeo de status a labels/colores)
export const incidentStatusConfig: Record<IncidentStatus, { label: string; color: string }> = {
  [IncidentStatus.OPEN]: { label: 'Abierto', color: 'bg-blue-500' },
  [IncidentStatus.ASSIGNED]: { label: 'Asignado', color: 'bg-purple-500' },
  [IncidentStatus.IN_PROGRESS]: { label: 'En Progreso', color: 'bg-yellow-500' },
  [IncidentStatus.ON_HOLD]: { label: 'En Espera', color: 'bg-orange-500' },
  [IncidentStatus.RESOLVED]: { label: 'Resuelto', color: 'bg-green-500' },
  [IncidentStatus.CLOSED]: { label: 'Cerrado', color: 'bg-gray-500' },
  [IncidentStatus.CANCELED]: { label: 'Cancelado', color: 'bg-red-500' },
};

export const priorityConfig: Record<Priority, { label: string; color: string }> = {
  [Priority.LOW]: { label: 'Baja', color: 'bg-blue-400' },
  [Priority.MEDIUM]: { label: 'Media', color: 'bg-yellow-400' },
  [Priority.HIGH]: { label: 'Alta', color: 'bg-orange-500' },
  [Priority.CRITICAL]: { label: 'Crítica', color: 'bg-red-600' },
};

export const incidentTypeConfig: Record<IncidentType, { label: string; icon: string }> = {
  [IncidentType.MACHINE_FAILURE]: { label: 'Fallo de Máquina', icon: 'cog' },
  [IncidentType.QUALITY_ISSUE]: { label: 'Problema de Calidad', icon: 'shield-alert' },
  [IncidentType.ACCIDENT]: { label: 'Accidente', icon: 'alert-triangle' },
  [IncidentType.NETWORK]: { label: 'Red', icon: 'wifi' },
  [IncidentType.HARDWARE]: { label: 'Hardware', icon: 'hard-drive' },
  [IncidentType.SOFTWARE]: { label: 'Software', icon: 'code' },
  [IncidentType.SECURITY]: { label: 'Seguridad', icon: 'lock' },
  [IncidentType.ACCESS]: { label: 'Acceso', icon: 'key' },
  [IncidentType.OTHER]: { label: 'Otro', icon: 'help-circle' },
};

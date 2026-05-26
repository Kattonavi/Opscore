// ──────────────────────────────────────────────
// Incident API types — enums & DTOs
// ──────────────────────────────────────────────

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
}

export enum IncidentType {
  MACHINE_FAILURE = "MACHINE_FAILURE",
  QUALITY_ISSUE = "QUALITY_ISSUE",
  ACCIDENT = "ACCIDENT",
  NETWORK = "NETWORK",
  HARDWARE = "HARDWARE",
  SOFTWARE = "SOFTWARE",
  SECURITY = "SECURITY",
  ACCESS = "ACCESS",
  OTHER = "OTHER",
}

// ── DTOs ──────────────────────────────────────

export interface IncidentRequestDTO {
  title: string;
  description: string;
  type: IncidentType;
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
  type: IncidentType;
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
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequestDTO {
  assignedToId: number;
}

export interface AssignmentResponseDTO {
  id: number;
  incidentId: number;
  assignedToId: number;
  assignedToName: string;
  assignedById: number;
  assignedByName: string;
  assignedAt: string;
}

export interface IncidentTimelineEntryDTO {
  id: number;
  action: IncidentAction;
  userId: number;
  userName: string;
  comment?: string;
  createdAt: string;
}

// ── Backend enums (not yet wired into DTOs) ────

export enum Category {
  SAFETY = "SAFETY",
  QUALITY = "QUALITY",
  OPERATIONS = "OPERATIONS",
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER",
}

export enum IncidentAction {
  INCIDENT_CREATED = "INCIDENT_CREATED",
  ASSIGNED = "ASSIGNED",
  REASSIGNED = "REASSIGNED",
  STARTED = "STARTED",
  PUT_ON_HOLD = "PUT_ON_HOLD",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
  COMMENT_ADDED = "COMMENT_ADDED",
}

// ── UI config helpers ─────────────────────────

export const incidentTypeConfig: Record<
  IncidentType,
  { label: string; color: string }
> = {
  [IncidentType.MACHINE_FAILURE]: { label: "Fallo de Máquina", color: "bg-red-500" },
  [IncidentType.QUALITY_ISSUE]: { label: "Problema de Calidad", color: "bg-amber-500" },
  [IncidentType.ACCIDENT]: { label: "Accidente", color: "bg-orange-600" },
  [IncidentType.NETWORK]: { label: "Red", color: "bg-blue-500" },
  [IncidentType.HARDWARE]: { label: "Hardware", color: "bg-violet-500" },
  [IncidentType.SOFTWARE]: { label: "Software", color: "bg-cyan-500" },
  [IncidentType.SECURITY]: { label: "Seguridad", color: "bg-rose-600" },
  [IncidentType.ACCESS]: { label: "Acceso", color: "bg-teal-500" },
  [IncidentType.OTHER]: { label: "Otro", color: "bg-muted-foreground" },
};

export const categoryConfig: Record<
  Category,
  { label: string; color: string }
> = {
  [Category.SAFETY]: { label: "Seguridad", color: "bg-red-500" },
  [Category.QUALITY]: { label: "Calidad", color: "bg-amber-500" },
  [Category.OPERATIONS]: { label: "Operaciones", color: "bg-blue-500" },
  [Category.MAINTENANCE]: { label: "Mantenimiento", color: "bg-violet-500" },
  [Category.OTHER]: { label: "Otro", color: "bg-muted-foreground" },
};

export const incidentActionConfig: Record<
  IncidentAction,
  { label: string; color: string }
> = {
  [IncidentAction.INCIDENT_CREATED]: { label: "Creado", color: "bg-emerald-500" },
  [IncidentAction.ASSIGNED]: { label: "Asignado", color: "bg-blue-500" },
  [IncidentAction.REASSIGNED]: { label: "Reasignado", color: "bg-amber-500" },
  [IncidentAction.STARTED]: { label: "Iniciado", color: "bg-cyan-500" },
  [IncidentAction.PUT_ON_HOLD]: { label: "En Espera", color: "bg-yellow-500" },
  [IncidentAction.RESOLVED]: { label: "Resuelto", color: "bg-emerald-600" },
  [IncidentAction.CLOSED]: { label: "Cerrado", color: "bg-muted-foreground" },
  [IncidentAction.CANCELED]: { label: "Cancelado", color: "bg-destructive" },
  [IncidentAction.COMMENT_ADDED]: { label: "Comentario", color: "bg-slate-500" },
};

export const incidentStatusConfig: Record<
  IncidentStatus,
  { label: string; color: string }
> = {
  [IncidentStatus.OPEN]: { label: "Abierto", color: "text-destructive" },
  [IncidentStatus.ASSIGNED]: { label: "Asignado", color: "text-chart-3" },
  [IncidentStatus.IN_PROGRESS]: { label: "En Progreso", color: "text-chart-2" },
  [IncidentStatus.ON_HOLD]: { label: "En Espera", color: "text-chart-4" },
  [IncidentStatus.RESOLVED]: { label: "Resuelto", color: "text-emerald-500" },
  [IncidentStatus.CLOSED]: { label: "Cerrado", color: "text-muted-foreground" },
  [IncidentStatus.CANCELED]: { label: "Cancelado", color: "text-destructive" },
};

export const priorityConfig: Record<
  Priority,
  { label: string; color: string }
> = {
  [Priority.LOW]: { label: "Baja", color: "bg-blue-400" },
  [Priority.MEDIUM]: { label: "Media", color: "bg-yellow-400" },
  [Priority.HIGH]: { label: "Alta", color: "bg-orange-500" },
  [Priority.CRITICAL]: { label: "Crítica", color: "bg-red-600" },
};

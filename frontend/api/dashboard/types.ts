// ──────────────────────────────────────────────
// Dashboard API types
// ──────────────────────────────────────────────

export interface IncidentStatusMetrics {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  onHold: number;
  resolved: number;
  closed: number;
  canceled: number;
}

export interface IncidentPriorityMetrics {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface AreaMetrics {
  area: string;
  count: number;
}

export interface DashboardMetrics {
  status: IncidentStatusMetrics;
  priority: IncidentPriorityMetrics;
  areas: AreaMetrics[];
}

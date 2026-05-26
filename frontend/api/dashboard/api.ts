import apiClient from "../client";
import type {
  IncidentStatusMetrics,
  IncidentPriorityMetrics,
  AreaMetrics,
  DashboardMetrics,
} from "./types";

/**
 * Dashboard API — aggregated metrics for reports & analytics
 */
export const dashboardApi = {
  /** GET /dashboard/incidents/status */
  getStatusMetrics: async (): Promise<IncidentStatusMetrics> => {
    const response = await apiClient.get("/dashboard/incidents/status");
    return response.data;
  },

  /** GET /dashboard/incidents/priority */
  getPriorityMetrics: async (): Promise<IncidentPriorityMetrics> => {
    const response = await apiClient.get("/dashboard/incidents/priority");
    return response.data;
  },

  /** GET /dashboard/incidents/area */
  getAreaMetrics: async (): Promise<AreaMetrics[]> => {
    const response = await apiClient.get("/dashboard/incidents/area");
    return response.data;
  },

  /** Fetch all dashboard metrics in parallel */
  getAll: async (): Promise<DashboardMetrics> => {
    const [status, priority, areas] = await Promise.all([
      dashboardApi.getStatusMetrics(),
      dashboardApi.getPriorityMetrics(),
      dashboardApi.getAreaMetrics(),
    ]);
    return { status, priority, areas };
  },
};

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { incidentsApi } from "@/api/incidents";
import type {
  IncidentResponseDTO,
  IncidentRequestDTO,
  IncidentStatus,
  Priority,
  IncidentType,
} from "@/api/incidents/types";

interface IncidentsState {
  incidents: IncidentResponseDTO[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchIncidents: () => Promise<void>;
  createIncident: (data: IncidentRequestDTO) => Promise<IncidentResponseDTO>;
  resolveIncident: (id: number, comment?: string) => Promise<void>;

  // Computed
  getIncidentsByStatus: (status: IncidentStatus) => IncidentResponseDTO[];
  getIncidentsByPriority: (priority: Priority) => IncidentResponseDTO[];
  getIncidentsByCategory: (type: IncidentType) => IncidentResponseDTO[];
  getIncidentStats: () => IncidentStats;
}

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<IncidentType, number>;
  byArea: Record<string, number>;
  avgResolutionTime: number;
}

export const useIncidentsStore = create<IncidentsState>()(
  persist(
    (set, get) => ({
      incidents: [],
      loading: false,
      error: null,

      fetchIncidents: async () => {
        set({ loading: true, error: null });
        try {
          const incidents = await incidentsApi.getAll();
          set({ incidents, loading: false });
        } catch (error: unknown) {
          const message =
            error instanceof Object &&
            error !== null &&
            "response" in error &&
            (error as { response: { data?: { message?: string } } }).response
              ?.data?.message;
          set({
            error: message || "Error al cargar incidentes",
            loading: false,
          });
        }
      },

      createIncident: async (data: IncidentRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const newIncident = await incidentsApi.create(data);
          set((state) => ({
            incidents: [...state.incidents, newIncident],
            loading: false,
          }));
          return newIncident;
        } catch (error: unknown) {
          const message =
            error instanceof Object &&
            error !== null &&
            "response" in error &&
            (error as { response: { data?: { message?: string } } }).response
              ?.data?.message;
          set({
            error: message || "Error al crear incidente",
            loading: false,
          });
          throw error;
        }
      },

      resolveIncident: async (id: number, comment: string = "Resuelto desde listado") => {
        set({ loading: true, error: null });
        try {
          await incidentsApi.resolve(id, comment);
          set((state) => ({
            incidents: state.incidents.map((inc) =>
              inc.id === id
                ? { ...inc, status: "RESOLVED" as IncidentStatus }
                : inc,
            ),
            loading: false,
          }));
        } catch (error: unknown) {
          const message =
            error instanceof Object &&
            error !== null &&
            "response" in error &&
            (error as { response: { data?: { message?: string } } }).response
              ?.data?.message;
          set({
            error: message || "Error al resolver incidente",
            loading: false,
          });
          throw error;
        }
      },

      getIncidentsByStatus: (status: IncidentStatus) => {
        return get().incidents.filter((inc) => inc.status === status);
      },

      getIncidentsByPriority: (priority: Priority) => {
        return get().incidents.filter((inc) => inc.priority === priority);
      },

      getIncidentsByCategory: (type: IncidentType) => {
        return get().incidents.filter((inc) => inc.type === type);
      },

      getIncidentStats: () => {
        const { incidents } = get();
        const total = incidents.length;

        const byStatus = incidents.reduce(
          (acc, inc) => {
            acc[inc.status] = (acc[inc.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const byPriority = incidents.reduce(
          (acc, inc) => {
            acc[inc.priority] = (acc[inc.priority] || 0) + 1;
            return acc;
          },
          {} as Record<Priority, number>,
        );

        const byCategory = incidents.reduce(
          (acc, inc) => {
            acc[inc.type] = (acc[inc.type] || 0) + 1;
            return acc;
          },
          {} as Record<IncidentType, number>,
        );

        const byArea = incidents.reduce(
          (acc, inc) => {
            const area = inc.areaName || inc.areaId?.toString() || "Sin área";
            acc[area] = (acc[area] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        // Estimate avg resolution time from created->updated for resolved/closed
        const resolved = incidents.filter(
          (inc) => inc.status === "RESOLVED" || inc.status === "CLOSED",
        );
        const avgResolutionTime =
          resolved.length > 0
            ? resolved.reduce((sum, inc) => {
                const created = new Date(inc.createdAt).getTime();
                const updated = new Date(inc.updatedAt).getTime();
                return sum + (updated - created) / (1000 * 60); // minutes
              }, 0) / resolved.length
            : 0;

        return {
          total,
          open: byStatus["OPEN"] || 0,
          inProgress: byStatus["IN_PROGRESS"] || 0,
          resolved: byStatus["RESOLVED"] || 0,
          closed: byStatus["CLOSED"] || 0,
          byPriority,
          byCategory,
          byArea,
          avgResolutionTime,
        };
      },
    }),
    {
      name: "opscore-incidents-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        incidents: state.incidents,
      }),
    },
  ),
);

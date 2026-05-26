import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { incidentsApi, assignmentsApi } from '@/api';
import type { 
  IncidentResponseDTO, 
  IncidentRequestDTO
} from '@/api/incidents/types';
import type { AssignmentRequestDTO } from '@/api/assignments/types';
import { 
  Priority,
  IncidentStatus,
  IncidentType
} from '@/api/incidents/types';

interface IncidentsState {
  incidents: IncidentResponseDTO[];
  currentIncident: IncidentResponseDTO | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchIncidents: () => Promise<void>;
  fetchIncidentById: (id: number) => Promise<void>;
  createIncident: (data: IncidentRequestDTO) => Promise<IncidentResponseDTO>;
  resolveIncident: (id: number) => Promise<void>;
  assignIncident: (id: number, data: AssignmentRequestDTO) => Promise<void>;
  clearError: () => void;
  clearCurrentIncident: () => void;
  
  // Computed
  getIncidentsByStatus: (status: IncidentStatus) => IncidentResponseDTO[];
  getIncidentsByPriority: (priority: Priority) => IncidentResponseDTO[];
  getIncidentsByCategory: (type: IncidentType) => IncidentResponseDTO[];
  getIncidentStats: () => {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    // Alias en español para compatibilidad
    abiertos: number;
    enProceso: number;
    resueltos: number;
    cerrados: number;
    // Propiedades adicionales para compatibilidad
    porPrioridad: Record<string, number>;
    porCategoria: Record<string, number>;
    porTipo: Record<string, number>;
    porArea: Record<string, number>;
    tiempoPromedioResolucion: number;
    byPriority: Record<Priority, number>;
    byCategory: Record<IncidentType, number>;
  };
}

export const useIncidentsStore = create<IncidentsState>()(
  persist(
    (set, get) => ({
      incidents: [],
      currentIncident: null,
      loading: false,
      error: null,

      fetchIncidents: async () => {
        set({ loading: true, error: null });
        try {
          const incidents = await incidentsApi.getAll();
          set({ incidents, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al cargar incidentes', 
            loading: false 
          });
        }
      },

      fetchIncidentById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const incident = await incidentsApi.getById(id);
          set({ currentIncident: incident, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al cargar el incidente', 
            loading: false 
          });
        }
      },

      createIncident: async (data: IncidentRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const newIncident = await incidentsApi.create(data);
          set(state => ({
            incidents: [...state.incidents, newIncident],
            loading: false,
          }));
          return newIncident;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al crear incidente', 
            loading: false 
          });
          throw error;
        }
      },

      resolveIncident: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await incidentsApi.resolve(id);
          // Actualizar el incidente en la lista
          set(state => ({
            incidents: state.incidents.map(inc => 
              inc.id === id ? { ...inc, status: IncidentStatus.RESOLVED } : inc
            ),
            currentIncident: state.currentIncident?.id === id 
              ? { ...state.currentIncident, status: IncidentStatus.RESOLVED }
              : state.currentIncident,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al resolver incidente', 
            loading: false 
          });
          throw error;
        }
      },

      assignIncident: async (id: number, data: AssignmentRequestDTO) => {
        set({ loading: true, error: null });
        try {
          await assignmentsApi.assign(id, data);
          // Actualizar el estado del incidente
          set(state => ({
            incidents: state.incidents.map(inc => 
              inc.id === id ? { ...inc, status: IncidentStatus.IN_PROGRESS } : inc
            ),
            currentIncident: state.currentIncident?.id === id 
              ? { ...state.currentIncident, status: IncidentStatus.IN_PROGRESS }
              : state.currentIncident,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al asignar incidente', 
            loading: false 
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentIncident: () => {
        set({ currentIncident: null });
      },

      getIncidentsByStatus: (status: IncidentStatus) => {
        return get().incidents.filter(incident => incident.status === status);
      },

      getIncidentsByPriority: (priority: Priority) => {
        return get().incidents.filter(incident => incident.priority === priority);
      },

      getIncidentsByCategory: (type: IncidentType) => {
        return get().incidents.filter(incident => incident.type === type);
      },

      getIncidentStats: () => {
        const incidents = get().incidents;
        const total = incidents.length;
        
        const byStatus = incidents.reduce((acc, inc) => {
          acc[inc.status] = (acc[inc.status] || 0) + 1;
          return acc;
        }, {} as Record<IncidentStatus, number>);

        const byPriority = incidents.reduce((acc, inc) => {
          acc[inc.priority] = (acc[inc.priority] || 0) + 1;
          return acc;
        }, {} as Record<Priority, number>);

        const byCategory = incidents.reduce((acc, inc) => {
          acc[inc.type] = (acc[inc.type] || 0) + 1;
          return acc;
        }, {} as Record<IncidentType, number>);

        return {
          total,
          open: byStatus[IncidentStatus.OPEN] || 0,
          inProgress: byStatus[IncidentStatus.IN_PROGRESS] || 0,
          resolved: byStatus[IncidentStatus.RESOLVED] || 0,
          closed: byStatus[IncidentStatus.CLOSED] || 0,
          // Alias en español para compatibilidad
          abiertos: byStatus[IncidentStatus.OPEN] || 0,
          enProceso: byStatus[IncidentStatus.IN_PROGRESS] || 0,
          resueltos: byStatus[IncidentStatus.RESOLVED] || 0,
          cerrados: byStatus[IncidentStatus.CLOSED] || 0,
          // Propiedades adicionales para compatibilidad
          porPrioridad: Object.fromEntries(
            Object.entries(byPriority).map(([k, v]) => [k.toLowerCase(), v])
          ) as Record<string, number>,
          porCategoria: Object.fromEntries(
            Object.entries(byCategory).map(([k, v]) => [k.toLowerCase(), v])
          ) as Record<string, number>,
          porTipo: Object.fromEntries(
            Object.entries(byCategory).map(([k, v]) => [k.toLowerCase(), v])
          ) as Record<string, number>, // Alias de categoria para tipos
          porArea: { produccion: 0, mantenimiento: 0, calidad: 0, seguridad: 0, logistica: 0 }, // Placeholder - no hay datos de área en el nuevo formato
          tiempoPromedioResolucion: 0, // Placeholder - calcular basado en createdAt y resolvedAt
          byPriority,
          byCategory,
        };
      },
    }),
    {
      name: 'opscore-incidents-storage',
      partialize: (state) => ({
        incidents: state.incidents,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { incidentsApi, statusApi, prioritiesApi, typesApi } from '@/api';
import type { IncidentResponseDTO as Incident, IncidentRequestDTO, Status, PriorityLegacy as Priority, Type } from '@/api/types';

interface IncidentsState {
  incidents: Incident[];
  statuses: Status[];
  priorities: Priority[];
  types: Type[];
  loading: boolean;
  error: string | null;
  
  fetchIncidents: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  fetchPriorities: () => Promise<void>;
  fetchTypes: () => Promise<void>;
  getIncidentById: (id: string) => Incident | undefined;
  getStatusById: (id: string) => Status | undefined;
  getPriorityById: (id: string) => Priority | undefined;
  getTypeById: (id: string) => Type | undefined;
  createIncident: (incident: IncidentRequestDTO) => Promise<Incident>;
  // updateIncident: (id: string, data: Partial<Incident>) => Promise<Incident>;
  assignIncident: (id: string, technicalId: string, supervisorId: string) => Promise<Incident>;
  closeIncident: (id: string, solution: string, rootCause: string) => Promise<Incident>;
  deleteIncident: (id: string) => Promise<void>;
  getIncidentStats: () => {
    total: number;
    abiertos: number;
    enProceso: number;
    cerrados: number;
    porArea: Record<string, number>;
    porTipo: Record<string, number>;
    porPrioridad: Record<string, number>;
    tiempoPromedioResolucion: number;
  };
}

export const useIncidentsStore = create<IncidentsState>()(
  persist(
    (set, get) => ({
      incidents: [],
      statuses: [],
      priorities: [],
      types: [],
      loading: false,
      error: null,

      fetchIncidents: async () => {
        set({ loading: true, error: null });
        try {
          const incidents = await incidentsApi.getAll();
          set({ incidents, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar incidentes', loading: false });
        }
      },

      fetchStatuses: async () => {
        set({ loading: true, error: null });
        try {
          const statuses = await statusApi.getAll();
          set({ statuses, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar estados', loading: false });
        }
      },

      fetchPriorities: async () => {
        set({ loading: true, error: null });
        try {
          const priorities = await prioritiesApi.getAll();
          set({ priorities, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar prioridades', loading: false });
        }
      },

      fetchTypes: async () => {
        set({ loading: true, error: null });
        try {
          const types = await typesApi.getAll();
          set({ types, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar tipos', loading: false });
        }
      },

      getIncidentById: (id: string) => {
        return get().incidents.find(incident => String(incident.id) === id);
      },

      getStatusById: (id: string | number) => {
        return get().statuses.find(status => String(status.id) === String(id));
      },

      getPriorityById: (id: string | number) => {
        return get().priorities.find(priority => String(priority.id) === String(id));
      },

      getTypeById: (id: string | number) => {
        return get().types.find(type => String(type.id) === String(id));
      },

      createIncident: async (incidentData: IncidentRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const newIncident = await incidentsApi.create(incidentData);
          set(state => ({
            incidents: [...state.incidents, newIncident],
            loading: false,
          }));
          return newIncident;
        } catch (error) {
          set({ error: 'Error al crear incidente', loading: false });
          throw error;
        }
      },

      // Nota: updateIncident no está disponible en el API actual
      // updateIncident: async (id: string, data: Partial<Incident>) => { ... },

      assignIncident: async (id: string, technicalId: string, supervisorId: string) => {
        set({ loading: true, error: null });
        try {
          // Usar assignmentsApi para asignar técnico
          const { assignmentsApi } = await import('@/api');
          await assignmentsApi.assign(Number(id), { technicianId: Number(technicalId), supervisorId: Number(supervisorId) });
          // Recargar incidentes para obtener el estado actualizado
          const incidents = await incidentsApi.getAll();
          set({ incidents, loading: false });
          return incidents.find(i => String(i.id) === id)!;
        } catch (error) {
          set({ error: 'Error al asignar incidente', loading: false });
          throw error;
        }
      },

      closeIncident: async (id: string, solution: string, rootCause: string) => {
        set({ loading: true, error: null });
        try {
          // El API usa "resolve" en lugar de "close"
          await incidentsApi.resolve(Number(id));
          // Recargar incidentes para obtener el estado actualizado
          const incidents = await incidentsApi.getAll();
          set({ incidents, loading: false });
          return incidents.find(i => String(i.id) === id)!;
        } catch (error) {
          set({ error: 'Error al cerrar incidente', loading: false });
          throw error;
        }
      },

      deleteIncident: async (id: string) => {
        // Nota: delete no está disponible en el API actual
        console.warn('Delete incident not available in API');
        return;
      },

      getIncidentStats: () => {
        const incidents = get().incidents;
        const total = incidents.length;
        // Usar el enum Status en lugar de id_status
        const abiertos = incidents.filter(i => i.status === 'OPEN').length;
        const enProceso = incidents.filter(i => i.status === 'IN_PROGRESS').length;
        const cerrados = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

        // Usar category como área (mapeo simple)
        const porArea: Record<string, number> = {};
        const porTipo: Record<string, number> = {};
        const porPrioridad: Record<string, number> = {};

        incidents.forEach(incident => {
          const type = incident.type || 'OTHER';
          const area = incident.areaId ? String(incident.areaId) : 'OTHER';
          porArea[area] = (porArea[area] || 0) + 1;
          porTipo[type] = (porTipo[type] || 0) + 1;
          const priority = incident.priority || 'MEDIUM';
          porPrioridad[priority] = (porPrioridad[priority] || 0) + 1;
        });

        // No hay resolvedAt en el API actual - usar placeholder
        const tiempoPromedioResolucion = 0;

        return {
          total,
          abiertos,
          enProceso,
          cerrados,
          porArea,
          porTipo,
          porPrioridad,
          tiempoPromedioResolucion,
        };
      },
    }),
    {
      name: 'incidents-storage',
      partialize: (state) => ({
        incidents: state.incidents,
        statuses: state.statuses,
        priorities: state.priorities,
        types: state.types,
      }),
    }
  )
);

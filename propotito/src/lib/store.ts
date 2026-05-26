"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useIncidentsStore as useIncidentsStoreNew, useAuthStore } from "@/stores";
import type { IncidentResponseDTO, Priority, IncidentStatus as BackendStatus, IncidentType as BackendIncidentType } from "@/api/incidents/types";

// Re-exportar los stores reales desde stores/
export { useAuthStore } from "@/stores/auth-store";
// export { useIncidentsStore as useIncidentStore } from "@/stores/incidents-store-new";
export type { Role, UserResponseDTO as User } from "@/api/types";

// Legacy store - usando el nuevo de @/stores
export { useIncidentsStore as useIncidentStore } from "@/stores";

// Tipos para el sistema de incidentes (legacy - migrar gradualmente)
export type IncidentStatusLegacy = "abierto" | "asignado" | "en_proceso" | "en_espera" | "resuelto" | "cerrado" | "cancelado";
export type IncidentTypeLegacy = "falla_maquina" | "accidente" | "desviacion_calidad" | "otro";
export type IncidentPriorityLegacy = "baja" | "media" | "alta" | "critica";
export type IncidentAreaLegacy = "produccion" | "mantenimiento" | "calidad" | "seguridad" | "logistica";

// Re-exportar con nombres legacy para compatibilidad
export type IncidentStatus = IncidentStatusLegacy;
export type IncidentType = IncidentTypeLegacy;
export type IncidentPriority = IncidentPriorityLegacy;
export type IncidentArea = IncidentAreaLegacy;

// Tipo unificado para incidentes - combina DTO del API con legacy
// El id puede ser string o number según la fuente
export interface Incident {
  id: string | number;
  // Campos DTO API
  title?: string;
  description?: string;
  status?: IncidentStatusLegacy;
  priority?: Priority;
  type?: BackendIncidentType;  // Usa enum nuevo del API
  createdAt?: string;
  resolvedAt?: string;
  // Campos legacy
  tipo?: IncidentTypeLegacy;  // Usa tipo legacy
  area?: IncidentArea;
  prioridad?: IncidentPriority;
  titulo?: string;
  descripcion?: string;
  estado?: IncidentStatus;
  reportadoPor?: string;
  reportadoPorNombre?: string;
  asignadoA?: string;
  asignadoANombre?: string;
  solucion?: string;
  causaRaiz?: string;
  fechaCreacion?: string;
  fechaAsignacion?: string;
  fechaCierre?: string;
  tiempoResolucion?: number;
  ubicacion?: string;
  imagenes?: string[];
  // Campos adicionales para compatibilidad con dashboard
  id_status?: string;
  id_type?: string;
  id_area?: string;
  id_priority?: string;
  opening_date?: string;
  // Campos técnicos
  id_technical?: string;
  id_supervisor?: string;
  technicalName?: string;
  reportedByUserId?: number;
  assignedUserId?: number;
  // Estado
  is_active?: boolean;
  // Fechas adicionales
  close_date?: string;
}

// Mapper para convertir IncidentResponseDTO a Incident (formato legacy)
const mapToLegacyIncident = (inc: IncidentResponseDTO): Incident => ({
  id: String(inc.id),
  tipo: "otro" as IncidentType,
  area: "produccion" as IncidentArea,
  prioridad: (mapPriorityToLegacy(inc.priority)) as IncidentPriority,
  titulo: inc.title,
  descripcion: inc.description,
  estado: (mapStatusToLegacy(inc.status)) as IncidentStatus,
  reportadoPor: "",
  reportadoPorNombre: "",
  fechaCreacion: inc.createdAt,
  fechaCierre: undefined,
});

function mapPriorityToLegacy(p: Priority): string {
  const map: Record<Priority, string> = {
    LOW: "baja",
    MEDIUM: "media",
    HIGH: "alta",
    CRITICAL: "critica",
  };
  return map[p] || "media";
}

function mapStatusToLegacy(s: BackendStatus): string {
  const map: Record<BackendStatus, string> = {
    OPEN: "abierto",
    ASSIGNED: "asignado",
    IN_PROGRESS: "en_proceso",
    ON_HOLD: "en_espera",
    RESOLVED: "resuelto",
    CLOSED: "cerrado",
    CANCELED: "cancelado",
  };
  return map[s] || "abierto";
}

// Hook helper para obtener incidentes en formato legacy
export const useLegacyIncidents = () => {
  const incidents = useIncidentsStoreNew((state) => state.incidents);
  return incidents.map(mapToLegacyIncident);
};

// Función para convertir incidentes al formato legacy
export const toLegacyIncidents = (incidents: IncidentResponseDTO[]): Incident[] =>
  incidents.map(mapToLegacyIncident);

// Función helper para saneincident con valores por defecto seguros
// Usar en componentes que necesitan campos guaranteed
export const sanitizeIncident = (inc: any): Incident => ({
  id: inc.id ?? 0,
  title: inc.title ?? inc.titulo ?? "",
  description: inc.description ?? inc.descripcion ?? "",
  status: inc.status,
  priority: inc.priority,
  type: inc.type,
  createdAt: inc.createdAt ?? inc.fechaCreacion ?? "",
  resolvedAt: inc.fechaCierre,
  // Legacy fields
  tipo: inc.tipo ?? "otro",
  area: inc.area ?? "produccion",
  prioridad: inc.prioridad ?? "media",
  titulo: inc.titulo ?? inc.title ?? "",
  descripcion: inc.descripcion ?? inc.description ?? "",
  estado: inc.estado ?? "abierto",
  reportadoPor: inc.reportadoPor ?? "",
  reportadoPorNombre: inc.reportadoPorNombre ?? "",
  fechaCreacion: inc.fechaCreacion ?? inc.createdAt ?? "",
  fechaCierre: inc.fechaCierre,
  opening_date: inc.opening_date ?? inc.fechaCreacion ?? "",
  id_status: inc.id_status ?? "",
  id_type: inc.id_type ?? "",
  id_area: inc.id_area ?? "",
  id_priority: inc.id_priority ?? "",
});

// Hook para obtener incidentes con campos saneados
export const useSafeIncidents = () => {
  const incidents = useIncidentsStoreNew((state) => state.incidents);
  return incidents.map(sanitizeIncident);
};

// Tipos para i18n
export type Language = "es" | "en" | "pt";

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "opscore-i18n",
    }
  )
);

// Re-exportar stores adicionales para compatibilidad
export { useIncidentsStore, useUsersStore } from "@/stores";

// Mock de catalogs store para evitar errores durante migración
export const useCatalogsStore = () => ({
  statuses: [],
  priorities: [],
  types: [],
  areas: [],
  fetchCatalogs: async () => {},
  getRoleById: () => undefined,
  getAreaById: () => undefined,
  getStatusById: () => undefined,
  getPriorityById: () => undefined,
  getTypeById: () => undefined,
  getCompanyById: () => undefined,
});

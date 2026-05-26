import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reportsApi } from '@/api';
import type { Report } from '@/api/types';

interface ReportsState {
  reports: Report[];
  loading: boolean;
  error: string | null;
  
  fetchReports: () => Promise<void>;
  getReportById: (id: string) => Report | undefined;
  getReportsByIncidentId: (incidentId: string) => Report[];
  createReport: (report: Partial<Report>) => Promise<Report>;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],
      loading: false,
      error: null,

      fetchReports: async () => {
        set({ loading: true, error: null });
        try {
          const reports = await reportsApi.getAll();
          set({ reports, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar reportes', loading: false });
        }
      },

      getReportById: (id: string | number) => {
        return get().reports.find(report => String(report.id) === String(id));
      },

      getReportsByIncidentId: (_incidentId: string | number) => {
        // TODO: Implementar cuando el API de reportes esté disponible
        return [];
      },

      createReport: async (reportData: Partial<Report>) => {
        set({ loading: true, error: null });
        try {
          const newReport = await reportsApi.create(reportData);
          set(state => ({
            reports: [...state.reports, newReport],
            loading: false,
          }));
          return newReport;
        } catch (error) {
          set({ error: 'Error al crear reporte', loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'reports-storage',
      partialize: (state) => ({
        reports: state.reports,
      }),
    }
  )
);

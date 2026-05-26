// Exportar stores con API real (NUEVOS)
export { useAuthStore } from './auth-store';
export { useIncidentsStore } from './incidents-store-new';
export { useUsersStore } from './users-store-new';

// Re-exportar stores legacy para compatibilidad durante migración
// TODO: Eliminar después de completar la migración
export { 
  useUsersStore as useUsersStoreLegacy,
  useIncidentsStore as useIncidentsStoreLegacy,
  useReportsStore as useReportsStoreLegacy,
} from './index-legacy';

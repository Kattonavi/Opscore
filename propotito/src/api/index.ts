// API Client
export { default as apiClient } from './client';

// Auth Module
export * from './auth';

// Incidents Module
export * from './incidents';

// Assignments Module
export * from './assignments';

// Common/Legacy types (usar con precaución)
export * from './common/types';

// Legacy API stubs - mantener por compatibilidad temporal
// TODO: Remover cuando stores legacy sean actualizados
export {
  statusApi,
  prioritiesApi,
  typesApi,
  rolesApi,
  areasApi,
  companiesApi,
  reportsApi,
} from './common/legacy-api';

// Legacy exports - mantener por compatibilidad
// TODO: Remover en futura refactorización
export { incidentsApi as legacyIncidentsApi } from './incidents/api';
export { assignmentsApi as legacyAssignmentsApi } from './assignments/api';

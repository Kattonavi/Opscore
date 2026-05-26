// ARCHIVO DE COMPATIBILIDAD TEMPORAL
// TODO: Migrar todos los imports a los módulos específicos y eliminar este archivo

// Re-exportar desde módulos organizados
export * from './auth/types';
export * from './incidents/types';
export * from './assignments/types';
export * from './common/types';

// Legacy exports - mantener por compatibilidad
// Estos tipos no existen en el backend actual pero se usan en código legacy
export interface RoleEntity {
  id: number;
  name: string;
  description: string;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface Area {
  id: number;
  name: string;
  description: string;
  companyId: number;
  active: boolean;
}

export interface Status {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface PriorityLegacy {
  id: number;
  name: string;
  description: string;
  level: number;
}

export interface Type {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos compartidos y legacy
// Usar solo para tipos que no tienen su propio dominio

// Legacy - mantener por compatibilidad temporal
// TODO: Migrar usos de Category a IncidentType
export enum Category {
  SAFETY = 'SAFETY',
  QUALITY = 'QUALITY',
  OPERATIONS = 'OPERATIONS',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

// Legacy - mantener por compatibilidad temporal  
// TODO: Migrar usos de IncidentStatus legacy al nuevo de incidents/types.ts
export enum LegacyIncidentStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

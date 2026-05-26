// API Mock - Simulación de llamadas al backend
// LEGACY: Mantener durante migración, eliminar después
import usersData from './mock/users.json';
import rolesData from './mock/roles.json';
import companiesData from './mock/companies.json';
import areasData from './mock/areas.json';
import statusData from './mock/status.json';
import prioritiesData from './mock/priorities.json';
import typesData from './mock/types.json';
import incidentsData from './mock/incidents.json';
import reportsData from './mock/reports.json';

// Simular delay de red
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============= USERS API =============
export const usersApi = {
  getAll: async () => {
    await delay();
    return usersData;
  },
  
  getById: async (id: string) => {
    await delay();
    return usersData.find(user => user.id === id);
  },
  
  create: async (user: any) => {
    await delay();
    const newUser = {
      ...user,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    usersData.push(newUser);
    return newUser;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const index = usersData.findIndex(user => user.id === id);
    if (index !== -1) {
      usersData[index] = {
        ...usersData[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return usersData[index];
    }
    throw new Error('User not found');
  },
  
  delete: async (id: string) => {
    await delay();
    const index = usersData.findIndex(user => user.id === id);
    if (index !== -1) {
      usersData.splice(index, 1);
      return true;
    }
    throw new Error('User not found');
  },
};

// ============= ROLES API =============
export const rolesApi = {
  getAll: async () => {
    await delay();
    return rolesData;
  },
  
  getById: async (id: string) => {
    await delay();
    return rolesData.find(role => role.id === id);
  },
};

// ============= COMPANIES API =============
export const companiesApi = {
  getAll: async () => {
    await delay();
    return companiesData;
  },
  
  getById: async (id: string) => {
    await delay();
    return companiesData.find(company => company.id === id);
  },
};

// ============= AREAS API =============
export const areasApi = {
  getAll: async () => {
    await delay();
    return areasData;
  },
  
  getById: async (id: string) => {
    await delay();
    return areasData.find(area => area.id === id);
  },
};

// ============= STATUS API =============
export const statusApi = {
  getAll: async () => {
    await delay();
    return statusData;
  },
  
  getById: async (id: string) => {
    await delay();
    return statusData.find(status => status.id === id);
  },
};

// ============= PRIORITIES API =============
export const prioritiesApi = {
  getAll: async () => {
    await delay();
    return prioritiesData;
  },
  
  getById: async (id: string) => {
    await delay();
    return prioritiesData.find(priority => priority.id === id);
  },
};

// ============= TYPES API =============
export const typesApi = {
  getAll: async () => {
    await delay();
    return typesData;
  },
  
  getById: async (id: string) => {
    await delay();
    return typesData.find(type => type.id === id);
  },
};

// ============= INCIDENTS API =============
export const incidentsApi = {
  getAll: async () => {
    await delay();
    return incidentsData;
  },
  
  getById: async (id: string) => {
    await delay();
    return incidentsData.find(incident => incident.id === id);
  },
  
  create: async (incident: any) => {
    await delay();
    const newIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      id_status: 'status-001', // Abierto por defecto
      opening_date: new Date().toISOString(),
      close_date: null,
      solution: null,
      root_cause: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    incidentsData.push(newIncident);
    return newIncident;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const index = incidentsData.findIndex(incident => incident.id === id);
    if (index !== -1) {
      incidentsData[index] = {
        ...incidentsData[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return incidentsData[index];
    }
    throw new Error('Incident not found');
  },
  
  assign: async (id: string, technicalId: string, supervisorId: string) => {
    await delay();
    const index = incidentsData.findIndex(incident => incident.id === id);
    if (index !== -1) {
      incidentsData[index] = {
        ...incidentsData[index],
        id_technical: technicalId,
        id_supervisor: supervisorId,
        id_status: 'status-002', // En Proceso
        updated_at: new Date().toISOString(),
      };
      return incidentsData[index];
    }
    throw new Error('Incident not found');
  },
  
  close: async (id: string, solution: string, rootCause: string) => {
    await delay();
    const index = incidentsData.findIndex(incident => incident.id === id);
    if (index !== -1) {
      const updated = {
        ...incidentsData[index],
        id_status: 'status-003',
        solution,
        root_cause: rootCause,
        close_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      incidentsData[index] = updated as any;
      return updated as any;
    }
    throw new Error('Incident not found');
  },
  
  delete: async (id: string) => {
    await delay();
    const index = incidentsData.findIndex(incident => incident.id === id);
    if (index !== -1) {
      incidentsData.splice(index, 1);
      return true;
    }
    throw new Error('Incident not found');
  },
};

// ============= REPORTS API =============
export const reportsApi = {
  getAll: async () => {
    await delay();
    return reportsData;
  },
  
  getById: async (id: string) => {
    await delay();
    return reportsData.find(report => report.id === id);
  },
  
  getByIncidentId: async (incidentId: string) => {
    await delay();
    return reportsData.filter(report => report.id_incident === incidentId);
  },
  
  create: async (report: any) => {
    await delay();
    const newReport = {
      ...report,
      id: `report-${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    reportsData.push(newReport);
    return newReport;
  },
};

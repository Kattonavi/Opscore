// Legacy API stubs - no requieren apiClient real
// Estos endpoints no existen en el backend actual

/**
 * APIs Legacy - Stubs para compatibilidad temporal
 * TODO: Remover cuando los stores legacy sean actualizados
 * Estos endpoints no existen en el backend actual
 */

export const statusApi = {
  getAll: async () => {
    console.warn('[statusApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const prioritiesApi = {
  getAll: async () => {
    console.warn('[prioritiesApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const typesApi = {
  getAll: async () => {
    console.warn('[typesApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const rolesApi = {
  getAll: async () => {
    console.warn('[rolesApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const areasApi = {
  getAll: async () => {
    console.warn('[areasApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const companiesApi = {
  getAll: async () => {
    console.warn('[companiesApi] Legacy API call - endpoint not available');
    return [];
  },
};

export const reportsApi = {
  getAll: async () => {
    console.warn('[reportsApi] Legacy API call - endpoint not available');
    return [];
  },
  getById: async (id: number) => {
    console.warn('[reportsApi] Legacy API call - endpoint not available');
    return null;
  },
  create: async (data: any) => {
    console.warn('[reportsApi] Legacy API call - endpoint not available');
    return { id: Date.now(), ...data };
  },
};

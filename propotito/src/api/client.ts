import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Instancia de axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar el token JWT a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // No enviar token en endpoints de autenticación
      if (token && !config.url?.startsWith('/auth')) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Token added to request:', config.url);
      } else if (!token) {
        console.warn('[API] No token found for request:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Error response:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

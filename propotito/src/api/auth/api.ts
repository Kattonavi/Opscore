import apiClient from '../client';
import type { 
  LoginRequestDTO, 
  LoginResponseDTO,
  CreateUserRequestDTO,
  UserResponseDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
  ChangePasswordDTO
} from './types';

/**
 * API de Autenticación
 */
export const authApi = {
  // POST /auth/login
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Guardar token en localStorage
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Obtener token del localStorage
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Eliminar token (logout)
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  // Verificar si hay token válido
  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  },
};

/**
 * API de Usuarios
 * Algunos endpoints requieren rol ADMIN
 */
export const usersApi = {
  // POST /users - Crear usuario (solo ADMIN)
  create: async (userData: CreateUserRequestDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // GET /users - Obtener todos los usuarios (solo ADMIN)
  getAll: async (): Promise<UserResponseDTO[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // GET /users/me - Obtener usuario actual
  me: async (): Promise<UserResponseDTO> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // PATCH /users/{id}/role - Actualizar rol (solo ADMIN)
  updateRole: async (id: number, data: UpdateUserRoleDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.patch(`/users/${id}/role`, data);
    return response.data;
  },

  // PATCH /users/{id}/status - Actualizar estado (solo ADMIN)
  updateStatus: async (id: number, data: UpdateUserStatusDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.patch(`/users/${id}/status`, data);
    return response.data;
  },

  // PATCH /users/change-password - Cambiar contraseña
  changePassword: async (data: ChangePasswordDTO): Promise<void> => {
    await apiClient.patch('/users/change-password', data);
  },
};

// Exportar tipos para uso en hooks/components
export type AuthApi = typeof authApi;
export type UsersApi = typeof usersApi;

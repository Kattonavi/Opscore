import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usersApi } from '@/api';
import type { 
  UserResponseDTO, 
  CreateUserRequestDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
  ChangePasswordDTO
} from '@/api/auth/types';
import { Role } from '@/api/auth/types';

interface UsersState {
  users: UserResponseDTO[];
  currentUser: UserResponseDTO | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserRequestDTO) => Promise<UserResponseDTO>;
  updateUserRole: (id: number, data: UpdateUserRoleDTO) => Promise<void>;
  updateUserStatus: (id: number, data: UpdateUserStatusDTO) => Promise<void>;
  changePassword: (data: ChangePasswordDTO) => Promise<void>;
  clearError: () => void;
  
  // Computed
  getUsersByRole: (role: Role) => UserResponseDTO[];
  getActiveUsers: () => UserResponseDTO[];
  getTechnicians: () => UserResponseDTO[];
  getSupervisors: () => UserResponseDTO[];
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      loading: false,
      error: null,

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const users = await usersApi.getAll();
          set({ users, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al cargar usuarios', 
            loading: false 
          });
        }
      },

      createUser: async (data: CreateUserRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const newUser = await usersApi.create(data);
          set(state => ({
            users: [...state.users, newUser],
            loading: false,
          }));
          return newUser;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al crear usuario', 
            loading: false 
          });
          throw error;
        }
      },

      updateUserRole: async (id: number, data: UpdateUserRoleDTO) => {
        set({ loading: true, error: null });
        try {
          const updatedUser = await usersApi.updateRole(id, data);
          set(state => ({
            users: state.users.map(user => 
              user.id === id ? updatedUser : user
            ),
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al actualizar rol', 
            loading: false 
          });
          throw error;
        }
      },

      updateUserStatus: async (id: number, data: UpdateUserStatusDTO) => {
        set({ loading: true, error: null });
        try {
          const updatedUser = await usersApi.updateStatus(id, data);
          set(state => ({
            users: state.users.map(user => 
              user.id === id ? updatedUser : user
            ),
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al actualizar estado', 
            loading: false 
          });
          throw error;
        }
      },

      changePassword: async (data: ChangePasswordDTO) => {
        set({ loading: true, error: null });
        try {
          await usersApi.changePassword(data);
          set({ loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Error al cambiar contraseña', 
            loading: false 
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getUsersByRole: (role: Role) => {
        return get().users.filter(user => user.role === role);
      },

      getActiveUsers: () => {
        return get().users.filter(user => user.active);
      },

      getTechnicians: () => {
        return get().users.filter(user => user.role === Role.TECHNICIAN);
      },

      getSupervisors: () => {
        return get().users.filter(user => user.role === Role.SUPERVISOR);
      },
    }),
    {
      name: 'opscore-users-storage',
      partialize: (state) => ({
        users: state.users,
      }),
    }
  )
);

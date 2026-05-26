import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usersApi, rolesApi, companiesApi, areasApi } from '@/api';
import type { UserResponseDTO as User, RoleEntity as Role, Company, Area, CreateUserRequestDTO } from '@/api/types';

interface UsersState {
  users: User[];
  roles: Role[];
  companies: Company[];
  areas: Area[];
  loading: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchAreas: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getRoleById: (id: string) => Role | undefined;
  getAreaById: (id: string) => Area | undefined;
  createUser: (user: CreateUserRequestDTO) => Promise<User>;
  // updateUser: (id: string, data: Partial<User>) => Promise<User>;
  // deleteUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      roles: [],
      companies: [],
      areas: [],
      loading: false,
      error: null,

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const users = await usersApi.getAll();
          set({ users: users as User[], loading: false });
        } catch (error) {
          set({ error: 'Error al cargar usuarios', loading: false });
        }
      },

      fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
          const roles = await rolesApi.getAll();
          set({ roles, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar roles', loading: false });
        }
      },

      fetchCompanies: async () => {
        set({ loading: true, error: null });
        try {
          const companies = await companiesApi.getAll();
          set({ companies, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar empresas', loading: false });
        }
      },

      fetchAreas: async () => {
        set({ loading: true, error: null });
        try {
          const areas = await areasApi.getAll();
          set({ areas, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar áreas', loading: false });
        }
      },

      getUserById: (id: string) => {
        return get().users.find(user => String(user.id) === id);
      },

      getRoleById: (id: string | number) => {
        return get().roles.find(role => String(role.id) === String(id));
      },

      getAreaById: (id: string | number) => {
        return get().areas.find(area => String(area.id) === String(id));
      },

      createUser: async (userData: CreateUserRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const newUser = await usersApi.create(userData);
          set(state => ({
            users: [...state.users, newUser as User],
            loading: false,
          }));
          return newUser as User;
        } catch (error) {
          set({ error: 'Error al crear usuario', loading: false });
          throw error;
        }
      },

      // Nota: updateUser y deleteUser no están disponibles en el API actual
      // updateUser: async (id: string, data: Partial<User>) => { ... },
      // deleteUser: async (id: string) => { ... },
    }),
    {
      name: 'users-storage',
      partialize: (state) => ({
        users: state.users,
        roles: state.roles,
        companies: state.companies,
        areas: state.areas,
      }),
    }
  )
);

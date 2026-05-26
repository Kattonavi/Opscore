# 🏪 Module: Auth Store con Zustand

## 📋 Descripción
Implementar el store de autenticación usando Zustand con persistencia en localStorage.

## 🎯 Tareas

### 1. Crear Auth Store
**Archivo:** `features/auth/stores/auth-store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, usersApi } from '@/features/auth/api';
import type { LoginRequestDTO, UserResponseDTO } from '@/features/auth/api';

const STORE_VERSION = 1;

interface AuthState {
  version: number;
  isAuthenticated: boolean;
  user: UserResponseDTO | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequestDTO) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: UserResponseDTO) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      version: STORE_VERSION,
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          authApi.setToken(response.token);
          
          let currentUser = null;
          try {
            currentUser = await usersApi.me();
          } catch (e) {
            console.error('Error fetching user:', e);
          }
          
          set({
            isAuthenticated: true,
            token: response.token,
            user: currentUser,
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Error al iniciar sesión',
            loading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        authApi.removeToken();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      fetchCurrentUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const currentUser = await usersApi.me();
          set({ user: currentUser });
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'opscore-auth-storage',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      migrate: (persistedState: any, version: number) => {
        if (version !== STORE_VERSION) {
          return {
            version: STORE_VERSION,
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          } as any;
        }
        return persistedState;
      },
    }
  )
);

// Helper para debugging
export const clearAuthStorage = () => {
  localStorage.removeItem('opscore-auth-storage');
};
```

### 2. Crear Hook useAuth (Opcional)
**Archivo:** `features/auth/hooks/use-auth.ts`

```typescript
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    isAdmin: store.user?.role === 'ADMIN',
    fullName: `${store.user?.firstName} ${store.user?.lastName}`,
  };
};
```

## ✅ Checklist
- [ ] Zustand store creado
- [ ] Persist middleware configurado
- [ ] Migración de versiones implementada
- [ ] Método login funcional
- [ ] Método logout funcional
- [ ] Manejo de errores
- [ ] Estados de loading
- [ ] Helper clearAuthStorage
- [ ] Hook useAuth (opcional)

## 🔗 Relacionado con
- Epic #X - Feature Login
- Module #X - API Client

## 🌿 Rama
`feature/login/store`

---
**Estimación:** 1 día

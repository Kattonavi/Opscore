"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/api/auth";
import { usersApi } from "@/api/user";
import type { LoginRequestDTO, UserResponseDTO } from "@/api/types";

// Versión del store - incrementar cuando cambie la estructura
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

      login: async (credentials: LoginRequestDTO) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // Guardar token
          authApi.setToken(response.token);

          // Obtener datos del usuario actual
          let currentUser = null;
          try {
            currentUser = await usersApi.me();
            console.log("[AuthStore] User fetched:", currentUser);
          } catch (e) {
            console.error("Error fetching user data:", e);
          }

          set({
            isAuthenticated: true,
            token: response.token,
            user: currentUser,
            loading: false,
            error: null,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Object &&
            error !== null &&
            "response" in error &&
            (error as { response: { data: { message?: string } } }).response
              ?.data?.message;
          set({
            error: message || "Error al iniciar sesión",
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

      clearError: () => {
        set({ error: null });
      },

      fetchCurrentUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const currentUser = await usersApi.me();
          console.log("[AuthStore] Current user refreshed:", currentUser);
          set({ user: currentUser });
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      },

      setUser: (user: UserResponseDTO) => {
        set({ user });
      },
    }),
    {
      name: "opscore-auth-storage",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      // Migrate old stores without version
      migrate: (
        persistedState: unknown,
        version: number
      ) => {
        if (version !== STORE_VERSION) {
          console.log(
            "[AuthStore] Migrating from version",
            version,
            "to",
            STORE_VERSION
          );
          // Return initial state if versions don't match (forces re-login)
          return {
            version: STORE_VERSION,
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          } satisfies Partial<AuthState>;
        }
        return persistedState as AuthState;
      },
    }
  )
);

// Helper para limpiar manualmente el store (para debugging)
export const clearAuthStorage = () => {
  localStorage.removeItem("opscore-auth-storage");
  console.log("[AuthStore] Storage cleared");
};

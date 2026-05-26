"use client";

import apiClient from "@/api/client";
import type { LoginRequestDTO, LoginResponseDTO } from "@/api/types";

export type { LoginRequestDTO, LoginResponseDTO } from "@/api/types";

export const authApi = {
  /** POST /auth/login */
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  },

  /** Store token in localStorage */
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  /** Read token from localStorage */
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  /** Remove token (logout) */
  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  /** Quick check if a token exists */
  isAuthenticated: (): boolean => !!authApi.getToken(),
};

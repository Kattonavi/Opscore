"use client";

import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "@/stores/config-store";

// Base URL is read from NEXT_PUBLIC_API_URL at build time, with a localhost
// fallback for development. The per-request baseURL below (set in the request
// interceptor) lets the user override it at runtime from the config store.
const FALLBACK_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient: AxiosInstance = axios.create({
  baseURL: FALLBACK_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request when available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.assign("/login");
        }
      }
    } else if (error.request) {
      console.error("No se pudo conectar con el servidor");
    }

    return Promise.reject(error);
  },
);

export default apiClient;

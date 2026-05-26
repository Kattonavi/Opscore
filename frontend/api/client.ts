"use client";

import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "@/stores/config-store";
import { clearSessionState } from "@/lib/session-reset";

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

// Single-flight guard for 401 handling.
//
// Several requests can fail with 401 in the same tick (e.g. the dashboard
// fans out three parallel calls when the token has just expired). Without a
// guard, each rejection would call clearSessionState() and request a
// navigation, queuing multiple redirects and double-clearing the stores
// mid-render. Once we have started handling the first 401, every
// subsequent 401 in the same browsing session becomes a passthrough
// rejection (`isHandlingUnauthorized` resets when the new page loads).
//
// IMPORTANT: 403 is treated as an authorisation error for a specific
// action and does NOT trigger logout. The interceptor simply rejects so
// each caller can surface the error in place.
let isHandlingUnauthorized = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (
        status === 401 &&
        typeof window !== "undefined" &&
        !isHandlingUnauthorized
      ) {
        isHandlingUnauthorized = true;
        // Clear auth + every per-user store + sensitive localStorage keys.
        clearSessionState();
        // Avoid redirecting if we're already on the login page (e.g. the
        // login POST itself returned 401 because of bad credentials).
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

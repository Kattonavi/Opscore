import type { AxiosError } from "axios";

/**
 * Extract the meaningful error message from an Axios error response.
 * Falls back to a generic message if nothing structured is found.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;

  const axiosErr = err as AxiosError<{ message?: string }>;

  // Backend validation error or business-rule error
  const backendMsg = axiosErr.response?.data?.message;
  if (backendMsg && typeof backendMsg === "string") return backendMsg;

  // HTTP status text when no body
  if (axiosErr.response?.status) {
    const status = axiosErr.response.status;
    if (status === 403) return "No tenés permisos para esta acción";
    if (status === 401) return "Sesión expirada. Iniciá sesión de nuevo";
    if (status === 404) return "Recurso no encontrado";
    if (status >= 500) return "Error del servidor. Intentalo de nuevo";
  }

  // Network error (no response received)
  if (axiosErr.code === "ERR_NETWORK" || !axiosErr.response) {
    return "No se pudo conectar con el servidor";
  }

  return fallback;
}

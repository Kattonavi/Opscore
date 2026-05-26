import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiEnvironment = "local" | "prod";

// "prod" URL is read at build time from NEXT_PUBLIC_API_URL so the same code
// works on Railway, Vercel, or any other host. The hard-coded fallback is the
// legacy Render deployment and is kept only to avoid breaking older builds
// that never set the env var.
const PROD_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://opscoreapi.onrender.com";

export const API_URLS: Record<ApiEnvironment, string> = {
  local: "http://localhost:8080",
  prod: PROD_API_URL,
};

const VALID_API_URLS = new Set(Object.values(API_URLS));

const normalizeApiUrl = (url: string): string =>
  VALID_API_URLS.has(url) ? url : API_URLS.local;

interface ConfigState {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      apiBaseUrl: API_URLS.prod,
      setApiBaseUrl: (url) => set({ apiBaseUrl: normalizeApiUrl(url) }),
    }),
    {
      name: "opscore-config",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ apiBaseUrl: state.apiBaseUrl }),
    },
  ),
);

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("opscore-config");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { apiBaseUrl?: string } };
        const stored = parsed?.state?.apiBaseUrl;
        if (stored) return normalizeApiUrl(stored);
      }
    } catch {
      // ignore parse errors, fallback to store
    }
  }

  const state = useConfigStore.getState();
  return normalizeApiUrl(state.apiBaseUrl || API_URLS.prod);
};

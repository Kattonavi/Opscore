"use client";

import { useIncidentsStore } from "@/features/incidents/stores/incidents-store";

/**
 * Legacy persist keys that this build no longer writes to but that may
 * still exist in users' browsers from earlier deployments. They get
 * wiped on every session boundary to prevent stale data from leaking
 * back into a fresh session.
 */
const LEGACY_LOCAL_STORAGE_KEYS = [
  "opscore-incidents-storage",
];

/**
 * Clears every Zustand store that holds *user-specific* data, leaving the
 * auth store untouched. This module deliberately does NOT import
 * `useAuthStore` so it can be safely consumed from inside the auth store
 * (no circular import).
 *
 * Call sites:
 *   - `useAuthStore.login`  → before persisting a different user.
 *   - `AuthGuard`           → defensive wipe before redirecting to /login.
 *   - `clearSessionState`   → as part of the full logout flow.
 *
 * Preferences that are NOT touched here (and never should be):
 *   - `app-theme`        — visual preference, not user-bound.
 *   - `opscore-config`   — API base URL toggle, not user-bound.
 *   - `locale` cookie    — language preference.
 */
export function clearOtherStores(): void {
  useIncidentsStore.getState().reset();

  if (typeof window === "undefined") {
    return;
  }

  for (const key of LEGACY_LOCAL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Private mode / quota exceeded — best effort cleanup.
    }
  }
}

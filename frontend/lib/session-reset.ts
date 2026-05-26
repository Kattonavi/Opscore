"use client";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { clearOtherStores } from "@/lib/stores-reset";

/**
 * Storage keys removed from localStorage on every full session clear.
 * `token` mirrors the Authorization header used by the Axios client;
 * removing it stops any in-flight request from re-authenticating with
 * the previous user's credentials.
 */
const SENSITIVE_LOCAL_STORAGE_KEYS = [
  "token",
];

/**
 * Full session teardown — auth + every user-bound store + the legacy
 * persisted storage keys. Use this on:
 *   - explicit logout from the UI (`UserMenu`)
 *   - the 401 interceptor (token rejected by backend, expired session)
 *   - the AuthGuard fallback when a protected route is reached without
 *     a valid token after hydration.
 *
 * Non-sensitive preferences (theme, language, API base URL) are
 * preserved.
 */
export function clearSessionState(): void {
  // 1. Reset the auth store first so any subscribed component re-renders
  //    with `isAuthenticated=false` immediately.
  useAuthStore.getState().logout();

  // 2. Wipe data from every other store. `clearOtherStores` is the
  //    single source of truth for the per-user store list.
  clearOtherStores();

  // 3. Remove sensitive localStorage keys (the token may be persisted
  //    under a plain key in addition to the Zustand persisted blob).
  if (typeof window !== "undefined") {
    for (const key of SENSITIVE_LOCAL_STORAGE_KEYS) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Private mode / quota exceeded — best effort cleanup.
      }
    }
  }
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side route guard.
 * Waits for Zustand persist hydration, then checks auth state.
 * Redirects to /login if the user is not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  // Zustand persist hydration is async — wait before making auth decisions.
  // Start unhydrated (SSR-safe), then subscribe to hydration on mount.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check immediately in case persist already hydrated before mount
    if (useAuthStore.persist.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors external store hydration state on first client render; deliberate.
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  // On hydration with a valid token but no user data, fetch the profile
  useEffect(() => {
    if (hydrated && token && !useAuthStore.getState().user) {
      useAuthStore.getState().fetchCurrentUser();
    }
  }, [hydrated, token]);

  // Still hydrating — show nothing to avoid flash of redirect
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Hydrated but not authenticated — render nothing (redirect runs via effect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

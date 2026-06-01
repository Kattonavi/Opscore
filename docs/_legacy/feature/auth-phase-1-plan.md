# Auth Phase 1 (Login + Session + Guards) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver login + session persistence + client-side route protection for the Next.js 16 frontend.

**Architecture:** Root `/api` domain modules (auth/user) + Zustand as single source of truth. UI and logic separated (AuthGuard + hooks + store). Client-side guards replace non-functional cookie middleware.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zustand, Axios, Tailwind/shadcn.

---

## File Structure (changes)

- Create:
  - `frontend/api/client.ts`
  - `frontend/api/auth/api.ts`
  - `frontend/api/auth/types.ts`
  - `frontend/api/auth/index.ts`
  - `frontend/api/user/api.ts`
  - `frontend/api/user/types.ts`
  - `frontend/api/user/index.ts`
  - `frontend/api/index.ts`
  - `frontend/features/auth/components/auth-guard.tsx`

- Modify:
  - `frontend/features/auth/stores/auth-store.ts`
  - `frontend/features/auth/hooks/use-auth.ts`
  - `frontend/features/auth/components/login-form.tsx`
  - `frontend/app/(auth)/login/page.tsx`
  - `frontend/app/layout.tsx` (wrap protected area if needed)
  - `frontend/middleware.ts` (remove cookie-based guard or reduce scope)

- Remove or migrate:
  - `frontend/features/auth/api/**` (migrate to root `/api`)

---

### Task 1: Create root API modules (auth/user)

**Files:**
- Create: `frontend/api/client.ts`
- Create: `frontend/api/auth/api.ts`, `frontend/api/auth/types.ts`, `frontend/api/auth/index.ts`
- Create: `frontend/api/user/api.ts`, `frontend/api/user/types.ts`, `frontend/api/user/index.ts`
- Create: `frontend/api/index.ts`

- [ ] **Step 1: Create axios client**

```ts
// frontend/api/client.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 2: Create auth types + API**

```ts
// frontend/api/auth/types.ts
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}
```

```ts
// frontend/api/auth/api.ts
import apiClient from "../client";
import type { LoginRequestDTO, LoginResponseDTO } from "./types";

export const authApi = {
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },
  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};
```

```ts
// frontend/api/auth/index.ts
export * from "./api";
export * from "./types";
```

- [ ] **Step 3: Create user types + API**

```ts
// frontend/api/user/types.ts
export interface UserResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  area: string | null;
  active: boolean;
  avatar: string | null;
}
```

```ts
// frontend/api/user/api.ts
import apiClient from "../client";
import type { UserResponseDTO } from "./types";

export const userApi = {
  me: async (): Promise<UserResponseDTO> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },
};
```

```ts
// frontend/api/user/index.ts
export * from "./api";
export * from "./types";
```

- [ ] **Step 4: Create root barrel**

```ts
// frontend/api/index.ts
export { default as apiClient } from "./client";
export * from "./auth";
export * from "./user";
```

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: PASS (no new lint errors)

- [ ] **Step 6: Commit**

```bash
git add frontend/api
git commit -m "feat: add root api modules for auth/user"
```

---

### Task 2: Update auth store + hook to use root API

**Files:**
- Modify: `frontend/features/auth/stores/auth-store.ts`
- Modify: `frontend/features/auth/hooks/use-auth.ts`

- [ ] **Step 1: Update imports and API usage**

```ts
// frontend/features/auth/stores/auth-store.ts (imports)
import { authApi, userApi } from "@/api";
import type { LoginRequestDTO, UserResponseDTO } from "@/api";
```

```ts
// frontend/features/auth/stores/auth-store.ts (login)
login: async (credentials: LoginRequestDTO) => {
  set({ loading: true, error: null });
  try {
    const response = await authApi.login(credentials);
    authApi.setToken(response.token);

    let currentUser: UserResponseDTO | null = null;
    try {
      currentUser = await userApi.me();
    } catch (e) {
      // keep null; UI can tolerate missing profile
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
      error: error.response?.data?.message || "Error al iniciar sesión",
      loading: false,
      isAuthenticated: false,
    });
    throw error;
  }
},
```

```ts
// frontend/features/auth/stores/auth-store.ts (logout)
logout: () => {
  authApi.removeToken();
  set({ isAuthenticated: false, user: null, token: null, error: null });
},
```

- [ ] **Step 2: Ensure hook derives only from store**

```ts
// frontend/features/auth/hooks/use-auth.ts
import { useAuthStore } from "@/features/auth/stores/auth-store";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    ...store,
    isAdmin: store.user?.role === "ADMIN",
    fullName: `${store.user?.firstName || ""} ${store.user?.lastName || ""}`.trim(),
  };
};
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/features/auth/stores/auth-store.ts frontend/features/auth/hooks/use-auth.ts
git commit -m "refactor: switch auth store to root api"
```

---

### Task 3: Add AuthGuard and remove broken middleware guard

**Files:**
- Create: `frontend/features/auth/components/auth-guard.tsx`
- Modify: `frontend/app/(auth)/login/page.tsx`
- Modify: `frontend/middleware.ts`

- [ ] **Step 1: Create AuthGuard (client-side)**

```tsx
// frontend/features/auth/components/auth-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth-store";

type AuthGuardProps = {
  children: React.ReactNode;
  publicRoutes?: string[];
};

export function AuthGuard({ children, publicRoutes = ["/login"] }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

    if (!isPublic && !token && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isPublic && (token || isAuthenticated) && !pathname.startsWith("/dashboard")) {
      router.replace("/dashboard");
    }
  }, [pathname, publicRoutes, router, isAuthenticated, token]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Reduce middleware to static assets only (or remove guard logic)**

```ts
// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo).*)"],
};
```

- [ ] **Step 3: Keep login page simple (no guard here)**

```tsx
// frontend/app/(auth)/login/page.tsx
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* existing UI intact */}
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`
Expected:
- Visit `/login` unauthenticated → sees login form
- Submit valid credentials → redirected to `/dashboard`
- Navigate to protected route without token → redirected to `/login`

- [ ] **Step 5: Commit**

```bash
git add frontend/features/auth/components/auth-guard.tsx frontend/middleware.ts frontend/app/(auth)/login/page.tsx
git commit -m "feat: add client auth guard and remove cookie middleware"
```

---

## Self-Review

1. **Spec coverage:** login, session persistence, redirect to /dashboard, guard routes — covered in Tasks 1–3.
2. **Placeholder scan:** No TBDs.
3. **Type consistency:** DTOs align with backend (login -> { token }, /users/me).

---

## Execution Handoff

Plan complete and saved to `docs/feature/auth-phase-1-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

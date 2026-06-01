# Config Tabs + API URL Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Configuración to tabs and add an API URL selector (local/prod) with live switching and a health check.

**Architecture:** Introduce a small persisted config store for the selected API base URL. API client reads the base URL on each request (interceptor) for real-time switching. Configuración page reorganized into tabs and adds a URL select + health check button.

**Tech Stack:** Next.js 16, Zustand (persist), Axios, Base UI Select.

---

## File Structure / Responsibilities

- `frontend/stores/config-store.ts` — persisted config (apiBaseUrl) with getters/setters.
- `frontend/api/client.ts` — uses config store to set `baseURL` per request.
- `frontend/app/(dashboard)/dashboard/configuracion/page.tsx` — tabs layout + API URL select + health check UI.

## Task 1: Add Config Store for API Base URL

**Files:**
- Create: `frontend/stores/config-store.ts`

- [ ] **Step 1: Create store with persisted apiBaseUrl**

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiEnvironment = "local" | "prod";

export const API_URLS: Record<ApiEnvironment, string> = {
  local: "http://localhost:8080",
  prod: "https://opscoreapi.onrender.com",
};

interface ConfigState {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      apiBaseUrl: API_URLS.local,
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
    }),
    {
      name: "opscore-config",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ apiBaseUrl: state.apiBaseUrl }),
    },
  ),
);

export const getApiBaseUrl = (): string => {
  const state = useConfigStore.getState();
  return state.apiBaseUrl || API_URLS.local;
};
```

- [ ] **Step 2: Manual verification**

Open devtools console and run:

```js
useConfigStore.getState().apiBaseUrl
```

Expected: `http://localhost:8080` on first load, and persists after reload if changed.

---

## Task 2: Make API Client Use Selected Base URL (Live)

**Files:**
- Modify: `frontend/api/client.ts`

- [ ] **Step 1: Inject baseURL per request using store getter**

```ts
import { getApiBaseUrl } from "@/stores/config-store";

// inside request interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    // existing token logic…
    return config;
  },
  (error) => Promise.reject(error),
);
```

- [ ] **Step 2: Manual verification**

Switch URL in Configuración and trigger any API call (e.g., refresh users list). Verify request goes to the selected host in the browser Network tab.

---

## Task 3: Convert Configuración to Tabs + Add URL Selector + Health Check

**Files:**
- Modify: `frontend/app/(dashboard)/dashboard/configuracion/page.tsx`

- [ ] **Step 1: Convert stacked cards to Tabs**

Replace the page layout with Tabs containing three sections:

```tsx
<Tabs defaultValue="appearance">
  <TabsList>
    <TabsTrigger value="appearance">Apariencia</TabsTrigger>
    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
    <TabsTrigger value="info">Información</TabsTrigger>
  </TabsList>

  <TabsContent value="appearance">…</TabsContent>
  <TabsContent value="notifications">…</TabsContent>
  <TabsContent value="info">…</TabsContent>
</Tabs>
```

- [ ] **Step 2: Add URL selector + health check in Info tab**

Use existing Select component and wire it to the config store:

```tsx
const { apiBaseUrl, setApiBaseUrl } = useConfigStore();
const [healthStatus, setHealthStatus] = useState<"idle"|"ok"|"error"|"loading">("idle");

const handleCheck = async () => {
  setHealthStatus("loading");
  try {
    await fetch(`${apiBaseUrl}/health`);
    setHealthStatus("ok");
  } catch {
    setHealthStatus("error");
  }
};
```

Select UI:

```tsx
<Select value={apiBaseUrl} onValueChange={setApiBaseUrl}>
  <SelectTrigger>
    {apiBaseUrl}
  </SelectTrigger>
  <SelectPopup>
    <SelectList>
      <SelectItem value="http://localhost:8080">
        <SelectItemText>Local</SelectItemText>
      </SelectItem>
      <SelectItem value="https://opscoreapi.onrender.com">
        <SelectItemText>Producción</SelectItemText>
      </SelectItem>
    </SelectList>
  </SelectPopup>
</Select>
```

Health button:

```tsx
<Button onClick={handleCheck} disabled={healthStatus === "loading"}>
  Probar conexión
</Button>
{healthStatus === "ok" && <Badge variant="secondary">OK</Badge>}
{healthStatus === "error" && <Badge variant="destructive">Error</Badge>}
```

- [ ] **Step 3: Manual verification**

1. Open Configuración → Información.
2. Switch between Local/Producción, verify persisted after reload.
3. Click “Probar conexión” and see OK/error badge.

---

## Plan Self‑Review

**Spec coverage:** Tabs layout, URL selector, persistence, live baseURL switching, health check all mapped in tasks.
**Placeholders:** None.
**Type consistency:** `apiBaseUrl` is `string`, used across store + client + UI.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-22-config-tabs-api-url-selector.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

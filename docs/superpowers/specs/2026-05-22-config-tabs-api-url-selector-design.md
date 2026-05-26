# Config Tabs + API URL Selector (Design)

## Goal
Update the **Configuración** page to use tabs instead of stacked cards, and add an API URL selector (local vs production) with real‑time switching and a “health check” button.

## Scope
- Convert Configuración layout from cards to tabs.
- Add API URL selector in **Información** tab.
- Persist selected API URL like theme/language preferences.
- Update API client baseURL in real time (no reload).
- Add a “Probar conexión” button that calls `GET /health` and displays status.

Out of scope:
- Backend changes.
- Additional environment options beyond local/prod.

## UX / UI
### Tabs
Tabs: **Apariencia**, **Notificaciones**, **Información**.
- Each tab retains the current content, only reorganized into tabs.

### Información Tab
Replace “URL” row with:
- A select dropdown labeled “URL de la API”.
- Options:
  - **Local**: `http://localhost:8080`
  - **Producción**: `https://opscoreapi.onrender.com`
- Button: **Probar conexión**
  - On click, call `GET /health` using the selected baseURL.
  - Show result: OK (green) or error (red) with brief message.

## Data Flow & State
- Create a small **Config Store** (Zustand + persist) for:
  - `apiBaseUrl` (string)
  - `setApiBaseUrl(url)`
  - `healthStatus` + `lastCheckedAt` (optional)

- API client (`api/client.ts`) must read baseURL from store **dynamically**:
  - Use a helper function `getApiBaseUrl()` in the store.
  - On each request, set `config.baseURL` in the request interceptor.
  - No reload required.

## Error Handling
- If `/health` fails, show a short error: “No se pudo conectar”.
- If URL is invalid, show “URL inválida”.

## Testing / Verification
- Switch URL and make any API call → should hit the selected host.
- Press “Probar conexión” → shows success/failure.
- Reload app → selection persists.

## Files to Change
- `frontend/app/(dashboard)/dashboard/configuracion/page.tsx`
- `frontend/components/ui/select.tsx` (if needed for styling only)
- `frontend/api/client.ts` (dynamic baseURL)
- `frontend/features/*` or `frontend/stores/*` (new config store)

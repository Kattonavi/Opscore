# Suite E2E — OpsCore

Guía operativa de las pruebas E2E introducidas en la Fase 4.

## Resumen

| Spec | Proyecto | Cubre |
|---|---|---|
| `tests/login.spec.ts` | `api` | Smoke de `POST /auth/login` con el admin. |
| `tests/users.spec.ts` | `api` | CRUD básico de usuarios, RBAC del endpoint `/users`. |
| `tests/incidents.spec.ts` | `api` | CRUD básico de incidentes + camino feliz reparado para Fase 2. |
| `tests/incident-workflow.api.spec.ts` | `api` | **Ciclo de vida completo** OPEN→ASSIGNED→IN_PROGRESS→ON_HOLD→IN_PROGRESS→RESOLVED→CLOSED + rama CANCEL + rechazos 409 en estados terminales. |
| `tests/incident-rbac.api.spec.ts` | `api` | RBAC por rol: MANAGER, SUPERVISOR (con nota de scope área), TECHNICIAN asignado, TECHNICIAN no asignado, OPERATOR. |
| `tests/session-isolation.ui.spec.ts` | `ui` | UI: cambio de usuario sin flash de datos del anterior, borrado de token → redirect, 403 no expulsa. |

## Pre-requisitos

1. Backend disponible en `E2E_API_URL` (default `http://localhost:8080`).
2. Frontend disponible en `E2E_BASE_URL` (default `http://localhost:3000`) — solo necesario para el proyecto `ui`.
3. Base de datos sembrada con el admin del backend (`OPSCORE_SEED_ENABLED=true` en el primer arranque o el seeder Java).
4. Para el proyecto `ui`: navegadores Playwright instalados — `npm run install:browsers`.

## Helpers compartidos

Viven en `tests/helpers/`:

- `env.ts` — lectura tipada de variables de entorno + `ROLE_IDS`.
- `auth.ts` — `apiLogin(request, creds)` y `adminLogin(request)`.
- `users.ts` — `ensureUserWithRole(request, adminToken, role, areaId?)` idempotente y `ensureUserAndLogin(...)`.
- `incidents.ts` — `createIncident`, `assignIncident`, `transitionIncident('start'|'hold'|'resolve'|'close'|'cancel')`, `getIncident`, `getAssignments`, `getTimeline`.

El archivo `tests/test-utils.ts` queda como **shim** de compatibilidad con
los tests legados; nuevas specs deben importar directamente desde
`helpers/*`.

## Variables de entorno

Ver `qa/.env.example`. Resumen:

```ini
E2E_API_URL=http://localhost:8080
E2E_BASE_URL=http://localhost:3000

# Admin (obligatorios)
E2E_ADMIN_EMAIL=admin@opscore.com
E2E_ADMIN_PASSWORD=abcd1234

# Opcionales — para reusar usuarios preexistentes en lugar de bootstrap
# E2E_MANAGER_EMAIL=...
# E2E_MANAGER_PASSWORD=...
# (mismo patrón para SUPERVISOR, TECHNICIAN, OPERATOR)

E2E_ROLE_ID_ADMIN=1
E2E_ROLE_ID_MANAGER=2
E2E_ROLE_ID_SUPERVISOR=3
E2E_ROLE_ID_TECHNICIAN=4
E2E_ROLE_ID_OPERATOR=5
```

## Comandos

### Local

```bash
# Sólo el proyecto API (no requiere navegador):
npx playwright test --project=api

# Proyecto UI (después de instalar binarios):
npm run install:browsers
npx playwright test --project=ui

# Listar todas las specs sin ejecutarlas:
npx playwright test --list

# Una sola spec:
npx playwright test tests/incident-workflow.api.spec.ts

# Modo UI interactivo:
npx playwright test --ui

# Reporte HTML:
npx playwright show-report
```

### Railway

Linux / macOS:
```bash
E2E_API_URL=https://opscore-api.up.railway.app \
E2E_BASE_URL=https://opscore-frontend.up.railway.app \
npx playwright test --project=api
```

Windows PowerShell:
```powershell
$env:E2E_API_URL="https://opscore-api.up.railway.app"
$env:E2E_BASE_URL="https://opscore-frontend.up.railway.app"
npx playwright test --project=api
```

## Bootstrapping de usuarios

`ensureUserWithRole` aplica esta lógica:

1. Si la env var `E2E_<ROLE>_EMAIL` / `_PASSWORD` está definida, se usa
   esa cuenta sin crear nada nuevo.
2. Si no, se intenta encontrar el usuario determinista
   `e2e-<rol>@opscore.local` listando `/users` con el admin token.
3. Si tampoco existe, se crea con `POST /users` (sólo el admin puede)
   con `password = E2eTest1234!`.

Esta estrategia mantiene Railway limpio entre runs y evita 400 "Email
already exists" en re-ejecuciones.

## Datos de prueba y limpieza

- **Incidentes E2E:** título prefijado con `E2E - ` (visible en el
  Board). Estado final puede ser CLOSED / CANCELED.
- **Usuarios E2E:** email `e2e-<rol>@opscore.local`. Password `E2eTest1234!`.
- **No hay endpoint público de delete.** Si el entorno acumula ruido,
  ejecutar manualmente:

```sql
-- En orden, por FKs:
DELETE FROM incident_logs
  WHERE incident_id IN (SELECT id FROM incidents WHERE title LIKE 'E2E - %');
DELETE FROM assignments
  WHERE incident_id IN (SELECT id FROM incidents WHERE title LIKE 'E2E - %');
DELETE FROM incidents
  WHERE title LIKE 'E2E - %';
DELETE FROM users
  WHERE email LIKE 'e2e-%@opscore.local';
```

## Limitaciones conocidas

- **SUPERVISOR scope por área:** la regla server-side (Fase 2) exige
  misma área para asignar. El bootstrap por defecto crea SUPERVISOR sin
  área, por lo que el test `SUPERVISOR puede asignar (scope área…)`
  acepta tanto 200 como 403 y se documenta como tal. Para probar el
  caso negativo (técnico de otra área) definí explícitamente usuarios
  con `areaId` o usá `E2E_SUPERVISOR_EMAIL` apuntando a una cuenta con
  área.
- **Proyecto `ui` requiere navegadores Playwright.** Si vas a un
  entorno CI sin ellos, agregá `npm run install:browsers` al pipeline.
- **No se ejecutó la suite E2E real en este repo** durante la Fase 4 —
  solo `--list` y `lint/build`. Para validar contra Railway o local
  con datos reales, seguí los comandos de arriba.

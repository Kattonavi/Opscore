# Roles & Permissions — OpsCore

> Status: design phase. All rules described here are enforced **server-side**. The frontend mirrors them for UX only and is never the security boundary.

## 1. Roles

| Role | Purpose |
|---|---|
| **ADMIN** | Platform owner. Manages users and access; full operational visibility. |
| **MANAGER** | Plant-wide operations. Assigns across areas, closes/cancels incidents, reads KPIs. |
| **SUPERVISOR** | Owns one operational area. Assigns within their area, closes/cancels, resets passwords in their area. |
| **TECHNICIAN** | Executes fixes on incidents assigned to them. |
| **OPERATOR** | Reports incidents from the floor and tracks their own reports. |

## 2. Permission Matrix

| Capability | ADMIN | MANAGER | SUPERVISOR | TECHNICIAN | OPERATOR |
|---|:---:|:---:|:---:|:---:|:---:|
| Create incident | ❌ | ❌ | ❌ | ❌ | ✅ |
| View all incidents | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own reported incidents | — | — | — | — | ✅ |
| View incidents assigned to me | — | — | — | ✅ | — |
| Assign / reassign technician | ✅ | ✅ | ✅ (own area) | ❌ | ❌ |
| Start / Hold / Resume / Resolve | ❌ | ❌ | ❌ | ✅ (if assigned) | ❌ |
| Close | ✅ | ✅ | ✅ (own area) | ❌ | ❌ |
| Cancel / mark false alarm | ✅ | ✅ | ✅ (own area) | ❌ | ❌ |
| Add timeline annotation | ✅ | ✅ | ✅ | ✅ (own) | ✅ (own) |
| View KPI dashboards | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change role | ✅ | ❌ | ❌ | ❌ | ❌ |
| Activate / deactivate user | ✅ | ❌ | ❌ | ❌ | ❌ |
| Administrative password reset | ✅ | ❌ | ✅ (own area) | ❌ | ❌ |
| Update own profile / password | ✅ | ✅ | ✅ | ✅ | ✅ |

> "Own area" means the rule is additionally constrained to users/incidents in the supervisor's `area_id`.

## 3. Canonical Business Rules

These seven rules are the heart of the authorization model and are enforced in the service layer, independent of any `@PreAuthorize` annotation.

1. **Only OPERATOR can create incidents.** Any other role on `POST /incidents` receives `403` — *"Solo los usuarios con rol operador pueden crear incidentes."*
2. **The reporter is always the authenticated user.** `reportedById`, `assignedToId`, and `supervisorId` in the creation body are ignored — no impersonation, no pre-assignment.
3. **Assignment targets only active TECHNICIAN accounts.** Assigning any other role returns `409`; an inactive technician is rejected — *"No se puede asignar un incidente a un técnico inactivo."*
4. **Assignment is blocked on RESOLVED, CLOSED, and CANCELED incidents** (enforced on backend and frontend).
5. **Technicians act only on incidents assigned to them.** Acting on another's incident returns `403` — *"No puedes modificar este incidente porque no está asignado a ti."*
6. **Administrative roles never perform technician actions.** ADMIN/MANAGER/SUPERVISOR cannot `start`/`hold`/`resolve` as if they were the assignee.
7. **Supervisors operate area-scoped for every privileged action** — assign, reassign, close, cancel (including false-alarm), and administrative password reset are permitted only within the supervisor's own area. A SUPERVISOR acting on an incident or user outside their area receives `403`. ADMIN and MANAGER act plant-wide.

## 4. Lifecycle Authorization

| Transition | Allowed role | Precondition |
|---|---|---|
| create → `OPEN` | OPERATOR | — |
| `OPEN` → `ASSIGNED` (assign) | ADMIN / MANAGER / SUPERVISOR (own area) | target is active TECHNICIAN |
| reassign → `ASSIGNED` | ADMIN / MANAGER / SUPERVISOR (own area) | source ∈ {`OPEN`,`ASSIGNED`,`IN_PROGRESS`,`ON_HOLD`}; target is active TECHNICIAN |
| `ASSIGNED` → `IN_PROGRESS` (start) | assigned TECHNICIAN | caller == assignee |
| `IN_PROGRESS` → `ON_HOLD` (hold) | assigned TECHNICIAN | caller == assignee |
| `ON_HOLD` → `IN_PROGRESS` (resume) | assigned TECHNICIAN | caller == assignee |
| `IN_PROGRESS` → `RESOLVED` (resolve) | assigned TECHNICIAN | caller == assignee |
| `RESOLVED` → `CLOSED` (close) | ADMIN / MANAGER / SUPERVISOR (own area) | — |
| any non-terminal → `CANCELED` (cancel, optional false-alarm) | ADMIN / MANAGER / SUPERVISOR (own area) | — |

`CLOSED` and `CANCELED` are terminal — no further transitions. `RESOLVED` transitions **only** to `CLOSED` (it cannot be reassigned, restarted, or canceled directly).

**Reassignment resets the status to `ASSIGNED`.** When an `IN_PROGRESS` or `ON_HOLD` incident is reassigned, the newly assigned technician must explicitly `start` it again. Every reassignment records an `assignments` history row (with `previousAssignedToId`) and a `REASSIGNED` audit event.

## 5. Endpoint Authorization

Coarse role gating is declared with `@PreAuthorize` on controllers; fine-grained ownership/area/lifecycle checks run in services. See the per-endpoint role column in the [API Contract](api-contract.md).

| Endpoint group | Gate |
|---|---|
| `POST /incidents` | OPERATOR only |
| `POST /incidents/{id}/assign` (assign + reassign) | ADMIN / MANAGER / SUPERVISOR (own area) + active-technician + non-terminal checks |
| `PATCH /incidents/{id}/{start\|hold\|resume\|resolve}` | TECHNICIAN + assignee check |
| `PATCH /incidents/{id}/{close\|cancel}` | ADMIN / MANAGER / SUPERVISOR (own area) |
| `GET /incidents*` | All, results filtered by role/scope |
| `POST /users`, `PATCH /users/{id}/{role\|status}` | ADMIN |
| `PATCH /users/{userId}/change-password` | ADMIN, or SUPERVISOR within area |
| `GET /dashboard/*` | ADMIN / MANAGER / SUPERVISOR (OPERATOR/TECHNICIAN → `403`) |

## 6. Data Visibility

| Role | Incident list returns |
|---|---|
| ADMIN / MANAGER | All incidents. |
| SUPERVISOR | All incidents (assignment/admin actions are area-scoped). |
| TECHNICIAN | Only incidents assigned to them. |
| OPERATOR | Only incidents they reported. |

Visibility is enforced server-side; requesting an out-of-scope `GET /incidents/{id}` returns `404`/`403` rather than leaking data.

## 7. Frontend RBAC (UX mirror)

`frontend/lib/rbac.ts` reflects this matrix to hide controls the user cannot use. It improves the experience but grants nothing — the backend re-checks every action. On logout, all client stores are reset to prevent cross-role data leakage.

## 8. Defense in Depth

Two independent layers must both allow an action:
1. **Declarative** — `@PreAuthorize` role check at the controller.
2. **Imperative** — business rule (ownership, area, lifecycle, active status) in the service.

A gap in one layer cannot silently grant access, because the other still applies.

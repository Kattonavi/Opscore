# Product Requirements — OpsCore

> Status: design phase. This document is the authoritative scope reference for the rebuild. Implementation follows the [Development Roadmap](development-roadmap.md).

## 1. Problem Statement

An industrial plant with ~400 operators records machine failures, accidents, and quality deviations on paper or through WhatsApp. The consequences:

- **No traceability** — nobody knows who reported what, who is responsible, or when an incident was resolved.
- **No measurement** — response and resolution times are not captured, so operations cannot be improved.
- **Recurring root causes** — the same failures repeat because there is no systematic record or analysis.

OpsCore digitizes this flow into a structured, role-based, auditable system.

## 2. Goals

| # | Goal | Measured by |
|---|---|---|
| G1 | Every incident is reported through a single structured channel. | 100% of incidents created via the platform (no side channels). |
| G2 | Every incident has a clear owner at every stage. | Each non-terminal incident has a defined responsible party. |
| G3 | Every action is auditable. | 100% of state transitions recorded with author + timestamp. |
| G4 | Response and resolution times are measurable. | KPIs available per period, area, and priority. |
| G5 | Access is governed by role. | No user can perform an action outside their role's permissions. |

### Non-Goals (this iteration)

- Structured root-cause analysis workflow (5-whys, fishbone). Incidents capture type, area, and timeline annotations only.
- File / photo attachments on incidents.
- Real-time push notifications (WebSocket / SSE).
- Native mobile applications. The web frontend is responsive and mobile-usable.
- Multi-tenant / multi-plant isolation. A single plant is assumed.

## 3. Personas

| Persona | Role | Context | Primary need |
|---|---|---|---|
| **Line Operator** | `OPERATOR` | On the production floor, often on a phone. | Report a failure in seconds and follow its progress. |
| **Shift Supervisor** | `SUPERVISOR` | Responsible for an operational area. | Triage incoming incidents and assign the right technician in their area. |
| **Plant Manager** | `MANAGER` | Oversees plant operations across areas. | Assign across areas, close incidents, and read KPIs to spot patterns. |
| **Maintenance Technician** | `TECHNICIAN` | Executes the fix. | See only their assigned work and move it through the lifecycle. |
| **System Administrator** | `ADMIN` | Owns the platform. | Manage users, roles, and access; full operational visibility. |

## 4. User Stories

### Operator
- As an operator, I can create an incident with title, description, type, priority, and area so the right people are alerted.
- As an operator, I can only see the incidents I reported, so my view stays relevant.
- As an operator, I am always recorded as the reporter and cannot report on someone else's behalf.

### Supervisor
- As a supervisor, I can view all incidents and assign an active technician in my area.
- As a supervisor, I can close or cancel incidents in my scope.
- As a supervisor, I can reset a password for a user in my area.

### Manager
- As a manager, I can view and assign incidents across all areas.
- As a manager, I can close or cancel any incident.
- As a manager, I can read KPI dashboards to detect recurring patterns.

### Technician
- As a technician, I see only incidents assigned to me.
- As a technician, I can start, put on hold, and resolve my assigned incidents.
- As a technician, I cannot act on an incident that is not assigned to me.

### Administrator
- As an admin, I can create users and assign roles and areas.
- As an admin, I can activate or deactivate any user.
- As an admin, I can reset any user's password.

### All authenticated users
- I can log in and receive a session token.
- I can update my own first/last name and change my own password.

## 5. Functional Requirements

### FR-1 Authentication
- FR-1.1 Users authenticate with email + password and receive a JWT.
- FR-1.2 All endpoints except login require a valid token.
- FR-1.3 Inactive users cannot authenticate.

### FR-2 Incident Reporting
- FR-2.1 Only `OPERATOR` can create incidents.
- FR-2.2 The reporter is always the authenticated user; client-supplied reporter/assignee/supervisor fields are ignored at creation.
- FR-2.3 An incident requires title, description, type, and priority; area is optional but recommended.
- FR-2.4 New incidents start in `OPEN`.

### FR-3 Assignment
- FR-3.1 `ADMIN`, `MANAGER`, and `SUPERVISOR` can assign incidents. Supervisors are scoped to their own area.
- FR-3.2 Assignment targets only **active** `TECHNICIAN` accounts.
- FR-3.3 Assignment is blocked on `RESOLVED`, `CLOSED`, and `CANCELED` incidents.
- FR-3.4 Assigning moves `OPEN → ASSIGNED`; reassigning is permitted on non-terminal incidents and records the supervisor.
- FR-3.5 Every assignment is recorded in assignment history.

### FR-4 Lifecycle
- FR-4.1 The state machine is the single source of truth and is enforced on both backend and frontend.
- FR-4.2 Only the **assigned** technician may `start`, `hold`, and `resolve`.
- FR-4.3 `ADMIN`/`MANAGER`/`SUPERVISOR` may `close` and `cancel`; they never perform technician actions.
- FR-4.4 `CLOSED` and `CANCELED` are terminal. `RESOLVED` transitions only to `CLOSED`.
- FR-4.5 `resolvedAt` is stamped on resolution.

### FR-5 Audit Timeline
- FR-5.1 Every transition (created, assigned, reassigned, started, put on hold, resolved, closed, canceled) is logged with action, author, and timestamp.
- FR-5.2 Users can add free-text annotations to an incident's timeline.
- FR-5.3 The timeline is read-only and append-only.

### FR-6 User Administration
- FR-6.1 `ADMIN` can create users, change roles, and toggle active status.
- FR-6.2 `ADMIN` (any user) and `SUPERVISOR` (own area) can administratively reset passwords.
- FR-6.3 Passwords are stored as BCrypt hashes and never returned in any response.

### FR-7 Dashboards & KPIs
- FR-7.1 Provide status distribution, priority distribution, and per-area counts.
- FR-7.2 Dashboards are filtered by the caller's role and scope.

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | Stateless JWT auth; method-level RBAC plus service-layer business checks (defense in depth); BCrypt hashing; environment-driven CORS allow-list. |
| **Reliability** | A failed side effect (e.g. email) must never abort the primary operation. |
| **Usability** | Reporting flow usable on a phone; UI available in es / en / pt. |
| **Performance** | List endpoints paginated; common queries indexed. |
| **Observability** | Health endpoint for liveness probes; structured logging. |
| **Maintainability** | Layered backend, typed frontend, documented API contract. |
| **Portability** | Containerised services; configuration via environment variables. |

## 7. Success Metrics (KPIs)

- **Mean time to assignment** — time from `OPEN` to `ASSIGNED`.
- **Mean time to resolution** — time from creation to `RESOLVED`.
- **Resolution rate per period** — closed vs. opened.
- **Incident volume by type, area, and priority**.
- **Reopen / cancel rate** — quality signal on triage and execution.

## 8. Scope Summary

**In scope:** authentication, incident reporting, assignment, lifecycle management, audit timeline, RBAC, user administration, KPI dashboards, i18n.

**Out of scope (this iteration):** RCA workflow, attachments, real-time notifications, native mobile, multi-plant, login rate-limiting/lockout, dedicated user-admin audit table.

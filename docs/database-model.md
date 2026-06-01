# Database Model — OpsCore

> Status: design phase. Target database: **PostgreSQL 16+**. Types below use PostgreSQL conventions; the backend maps them through Spring Data JPA / Hibernate.

> **Timestamp convention:** every timestamp column is `TIMESTAMPTZ` and stores **UTC**. The application persists in UTC and serializes ISO-8601 in API responses (see [API Contract](api-contract.md)). This keeps time-based KPIs correct across shifts.

## 1. Entity-Relationship Overview

```
            ┌─────────┐         ┌─────────┐
            │  roles  │         │  areas  │
            └────┬────┘         └────┬────┘
                 │ 1                 │ 1
                 │                   ├──────────────┐
                 │ *                 │ *            │ *
            ┌────┴───────────────────┴───┐         │
            │           users            │         │
            └────┬───────────┬───────────┘         │
       reported_by│  assigned_to│ supervisor_id     │ area_id
                 *│           *│           *        │
            ┌─────┴────────────┴────────────────────┴────┐
            │                 incidents                   │
            └───┬───────────────────────────┬────────────┘
              1 │                          1 │
                │ *                          │ *
        ┌───────┴────────┐          ┌────────┴─────────┐
        │  assignments   │          │  incident_logs   │
        └────────────────┘          └──────────────────┘
```

Cardinality summary:
- A **role** has many **users**; a user has exactly one role.
- An **area** has many **users** and many **incidents**.
- A **user** can be the reporter, assignee, or supervisor of many incidents.
- An **incident** has many **assignments** (history) and many **incident_logs** (audit timeline).

## 2. Tables

### `roles`
Catalog of the five system roles.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `name` | `VARCHAR(50)` | NOT NULL, UNIQUE | `ADMIN`, `MANAGER`, `SUPERVISOR`, `TECHNICIAN`, `OPERATOR` |
| `description` | `VARCHAR(500)` | NULL | |

### `areas`
Operational areas of the plant.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `name` | `VARCHAR(255)` | NOT NULL, UNIQUE | e.g. "Línea 1", "Mantenimiento" |
| `description` | `VARCHAR(500)` | NULL | |
| `color` | `VARCHAR(50)` | NULL | UI accent color (hex/name). |

### `users`
Authenticated accounts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `first_name` | `VARCHAR(255)` | NOT NULL | Letters only (validated; rejects digits). |
| `last_name` | `VARCHAR(255)` | NOT NULL | Letters only. |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login identifier. |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt hash. Never returned by the API. |
| `role_id` | `BIGINT` | NOT NULL, FK → `roles(id)` | |
| `area_id` | `BIGINT` | NULL, FK → `areas(id)` | Application rule: **required** for `SUPERVISOR` and `TECHNICIAN`; **optional (recommended)** for `OPERATOR` when routing depends on area; **nullable** for `ADMIN`/`MANAGER`. Enforced at the service layer, not by the DB. |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `TRUE` | Inactive users cannot log in or be assigned. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `avatar` | `VARCHAR(255)` | NULL | Optional avatar URL. |

### `incidents`
Core entity — one row per reported incident.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `title` | `VARCHAR(100)` | NOT NULL | 5–100 chars. |
| `description` | `VARCHAR(500)` | NOT NULL | 10–500 chars. |
| `type` | `VARCHAR(30)` | NOT NULL | Enum `IncidentType` (see §3). |
| `status` | `VARCHAR(20)` | NOT NULL | Enum `IncidentStatus`; new incidents start `OPEN`. |
| `priority` | `VARCHAR(10)` | NOT NULL | Enum `Priority`. |
| `is_false_alarm` | `BOOLEAN` | NOT NULL, DEFAULT `FALSE` | Set via the **cancel** flow (`isFalseAlarm=true`) to record a `CANCELED` incident as a non-event. See [API Contract](api-contract.md). |
| `area_id` | `BIGINT` | NULL, FK → `areas(id)` | Where the incident occurred. |
| `reported_by` | `BIGINT` | NOT NULL, FK → `users(id)` | Always the authenticated `OPERATOR`. |
| `assigned_to` | `BIGINT` | NULL, FK → `users(id)` | Active `TECHNICIAN` once assigned. |
| `supervisor_id` | `BIGINT` | NULL, FK → `users(id)` | Set **only** when the last assignment/review action was performed by a `SUPERVISOR`; remains `NULL` for ADMIN/MANAGER actions. Assignment accountability comes primarily from `assignments` + `incident_logs`, not this column. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, immutable | Audited (UTC). |
| `updated_at` | `TIMESTAMPTZ` | NULL | Audited on each change (UTC). |
| `resolved_at` | `TIMESTAMPTZ` | NULL | Stamped on transition to `RESOLVED` (UTC). |
| `updated_by_id` | `BIGINT` | NULL, FK → `users(id)` | Actor of the last change. |
| `resolved_by_id` | `BIGINT` | NULL, FK → `users(id)` | Actor that resolved it. |

> **Note:** the legacy free-text `category` column and `Category` enum from the prototype are intentionally **dropped** in the rebuild. Classification is `type` (what) + `area` (where).

### `assignments`
Immutable record of every assignment (assignment history).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `incident_id` | `BIGINT` | NOT NULL, FK → `incidents(id)` | |
| `assigned_to_id` | `BIGINT` | NOT NULL, FK → `users(id)` | The technician now responsible. |
| `assigned_by_id` | `BIGINT` | NOT NULL, FK → `users(id)` | ADMIN/MANAGER/SUPERVISOR who performed the (re)assignment. |
| `previous_assigned_to_id` | `BIGINT` | NULL, FK → `users(id)` | Prior technician on reassignment; `NULL` for the first assignment. |
| `assigned_at` | `TIMESTAMPTZ` | NOT NULL | Set on insert (UTC). |
| `comment` | `VARCHAR(500)` | NULL | Optional reason/note for the (re)assignment. |

### `incident_logs`
Append-only audit timeline — one row per lifecycle event or annotation.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK | |
| `incident_id` | `BIGINT` | NOT NULL, FK → `incidents(id)` | |
| `user_id` | `BIGINT` | NULL, FK → `users(id)` | Author of the action. |
| `action` | `VARCHAR(20)` | NOT NULL | Enum `IncidentAction` (see §3). |
| `comment` | `TEXT` | NULL | Free-text note / annotation. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |

## 3. Enumerations

Enums are persisted as strings (`EnumType.STRING`) for readability and forward compatibility.

### `IncidentStatus`
`OPEN` · `ASSIGNED` · `IN_PROGRESS` · `ON_HOLD` · `RESOLVED` · `CLOSED` · `CANCELED`

### `IncidentType`
`MACHINE_FAILURE` · `QUALITY_ISSUE` · `ACCIDENT` · `NETWORK` · `HARDWARE` · `SOFTWARE` · `SECURITY` · `ACCESS` · `OTHER`

### `Priority`
`LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

### `IncidentAction` (audit log)
`INCIDENT_CREATED` · `ASSIGNED` · `REASSIGNED` · `STARTED` · `PUT_ON_HOLD` · `RESUMED` · `RESOLVED` · `CLOSED` · `CANCELED` · `COMMENT_ADDED`

> A false-alarm cancellation is recorded as `CANCELED` on an incident whose `is_false_alarm` is `TRUE` (no separate action value).

### Roles (`roles.name`)
`ADMIN` · `MANAGER` · `SUPERVISOR` · `TECHNICIAN` · `OPERATOR`

## 4. Relationships & Referential Integrity

| FK | References | On delete | Rationale |
|---|---|---|---|
| `users.role_id` | `roles.id` | RESTRICT | A role in use cannot be removed. |
| `users.area_id` | `areas.id` | RESTRICT | Preserve area history. |
| `incidents.reported_by` | `users.id` | RESTRICT | Reporter must remain resolvable. |
| `incidents.assigned_to` | `users.id` | RESTRICT | Assignee must remain resolvable. |
| `incidents.supervisor_id` | `users.id` | RESTRICT | |
| `incidents.updated_by_id` | `users.id` | RESTRICT | Last-change actor must remain resolvable. |
| `incidents.resolved_by_id` | `users.id` | RESTRICT | Resolving actor must remain resolvable. |
| `incidents.area_id` | `areas.id` | RESTRICT | |
| `assignments.incident_id` | `incidents.id` | CASCADE | History belongs to its incident. |
| `assignments.assigned_to_id / assigned_by_id / previous_assigned_to_id` | `users.id` | RESTRICT | Actors must remain resolvable. |
| `incident_logs.incident_id` | `incidents.id` | CASCADE | Timeline belongs to its incident. |
| `incident_logs.user_id` | `users.id` | SET NULL | Keep the event even if the author is removed. |

## 5. Indexes

Recommended beyond the implicit PK and UNIQUE indexes:

| Index | Column(s) | Reason |
|---|---|---|
| `idx_incidents_status` | `incidents(status)` | Dashboard/status filtering and Kanban columns. |
| `idx_incidents_priority` | `incidents(priority)` | Priority distribution KPI. |
| `idx_incidents_area` | `incidents(area_id)` | Per-area KPI and supervisor scoping. |
| `idx_incidents_assigned_to` | `incidents(assigned_to)` | Technician "my incidents" view. |
| `idx_incidents_reported_by` | `incidents(reported_by)` | Operator "my reports" view. |
| `idx_logs_incident` | `incident_logs(incident_id, created_at)` | Ordered timeline retrieval. |
| `idx_assignments_incident` | `assignments(incident_id, assigned_at)` | Ordered assignment history. |

## 6. Seed Data

The backend seeds a deterministic baseline for **development and testing only**. The seeder is idempotent.

### Roles
The five roles: `ADMIN`, `MANAGER`, `SUPERVISOR`, `TECHNICIAN`, `OPERATOR`.

### Areas
| Name | Notes |
|---|---|
| Production | Production lines. |
| Maintenance | Maintenance / repairs. |
| Safety | Safety & incidents. |
| Quality | Quality control. |
| Logistics | Warehouse & logistics. |

### Users (one per role)
| Email | Role | Area |
|---|---|---|
| `admin@opscore.local` | ADMIN | — |
| `manager@opscore.local` | MANAGER | — |
| `supervisor@opscore.local` | SUPERVISOR | Maintenance |
| `technician@opscore.local` | TECHNICIAN | Maintenance |
| `operator@opscore.local` | OPERATOR | Production |

### Passwords
- **No seed password is hard-coded in documentation or committed to the repository.**
- Seed passwords are supplied at runtime through environment variables (e.g. `OPSCORE_SEED_PASSWORD`), or a clearly marked **local-only** development default that is never used outside local development.
- Passwords are BCrypt-hashed at seed time.
- Seed accounts are for local/dev/test only and must never be reused in production. Production users are created through the admin flow.

## 7. Schema Management

- **Development:** Hibernate `ddl-auto=update`.
- **Production:** Hibernate `ddl-auto=validate`.
- **Planned hardening:** introduce Flyway versioned migrations under `backend/opscore-api/src/main/resources/db/migration/` and pin production to `validate` permanently (see [roadmap](development-roadmap.md)).

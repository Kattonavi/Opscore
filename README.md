# OpsCore

[![Java](https://img.shields.io/badge/Java-25-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

## Overview

**OpsCore** is a web platform for managing operational incidents in industrial environments. It centralizes incident reporting, technician assignment, lifecycle control, audit timelines and operational KPIs in a single role-based system.

The platform exists to solve a recurring problem in plant operations: incidents are reported through informal channels (calls, paper, chats), accountability gets lost between shifts and root-cause data never reaches whoever can act on it. OpsCore replaces that with a structured flow — operators report, supervisors/managers triage and assign, technicians execute, and every action is recorded with timestamps and authorship for later review.

## Features

- **Incident reporting** restricted to OPERATOR users, with the reporter always bound to the authenticated user (no impersonation possible).
- **Technician assignment** validated end-to-end: only active TECHNICIAN accounts can be assigned, and never on RESOLVED, CLOSED or CANCELED incidents.
- **Lifecycle state machine**: `OPEN → ASSIGNED → IN_PROGRESS → ON_HOLD → IN_PROGRESS → RESOLVED → CLOSED / CANCELED`, enforced symmetrically in backend and frontend.
- **Per-incident audit timeline** with action type, author and comment for every transition (start, hold, resolve, close, cancel, reassign, annotate).
- **Role-based dashboards and Kanban board** with column counts, priority cues and per-role filtered views.
- **User administration**: create users, change roles, toggle active status, administrative password reset (ADMIN or SUPERVISOR within their area).
- **Self-service profile** at `PATCH /users/me` (only `firstName` and `lastName`, validated by regex to reject digits).
- **Internationalisation** of the frontend (es / en / pt) through a custom i18n provider.
- **Operational metrics** via Recharts (status distribution, priority distribution, per-area counts).
- **Centralised error handling** in the backend with Spanish, context-aware messages instead of bare `403 Forbidden` responses.

## Tech Stack

### Backend (`backend/opscore-api`)
- **Language / runtime:** Java 25 (LTS)
- **Framework:** Spring Boot 4.0.6 (Spring Framework 7, Jakarta EE 11)
- **Security:** Spring Security + JWT (`io.jsonwebtoken` 0.11.x), BCrypt password hashing
- **Persistence:** Spring Data JPA + Hibernate ORM 7
- **Database:** PostgreSQL 16+
- **API docs:** springdoc-openapi 3.x (Swagger UI at `/swagger-ui/index.html` in dev/staging)
- **Build:** Maven (via included `mvnw` wrapper)

### Frontend (`frontend`)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI library:** React 19, TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui component primitives
- **State:** Zustand with `persist` middleware
- **HTTP client:** Axios with JWT interceptor
- **Charts:** Recharts
- **i18n:** Custom provider with JSON locale files (es, en, pt)

### Quality Assurance (`qa`)
- **Framework:** Playwright (API + UI projects)
- **Test layout:** Bootstrapped helpers under `qa/tests/helpers/`, deterministic E2E users per role
- **Current suite:** 47 tests listed across 8 files (see `npx playwright test --list`)

### Deployment
- **Target environment:** Railway staging/demo (backend + Postgres add-on + frontend)
- **Deployment guide:** [`docs/deployment-railway.md`](docs/deployment-railway.md)
- **Database:** PostgreSQL provided by Railway
- **Reverse proxy / DNS / TLS:** handled by Railway

## Project Structure

```
Opscore/
├── backend/
│   └── opscore-api/        Spring Boot REST API (controllers, services, security, JPA)
├── frontend/               Next.js 16 application (App Router, shadcn/ui, Zustand)
├── qa/                     Playwright API + UI tests
├── docs/                   Architecture notes, deployment guides, feature specs
└── propotito/              Legacy/historical prototype — NOT part of the deployable system
```

> The `propotito/` directory is preserved as a historical reference and is **not** deployed nor maintained.

## Roles and Permissions

| Role | Create incident | View | Assign | Start / Hold / Resolve | Close | Cancel | User admin |
|---|---|---|---|---|---|---|---|
| **ADMIN** | ❌ | All | ✅ | ❌ (not as technician) | ✅ | ✅ | ✅ |
| **MANAGER** | ❌ | All | ✅ | ❌ (not as technician) | ✅ | ✅ | ❌ |
| **SUPERVISOR** | ❌ | All | ✅ (own area) | ❌ (not as technician) | ✅ | ✅ | Password reset (own area) |
| **TECHNICIAN** | ❌ | Only assigned to them | ❌ | ✅ (only if assigned) | ❌ | ❌ | ❌ |
| **OPERATOR** | ✅ | Only own reports | ❌ | ❌ | ❌ | ❌ | ❌ |

### Key business rules

1. **Only OPERATOR can create incidents.** Any other role hitting `POST /incidents` receives `403 FORBIDDEN` with the message *"Solo los usuarios con rol operador pueden crear incidentes."*
2. **The reporter is always the authenticated user.** `reportedById`, `assignedToId` and `supervisorId` sent in the creation body are silently ignored — no impersonation, no pre-assignment.
3. **Assignment is only to active TECHNICIAN users.** Attempts to assign ADMIN/MANAGER/SUPERVISOR/OPERATOR return `409 CONFLICT`. Inactive technicians are rejected with the message *"No se puede asignar un incidente a un técnico inactivo."*
4. **Assignment is blocked on RESOLVED, CLOSED and CANCELED incidents** in both backend and frontend.
5. **Technicians can only act on incidents assigned to them.** Even with a TECHNICIAN role, trying to `start`/`hold`/`resolve` someone else's incident returns `403` with *"No puedes modificar este incidente porque no está asignado a ti."*
6. **Administrative roles never perform technical actions.** ADMIN, MANAGER and SUPERVISOR cannot start/hold/resolve as if they were the assigned technician.
7. **Supervisors operate area-scoped** for both assignment and administrative password reset.

## Incident Workflow

```
        ┌──────────────────────────────────────┐
        │              OPERATOR creates        │
        ▼                                      │
       OPEN ──────────► ASSIGNED ──► IN_PROGRESS ──► RESOLVED ──► CLOSED
        │ (manager        ▲              │  ▲             │
        │  assigns)       │              │  │             │
        │                 └── reassign ──┘  │             │
        │                                   ▼             │
        │                                ON_HOLD          │
        │                                   │             │
        │                                   └─────────────┘
        │
        └─────────────────────► CANCELED
                (from OPEN / ASSIGNED / IN_PROGRESS / ON_HOLD)
```

- `CLOSED` and `CANCELED` are terminal — no further transitions accepted.
- `RESOLVED` only accepts `CLOSED` (managerial action). It cannot be reassigned, restarted or cancelled directly.
- The state machine is the single source of truth in [`IncidentTransitions.java`](backend/opscore-api/src/main/java/com/opscore/service/impl/IncidentTransitions.java) and mirrored in the frontend RBAC helpers ([`lib/rbac.ts`](frontend/lib/rbac.ts)).

## API Highlights

The Swagger UI (dev/staging only) exposes the full catalogue at `/swagger-ui/index.html`. A non-exhaustive summary:

### Authentication
- `POST /auth/login` → returns a JWT (24h expiration by default).

### Incidents
- `POST /incidents` — create (OPERATOR only; reportedBy auto-bound to the caller)
- `GET /incidents` — list filtered by the caller's role and optional `status` / `priority` / `areaId` query parameters
- `GET /incidents/{id}` — detail (visibility enforced server-side)
- `GET /incidents/paginated` — paginated list
- `GET /incidents/{id}/assignments` — assignment history
- `GET /incidents/{id}/timeline` — audit timeline
- `POST /incidents/{id}/annotations` — add comment to the timeline
- `POST /incidents/{id}/assign` — assign to a TECHNICIAN (ADMIN / MANAGER / SUPERVISOR)
- `PATCH /incidents/{id}/start` — assigned TECHNICIAN only
- `PATCH /incidents/{id}/hold` — assigned TECHNICIAN only
- `PATCH /incidents/{id}/resolve` — assigned TECHNICIAN only
- `PATCH /incidents/{id}/close` — ADMIN / MANAGER / SUPERVISOR
- `PATCH /incidents/{id}/cancel` — ADMIN / MANAGER / SUPERVISOR

### Users
- `POST /users` — create user (ADMIN)
- `GET /users` — list users (ADMIN)
- `GET /users/{id}` — get user by id (ADMIN)
- `GET /users/assignable` — list active TECHNICIAN users for selectors (ADMIN / MANAGER / SUPERVISOR)
- `GET /users/me` — current authenticated user
- `PATCH /users/me` — update own `firstName` / `lastName` (regex-validated; rejects digits)
- `PATCH /users/{id}/role` — change role (ADMIN)
- `PATCH /users/{id}/status` — activate/deactivate (ADMIN)
- `PATCH /users/change-password` — self-service password change (any authenticated user)
- `PATCH /users/{userId}/change-password` — administrative password reset (ADMIN, or SUPERVISOR within their area)

### Auxiliary
- `GET /areas` — list operational areas
- `GET /dashboard/*` — aggregated metrics for charts
- `GET /actuator/health` — liveness probe used by Railway

## Authentication and Security

- **Stateless JWT authentication** validated by a custom `JwtFilter` registered before `UsernamePasswordAuthenticationFilter`.
- **Method-level RBAC** via `@PreAuthorize` annotations on controllers + business-rule checks inside services (defense in depth).
- **BCrypt** password hashing; passwords are never returned in any response payload.
- **Centralised error responses** through `GlobalExceptionHandler`:
  - `AccessDeniedException` messages thrown by business code are forwarded verbatim (e.g. *"No puedes modificar este incidente porque no está asignado a ti."*).
  - Static `@PreAuthorize` denials, which arrive with Spring's generic *"Access Denied"* message, are mapped to a contextual default based on `path + method` so the client never gets a bare 403.
- **Input validation** with Bean Validation (`@Valid`, `@Pattern`, `@Size`, `@NotBlank`) on every DTO that crosses the API boundary.
- **CORS** allow-list is environment-driven (`CORS_ALLOWED_ORIGINS`).
- **Swagger UI and OpenAPI JSON** can be disabled in production via `SPRINGDOC_SWAGGER_UI_ENABLED=false` / `SPRINGDOC_API_DOCS_ENABLED=false`.

## Email Status

> ⚠️ **OpsCore does not send real emails today.**

The `WelcomeEmailService` is implemented as a **log-only stub**. When a user is created through `POST /users`, the service writes a structured `INFO` log entry but **no SMTP message is dispatched**. This is by design: it provides a clean integration hook without forcing an SMTP setup in every environment.

To enable real email delivery, the operator needs to:

1. Add the dependency `spring-boot-starter-mail` to [`backend/opscore-api/pom.xml`](backend/opscore-api/pom.xml).
2. Replace the placeholder branch in [`WelcomeEmailService.sendWelcomeEmail`](backend/opscore-api/src/main/java/com/opscore/service/WelcomeEmailService.java) with a real `JavaMailSender.send(...)` call.
3. Provide the SMTP configuration via environment variables:

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port (e.g. 587) |
| `SMTP_USERNAME` | SMTP auth user |
| `SMTP_PASSWORD` | SMTP auth password / app password |
| `MAIL_FROM` | Default sender address |
| `opscore.mail.enabled=true` | Application-level flag that activates the real-send branch |

User creation already wraps the email call in a `try/catch`, so a future SMTP outage will never block account provisioning — failures are logged at WARN level only.

## Quality Assurance

The `qa/` project uses **Playwright** with two configured projects: `api` (HTTP-only against the backend) and `ui` (real browser against the frontend).

- **47 tests across 8 files**, verified via `npx playwright test --list`. The full E2E run is not executed in this documentation pass — running it requires a live backend (with a seeded database) and a running frontend.
- Helpers under `qa/tests/helpers/` bootstrap deterministic users per role (`e2e-<role>@opscore.local`) so re-runs are idempotent.
- Coverage focus areas:
  - Authentication and JWT issuance
  - Incident creation rules (OPERATOR-only, automatic reportedBy, ignored body fields)
  - Assignment rules (TECHNICIAN-only, blocked on RESOLVED/CLOSED/CANCELED, inactive rejection)
  - Lifecycle workflow (full path OPEN → CLOSED, plus cancel branch)
  - Self-service profile (`PATCH /users/me` + regex validation)
  - Administrative password reset (`PATCH /users/{userId}/change-password`)
  - UI session isolation (no data leakage between roles after logout)

## Getting Started

### Prerequisites
- Java 25 (LTS)
- Node.js 22.x
- PostgreSQL 16+
- The Maven wrapper (`mvnw` / `mvnw.cmd`) ships with the repo — no global Maven install required

### Backend

```bash
cd backend/opscore-api
cp .env.example .env           # adjust local values
./mvnw spring-boot:run         # dev profile by default
```

Swagger UI: <http://localhost:8080/swagger-ui/index.html>

Run the backend test suite:

```bash
cd backend/opscore-api
.\mvnw.cmd test                # Windows
./mvnw test                    # macOS / Linux
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

Frontend quality gates:

```bash
cd frontend
npm run lint
npm run build
```

### QA

```bash
cd qa
npm install
npm run install:browsers       # first time only
npx playwright test --list     # discover/list all configured tests
npm run test:local             # full suite against a locally running stack
```

## Contributors / Team

The project is delivered by a cross-functional team of frontend, backend and QA engineers.

### Backend

| Avatar | Name | Role | GitHub | LinkedIn |
|---|---|---|---|---|
| <img src="https://avatars.githubusercontent.com/u/99445195?v=4" width="60" /> | **Kevin Londoño** | Backend Developer | [Kattonavi](https://github.com/Kattonavi) | [LinkedIn](https://www.linkedin.com/in/kevin-londo%C3%B1o/) |
| <img src="https://media.licdn.com/dms/image/v2/D4E03AQG6Ec171YNU4A/profile-displayphoto-crop_800_800/B4EZs5pCDBIMAI-/0/1766198616537?e=1781136000&v=beta&t=dFy9qY_Jo0tMLMRsAAugqwyIIqYvFij1oDXi6-LtlLs" width="60" /> | **Rodrigo Peña** | Backend Developer | [IngRodrigoPena](https://github.com/IngRodrigoPena) | [LinkedIn](https://www.linkedin.com/in/ing-rodrigo-pena-ramirez/) |
| <img src="https://avatars.githubusercontent.com/u/66507975?s=96&v=4" width="60" /> | **Estanislao Hancco** | Backend Developer | [hanquito](https://github.com/hanquito) | [LinkedIn](https://www.linkedin.com/) |

### Frontend

| Avatar | Name | Role | GitHub | LinkedIn |
|---|---|---|---|---|
| <img src="https://avatars.githubusercontent.com/u/69812733?s=96&v=4" width="60" /> | **David H. Caycedo B.** | Frontend Developer | [davidcoachdev](https://github.com/davidcoachdev) | [LinkedIn](https://www.linkedin.com/in/davidcoachdev/) |

### QA

| Avatar | Name | Role | GitHub | LinkedIn |
|---|---|---|---|---|
| <img src="https://avatars.githubusercontent.com/u/141883724?s=96&v=4" width="60" /> | **Jesus Medina** | QA Engineer | [JesusMedina21](https://github.com/JesusMedina21) | [LinkedIn](https://www.linkedin.com/in/jesusmedina-dev/) |

## Current Limitations

The following items are explicitly **out of scope for the current iteration** and are recorded here so they are not mistaken for working features:

- **Email delivery is not active.** `WelcomeEmailService` only writes log entries; integrating Spring Boot Mail + SMTP is required to send real welcome / notification emails (see [Email Status](#email-status)).
- **Root-cause analysis module is basic.** Incidents capture title, description, type, priority and timeline annotations, but a structured RCA workflow (5-whys, fishbone, etc.) is **not** implemented yet.
- **File attachments are not implemented.** There is no upload pipeline for incident photos or documents. No Cloudinary / S3 / object-storage integration is wired in.
- **Schema migrations are managed by Hibernate `ddl-auto`** (`update` in dev, `validate` in prod). Flyway or Liquibase integration is **not** yet in place, so production deploys still rely on manual DDL coordination.
- **No audit log table for user administration.** Role changes, status changes and administrative password resets are not persisted to a dedicated audit table.
- **No rate limiting / lockout** on `/auth/login` or password-change endpoints.
- **Real-time notifications (WebSocket / SSE) are not implemented.** The frontend polls or refetches on demand.
- **`propotito/` is a historical prototype.** It is not deployed, not maintained and intentionally untouched.

## Next Steps

Recommended follow-up work, ordered roughly by business value vs. effort:

1. **Wire real SMTP delivery** in `WelcomeEmailService` once the operator chooses an email provider — minimal code change, environment-only configuration.
2. **Adopt Flyway** (or Liquibase) and switch the production profile to `ddl-auto=validate` definitively, with versioned migrations under `backend/opscore-api/src/main/resources/db/migration/`.
3. **Introduce a user-administration audit log** (role change, status change, admin password reset) — new entity + service hook in `UserService`.
4. **Run the full Playwright suite in CI** against a deployed staging environment, not just `--list`.
5. **Add rate limiting** (e.g. Bucket4j or Spring Cloud Gateway) on auth and password endpoints.
6. **File attachments** for incidents via a signed-upload flow to an object store — separate feature epic.
7. **Structured RCA workflow** (cause categories, recurrence detection, top-offender reports).
8. **i18n for backend error messages** through `MessageSource` if multilanguage support becomes a requirement.
9. **Endpoint hardening**: change the current silent-ignore policy for `reportedById` / `assignedToId` / `supervisorId` on `POST /incidents` to an explicit `400` once all internal clients are migrated.
10. **Refresh secondary READMEs** under `backend/`, `backend/opscore-api/db/`, `frontend/`, `qa/` and `docs/` to align them with this top-level document — left untouched in this pass on purpose, but worth a follow-up.

---

> Built with care by the OpsCore team. Issues and contributions are welcome through the project's GitHub repository.

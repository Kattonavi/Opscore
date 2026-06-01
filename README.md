# OpsCore

[![Java](https://img.shields.io/badge/Java-25-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> **Status — design phase.** OpsCore is being rebuilt from the ground up. This repository currently contains the technical documentation that defines the system; backend and frontend implementation follow the [development roadmap](docs/development-roadmap.md).

## Overview

**OpsCore** is an industrial incident management platform. It centralizes incident reporting, technician assignment, lifecycle control, a per-incident audit timeline, role-based access control, and operational KPIs in a single system.

It targets a recurring problem in plant operations: failures are reported through informal channels (calls, paper, chat), accountability is lost between shifts, and root-cause data never reaches whoever can act on it. OpsCore replaces that with a structured flow — **operators report**, **supervisors and managers triage and assign**, **technicians execute**, and every action is recorded with timestamp and author for later review.

## Target Capabilities

- **Incident reporting** restricted to `OPERATOR` users, with the reporter always bound to the authenticated account (no impersonation).
- **Technician assignment** validated end-to-end: only active `TECHNICIAN` accounts can be assigned, never on terminal incidents.
- **Lifecycle state machine** — `OPEN → ASSIGNED → IN_PROGRESS ↔ ON_HOLD → RESOLVED → CLOSED`, plus a `CANCELED` branch — enforced symmetrically on backend and frontend.
- **Per-incident audit timeline** capturing action type, author, comment, and timestamp for every transition.
- **Role-based dashboards** with per-role filtered views and a Kanban board.
- **User administration** — create users, change roles, toggle active status, administrative password reset.
- **Self-service profile** updates and password change.
- **Operational metrics** — status, priority, and per-area distributions.
- **Centralised, context-aware error handling** instead of bare `403`/`500` responses.

## Tech Stack

### Backend (`backend/opscore-api`)
- **Language / runtime:** Java 25 (LTS)
- **Framework:** Spring Boot 4.0 (Spring Framework 7, Jakarta EE 11)
- **Security:** Spring Security + JWT, BCrypt password hashing
- **Persistence:** Spring Data JPA + Hibernate ORM 7
- **Database:** PostgreSQL 16+
- **API docs:** springdoc-openapi (Swagger UI in dev/staging)
- **Build:** Maven (via the included `mvnw` wrapper)

### Frontend (`frontend`)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui primitives
- **State:** Zustand with `persist` middleware
- **HTTP:** Axios with a JWT interceptor
- **Charts:** Recharts
- **i18n:** Custom provider with JSON locale files (es / en / pt)

### Quality
- **Backend tests:** JUnit 5 + Spring Boot Test (+ Testcontainers for integration)
- **Frontend unit/component tests:** Vitest
- **E2E / API tests:** Playwright (`api` and `ui` projects)

## Documentation

The system is specified ahead of implementation. Start here:

| Document | Purpose |
|---|---|
| [Product Requirements](docs/product-requirements.md) | Problem, goals, personas, user stories, functional & non-functional requirements, KPIs. |
| [Architecture](docs/architecture.md) | System context, backend/frontend design, auth flow, deployment topology. |
| [Database Model](docs/database-model.md) | Tables, columns, constraints, relationships, enums. |
| [API Contract](docs/api-contract.md) | Conventions, endpoint catalogue, request/response shapes, error envelope. |
| [Roles & Permissions](docs/roles-and-permissions.md) | Role matrix, business rules, authorization model. |
| [Development Roadmap](docs/development-roadmap.md) | Phased milestones and definition of done. |
| [Testing Strategy](docs/testing-strategy.md) | Test pyramid, coverage targets, CI gates. |

## Repository Structure

```
Opscore/
├── backend/
│   └── opscore-api/        Spring Boot REST API (planned)
├── frontend/               Next.js 16 application (planned)
├── qa/                     Playwright API + UI tests (planned)
├── docs/                   Technical documentation (this set)
└── propotito/              Historical prototype — NOT part of the rebuild
```

> `propotito/` is preserved as a historical reference. It is not deployed, not maintained, and not part of the rebuilt system.

## Roles at a Glance

| Role | Create incident | View | Assign | Start / Hold / Resume / Resolve | Close / Cancel | User admin |
|---|---|---|---|---|---|---|
| **ADMIN** | ❌ | All | ✅ | ❌ | ✅ | ✅ |
| **MANAGER** | ❌ | All | ✅ | ❌ | ✅ | ❌ |
| **SUPERVISOR** | ❌ | All | ✅ (own area) | ❌ | ✅ (own area) | Password reset (own area) |
| **TECHNICIAN** | ❌ | Assigned to them | ❌ | ✅ (if assigned) | ❌ | ❌ |
| **OPERATOR** | ✅ | Own reports | ❌ | ❌ | ❌ | ❌ |

Full rules: [Roles & Permissions](docs/roles-and-permissions.md).

## Incident Lifecycle

```
   OPERATOR creates
         │
         ▼
       OPEN ──assign──► ASSIGNED ──start──► IN_PROGRESS ──resolve──► RESOLVED ──close──► CLOSED
         │                  ▲                   │   ▲                                       
         │                  └─── reassign ──────┘   │                                       
         │                                  hold │  │ resume                                
         │                                       ▼  │                                       
         │                                    ON_HOLD                                       
         │                                                                                  
         └──────────────────────────► CANCELED  (from OPEN / ASSIGNED / IN_PROGRESS / ON_HOLD)
```

`CLOSED` and `CANCELED` are terminal. `RESOLVED` only transitions to `CLOSED`.

## License

See [LICENSE](LICENSE).

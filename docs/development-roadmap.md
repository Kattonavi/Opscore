# Development Roadmap — OpsCore

> Status: design phase, starting June 2026. The roadmap is milestone-driven rather than date-driven; each milestone has explicit deliverables and a definition of done. Milestones are sequential but the boundaries are guidance, not contracts.

## Guiding Principles

- **Documentation first.** The system is specified before code (this milestone, M0).
- **Vertical slices.** Each milestone ships an end-to-end, testable capability — not a horizontal layer.
- **Security from day one.** Auth and RBAC land before any business feature that needs them.
- **Always shippable.** `main` stays green; every milestone leaves the system runnable.

## M0 — Technical Documentation ✅ (current)

**Goal:** a complete, authoritative specification.

- README, product requirements, architecture, database model, API contract, roles & permissions, testing strategy, this roadmap.

**Done when:** the seven documents are consistent with one another and reviewed.

## M1 — Project Foundation

**Goal:** runnable skeletons for both apps, wired to a database.

- Backend: Spring Boot 4 project, PostgreSQL connection, base config, health endpoint, OpenAPI, Dockerfile.
- Frontend: Next.js 16 project, Tailwind + shadcn/ui, Axios client, i18n provider, Dockerfile.
- Local orchestration (compose) for backend + db + frontend.
- CI pipeline: build + lint on every push.

**Done when:** both apps build and start locally; `/actuator/health` returns `UP`; CI is green.

## M2 — Authentication & Users

**Goal:** users can log in; admins can manage accounts.

- Entities: `roles`, `areas`, `users`. Seed roles, areas, and one user per role.
- BCrypt hashing; JWT issuance + `JwtFilter`; `POST /auth/login`.
- User endpoints: create, list, get, assignable, `/me`, role/status changes, password change/reset.
- Frontend: login page, session store (Zustand persist), auth interceptor, profile screen, user-admin screens.

**Done when:** all five seeded roles can authenticate; admin can CRUD users; password reset works; profile validation rejects digits.

## M3 — Incident Reporting

**Goal:** operators can report and view their incidents.

- `incidents` entity + enums (`IncidentType`, `IncidentStatus`, `Priority`).
- `POST /incidents` (OPERATOR only; reporter auto-bound; ignored body fields).
- `GET /incidents`, `/paginated`, `/{id}` with role-scoped visibility.
- Frontend: mobile-friendly reporting form; "my reports" list and detail.

**Done when:** an operator creates an incident and sees only their own; non-operators are blocked from creating; visibility scoping holds.

## M4 — Assignment, Lifecycle & Audit

**Goal:** the full incident workflow with traceability.

- Assignment endpoint with active-technician + non-terminal checks; `assignments` history.
- Lifecycle state machine (single source of truth) + transition endpoints (`start`/`hold`/`resolve`/`close`/`cancel`).
- `incident_logs` audit timeline; annotations endpoint.
- Frontend: assignment UI, Kanban board, per-incident timeline, RBAC mirror in `lib/rbac.ts`.

**Done when:** an incident traverses `OPEN → … → CLOSED` and the `CANCELED` branch; every transition is logged with author + timestamp; all seven business rules are enforced and covered by tests.

## M5 — Dashboards & KPIs

**Goal:** operational visibility for managers and supervisors.

- Aggregation endpoints: status, priority, per-area counts.
- Frontend: Recharts dashboards, role-filtered.

**Done when:** dashboards render live aggregates and respect role scope.

## M6 — Hardening & Polish

**Goal:** production readiness.

- Flyway migrations; production `ddl-auto=validate` permanently.
- Centralised, contextual error handling reviewed end-to-end.
- Optional welcome-email delivery (opt-in via env).
- Rate limiting / lockout on auth and password endpoints.
- Full Playwright suite in CI against a deployed staging environment.
- Deployment guide finalised; observability (structured logs, health) verified.

**Done when:** migrations gate schema changes; security review passes; E2E suite is green in CI on staging.

## Backlog (post-M6)

Recorded so they are not mistaken for current scope:

- Structured root-cause analysis (cause categories, recurrence detection, top-offender reports).
- Incident file/photo attachments via signed upload to object storage.
- Real-time notifications (WebSocket / SSE) replacing on-demand refetch.
- Dedicated audit table for user-administration actions.
- Backend i18n of error messages via `MessageSource`.
- Switch the silent-ignore policy for `reportedById`/`assignedToId`/`supervisorId` on `POST /incidents` to an explicit `400`.

## Definition of Done (every milestone)

A milestone is complete only when:
1. Code is merged to `main` and the apps build and run.
2. Unit + integration tests for the new behaviour pass; relevant E2E coverage is added.
3. The affected documentation is updated in lockstep.
4. No known regression in earlier milestones.
5. Lint/format gates pass.

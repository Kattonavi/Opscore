# Architecture — OpsCore

> Status: design phase. This document describes the target architecture for the rebuild.

## 1. Architectural Principles

1. **Separation of concerns** — a stateless REST API and a decoupled SPA frontend communicate only over HTTP/JSON.
2. **Defense in depth** — authorization is enforced twice: declaratively at the controller (`@PreAuthorize`) and imperatively in the service layer (business rules).
3. **Single source of truth for the lifecycle** — the incident state machine lives in one backend component and is mirrored, never re-invented, on the frontend.
4. **Fail safe** — non-critical side effects (email, metrics) never abort a primary operation.
5. **Configuration over code** — secrets and environment differences come from environment variables, not the codebase.

## 2. System Context

```
            ┌──────────────┐         HTTPS / JSON        ┌────────────────────┐
  Browser ─▶│  Frontend    │ ─────── Bearer JWT ───────▶ │   Backend API      │
 (operator, │  Next.js 16  │                             │   Spring Boot 4    │
 supervisor,│  (SPA)       │ ◀───── JSON / errors ─────  │                    │
 manager,   └──────────────┘                             └─────────┬──────────┘
 tech,                                                             │ JPA / JDBC
 admin)                                                            ▼
                                                          ┌────────────────────┐
                                                          │  PostgreSQL 16     │
                                                          └────────────────────┘
                                                          (optional) SMTP for
                                                           welcome emails
```

- **Frontend** holds no business authority. It hides controls the user cannot use, but every rule is re-checked server-side.
- **Backend** is the security boundary and the source of truth.
- **Database** is owned exclusively by the backend; no other component connects to it.

## 3. Container View

| Container | Technology | Responsibility |
|---|---|---|
| **Frontend SPA** | Next.js 16 (App Router), React 19, TypeScript, Tailwind + shadcn/ui, Zustand, Axios, Recharts | Render role-specific UI, hold session token, call the API, visualize KPIs. |
| **Backend API** | Java 25, Spring Boot 4, Spring Security, Spring Data JPA, Hibernate 7 | Authentication, authorization, business rules, persistence, KPI aggregation. |
| **Database** | PostgreSQL 16 | Durable storage for users, incidents, assignments, audit logs, areas, roles. |
| **SMTP (optional)** | Any provider | Welcome emails; disabled by default. |

## 4. Backend Architecture

A conventional layered (hexagonal-leaning) Spring Boot application.

```
HTTP ─▶ Controller ─▶ Service ─▶ Repository ─▶ Database
          │             │
          │             ├─ business rules (RBAC + lifecycle + validation)
          │             └─ audit logging (incident_logs)
          └─ @PreAuthorize (coarse RBAC), @Valid (DTO validation)
```

### Packages
| Package | Contents |
|---|---|
| `config` | Security, CORS, JWT filter, OpenAPI, data seeding. |
| `controller` | REST endpoints. Thin: validate input, delegate, map output. |
| `service` | Business logic, lifecycle transitions, authorization rules. |
| `repository` | Spring Data JPA interfaces. |
| `entity` | JPA entities (`User`, `Role`, `Area`, `Incident`, `Assignment`, `IncidentLog`). |
| `enums` | `IncidentStatus`, `IncidentType`, `Priority`, `IncidentAction`. |
| `dto` | Request/response payloads — the entities are never serialized directly. |
| `exception` | Domain exceptions + a global handler that produces contextual error envelopes. |

### Cross-cutting concerns
- **Authentication** — a `JwtFilter` registered before `UsernamePasswordAuthenticationFilter` validates the bearer token and populates the security context.
- **Authorization** — `@PreAuthorize` on controllers for coarse role checks; fine-grained ownership/area/lifecycle rules live in services.
- **Validation** — Bean Validation (`@NotBlank`, `@Size`, `@NotNull`, `@Pattern`) on every inbound DTO.
- **Error handling** — a `GlobalExceptionHandler` maps exceptions to a consistent JSON envelope; access-denied messages are made contextual rather than a bare "Access Denied".
- **Auditing** — `@CreatedDate` / `@LastModifiedDate` on entities; explicit `IncidentLog` rows for lifecycle events.

## 5. Authentication & Authorization Flow

```
1. POST /auth/login { email, password }
2. Backend verifies BCrypt hash, checks user is active
3. Backend returns a signed JWT (claims: `sub`/`userId`, `email`, `role`, `areaId`, `iat`, `exp`)
4. Frontend stores the token (Zustand persist → localStorage) and attaches it:
       Authorization: Bearer <token>
5. JwtFilter validates signature + expiry on every request and sets the principal
6. @PreAuthorize + service rules decide if the action is allowed
```

### JWT decisions (v1)
- **Access token only — no refresh token in v1.** Clients re-authenticate when the 24-hour token expires.
- **Algorithm:** HS256. **Secret:** environment variable only (never committed or logged).
- **Lifetime:** 24 hours (development/demo value).
- **Claims:** `sub`/`userId`, `email`, `role`, `areaId`, `iat`, `exp`.
- **Frontend storage (v1 demo):** Zustand `persist` → `localStorage`. **Tradeoff:** JavaScript-readable, so exposed to XSS; accepted for the demo and revisited in hardening.
- **Future hardening:** `httpOnly` + `Secure` cookies and refresh-token rotation.

Other auth properties:
- Tokens are **stateless** — no server-side session store.
- Passwords are hashed with **BCrypt**; plaintext never persisted or logged.
- CORS origins come from an environment allow-list (`CORS_ALLOWED_ORIGINS`).

## 6. Frontend Architecture

```
app/            App Router routes & layouts (role-gated)
components/      Reusable UI (shadcn/ui based)
lib/rbac.ts      RBAC helpers — mirror of backend permissions
api/             Axios client + typed request/response models
stores (Zustand) Session + UI state, persisted to storage
i18n/            Locale provider (es / en / pt)
```

- **RBAC mirror** — `lib/rbac.ts` reflects the backend permission matrix so the UI hides what the user cannot do. It is a UX optimization, **not** a security control.
- **HTTP interceptor** — attaches the JWT and handles `401` by clearing the session.
- **State** — Zustand with `persist`; a session reset clears all stores on logout to prevent cross-role data leakage.

## 7. Error Handling Contract

All errors return a consistent envelope (see [API Contract](api-contract.md)):

```json
{ "timestamp": "...", "status": 403, "error": "Forbidden", "message": "<contextual>", "path": "/incidents/42/start" }
```

- Business `AccessDeniedException` messages are forwarded verbatim (e.g. *"No puedes modificar este incidente porque no está asignado a ti."*).
- Static `@PreAuthorize` denials are mapped to a contextual default based on path + method, so clients never receive a bare 403.

## 8. Deployment Topology

```
┌───────────────────────────── Hosting platform ─────────────────────────────┐
│                                                                             │
│   [Frontend service]  ◀── TLS ──  Users                                     │
│         │ env: NEXT_PUBLIC_API_URL                                          │
│         ▼ HTTPS                                                              │
│   [Backend service]  ── JDBC ──▶  [PostgreSQL add-on]                        │
│         │ env: DB creds, JWT secret, CORS origins, (optional) SMTP          │
│         └─ /actuator/health  ◀── platform liveness probe                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Each service is containerised (Dockerfile per service).
- **Schema management:** Hibernate `ddl-auto=update` in dev, `validate` in production. Versioned migrations (Flyway/Liquibase) are a planned hardening step — see the [roadmap](development-roadmap.md).
- **Configuration:** all secrets via environment variables; nothing sensitive committed.

## 9. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Stateless JWT over server sessions | Horizontal scalability; no shared session store. |
| RBAC enforced in two layers | A bug or omission in one layer cannot silently grant access. |
| DTOs at the API boundary | Entities never leak; response shape is decoupled from the schema. |
| Lifecycle as an explicit state machine | Transitions are validated centrally and cannot be bypassed by ad-hoc updates. |
| Append-only audit log | Full traceability; history cannot be rewritten through the API. |

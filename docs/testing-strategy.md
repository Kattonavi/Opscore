# Testing Strategy — OpsCore

> Status: design phase. This document defines how OpsCore is verified. Tests are written alongside each milestone (see [roadmap](development-roadmap.md)), not deferred to the end.

## 1. Objectives

- Prove the **seven business rules** and the **lifecycle state machine** hold under every role.
- Guarantee **authorization** cannot be bypassed (server-side, regardless of UI).
- Catch regressions automatically in CI before merge.
- Keep tests **deterministic and idempotent** so they can run repeatedly against the same environment.

## 2. Test Pyramid

```
            ╱╲        E2E (Playwright UI)        — few, high-value journeys
           ╱  ╲
          ╱----╲      API / integration tests    — the core safety net
         ╱      ╲
        ╱--------╲    Unit tests                  — many, fast, isolated
```

| Layer | Tooling | Scope |
|---|---|---|
| **Unit** | JUnit 5, Mockito (backend); Vitest/Jest + Testing Library (frontend) | Pure logic: lifecycle transitions, RBAC helpers, validators, mappers. |
| **Integration / API** | Spring Boot Test + Testcontainers (PostgreSQL); Playwright `api` project | Controllers → services → real database; the authorization contract. |
| **E2E** | Playwright `ui` project | Critical user journeys through the real frontend + backend. |

## 3. Backend Testing

### Unit
- **Lifecycle:** every legal transition succeeds; every illegal transition is rejected. Terminal states (`CLOSED`, `CANCELED`) accept nothing; `RESOLVED` accepts only `CLOSED`.
- **Authorization predicates:** assignee check, area scoping, active-technician check.
- **Validation:** title 5–100, description 10–500, name regex rejects digits.

### Integration (Testcontainers + real PostgreSQL)
- **Auth:** login succeeds for active users, fails for wrong password and inactive accounts; protected endpoints reject missing/invalid tokens with `401`.
- **The seven business rules**, one focused test each:
  1. Non-operator `POST /incidents` → `403`.
  2. Client-supplied reporter/assignee/supervisor on create are ignored.
  3. Assigning a non-technician / inactive technician → `409`.
  4. Assigning a `RESOLVED`/`CLOSED`/`CANCELED` incident → blocked.
  5. Technician acting on an unassigned incident → `403`.
  6. Admin/manager/supervisor cannot `start`/`hold`/`resolve`.
  7. Supervisor actions are area-scoped.
- **Audit:** each transition writes exactly one `incident_logs` row with the correct action, author, and timestamp.
- **Error envelope:** denied requests return the contextual message shape, never a bare 403.

## 4. API Testing (Playwright `api`)

HTTP-only, no browser. Verifies the contract from the outside:
- Authentication and JWT issuance.
- Incident creation rules and ignored body fields.
- Assignment rules (technician-only, terminal-state block, inactive rejection).
- Full lifecycle path `OPEN → CLOSED` plus the `CANCELED` branch.
- Self-service profile (`PATCH /users/me`) and regex validation.
- Administrative password reset (`PATCH /users/{userId}/change-password`).

## 5. E2E Testing (Playwright `ui`)

Real browser against the running stack. Representative journeys:
- Operator logs in, reports an incident, sees it in their list, cannot see others'.
- Supervisor assigns a technician within their area; cannot assign outside it.
- Technician moves an assigned incident `start → resolve`; cannot touch unassigned ones.
- Manager closes a resolved incident and reads the KPI dashboard.
- **Session isolation:** after logout, no previous-role data leaks into the next session.

## 6. Test Data Strategy

- **Deterministic users per role** with stable emails (e.g. `e2e-<role>@opscore.local`), seeded idempotently so re-runs don't accumulate state.
- Seed passwords are for local/CI/demo only — never reused in production.
- Integration tests spin up a disposable PostgreSQL via Testcontainers; no shared mutable fixture between unrelated tests.
- Each test creates the minimum state it needs and tolerates pre-existing seed data.

## 7. Coverage Targets

| Area | Target |
|---|---|
| Lifecycle transition logic | 100% of transitions (legal + illegal). |
| The seven business rules | 100% — each has a dedicated test. |
| Service layer (backend) | ≥ 80% line coverage. |
| Critical user journeys | Covered by at least one E2E test each. |

> Coverage percentage is a guardrail, not the goal — the priority is that **rules and lifecycle** are exhaustively exercised.

## 8. Continuous Integration Gates

On every pull request, all must pass before merge:
1. Backend: `mvn verify` (unit + integration with Testcontainers).
2. Frontend: `lint`, `build`, unit tests.
3. Playwright `api` + `ui` suites against an ephemeral or staging stack.

`main` is protected; a red pipeline blocks merge.

## 9. Out of Scope (this iteration)

- Load / performance testing.
- Penetration testing beyond the RBAC contract checks.
- Visual regression testing.
- Contract testing against external consumers (no external API consumers yet).

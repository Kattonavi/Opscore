# OpsCore Documentation

Technical documentation for the OpsCore rebuild. These documents are the **source of truth** for the system; implementation follows them.

> Status: design phase. OpsCore is being rebuilt from scratch as a solo portfolio project.

## Core Documents

| Document | Purpose |
|---|---|
| [Product Requirements](product-requirements.md) | Problem, goals, personas, user stories, functional & non-functional requirements, KPIs. |
| [Architecture](architecture.md) | System context, backend/frontend design, auth flow, deployment topology. |
| [Database Model](database-model.md) | Tables, columns, constraints, relationships, enums. |
| [API Contract](api-contract.md) | Conventions, endpoint catalogue, request/response shapes, error envelope. |
| [Roles & Permissions](roles-and-permissions.md) | Role matrix, business rules, authorization model. |
| [Development Roadmap](development-roadmap.md) | Phased milestones and definition of done. |
| [Testing Strategy](testing-strategy.md) | Test pyramid, coverage targets, CI gates. |

The project [README](../README.md) is the top-level entry point.

## Visual References (legacy — pending validation)

The entity-relationship diagrams under [`tablas/`](tablas/) (`tablas.drawio`, `tablas.excalidraw`) predate this rebuild. They are kept as visual references **but have not yet been validated against** the current [Database Model](database-model.md) and may reflect an older schema. Verify against the database model before relying on them.

## Legacy Archive

Documentation from the previous build has been moved to [`_legacy/`](_legacy/). It is retained for historical context only, is **not** maintained, and does not reflect the current design. Always prefer the core documents above.

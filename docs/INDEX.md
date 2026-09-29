# Project documentation

Source audit: **2026-09-19**, with a scoped **2026-09-25** update for section permissions, independent panel entry and subscribed guards. Documentation describes implemented behavior; source code remains the final authority when the two differ.

**For an AI development task, start with [AI_CONTEXT.md](AI_CONTEXT.md), then [FEATURE_MAP.md](FEATURE_MAP.md).** Use these maps to select a small set of source files before editing. Do not repeat a full-project scan for an ordinary feature change.

## Choose the relevant document

| Need | Read |
| --- | --- |
| Quick context and constraints | [AI_CONTEXT.md](AI_CONTEXT.md) |
| Product purpose, scope, and implementation status | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Rendering, module boundaries, and dependency graph | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Directory responsibilities and configuration locations | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| User flows and modification considerations | [FEATURES.md](FEATURES.md) |
| Feature → pages → components → state → data | [FEATURE_MAP.md](FEATURE_MAP.md) |
| Every URL, access requirement, and page wrapper | [ROUTES.md](ROUTES.md) |
| Component contracts, props, state, and reuse | [COMPONENTS.md](COMPONENTS.md) |
| State ownership, subscriptions, and persistence | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |
| Repository contracts, models, validation, and data sources | [API_AND_DATA.md](API_AND_DATA.md) |
| Login, sessions, roles, visibility, and security limits | [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md) |
| Persian RTL, styling, responsive behavior, and accessibility | [UI_AND_DESIGN_SYSTEM.md](UI_AND_DESIGN_SYSTEM.md) |
| Installation, commands, tooling, QA, and troubleshooting | [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) |
| Workflow for making and documenting future changes | [CHANGE_GUIDE.md](CHANGE_GUIDE.md) |

Supporting records: [ASSETS.md](ASSETS.md) describes supplied branding/image assets. [VALIDATION.md](VALIDATION.md) separates dated test evidence from current documentation validation. [check-docs.mjs](check-docs.mjs) checks links, source paths, the documentation index, and route coverage.

## Scope and accuracy

The audit covered all 97 application TS/TSX files in `app/`, `components/`, `data/`, `services/`, `hooks/`, `lib/`, and `types/`; all routes and shared CSS; package/configuration files and the lockfile; scripts and tests; existing documentation; and public/reference asset metadata and mappings. Generated output, third-party package internals, and Git object history are not application architecture. Their roles and exclusions are recorded in [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

Use these status terms consistently:

- **Implemented (local/demo):** working frontend behavior backed by browser-local data.
- **Partially implemented:** a visible entry point exists, but the described larger capability does not.
- **NOT CURRENTLY IMPLEMENTED:** no implementation exists in this source tree.
- **UNKNOWN — Requires source inspection:** evidence is insufficient; identify the missing evidence rather than inventing a contract.

Canonical ownership reduces duplication: routes live in `ROUTES.md`; models/validation in `API_AND_DATA.md`; storage lifecycle in `STATE_MANAGEMENT.md`; login semantics in `AUTH_AND_PERMISSIONS.md`; operational commands in `DEVELOPMENT_GUIDE.md`. Other documents link to these contracts. Update the affected documents with the source change, following [CHANGE_GUIDE.md](CHANGE_GUIDE.md).

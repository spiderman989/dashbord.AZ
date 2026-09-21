# Change guide

The documentation is the first source of context; relevant source code is the implementation authority. The purpose is to narrow inspection, not to replace it or assume every future working tree still matches this audit.

## Workflow

1. Read [INDEX.md](INDEX.md) and [AI_CONTEXT.md](AI_CONTEXT.md). Note the audit date and the user's requested scope.
2. Identify the feature in [FEATURES.md](FEATURES.md). Separate working local/demo behavior from placeholders and absent functionality.
3. Read the relevant contracts: [ARCHITECTURE.md](ARCHITECTURE.md), [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md), [API_AND_DATA.md](API_AND_DATA.md), [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md), or [UI_AND_DESIGN_SYSTEM.md](UI_AND_DESIGN_SYSTEM.md).
4. Use [FEATURE_MAP.md](FEATURE_MAP.md) and [ROUTES.md](ROUTES.md) to list the smallest likely source surface: page wrapper, feature component, service/type, navigation if needed, and shared dependencies actually affected.
5. Check the working-tree diff and applicable project instructions. Preserve existing uncommitted work. Inspect those selected files before editing. Expand inspection only when imports, consumers, tests, or observed behavior show another dependency.
6. Implement the requested change using existing repository, hook, UI, validation, Persian date/search, and role patterns. Reuse an existing configuration/component where the data/behavior fits; retain dedicated forms where it does not.
7. Validate the behavior at appropriate desktop/mobile widths and run the relevant supported checks below. Fix regressions caused by the change; report unrelated failures without broad refactoring.
8. Update affected documents and maps in the same change. Verify their paths, routes, contracts, and status labels. Run `node docs/check-docs.mjs` and review the final diff.
9. Report changed behavior/files, commands actually run, remaining limitations, and documentation updates. Do not describe past test results as fresh verification.

Only repeat a full-project audit when a broad migration, substantial undocumented restructuring, or contradictory evidence makes the existing map unreliable.

## Minimal scope examples

| Request | Starting source set | Additional area only if required |
| --- | --- | --- |
| Add/edit an employee-account field | AdminEmployees, employeeService, `types/index.ts` | authService/PortalShell if the session/profile projection changes; stored-data compatibility |
| Change feedback validation | feedbackService, FeedbackPage, types | Shared Field/Input only for a reusable control defect |
| Add a content field | Matching resourceConfig entry, domain type, employee viewer | ContentManager/ContentForm only if the field needs unsupported behavior |
| Add an ordinary panel feature | Nearest feature component, new page in correct route group, existing service/hook pattern, navigation entry | Shared layout/CSS only where necessary |
| Change a status/ownership model | Type, service/helper, all consumers identified by FEATURE_MAP | Existing stored JSON, labels, filters, counts and related tests |
| Adjust one layout | Affected component and scoped CSS selectors | Other consumers only where shared rules are changed |

## Constraints to preserve

- Keep the frontend/local scope unless the user explicitly requests another architecture. Async service names do not imply HTTP APIs.
- Do not redesign existing dashboards, change global fonts/colors, reorganize menus, or refactor unrelated code for a feature addition.
- Do not merge phone-directory records by name, correct authoritative spelling opportunistically, or confuse extensions with login accounts.
- Keep feedback types exactly suggestion/criticism unless the user explicitly changes that contract. Announcement types are unrelated.
- Preserve employee IDs across edits, exact password matching, case-insensitive employee usernames, reserved demo username behavior, and independent panel sessions.
- Consider compatibility of existing localStorage data before changing a shape/key. There is no automatic migration. Do not erase browser data to make a change appear to work.
- Maintain Persian labels, RTL/LTR boundaries, Jalali display/Tehran time, native date inputs, accessible labels, empty/error/loading states, and existing dialog/table patterns.
- Keep supplied assets and licenses intact; use AssetImage/BrandLogo rather than replacing branding. Avoid new packages when existing tools suffice.

## Validation selection

| Change | Appropriate checks |
| --- | --- |
| Documentation only | Documentation checker; compare documented contracts with selected source; diff/path/link review. No need to rebuild an unchanged application solely for prose. |
| Types, services, routes, components | Lint and typecheck; domain tests if relevant; production build for framework/type/route changes |
| Search/calendar/link helpers or seed directory | `npm test`, plus affected UI behavior |
| Login, persistence, shared UI, content CRUD, ownership | Existing browser suite against a current production build; inspect affected empty/error/success and mobile/dialog states |
| Dependency/build configuration | Install/build/typecheck/lint and relevant tests; inspect lockfile and generated differences |

Exact commands/prerequisites live in [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md). Expand or add meaningful tests for new contracts or regressions; do not mirror implementation with redundant tests. Record blockers honestly instead of disabling checks.

## Documentation update matrix

| Source change | Update |
| --- | --- |
| Route, menu, feature location or dependency | ROUTES, FEATURE_MAP, FEATURES; PROJECT_STRUCTURE if directories changed |
| Model/service validation/data source | API_AND_DATA; STATE_MANAGEMENT for ownership/persistence changes |
| Authentication/roles/session behavior | AUTH_AND_PERMISSIONS, affected FEATURES/FEATURE_MAP, AI_CONTEXT |
| Component props/state/reuse | COMPONENTS; affected feature map and architecture when boundaries change |
| Global layout/design/responsive pattern | UI_AND_DESIGN_SYSTEM; ASSETS if mappings change |
| Dependencies/scripts/env/build/QA | DEVELOPMENT_GUIDE; dated VALIDATION evidence |
| High-level scope or constraints | PROJECT_OVERVIEW, ARCHITECTURE, AI_CONTEXT; INDEX for new documents |

Keep detailed contracts in their canonical document and summaries short. Add links rather than duplicating all validation rules in several files. Record implemented/partial/not-implemented/unknown status explicitly; never promote mock prose, old plans, enum members, or optional fields into completed features without source evidence.

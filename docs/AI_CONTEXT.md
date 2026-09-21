# AI context

**Start here for future coding tasks.** Audited 2026-09-19 against the working tree. Use [INDEX.md](INDEX.md) for topics, [FEATURE_MAP.md](FEATURE_MAP.md) for file selection, and [CHANGE_GUIDE.md](CHANGE_GUIDE.md) for the workflow. Inspect relevant source before editing; do not rescan the entire project for a routine change.

## Project and stack

Persian RTL employee portal and admin panel for آذرشین. Next App Router + React + strict TypeScript; Tailwind v4/custom shared CSS; Lucide; local Vazirmatn font. React hooks/context and browser localStorage repositories; no external store. Locked versions and commands: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md).

**No domain backend, API endpoints, database, server actions, real authentication, or ProcessMaker integration.** Next still provides server rendering; root layout forces dynamic rendering. Do not turn a frontend feature request into a backend project.

## Architecture and key files

- [app/layout.tsx](../app/layout.tsx): `lang=fa`, `dir=rtl`, font, metadata, ToastProvider. [app/globals.css](../app/globals.css): existing design and responsive system, with the user-supplied `public/assets/site-background.jpg` as a fixed backdrop on all pages.
- [Employee layout](<../app/(employee)/layout.tsx>): AuthGuard → PortalShell + InfoRail. [Admin layout](<../app/admin/(panel)/layout.tsx>): AuthGuard admin → PortalShell admin. Group names do not appear in URLs.
- [lib/navigation.ts](../lib/navigation.ts): ordered menus; add only required entries. [ROUTES.md](ROUTES.md): all 28 page paths.
- [components/employee/](../components/employee/), [components/admin/](../components/admin/): feature behavior. [components/shared/](../components/shared/), [components/ui/](../components/ui/): shell/auth/assets/tables/forms/dialogs/states/toasts.
- [services/mockRepository.ts](../services/mockRepository.ts): sole collection persistence adapter. [hooks/useResource.ts](../hooks/useResource.ts): subscribed data/loading/error/reload. [types/index.ts](../types/index.ts): all domain contracts.
- [data/](../data/): demo seeds, except authoritative [phoneDirectory.ts](../data/phoneDirectory.ts). [lib/date.ts](../lib/date.ts), [lib/utils.ts](../lib/utils.ts), [lib/labels.ts](../lib/labels.ts): calendar, normalization/link/error helpers, Persian enum labels.

Flow: thin server page/layout may supply seed arrays → client feature → service/repository → localStorage → `portal:name`/native storage events → useResource refresh. Missing storage uses cloned seeds; saved empty arrays stay empty. Server reads never see browser records. Full keys/contracts: [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md), [API_AND_DATA.md](API_AND_DATA.md).

## Fast feature pointers

| Request area | Start here |
| --- | --- |
| Admin employee accounts | [AdminEmployees.tsx](../components/admin/AdminEmployees.tsx), [employeeService.ts](../services/employeeService.ts), account type; authService for login impact |
| Employee feedback | [FeedbackPage.tsx](../components/employee/FeedbackPage.tsx), [feedbackService.ts](../services/feedbackService.ts); only suggestion/criticism |
| Login/session/profile | [LoginForm.tsx](../components/shared/LoginForm.tsx), [authService.ts](../services/authService.ts), [AuthGuard.tsx](../components/shared/AuthGuard.tsx), [PortalShell.tsx](../components/shared/PortalShell.tsx) |
| Admin content CRUD | [ContentManager.tsx](../components/admin/ContentManager.tsx), [resourceConfig.tsx](../components/admin/resourceConfig.tsx), relevant service/type/employee view |
| Requests/course enrollment | ProcessInbox/ProcessDetails/ProcessRequestForm and CoursesPage under components/employee; processService + activityService |
| Directory/ticket choices | PhoneDirectory, AdminPhoneDirectory, phoneDirectoryService; TicketsPage reads department names |
| Dashboard/rail/shared UI | Dashboard/AdminDashboard/InfoRail and composed views; shared components + scoped global CSS |

Exact files and cross-feature edges are in FEATURE_MAP. News/courses use routed admin editors; gallery/announcements/quick links use modals. **`/admin/processes` manages quick links, not process instances.** Courses create an enrollment process using `COURSE-${course.id}`. CRM is a preparation page only.

## Authentication and permissions

Login is username/password: demo employee `employee` / `employee123`, admin `admin` / `admin123`. Admin-created accounts can sign in locally. Employee usernames are trimmed/case-insensitive; passwords match exactly, including spaces and digit forms. See [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md) for full rules.

Session keys `azarshin.demo.employee` and `azarshin.demo.admin` hold IDs independently. EmployeeAccount stores names/position/username/plaintext password; authService projects it to Employee context, mapping position to the existing department field. Phone-directory records are separate. Keep stable IDs on edits.

AuthGuard is client-only. Common admin roles: ADMIN/SUPER_ADMIN/HR/CONTENT_MANAGER, but only built-in ADMIN is supplied; managed accounts are EMPLOYEE. No granular permissions. Own process/ticket/feedback records filter employeeId. Process activities filter display name; other activity types and notifications are shared. Guards do not subscribe to session/account changes: deletion/edits are reflected on guard remount/reload, not immediately everywhere.

## Conventions and constraints

- Reuse DataTable, ContentForm where suitable, Field/Input/Button/Card, Modal/ConfirmDialog, states and toasts. Specialized password/feedback/request forms have their own components/helpers. No new architecture/dependency without a concrete need.
- Persian labels and RTL throughout; isolate Latin identifiers with LTR/bdi. Use Intl Persian calendar/Tehran time; native date forms are Gregorian. Search normalization must never normalize passwords.
- Preserve supplied brand assets, Vazirmatn, palette and shared layouts. Tables turn into cards below 768px; drawer replaces desktop sidebar below 1024px. Follow [UI_AND_DESIGN_SYSTEM.md](UI_AND_DESIGN_SYSTEM.md).
- Preserve the exact 10 departments/25 original extensions, including separate 253/254 entries named `دکتر شهرور افشار`. Do not merge duplicate names or silently correct authoritative spelling.
- Account-management bottom notice is absent; copyright sentence is hidden only at `/admin/employees`. Feedback accepts **only** suggestion/criticism.
- Named PascalCase components, thin default-export page wrappers, camelCase services/utilities, root `@/` alias and nearby relative imports. Keep unrelated formatting/refactors out of the diff.

## Limits and validation

No secure/multi-device persistence, migration, conflict resolution, transactions, cascade deletes, full runtime schemas, or immediate session revocation. Activities are not a complete audit log. Process progression, ticket replies, admin feedback review, and real CRM are NOT CURRENTLY IMPLEMENTED. Optional task URLs and declared roles are not evidence of integration. Deployment outside this tree is UNKNOWN — Requires source inspection.

Use `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as appropriate. Browser suite: `npm run test:e2e`, requires a running server and installed Chrome; optional `PORTAL_TEST_URL`. It writes ignored test-results. Four domain tests cover authoritative directory, Persian search, calendar and link schemes. `node docs/check-docs.mjs` checks documentation structure/links/routes. Read DEVELOPMENT_GUIDE for precise commands and VALIDATION for dated evidence.

Before editing, inspect the current diff and preserve pre-existing work. After a change, update relevant docs/maps and this summary if the project-level facts changed. Source wins over stale documentation; correct both within the task's scope.

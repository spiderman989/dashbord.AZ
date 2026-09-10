# پورتال کارکنان 

A Persian RTL employee portal and separate administration interface using Next.js App Router, strict TypeScript, React, Tailwind CSS, Lucide icons, and locally hosted Vazirmatn.

**Validation status (2026-09-09):** npm installation, lint, full TypeScript checking, the production build, all four domain tests and source checks pass. Chrome browser verification passes 14 workflows, 86 route/viewport checks and 11 automated accessibility audits, with no overflow, broken images, or console/hydration errors. Desktop and mobile screenshots were reviewed. See [docs/VALIDATION.md](docs/VALIDATION.md) for evidence, focused fixes and verification limits.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows with PowerShell script execution disabled, use `npm.cmd` in place of `npm`. Installation runs `scripts/setup-assets.mjs` to copy the licensed Vazirmatn font into `public/fonts/` automatically.

| Account | Login | Demo credentials |
| --- | --- | --- |
| Employee | `/login` | Personnel code `1001`, national ID `0012345678` |
| Admin | `/admin/login` | Username `admin`, password `admin123` |

These credentials are deliberately public mock values. Login forms provide a button to fill the demo credentials. Employee and admin sessions are independent, so both areas can be reviewed in one browser.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
# In another terminal, with Chrome installed:
npm run test:e2e
```

The browser suite tests employee/admin login, CRUD, publication visibility, date validation, image uploads, toggles, ordering, process submission, course enrollment, tickets, exact directory preservation, search normalization, pagination, mobile drawers, keyboard dismissal, logout, and persistence. It checks the routes at desktop and mobile widths, plus representative layouts at 1920, 1280, 1024, 768, and 360 pixels. It records screenshots and an accessibility/layout report under `test-results/`. Set `PORTAL_TEST_URL` to test a different local port.

## Routes

Employee: `/login`, `/`, `/processes`, `/processes/new`, `/processes/[id]`, `/phone-directory`, `/news`, `/news/[id]`, `/courses`, `/tickets`, `/crm`, `/activities`, `/announcements`.

Admin: `/admin/login`, `/admin`, `/admin/news`, `/admin/news/new`, `/admin/news/[id]`, `/admin/courses`, `/admin/courses/new`, `/admin/courses/[id]`, `/admin/gallery`, `/admin/announcements`, `/admin/processes`, `/admin/activities`, `/admin/phone-directory`.

CRM provides an explicit preparation state with working support navigation. Process viewing has an informational mock preview until an API-provided case link is available.

## Architecture

```text
app/          App Router layouts, pages, loading and error boundaries
components/   Reusable UI primitives, employee features, admin management
data/         Demo content and authoritative phone-directory seed
services/     Async repository contracts, auth and domain services
hooks/        Lifecycle-safe subscriptions and loading/error handling
types/        Central domain interfaces and future role definitions
lib/          Jalali formatting, Persian normalization, labels and navigation
public/       Supplied organizational assets and local font
tests/        Exact directory, Persian search, calendar and link-safety tests
scripts/      Browser workflow, responsive and accessibility verification
```

UI components read services. Services use one local mock repository. Mutations persist in browser localStorage, notify mounted subscribers, and synchronize across tabs through storage events. Server-rendered pages provide initial seeds; client subscribers reconcile browser edits. Stored edits survive navigation/reloads and appear in the employee portal. No component imports mock content arrays directly.

Phone records use stable independent IDs. Names that look duplicated are never merged. Each department and extension supports mock CRUD; extensions can be enabled or disabled. Original seed records remain unchanged on disk. Explicit administrator edits affect browser storage only. Admin forms retain manager titles in parentheses.

Date display uses `Intl.DateTimeFormat` with the actual Persian calendar and `Asia/Tehran`. The calendar computes Jalali month lengths including leap years, has month navigation and a return-to-today action. Date form inputs use browser-native Gregorian input with a Persian explanation; published dates are always shown in Jalali.

## Replace mocks with the company API

Replace `services/mockRepository.ts` or individual domain service methods with typed calls to the company API. Retain the `Repository<T>` interface and use `getEmployeeProcesses(employeeId)` for an employee inbox. Production authentication must come from a backend-verified session using secure HttpOnly cookies and server-enforced permissions. Mock browser route guards are UI behavior, not production authorization.

The future flow is **Browser → Next.js → Company Backend/API → MySQL / ProcessMaker 3.8.3**. This project has no MySQL client, database connection, ProcessMaker calls, environment secrets, access tokens, or real backend. Only an approved task URL supplied by the backend is passed to `ProcessItem.backendTaskUrl`; the UI rejects executable URL schemes. The backend must validate task ownership and any destination before returning a URL.

Images uploaded in the demo are decoded and validated in the browser (PNG/JPEG/WebP, at most 1 MB) and stored as data URLs. Storage quota errors are surfaced to the user. Replace this with a backend upload service for production storage. Demo persistence is device/browser-local, not multi-user storage.

Roles are prepared as `EMPLOYEE`, `ADMIN`, `SUPER_ADMIN`, `HR`, and `CONTENT_MANAGER`; finer-grained authorization belongs in the company backend.

## Branding

See [docs/ASSETS.md](docs/ASSETS.md) for the inspected assets, their mapping, and the brand palette. The supplied brand sheet is the branding authority, and the supplied dashboard screenshot is the layout authority.

Framework references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

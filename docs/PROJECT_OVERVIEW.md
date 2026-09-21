# Project overview

The **آذرشین employee portal** is a Persian RTL web frontend for everyday employee requests, organizational information, and local administration. The package is named `azarshin-employee-portal`, version `1.0.0`, and is private. Its current purpose is a working local/demo portal, not a deployed enterprise backend.

## Technology and structure

- Next.js App Router and React, with strict TypeScript.
- Tailwind CSS v4 plus the existing custom stylesheet in [app/globals.css](../app/globals.css).
- Lucide icons and locally served Vazirmatn typography.
- React hooks/context for UI state; a shared localStorage repository adapter for domain data.
- Node domain tests, ESLint, TypeScript checks, and a Playwright/axe browser harness.

Exact locked versions and commands are in [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md). Route groups separate the employee portal from the administration panel without adding parentheses to URLs. Login pages sit outside those guarded groups.

## Implemented areas

| Area | Current capability |
| --- | --- |
| Employee workspace | Dashboard, own process inbox/details, request creation, quick links, activity history |
| Information | Published news/details, active announcements, directory search/copy/call, calendar, clock, gallery |
| Training | Active/finished courses; an enrollment request creates a local process record |
| Support | Local ticket submission and own ticket history |
| Feedback | صندوق انتقادات و پیشنهادات: only پیشنهاد / انتقاد, local submission and own history |
| Administration | Dashboard; news, course, gallery, announcement and quick-link management; activity viewing; department/extension management |
| Employee accounts | مدیریت کارکنان: add/edit/delete browser-local accounts with visible organizational position; these accounts can use the employee login |
| Shared shell | Navigation, mobile drawer, profile, notifications, independent employee/admin logout |
| CRM | **Partially implemented:** preparation page with a support link; customer/sales functionality is NOT CURRENTLY IMPLEMENTED |

Detailed flows and boundaries are in [FEATURES.md](FEATURES.md). Some sample content mentions future CRM, reviews, or responses; those sentences do not establish implemented functionality.

## Roles and data flow

The current usable identities are a built-in demo employee, a built-in demo admin, and local employee accounts created through the admin panel. The type system also declares `SUPER_ADMIN`, `HR`, and `CONTENT_MANAGER`; they are accepted by the common admin role check, but separate role provisioning and granular capabilities are NOT CURRENTLY IMPLEMENTED.

The typical flow is:

`page wrapper → feature component → service/repository → browser localStorage → subscription → refreshed UI`.

Some server page/layout wrappers supply initial seed arrays. When client components mount, they read browser storage and reconcile any saved edits. Administration and employee views share repositories, so edits become visible in relevant mounted views and other tabs on the same origin. This is not cross-device or multi-user server synchronization.

The source contains **no application API endpoints, database, backend business services, server actions, or real authentication**. Next.js still runs a server for rendering and serving the app. “Frontend-only” describes the business-data architecture, not a static-export build. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Data authority and boundaries

[data/phoneDirectory.ts](../data/phoneDirectory.ts) contains the authoritative 10 departments and 25 extension records. Their spelling, ordering, grouping, and intentional duplicates are regression tested. Other populated collections are demo seeds. Employee-account, feedback, and ticket collections start empty.

Local credentials are plaintext mock data. UI guards and employee filtering are convenience behavior, not a security boundary. Real authentication/authorization, server persistence, ProcessMaker/MySQL integration, feedback review, ticket replies, and process progression are **NOT CURRENTLY IMPLEMENTED**. No deployment provider or environment is configured in the source tree; its external deployment arrangement is **UNKNOWN — Requires source inspection** of any deployment repository/configuration supplied later.

Preserve the existing design, authoritative directory, independent sessions, and local repository conventions unless the requested task specifically requires changing them.

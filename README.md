# پورتال کارکنان 

A Persian RTL employee portal and administration panel built with Next.js App Router, React, strict TypeScript, Tailwind CSS, Lucide, and locally hosted Vazirmatn.

**Start future AI coding tasks with [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md).** The [documentation index](docs/INDEX.md) links architecture, every route, feature/file maps, component contracts, local data, authentication, design conventions, and the change workflow.

## Run locally

Use Node 24 to match the audited environment, then:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Use `npm.cmd` instead of `npm` if PowerShell blocks npm's script wrapper. Installation copies the licensed local font through the existing postinstall script.

The two public login pages are `/login` and `/admin/login`. Both use username/password. Built-in sample credentials and admin-created local employee login behavior are documented in [AUTH_AND_PERMISSIONS.md](docs/AUTH_AND_PERMISSIONS.md).

## Current scope

Employees can use a dashboard, process inbox and request forms, phone directory, published news, training requests, local tickets, activity history, and **صندوق انتقادات و پیشنهادات** with only پیشنهاد / انتقاد. Administrators manage content, quick links, directory entries, and employee accounts through **مدیریت کارکنان**. CRM is a preparation page.

Business data and credentials are browser-local demonstrations. There are **no application APIs, database connections, backend business services, or real authentication**. Next.js provides rendering/serving; client guards are not security boundaries. See [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) and [API_AND_DATA.md](docs/API_AND_DATA.md) for implemented features and limitations.

The authoritative 10 departments and 25 extension records are separate from employee accounts. Their original spelling, grouping, ordering, and duplicates are regression tested. Branding and supplied references are mapped in [ASSETS.md](docs/ASSETS.md).

## Development and validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
node docs/check-docs.mjs
```

Browser QA requires a running production server and installed Chrome; run `npm run test:e2e` in another terminal. [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) documents supported commands, dependencies, optional `PORTAL_TEST_URL`, outputs, and troubleshooting. [VALIDATION.md](docs/VALIDATION.md) separates dated evidence from checks performed during documentation work.

Before changing a feature, follow [CHANGE_GUIDE.md](docs/CHANGE_GUIDE.md) and use [FEATURE_MAP.md](docs/FEATURE_MAP.md) to inspect the relevant source. Preserve unrelated functionality, the existing design, authoritative records, and uncommitted work. Update affected documentation with implementation changes.

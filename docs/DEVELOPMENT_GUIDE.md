# Development guide

## Prerequisites and dependencies

Use Node.js **24** to match the audited local environment (24.13.0, npm 11.6.2). The root package does not declare engines. Locked Next.js declares Node ≥20.9, but the project's test command additionally requires Node's `--experimental-strip-types`; the Next minimum alone does not establish support for every project command.

The committed [package-lock.json](../package-lock.json) resolves the following main versions at the audit. [package.json](../package.json) uses `latest` for most packages, so refreshing dependencies can change the toolchain substantially. Keep the lockfile and avoid incidental upgrades.

| Dependency | Locked version | Use |
| --- | --- | --- |
| next | 16.3.4 | App Router, rendering, build/dev server, image/font integration |
| react / react-dom | 19.2.8 | Components, hooks/context, DOM rendering |
| lucide-react | 1.43.0 | Icons |
| typescript | 6.0.3 | Strict types and source checking |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | Utilities/theme compilation |
| eslint / eslint-config-next | 9.39.5 / 16.3.4 | Next and TypeScript lint rules |
| @fontsource-variable/vazirmatn | 5.3.0 | Font source copied into public assets |
| playwright | 1.63.0 | Browser workflow harness |
| @axe-core/playwright | 4.13.0 | Automated accessibility audits |

React/DOM/Node type packages are also installed. No API client, database driver, external store, form schema library, date library, or UI component kit is declared.

## Installation and local server

From the repository root:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. With PowerShell script execution restrictions, use `npm.cmd` instead of `npm`. `npm install` is also supported, but `npm ci` uses the existing lockfile reproducibly. The postinstall script, [scripts/setup-assets.mjs](../scripts/setup-assets.mjs), copies the Vazirmatn Arabic variable font and license into [public/fonts/](../public/fonts/). Do not skip it when preparing a fresh environment.

Both dev and start bind to `0.0.0.0`. A different port is supported by forwarding `--port`, for example `npm.cmd run dev -- --port 3100`. Browser-local records are scoped by origin; switching between ports/hostnames uses different storage. Demo credentials and managed-account behavior are documented in [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md).

## Supported commands

| Command | What it checks / runs |
| --- | --- |
| `npm run dev` | Next development server |
| `npm run build` | Optimized production build, TypeScript and route generation |
| `npm start` | Serves a previously completed build |
| `npm run lint` | `eslint .` with Next core-web-vitals/TypeScript configs |
| `npm run typecheck` | `tsc --noEmit`; tests are excluded in tsconfig |
| `npm test` | Node strip-types test runner on `tests/domain.test.ts` |
| `npm run test:e2e` | `node scripts/qa-browser.cjs`; requires a running server and installed Chrome |
| `node scripts/check-source.mjs` | Syntax transpilation for app TS/TSX and strict domain checking; supplements full typecheck |
| `node scripts/setup-assets.mjs` | Recopy local font/license if necessary |
| `node --check scripts/qa-browser.cjs` | Browser-harness JavaScript syntax check |
| `node --check scripts/setup-assets.mjs` | Asset-script JavaScript syntax check |
| `node docs/check-docs.mjs` | Required docs/index, local links/anchors/source paths, and exact route-to-page coverage |
| `npm ls --depth=0` | Inspect actual installed direct dependency versions |

There is no formatter script, Jest/Vitest setup, Storybook, or configured CI job. Do not invent commands such as `npm run format` or `npm run test:unit`.

## Production/browser validation

Build and start in one terminal:

```sh
npm run build
npm start -- --port 3100
```

Then in another PowerShell terminal:

```powershell
$env:PORTAL_TEST_URL = 'http://localhost:3100'
npm.cmd run test:e2e
```

`PORTAL_TEST_URL` is optional, used only by [scripts/qa-browser.cjs](../scripts/qa-browser.cjs); default is `http://localhost:3000`. The harness does not start the server. It launches installed Chrome (`channel: "chrome"`) headlessly in an isolated context with Persian locale, Tehran time zone and clipboard permissions. It changes data only inside that test context.

Current harness coverage: 17 named workflows; all 28 concrete page examples at 1440px/390px; additional representative widths 1920/1280/1024/768/360; course-form and new-feature regressions, totaling 100 route/viewport checks; 17 axe audits. It checks RTL, overflowing document width, missing images, console/page errors, login/session behavior, CRUD, persistence, publication, normalized search, course requests, tickets, feedback, account credential edits/deletion, and mobile navigation/dialog behavior. Coverage is selected automated Chrome checks, not all browsers or a full manual accessibility review.

The harness writes JSON reports/screenshots under ignored `test-results/`. Optional inspection mode is supported: `node scripts/qa-browser.cjs --inspect /admin/employees 390`. It seeds local demo session markers only in the isolated context and writes inspection diagnostics instead of running the full suite. Dated results are in [VALIDATION.md](VALIDATION.md); results must not be presented as newly run unless actually rerun.

The four [domain tests](../tests/domain.test.ts) cover exact directory records/order/duplicates, Persian/Arabic search/digits, actual Jalali leap/year/month boundaries, and local/HTTPS link acceptance with unsafe schemes rejected. There are no isolated unit tests for every service; browser workflows cover many service behaviors.

## Configuration and environment

No application environment variables or secrets are read in the audited source. No environment file/example is supplied. [next.config.ts](../next.config.ts) enables strict React mode, disables the powered-by header, and has no remote-image patterns. Root layout forces dynamic rendering; no static export is configured. [tsconfig.json](../tsconfig.json) defines root `@/` imports, strict ES2022/bundler checking, and generated Next type includes. [eslint.config.mjs](../eslint.config.mjs) ignores build/test/tool output. [postcss.config.mjs](../postcss.config.mjs) enables Tailwind's PostCSS plugin.

Next generates [next-env.d.ts](../next-env.d.ts) and `.next` route type files; dev and build can point these references at different generated locations. Do not treat generated paths as permanent hand-authored source. Start the normal dev/build process if missing generated types prevent a fresh-checkout typecheck, and inspect any generated-file diff separately from intentional changes.

## Troubleshooting and known limits

| Symptom | Source-grounded check |
| --- | --- |
| Missing font on install/build | Check installed font package and rerun `node scripts/setup-assets.mjs`; font is local, not downloaded by Next at runtime |
| Browser QA fails to launch | Verify installed Chrome and project dependencies; the harness explicitly selects Chrome, not bundled/default Chromium |
| QA connection refused / wrong content | Start the intended production build and match PORTAL_TEST_URL; QA assumes initial seed data in its own new context |
| Seed edit seems ineffective | Existing collection JSON wins over seeds. Inspect the relevant key in a test profile; do not wipe a user's records |
| Saved data unreadable | Adapter rejects malformed JSON/invalid record IDs; there is no repair/migration UI |
| Image save fails | Check file decode/type/size and available localStorage quota; no remote upload service exists |
| Employee change not reflected in profile/session | Reload/remount AuthGuard; collection updates alone do not refresh EmployeeContext |
| Wrong “latest” entry/order | Repository arrays preserve seed order and prepend creates; most lists do not date-sort automatically |

During this audit `npm.cmd ls --depth=0` succeeded but listed extra installed native/WASM support packages as `extraneous`. No dependency cleanup or upgrade was performed; use the lockfile to reconstruct an environment rather than assuming every current node_modules entry is a project dependency.

Deployment scripts/provider configuration and external infrastructure are **UNKNOWN — Requires source inspection** of deployment material outside this tree. No deployment validation, Firefox/WebKit/device testing, or manual screen-reader certification is established by the current local checks. Backend integration remains **NOT CURRENTLY IMPLEMENTED**.

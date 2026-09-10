# Validation status

**Completed on 2026-09-09. All requested local frontend validation checks pass.** The previous npm/network blocker was resolved after the VPN connection was restored. The existing frontend was retained; changes were limited to defects exposed by validation, test reliability, installed dependencies, and documentation.

## Installation and environment

- Official registry connectivity succeeded: `npm.cmd view next version --fetch-timeout=15000 --fetch-retries=0` returned `16.3.4`.
- `npm.cmd install --fetch-timeout=60000 --fetch-retries=2 --no-fund` succeeded: 369 packages added, 370 audited, zero reported vulnerabilities. No alternative registry or proxy was needed.
- npm generated `package-lock.json`. The postinstall script copied the local Vazirmatn font and its OFL license into `public/fonts/`.
- Resolved application versions: Next.js 16.3.4, React/React DOM 19.2.8, Tailwind CSS 4.3.3, TypeScript 6.0.3. `npm.cmd ls --depth=0` completed successfully.
- Validation ran on Windows with Node.js 24.13.0. Browser tests used Playwright 1.63.0 and installed Chrome 152.0.7977.76 against `npm.cmd start -- --port 3000`, serving the production build at `http://localhost:3000`.
- npm emitted a nonblocking deprecation warning for ESLint 9.39.5. Lint passes; no unrelated major tooling migration was made during this validation task.

## Final command results

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | PASS; no warnings or errors |
| `npm.cmd run typecheck` | PASS; full application TypeScript checking |
| `npm.cmd run build` | PASS; optimized Next.js production build, TypeScript and route generation |
| `npm.cmd test` | PASS; all four domain tests, none skipped |
| `node scripts/check-source.mjs` | PASS; syntax checks for 91 TS/TSX files and strict typing for 23 domain/data/service/utility files using the installed compiler |
| `node --check scripts/qa-browser.cjs` | PASS |
| `node --check scripts/setup-assets.mjs` | PASS |
| `node scripts/qa-browser.cjs` (the `test:e2e` package script) | PASS; 14 workflows, 86 route/viewport checks, 11 accessibility audits |

Lint, full type checking, domain tests and source checks were rerun after the fixes. The final browser suite ran against the rebuilt production application and completed at `2026-09-09T09:03:47.299Z`.

## Browser coverage

The browser suite uses an isolated context with Persian locale and the Tehran time zone. It creates and removes test content in that context without altering the authoritative seed files or an existing user browser profile.

- Employee and admin login: invalid credentials, Persian digits, protected-page redirects, independent sessions, profile identity and logout.
- Processes: status filtering, details, mock process preview, request creation and persistence after reload. Course enrollment and ticket creation/history also pass.
- News: create draft, preview, edit, publish and delete; drafts remain hidden from employees. Publishing and deletion update an already-open employee tab, and published content survives reload.
- Other administration flows: course validation/create/edit/delete; gallery upload/preview/disable/delete; announcement creation/status filtering/disable/delete; quick-process creation/link validation/reordering/delete; activity search and pagination.
- Phone administration: add a department and extension, preserve the manager label, edit and disable the extension, verify employee visibility, and delete the temporary department. The original 25 employee-visible records remain afterward.
- Persian/Arabic directory search, Persian extension-number search, copy feedback, department search and empty/reset behavior pass.
- Mobile navigation opens and closes the right-side drawer, closes it after navigation and Escape, and restores body scrolling. Dialog dismissal and responsive table cards work.
- All inspected routes retain `lang="fa"` and `dir="rtl"`. Final checks report **zero horizontal-overflow failures, zero broken images, and zero console or hydration errors**.
- Axe WCAG 2 A/AA and 2.1 AA checks report **zero violations across 11 audited views**: employee login/dashboard/directory, admin dashboard/news/forms/login, with desktop and mobile coverage. This is automated coverage, not a claim of a complete manual accessibility certification.

All 26 concrete routes below passed at both 1440px and 390px:

| Area | Verified routes |
| --- | --- |
| Employee access and inbox | `/login`, `/`, `/processes`, `/processes/process-1`, `/processes/new`, `/phone-directory` |
| Employee content and support | `/news`, `/news/news-1`, `/courses`, `/activities`, `/announcements`, `/tickets`, `/crm` |
| Admin access and news | `/admin/login`, `/admin`, `/admin/news`, `/admin/news/new`, `/admin/news/news-1` |
| Admin courses and content | `/admin/courses`, `/admin/courses/new`, `/admin/courses/course-1`, `/admin/gallery`, `/admin/announcements`, `/admin/processes`, `/admin/activities`, `/admin/phone-directory` |

Six representative pages additionally passed at 1920, 1280, 1024, 768 and 360px. The course create/edit forms received additional 360px and 768px regression checks after the overflow fix: **86 route/viewport checks in total**. Created process and content IDs were also exercised in the workflow tests.

## Authoritative directory regression results

The domain test compares every original name, extension, department and ordering exactly, and checks unique record IDs. Browser checks independently verify 25 displayed extensions and these 10 department names in order:

`مدیریت`، `مالی`، `فروش`، `دبیرخانه`، `روابط عمومی`، `IT`، `انبار`، `تدارکات`، `منابع انسانی`، `حراست`.

- Extensions **253** and **254** remain two independent records under `مدیریت`.
- Their name remains **`دکتر شهرور افشار`**, exactly as supplied in the original authoritative directory. The later validation request uses `دکتر شهروز افشار`; no spelling correction or data migration was made.
- **114 — علیرضا میراحمدی** and **109 — آشپزخانه** both remain under `تدارکات`.
- The other three domain tests pass Persian/Arabic search normalization, true Jalali dates including leap/month/year boundaries, and permitted local/HTTPS process links.

## Failures found and fixed

| Initial failure | Focused fix | Final verification |
| --- | --- | --- |
| A ReactNode conditional could pass a number/bigint into the CSS class utility | Convert `rail` to a boolean in `PortalShell` | Full type check and build pass |
| Donut-chart offset mutation violated the React immutability lint rule | Derive cumulative offsets from process counts | Lint/build and rendered chart checks pass |
| Anonymous PostCSS config export triggered a lint warning | Export a named config constant | Lint passes without warnings |
| Course image preview caused 17px of horizontal overflow at 390px | Constrain the preview image to its container width | Create/edit forms pass at 360, 390, 768 and 1440px |
| Low text contrast in the header, welcome surfaces and extension numbers | Adjust muted text and use the existing darker brand color for extension text | All 11 automated accessibility audits pass |
| The browser harness expected label text without the visual required marker | Accept the optional marker in test locators; preserve the accessible UI labels | Employee/admin form workflows pass |

Browser checks now also wait for fonts and lazy images to finish loading, record environment/audit metadata, verify exact department names and both Afshar extensions, and exercise news synchronization across tabs. No checks were disabled to obtain a pass. No application routes, branding assets, authoritative records or service architecture were rewritten.

## Evidence and visual review

The final machine-readable results are in [test-results/qa-report.json](../test-results/qa-report.json). Final desktop and mobile screenshots were visually reviewed for RTL placement, form/image containment, responsive cards and directory readability:

- [Employee desktop](../test-results/portal-desktop.png) and [employee mobile](../test-results/portal-mobile.png)
- [Admin desktop](../test-results/admin-desktop.png) and [admin news mobile](../test-results/admin-news-mobile.png)
- [Directory mobile](../test-results/directory-mobile.png)
- [Corrected course form mobile](../test-results/admin-course-mobile.png)
- [Admin login mobile](../test-results/login-mobile.png)

The employee desktop login was also inspected during initial browser diagnosis. All five supplied PNG references were inspected before the original implementation, and their source files remain preserved. `test-results/` is ignored by version control and regenerated by browser QA; any earlier `failure.png` or `inspection.*` files are diagnostic artifacts, not the final result.

## Remaining limits

There are **no remaining installation or local frontend validation blockers** and no failing available tests.

- Firefox, Safari/WebKit, physical mobile devices, and manual screen-reader testing were not verified; the executed browser checks use installed Chrome with resized viewports.
- Real backend authentication/authorization, multi-user server persistence, MySQL and ProcessMaker integration remain intentionally outside this frontend-only phase. Browser-local mock persistence and cross-tab updates are verified.
- No deployment or external hosting validation was performed; the production build was verified locally.

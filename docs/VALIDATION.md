# Validation evidence

## Delete every page/link entry: 2026-09-28

Fresh checks for builtin and custom deletion in `/admin/links`:

- `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`: PASS. Typecheck also passed after restoring the pre-existing dev type imports in `next-env.d.ts`.
- `npm.cmd test`: PASS, all 11 domain tests.
- `node scripts/qa-page-links.cjs`: PASS, 18 workflows and 4 axe audits on the current production build at port 3102; no browser/console errors. Covers a trash action on every row in both panels, cancel, quota failure with retry, shared-menu refresh, reload persistence, unchanged builtin grants/content/direct routes, deletion of the settings entry, empty tables and custom replacements using deleted builtin titles. An initial run stopped on an incorrect test expectation for the news heading; it was corrected to the existing UI title before the successful full rerun.
- Final URL-direction copy adjustment: rebuilt and reran lint/typecheck, then `node scripts/qa-page-links.cjs --delete-dialog`: PASS, 1 focused workflow and 1 axe audit. Verified all 10 admin rows have deletion controls, the return URL is LTR-isolated inside the RTL confirmation, and deleting the settings entry persists while its direct route remains accessible.
- Desktop/mobile screenshot review: PASS; existing table styling and mobile dialog layout remain usable. Final images: `test-results/page-links-delete-final-desktop.png` and `test-results/page-links-delete-final-mobile-dialog.png`.
- `node docs/check-docs.mjs`: PASS.

Evidence: `test-results/page-links-report.json` (08:57:23Z–09:01:23Z) and `test-results/page-links-delete-final-report.json` (09:03:48Z–09:03:58Z), both 2026-09-28. Deletions and quota fixtures ran only in isolated Chrome contexts. No user browser records or authoritative seed files were changed. The full general-browser and permission suites below are historical evidence and were not rerun for this scoped change.

## Page and link management: 2026-09-27

Fresh checks for `/admin/links` and its navigation/permission integration:

- `npm.cmd run build`: PASS, including the new route (31 page wrappers plus framework not-found output).
- `npm.cmd run lint`: PASS with no warnings; `npm.cmd run typecheck`: PASS.
- `npm.cmd test`: PASS, 11 tests. New coverage checks full HTTP/HTTPS URLs including localhost/IP/ports, rejection of credentials/unsafe protocols, normalized title uniqueness, stable custom IDs, inactive/missing grants and the primary-admin-only section.
- `node scripts/qa-page-links.cjs`: PASS, 15 workflows and 3 axe audits against the production build on port 3102. Covers actual-menu inventories, independent builtin overrides, external same-tab/internal new-tab navigation, no redirect chains, stable-ID creation/placement/rename, default denial and live assignment, destination authorization, disable/reactivate, dirty warnings/cancel, inline errors, quota failure without applying changes, reload/loading gate, deletion cleanup, independent reset, admin entry, protected settings and corrupt storage fallback.
- Desktop and 360/390/768px responsive checks passed after waiting for the existing sidebar transition to settle. Desktop and mobile screenshots were visually inspected; the icon-preview ARIA role was corrected after an initial axe finding. Final audits have no violations or runtime/console errors.
- Existing `scripts/qa-permissions.cjs`: PASS, 8 workflows and 4 axe audits against this build. Its primary-admin menu expectation now includes the fixed settings entry; the original 19 delegable builtin sections remain intact.
- Existing `scripts/qa-browser.cjs`: PASS, all 17 workflows, 100 responsive route checks and 17 axe audits against this production build on port 3102. No browser errors, overflow, broken images or axe violations were reported.
- `node scripts/qa-page-links.cjs --external-tab`: PASS, an additional isolated browser check follows an external subdomain/port/path URL into a new tab, verifies `noopener noreferrer` and null opener, keeps the original tab on settings, then resets that builtin to its real internal route and same-tab mode.
- Final notification-only follow-up: `node scripts/qa-page-links.cjs --notifications`: PASS. An exact section-entry notification follows its override, a detail notification keeps its real route, and read-all leaves hidden notifications unread. This narrowed the read-all predicate after the full suites above; the final source was rebuilt, linted and typechecked successfully, then this focused scenario passed. Evidence: `test-results/page-links-notifications-report.json`.
- `node docs/check-docs.mjs`: PASS, 31 route mappings and 14 collection mappings. `git diff --check`: PASS (line-ending notices only).

Evidence: ignored `test-results/page-links-report.json`, `test-results/page-links-external-tab-report.json`, `test-results/page-links-*.png`, `test-results/permissions-report.json` and `test-results/qa-report.json`. The page-link suite ran from 12:30:28Z to 12:32:53Z on 2026-09-27. All accounts, permissions, corrupt-data and storage-failure fixtures were confined to isolated browser contexts. Source directory seeds and user browser data were not modified. The generated Next.js type imports were restored to the pre-existing dev paths after the build, and typecheck passed again. The mock settings are shared by accounts in one browser profile/origin only; an API and server authorization are still required for multi-device use and real security. Delete rollback is best effort across local collections, not a transaction.

## Section permissions: 2026-09-25

Fresh validation for the frontend-only permission implementation (separate from historical reports below):

- `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` (8 domain tests) and `npm.cmd run build`: PASS.
- `node scripts/qa-permissions.cjs` against the production build on localhost:3101: PASS, 8 workflows and 4 axe audits. Accounts were created only in an isolated Chrome context.
- Danial: employee processes/CRM only, allowed landing path, hidden menus/shortcuts and blocked unauthorized nested paths; admin login rejected. Ali: admin news only, news editors preserved, other admin routes blocked, no automatic employee news access. Additional checks cover disabled admin choices, all 19 sections, bulk actions, cancel/Escape/backdrop/close, reload persistence, keyboard tabs, 360/390/768px modal sizing, live employee/admin revocation, empty states, logout, malformed grants and primary-admin immunity. A limited admin granted employee management still cannot see permission actions.
- Final targeted shortcut check against the rebuilt app: PASS, 3 checks covering hidden external quick-process links without process access, filtered internal/unknown targets after granting process access, and primary-admin employee-panel access. Evidence: `test-results/permissions-shortcuts-report.json`.
- Existing `scripts/qa-browser.cjs` suite: PASS, 17 workflows, 100 route/viewport checks, 17 axe audits; no overflow, broken images, console/page errors or axe violations. Its managed-login fixture now receives explicit workspace/feedback grants through the UI.
- `node docs/check-docs.mjs`: PASS, 30 route mappings and 13 collection mappings. `git diff --check`: PASS.
- Desktop/mobile permission-dialog screenshots were visually inspected: existing RTL styling, labeled controls, scrolling options and visible footer actions preserved.

Evidence: ignored `test-results/permissions-report.json`, `test-results/permissions-desktop.png`, `test-results/permissions-mobile.png`, and `test-results/qa-report.json`. No real browser profile, authoritative directory records or existing users were modified. These tests establish local UI behavior only; server authorization remains unimplemented.


This file records **dated evidence**, not a claim that every check was rerun during documentation work. Current commands and coverage definitions are in [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md); current routes are in [ROUTES.md](ROUTES.md).

## Login logo replacement: 2026-09-20

Copied the supplied 660 x 180 transparent PNG unchanged and updated two login-scoped CSS rules. Both login routes display the logo at up to 440px wide with its original proportions, while retaining the existing logo slot, story/form positions, spacing, and mobile story-panel hiding.

| Check run for this change | Result |
| --- | --- |
| `npm.cmd run build` | PASS: production compilation, TypeScript, and all 28 routes |
| `npm.cmd run lint` and `npm.cmd run typecheck` | PASS; typecheck also passed after restoring the original generated Next.js references |
| Asset verification | PASS: original, copied, and HTTP-served PNG bytes match (75,036 bytes, 660 x 180, SHA-256 `0536ff458d4eff9e74db00185ca16f577254ae05cab8741d69627b66242920fd`) |
| Focused browser comparison | PASS: both login routes at 1920, 1440, 1280, 1024, 768, 767, 390, 360, and 320px (18 views); identical surrounding element rectangles/styles with the previous and new logo rules |
| Logo visibility and navigation | PASS: full artwork fits within the visible story panel, preserves proportions, and clears the story text; desktop logo links work on both pages; existing hiding below 768px is unchanged |
| Screenshot review | PASS: desktop logo detail, full employee desktop, admin tablet, and admin mobile layouts reviewed; no clipping, overlap, or horizontal overflow |
| Source comparison | PASS: only the two scoped CSS rules changed in application source; inspected shared components, both route wrappers, auth service, header logo, and original brand sheet match the task baseline |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://127.0.0.1:3100` | PASS: 17 workflows, 100 responsive route checks, 17 axe audits; zero overflow, broken images, browser errors, or axe violations |
| `node docs/check-docs.mjs` and `git diff --check` | PASS |

Ignored evidence: `test-results/login-logo-review.json`, `test-results/login-logo-*.png`, and `test-results/qa-report.json`. Browser: Chrome 153.0.8010.48; Node: v24.13.0. The full suite ran from 2026-09-20T04:57:26.660Z to 2026-09-20T05:00:04.221Z. Earlier entries below are historical; the shared QA report now describes this run.

## Header logo enlargement: 2026-09-19

Changed only the header image's background size from `contain` to `123% auto`. Both supplied marks are 23% larger within the existing logo viewport. Centering, image proportions/colors, header control positions, source image bytes, and responsive transforms are unchanged.

| Check run for this change | Result |
| --- | --- |
| `npm.cmd run build` | PASS: production compilation, TypeScript, and all 28 routes |
| Focused browser inspection | PASS: both headers at 1440, 1024, 768, 767, 600, 479, 390, 360, and 320px (18 views); full visible artwork, preserved proportions, no clipping, overlap, or overflow |
| Comparison with original sizing | PASS: identical logo/header/control rectangles and surrounding styles; the existing homepage links work in all 18 views |
| Screenshot review | PASS: desktop employee and mobile admin headers show the larger marks with the original placement and clear space around controls |
| Scope/source comparison | PASS: one background-size value changed; shared components, auth service, and all inspected branding assets are byte-identical to the task baseline; login branding retains its prior sizing |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://localhost:3100` | PASS: 17 workflows, 100 responsive route checks, 17 axe audits; zero overflow, broken images, browser errors, or axe violations |
| `node docs/check-docs.mjs` and `git diff --check` | PASS |

Current ignored evidence: `test-results/header-logo-size-review.json`, `test-results/header-logo-size-*.png`, and `test-results/qa-report.json`. Browser: Chrome 153.0.8010.48; Node: v24.13.0. The suite ran from 2026-09-19T11:40:17.080Z to 2026-09-19T11:43:01.229Z. Earlier entries below are historical; the shared QA report now describes this run.

## Header logo replacement: 2026-09-19

Copied the supplied transparent PNG unchanged and added one header-scoped CSS rule. Employee and admin headers use the new logo in the existing 157 x 42px viewport with the existing responsive scaling.

| Check run for this change | Result |
| --- | --- |
| `npm.cmd run build` | PASS: production build and all 28 routes |
| `npm.cmd run lint` | PASS |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS after restoring generated Next.js references |
| Asset verification | PASS: HTTP 200, image/png, 471 x 126 RGBA, 40,383 bytes; original, copied, and served SHA-256 values match |
| Focused browser inspection | PASS: employee/admin headers at 1440, 1024, 768, 390, and 360px; centered contain-sized logo, no clipping or overflow |
| Header layout and navigation | PASS: identical header, logo, and neighboring-control rectangles with the old/new image; existing accessible labels and homepage links work in all 10 views |
| Screenshot review | PASS: desktop detail and mobile header screenshots show the supplied logo clearly without shifting surrounding controls |
| Scope/source comparison | PASS: exactly one CSS rule added; BrandLogo, PortalShell, LoginForm, auth service, and original brand sheet are byte-identical to the task baseline; both login pages retain their existing logo image |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://localhost:3100` | PASS: 17 workflows, 100 responsive route checks, 17 axe audits; zero overflow, broken images, browser errors, or axe violations |
| `node docs/check-docs.mjs` and `git diff --check` | PASS |

Ignored evidence recorded for that run: `test-results/header-logo-review.json`, `test-results/header-logo-*.png`, and `test-results/qa-report.json`. Browser: Chrome 153.0.8010.48; Node: v24.13.0. The suite ran from 2026-09-19T10:53:18.600Z to 2026-09-19T10:55:58.122Z. The shared QA report may have been overwritten by later validation.

## Login background blur: 2026-09-19

Added one shared login-only CSS rule: a fixed full-viewport backdrop with 10px blur and a subtle 16% tint using the existing surface color. The background stays cover-sized while the login content remains sharp. Both login pages use the same treatment.

| Check run for this change | Result |
| --- | --- |
| `npm.cmd run build` | PASS |
| `npm.cmd run lint` | PASS |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS after restoring generated Next.js references |
| Focused browser inspection | PASS: both login pages at 1440, 768, 390, and 360px; full background coverage, no overflow, sharp foreground, clickable inputs, working password visibility controls |
| Foreground comparison with the blur layer enabled/disabled | PASS: identical element positions, dimensions, colors, and opacity; no filters applied to foreground elements |
| Employee/admin login transitions | PASS: successful navigation removes the login blur layer; dashboard backgrounds remain unfiltered |
| Screenshot review | PASS: desktop, tablet, and mobile views preserve the layout, existing focus outlines, and readable form controls |
| Scope/source comparison | PASS: exactly one CSS rule added; login component, both route wrappers, auth service, and original image are byte-identical to the task baseline |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://localhost:3100` | PASS: 17 workflows, 100 responsive route checks, 17 axe audits; zero overflow, broken images, browser errors, or axe violations |
| `node docs/check-docs.mjs` and `git diff --check` | PASS |

Ignored evidence recorded for that run: `test-results/login-blur-review.json`, `test-results/login-blur-*.jpg`, and `test-results/qa-report.json`. Browser: Chrome 153.0.8010.48; Node: v24.13.0. Suite ran from 2026-09-19T08:29:40.230Z to 2026-09-19T08:33:09.863Z. The shared QA report may have been overwritten by later validation.

## Shared image background: 2026-09-19

Applied the supplied brick/kiln JPEG as the shared fixed page background, including employee/admin pages, both login pages, and loading/not-found views. Mobile cropping keeps a brick corner visible; footer text has a light backing for contrast. The original image is copied without conversion.

Fresh validation for this change:

| Check | Result |
| --- | --- |
| `npm.cmd run build` | PASS on the final styling |
| `npm.cmd run lint` | PASS |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS after restoring the generated Next.js references |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://localhost:3100` | PASS: 17 workflows, 100 route/viewport checks across 28 route examples, 17 axe audits; zero overflow, broken images, console/page errors, or axe violations |
| Focused background inspection | PASS: 12 desktop/mobile views covering both logins, employee/admin dashboards, directory, and 404; fixed cover background, transparent login containers, RTL, and no overflow/browser errors |
| Screenshot review | Reviewed login, dashboard, 404, and scrolling directory views; refined the mobile crop and footer contrast, then checked the final screenshots |
| Asset verification | PASS: HTTP 200, image/jpeg, 1500 x 953, 60,362 bytes; original/copied/served SHA-256 values match |
| `node docs/check-docs.mjs` | PASS |
| `git diff --check` | PASS |

Current ignored evidence: `test-results/qa-report.json`, `test-results/background-review.json`, and `test-results/background-*.jpg`. Browser: Chrome 153.0.8010.48; Node: v24.13.0. Suite started 2026-09-19T07:09:02.283Z and finished 2026-09-19T07:12:08.630Z. The earlier results below remain historical and shared report paths may have been overwritten by this run.

## Login demo-panel removal: 2026-09-19

Removed the displayed demo credentials and sample-fill actions from both `/login` and `/admin/login`. Existing browser workflows now enter credentials directly; local authentication behavior is unchanged.

The following checks were run for this UI change against the updated production build:

| Check | Result |
| --- | --- |
| `npm.cmd run build` | PASS |
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `node --check scripts/qa-browser.cjs` | PASS |
| `node docs/check-docs.mjs` | PASS |
| `node scripts/qa-browser.cjs`, with `PORTAL_TEST_URL=http://localhost:3100` | PASS: 17 workflows, 100 route/viewport checks, 17 axe audits; no overflow, broken images, console/page errors, or axe violations |
| Targeted login inspection and screenshot review | PASS: both pages at 1440px and 390px; empty fields, no demo credentials or sample-fill controls, retained submit/panel-switch controls, RTL layout, and no horizontal overflow or browser errors |
| `git diff --check` | PASS |

Fresh browser evidence is in the ignored `test-results/qa-report.json`; focused login observations and screenshots are in `test-results/login-demo-removal.json` and its referenced PNGs. Browser: Chrome 153.0.8010.48; Node: v24.13.0. Reports were generated on 2026-09-19. The older evidence below remains historical.

## Historical browser report: 2026-09-18

The documentation audit inspected the existing local `test-results/qa-report.json`. Its environment records:

| Field | Recorded value |
| --- | --- |
| Started / finished (UTC) | 2026-09-18T19:04:34.451Z / 2026-09-18T19:07:33.949Z |
| Server | http://localhost:3100 |
| Browser | Chrome 153.0.8010.48 |
| Node | v24.13.0 |
| Named workflows | 17 |
| Route/viewport checks | 100 |
| Axe audited views | 17 |
| Overflow / broken images / console or page errors / axe violations | 0 / 0 / 0 / 0 |
| Failure field | Absent |

The report includes current username/password login validation, local account CRUD/login/credential edits/deletion, exactly two feedback types and own-ID history, directory preservation/search/copy, processes, tickets, enrollment, content CRUD/publication across tabs, mobile navigation, and logout. It includes 28 concrete route examples; dynamic-ID examples are not extra route definitions.

This report predates the documentation-only task. The audit verified the report contents and read the current browser harness; it did not rerun Chrome or perform a new visual review. Reports/screenshots are ignored local output and may be absent in a fresh checkout or overwritten by later runs. Regenerate them with [scripts/qa-browser.cjs](../scripts/qa-browser.cjs) against a current build when validating application changes.

## Documentation audit: 2026-09-19

The full application-source audit covered 97 TS/TSX files, all page routes, CSS, services/data/types, configuration/lockfile, tests/scripts and asset mappings. It verified that the two public asset files are byte-identical to their root references; their actual encodings are recorded in [ASSETS.md](ASSETS.md).

The following checks were run during this documentation-only task:

| Command / comparison | Result |
| --- | --- |
| `node docs/check-docs.mjs` | PASS: all 15 required documents; 19 Markdown files, 384 local links, 24 inline source paths, 28 exact route/page mappings, 12 collection mappings |
| `npm.cmd run lint` | PASS, including the new documentation checker |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd test` | PASS: all four domain tests |
| `node scripts/check-source.mjs` | PASS: syntax for 97 TS/TSX files; strict domain typing for 25 service/data/utility files |
| Source-map consistency | All 97 application TS/TSX files have documentation links; all 28 documented route component names match their page sources |
| `git diff --check` | PASS; Git also emitted line-ending normalization notices |
| Before/after SHA-256 comparison | All 119 non-documentation source/configuration/asset files unchanged |

The checker verifies structural facts; the source audit supplies the behavioral review. Existing uncommitted application changes from earlier feature work were preserved. This task changed documentation and documentation tooling only. A production build and browser suite were not rerun for the documentation-only changes.

## Earlier baseline: 2026-09-09

The previous validation document recorded successful installation, lint, typecheck, production build, four domain tests, source checks, and a Chrome run with **14 workflows, 86 route/viewport checks and 11 axe audits**. Those counts and its older login behavior describe that earlier version, not the current application. They are superseded as current coverage by the inspected September 18 report and the current harness.

## Coverage limits

- Automated browser coverage is installed Chrome with resized viewports, Persian locale and Tehran time zone. Firefox/WebKit, physical devices, and manual screen-reader testing are not established by this evidence.
- Zero axe violations means zero findings on those audited views/rules, not a complete accessibility certification.
- No deployment or external hosting validation is recorded.
- Local mock persistence/role UI checks do not validate a backend, multi-device synchronization, or production authorization; those capabilities are NOT CURRENTLY IMPLEMENTED.
- Exact directory regression tests preserve the supplied `دکتر شهرور افشار` spelling and separate 253/254 records. They do not authorize spelling changes or merging repeated names.

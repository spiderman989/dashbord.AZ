# Project structure

All paths are repository-relative. Use [ROUTES.md](ROUTES.md) for the complete page-file map and [FEATURE_MAP.md](FEATURE_MAP.md) to locate a feature without walking the tree again.

| Directory / file | Responsibility and important locations | Modification guidance |
| --- | --- | --- |
| [app/](../app/) | App Router wrappers. [layout.tsx](../app/layout.tsx) owns global providers/font/RTL/metadata; [globals.css](../app/globals.css) owns shared styles; [not-found.tsx](../app/not-found.tsx) handles unmatched URLs | Keep wrappers thin; shared layout/CSS changes affect both panels |
| [app/(employee)/](<../app/(employee)/>) | Employee route group, guarded layout and information rail; home, processes, directory, content, tickets, feedback, activities, CRM placeholder | Group name is absent from URL; new employee pages inherit shell and rail |
| [app/admin/(panel)/](<../app/admin/(panel)/>) | Guarded admin group; dashboard, content editors, directory and accounts | Admin loading/error files reuse employee boundaries; no separate admin API |
| [app/login/](../app/login/), [app/admin/login/](../app/admin/login/) | Public login wrappers using shared LoginForm | Outside protected layouts; login labels/logic changes may affect both modes |
| [components/employee/](../components/employee/) | Employee features; `Dashboard.tsx`, process pages, `FeedbackPage.tsx`, `InfoRail.tsx`, content and support pages | Use services, context, UI primitives and Persian utilities |
| [components/admin/](../components/admin/) | `AdminDashboard.tsx`, `AdminEmployees.tsx`, `PermissionEditor.tsx`, `AdminPhoneDirectory.tsx`, `ContentManager.tsx`, `resourceConfig.tsx` | Generic content resources use configuration; accounts and directory retain custom editors |
| [components/shared/](../components/shared/) | `AuthGuard.tsx`, `SectionGuard.tsx`, `PermissionLink.tsx`, `LoginForm.tsx`, `PortalShell.tsx`, `ActivityHistory.tsx`, `AssetImage.tsx`, `BrandLogo.tsx`, `ProcessIcon.tsx` | Check employee and admin consumers before changing shared contracts |
| [components/ui/](../components/ui/) | `Primitives.tsx`, `DataTable.tsx`, `ContentForm.tsx`, `Modal.tsx`, `States.tsx`, `Toast.tsx` | Reuse established components; no external component/form/table library |
| [services/](../services/) | `mockRepository.ts` adapter, `authService.ts`, collection services and domain mutation helpers | Business persistence belongs here; no API endpoints or database clients |
| [hooks/useResource.ts](../hooks/useResource.ts) | Subscribed local collection reader | Stable repository object identity is important for effect dependencies |
| [types/index.ts](../types/index.ts) | Shared domain interfaces, unions, generic Repository | Changing a type requires checking services and consumers; TS types do not validate stored JSON |
| [data/](../data/) | Typed seed arrays for content, identities, processes, notifications; authoritative `phoneDirectory.ts` | Admin UI edits never write these files; preserve original directory records and IDs |
| [lib/](../lib/) | `date.ts` Persian calendar/time; `utils.ts` normalization/link checks/errors; `labels.ts` enum labels; `navigation.ts` ordered menus | Shared utilities have broad effects; domain tests cover date/search/link behavior |
| [public/assets/](../public/assets/) | `brand-guide.png`, `portal-reference.png` copied reference assets | BrandLogo/AssetImage and CSS depend on these originals; see [ASSETS.md](ASSETS.md) |
| [public/fonts/](../public/fonts/) | Local Vazirmatn variable font and `OFL.txt` | Setup script refreshes files after dependency installation; retain license |
| [tests/domain.test.ts](../tests/domain.test.ts) | Four Node domain regression tests | Exact authoritative directory, search normalization, calendar, permitted link schemes |
| [scripts/](../scripts/) | `setup-assets.mjs`, `check-source.mjs`, `qa-browser.cjs` | Font setup, supplementary source verification, browser workflows/audits respectively |
| [docs/](./) | Persistent knowledge base, asset/evidence records, documentation checker | Update relevant contracts/maps with implementation changes |
| [AGENTS.md](../AGENTS.md), [README.md](../README.md) | Documentation-first agent instructions and human entry point | Keep short; link to canonical documents rather than duplicating contracts |

## Root configuration

| File | Verified behavior |
| --- | --- |
| [package.json](../package.json) | ESM project, npm scripts and direct dependencies; most version ranges are `latest` |
| [package-lock.json](../package-lock.json) | Resolved dependency graph; prefer reproducible lockfile installation |
| [tsconfig.json](../tsconfig.json) | Strict ES2022/bundler TypeScript; alias `@/*` → root; tests excluded; generated Next types included |
| [next.config.ts](../next.config.ts) | Strict React mode, no powered-by header, empty remote-image allowlist |
| [next-env.d.ts](../next-env.d.ts) | Next-generated type references; can be rewritten by dev/build |
| [eslint.config.mjs](../eslint.config.mjs) | Next core web vitals and TypeScript configs; ignores generated/tool/output directories |
| [postcss.config.mjs](../postcss.config.mjs) | Tailwind v4 PostCSS plugin |
| [.gitignore](../.gitignore) | Ignores dependency/build/test output, local tools, TypeScript cache, environment files (except an allowed example filename) |

No environment example, CI workflow, Dockerfile, deployment configuration, API route handler, middleware, proxy, or server-action module is present in the audited application. Their implementation is **NOT CURRENTLY IMPLEMENTED** in this tree.

## Non-source material

Five original reference images remain at the root; [ASSETS.md](ASSETS.md) lists exact filenames and usage. Their `.png` filenames are preserved even where the actual encoding is JPEG.

`node_modules/` holds installed dependencies; `.next/` holds generated build/dev output; `tsconfig.tsbuildinfo` is an incremental cache; `test-results/` holds regenerable QA JSON/screenshots; `.tools/` contains ignored local tooling (including the source checker's optional TypeScript fallback). `.git/` is version-control metadata. These are not feature implementation locations. `out/` is an ignored potential output path, not a configured static-export target and not required to exist.

## Naming and import conventions

Components are named exports in PascalCase `.tsx` files; App Router files use framework names (`page`, `layout`, `loading`, `error`). Services/utilities/data generally use camelCase filenames; shared domain types are centralized. Use `@/` for root imports and relative imports for nearby modules, with `import type` for type-only dependencies. Scripts use `.mjs` for ESM and `.cjs` for the browser harness. No configured formatter or separate application `src/` directory exists; avoid broad formatting changes to the compact existing source.

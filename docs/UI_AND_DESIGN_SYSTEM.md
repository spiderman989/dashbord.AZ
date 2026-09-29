# UI and design system

The app is Persian and RTL. Existing visual authority is the supplied brand sheet and portal references, mapped in [ASSETS.md](ASSETS.md). Reuse the current components and layout; ordinary feature work should not redesign dashboards, typography, palette, or navigation.

## Sources and typography

[app/globals.css](../app/globals.css) contains Tailwind v4 import/theme mapping, root tokens, and the custom shared class system. There are no CSS modules or third-party UI kits. Components combine semantic classes (`card`, `form-grid`, `table-card`) with occasional Tailwind utilities (`mt-4`, `break-all`). [app/layout.tsx](../app/layout.tsx) sets `lang="fa"`, `dir="rtl"`, and a local Vazirmatn variable font (weight 100–900) with Tahoma/sans-serif fallbacks.

Base body: 13px, line-height 1.85. Page headings usually override h1 to 22px; admin headings to 24px. Section h2 is generally 15px; small text 11px, with component-specific compact variants. Keep the existing hierarchy; there is no documented uniform spacing scale beyond the actual CSS and Tailwind utilities.

The shared header displays the user-supplied transparent [header logo](../public/assets/azarshin-header-logo@3x.png) centered at `123% auto` background size in the existing 157 x 42 logo viewport, with its existing mobile scale rules. This enlarges both marks by 23% using the image's transparent padding; the artwork stays fully visible and proportional without moving the header controls. The `.topbar` selector scopes this sizing to employee/admin headers. Asset provenance is recorded in [ASSETS.md](ASSETS.md).

Both login pages use the supplied [login logo](../public/assets/azarshin-header-logo-xl@3x.png), displayed proportionally at up to 440px wide and constrained to the story panel's content width. Login-scoped rules center the 11:3 image within the existing 46px logo slot and preserve its 60px bottom margin, keeping surrounding text and form positions unchanged. The story panel, including its logo, remains hidden below 768px. See [ASSETS.md](ASSETS.md) for provenance.

## Color and shape tokens

| Root token | Value / role |
| --- | --- |
| `--bg`, `--surface`, `--surface-2` | `#f5f5f2`, `#fff`, `#f7f8f8`; page fallback/cards/secondary surfaces |
| `--ink`, `--muted`, `--subtle` | `#263444`, `#5e6966`, `#9da5a8`; text hierarchy |
| `--navy`, `--slate` | `#1c2632`, `#2c3b4e`; shell and banners |
| `--brand`, `--brand-dark`, `--accent` | `#bc5c46`, `#a64c38`, `#feb161`; terracotta actions and amber details |
| `--ivory`, `--oatmeal` | `#ede9de`, `#ccc0b0`; warm supporting surfaces |
| `--border` | `#e9eae7` |
| `--success`, `--warning`, `--danger`, `--info` | `#377867`, `#996026`, `#bc4c4c`, `#4b7196` |
| `--radius`, `--shadow` | 12px card radius; subtle existing two-layer shadow |

The Tailwind `@theme` mapping additionally defines `--color-muted: #778087`; it differs from the custom `.muted` class using `--muted`. Do not assume those are interchangeable. Badge tones also include component-specific backgrounds/text colors.

## Layout and responsiveness

All pages share the user-supplied brick/kiln background in [site-background.jpg](../public/assets/site-background.jpg). A fixed `body::before` layer covers the viewport without repeating or stretching as pages grow; it is centered on desktop and positioned at 40% horizontally up to 767px, keeping a brick corner visible without placing the darker stacks behind the mobile login controls. The layer ignores pointer events and sits behind the content within the body's isolated stacking context. Login page/mobile panel backgrounds are transparent so the image remains visible. Existing cards, form controls, dialogs, navigation, and the login story retain their readable surfaces. Footer text has a light backing to retain contrast over the darker bricks; empty footer spans stay unstyled. Asset provenance is in [ASSETS.md](ASSETS.md).

Both login routes add a fixed `.login-page::before` backdrop with a 10px blur and a subtle translucent tint using the existing `#fcfcf9` surface color. It covers the viewport between the shared background image and the page content, ignores pointer events, and leaves the form, text, controls, and login story unfiltered. This treatment is scoped to the shared login wrapper; portal pages retain their original background treatment. The background image, cover sizing, crop positions, and layout breakpoints remain the same.

PortalShell has a fixed top bar and right sidebar, with body offset by sidebar width. Default sidebar is 220px, top bar 76px; collapsed sidebar 80px. Workspace maximum width is 1760px. Employee layout is a flexible main column plus a 305px information rail with 22px gap; admin omits the rail.

| Breakpoint in CSS | Main behavior |
| --- | --- |
| `min-width: 1600px` | Sidebar 245px, rail 335px; larger workspace/card spacing |
| `max-width: 1240px` | Sidebar 190px, rail 265px; denser content and adjusted grids |
| `max-width: 1023px` | Desktop sidebar hidden, body offset zero, mobile menu available; top bar 68px, employee rail 285px |
| `max-width: 767px` | Top bar 64px; employee rail below main; login story hidden; table rows become two-column cards; mobile sort control shown; toolbars wrap |
| `max-width: 479px` | Tables/cards and forms become single-column where specified; narrower padding, wrapped actions; rail one column; process timeline vertical |
| `prefers-reduced-motion: reduce` | Animations/transitions greatly shortened and smooth scrolling disabled |

Responsive rules occur in two sections of the stylesheet; later rules and `.admin-shell` overrides matter. Directory/ticket/dashboard grids have their own breakpoints rather than one universal layout rule. Keep `min-width: 0`, `minmax(0, 1fr)`, wrapping and bounded image containers. Check long Persian labels, 40-character usernames, empty states and open dialogs at mobile widths. The feedback navigation item has a targeted wrapping rule for its long label.

The employee phone directory uses CSS columns so department cards stack without gaps caused by unequal card heights. Each card stays intact, with 16px between cards (15px up to 479px). The existing responsive counts remain: two columns above 1240px and from 480–767px, one column from 768–1240px and up to 479px. Cards follow their source order down the right column, then the left; search and filtering naturally rebalance the columns. Card contents and the admin directory layout are unchanged.

## Reusable patterns

- **Page:** PageHeading with eyebrow/description/actions, then Card sections; admin table pages use `table-card`, `table-card-heading` and DataTable. Use existing empty/loading/error states.
- **Buttons:** primary uses dark terracotta, secondary outlined white, ghost transparent, danger red. Standard minimum height 42px, radius 7px; loading disables the button. Icon controls require a meaningful Persian accessible label.
- **Forms:** Field + Input/Select/Textarea; input minimum height 44px, 7px radius. `form-grid` is two columns with 22px gap, `full-width` spans both, and mobile collapses to one column. Required stars accompany actual constraints; inline Persian errors use alert semantics. `form-actions` provides save/cancel and hint spacing.
- **Tables:** local filtering/sorting/pagination via DataTable; desktop native table, mobile `data-label` cards. Do not introduce a separate table library for a simple new list.
- **Dialogs:** shared native-dialog Modal, editor/gallery width modifiers, ConfirmDialog for deletion. Focus/modal behavior comes from the browser; body scrolling is restored on unmount. Busy-close behavior remains the caller's responsibility.
- **Feedback:** success/error toasts plus persistent form errors where appropriate. Toasts live in a polite live region; errors use alerts. Handle quota/read errors instead of silently claiming success.
- **Content:** AssetImage uses supplied crop assets or browser image data, with a visible fallback; news body renders text paragraphs rather than HTML.

Component contracts are in [COMPONENTS.md](COMPONENTS.md).

## RTL, dates, and accessibility

Prefer logical spacing (`padding-inline`, `margin-inline-start`) for new rules, while respecting existing physical right/left layout rules. Use `dir="ltr"` or `<bdi>` for usernames, references, extension numbers and URLs. Preserve exact password input; search normalization is not credential normalization. Display ordinary numeric UI with `faNumber` where existing components do so.

[lib/date.ts](../lib/date.ts) uses Intl's real Persian calendar and `Asia/Tehran`. Native date fields are Gregorian/LTR, with Persian explanatory hints; calendar display is Jalali. Do not substitute fixed sample dates or hard-coded Persian month lengths.

Existing accessibility patterns include a skip-to-main link, landmarks/headings, visible focus outline, labels/IDs, descriptive icon labels, `aria-current` navigation/pagination/date, table sort announcements, live loading/toast/count messages, native dialog semantics, radio/switch state, and reduced-motion support. Field renders hint/error IDs but does not automatically attach them to its child. Decorative icons/images should not duplicate spoken content. Automated axe results are limited to audited views and are not a manual accessibility certification.

The mock-account notice was removed from the employee-management page. Its copyright sentence is hidden only at `/admin/employees`; the shell's other footer content and other routes' copyright remain. Keep this scoped behavior when changing shared footer code.

## Section permission editor (2026-09-25)

The 2026-09-27 page/link manager uses existing Field/Input/Select, Card, DataTable, Modal/ConfirmDialog and toast components. [Scoped CSS](../components/admin/page-links.css) handles the icon preview, wrapping destination cells and responsive editor; URL inputs are LTR within the RTL form. Sidebar labels now wrap for long custom titles and redirected feedback links independently of their href. No palette/font/assets were changed. Inactive custom items are visibly marked in the existing permission editor.

[PermissionEditor](../components/admin/PermissionEditor.tsx) reuses the native Modal, Button, toast and state components. Scoped `permission-*` rules in globals.css keep the current navy/terracotta palette and RTL font. The form uses keyboard-operable tabs, native labeled checkboxes and a disabled fieldset when admin entry is off. Options are two columns on desktop and one below 480px. The option panel scrolls while heading, tabs and save/cancel actions remain accessible. Section grants also filter existing cards/links; unrelated page styling is unchanged.

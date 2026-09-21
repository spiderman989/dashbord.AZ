# Assets and design references

The five supplied image references remain untouched at the workspace root. Their original `.png` filenames are preserved. During the 2026-09-19 source audit, file metadata showed that the brand sheet is PNG and the other four references are JPEG-encoded despite their filenames; do not rename or convert them as part of unrelated feature work.

| Provided file | Use |
| --- | --- |
| `Screenshot 2026-09-08 212238.png` | Authoritative brand palette and actual Persian logo. Served as `public/assets/brand-guide.png`. The default logo uses a CSS viewport into the original sheet; headers and login pages use the separately supplied PNGs described below. |
| `file_000000006ee882469bbcaac19ef3a0d5.png` | Main employee dashboard layout reference, building photograph, and gallery imagery. Served as `public/assets/portal-reference.png`. The `AssetImage` component displays the corresponding source-image regions. |
| `file_00000000bac081f494c69b15ebb736ec.png` | Ticket layout, department selection, priority controls, and common sidebar reference. |
| `file_000000000e808243b02e9a44f3bca74a.png` | Internal-directory layout reference. Supplied authoritative text replaces the illustrative names in this screenshot. |
| `file_000000000e808243b02e9a44f3bca74a(1).png` | Process inbox layout reference. |

The brand sheet takes precedence over the older screenshot colors and logo. Sampled palette: slate `#2c3b4e`, amber `#feb161`, terracotta `#bc5c46`, oatmeal `#ccc0b0`, ivory `#ede9de`, dark slate `#1c2632`. Variations are used for accessible text and controls.

No separate font, high-resolution photograph, or favicon was supplied with the original references. Transparent header and login logos were supplied later, as documented below. Vazirmatn is served locally. Source screenshot imagery is intentionally kept local and mapped centrally in `AssetImage.tsx`, so higher-resolution originals can be substituted later without altering the UI.

The audit verified byte-identical copies at `public/assets/brand-guide.png` (PNG, 631×671) and `public/assets/portal-reference.png` (JPEG, 1448×1086). The actual implementation is in [BrandLogo.tsx](../components/shared/BrandLogo.tsx), [AssetImage.tsx](../components/shared/AssetImage.tsx), and [app/globals.css](../app/globals.css). The root layout currently uses the brand-guide image as its icon; there is no separate favicon asset. Font installation is handled by [scripts/setup-assets.mjs](../scripts/setup-assets.mjs), with the license preserved in [public/fonts/OFL.txt](../public/fonts/OFL.txt).

News, courses, galleries, announcements, activity history, processes and login identities are clearly designated demo data. The 10 departments and 25 phone-extension records in `data/phoneDirectory.ts` are authoritative and covered by exact-data regression tests.

## Header logo

On 2026-09-19 the user supplied [azarshin-header-logo@3x.png](../public/assets/azarshin-header-logo@3x.png) to replace the logo at the left of the website header. The PNG is copied unchanged from the supplied file: 471 x 126 pixels, RGBA transparency, 40,383 bytes. The scoped `.topbar .brand-logo > span` rule displays it centered at `123% auto` background size in the existing 157 x 42 logo viewport, retaining the established mobile scaling. This 23% enlargement uses transparent padding around the supplied artwork, keeping both marks fully visible and proportional while preserving header placement and control spacing. Both employee and admin headers use it through their shared PortalShell. The default brand-sheet logo, favicon, logo links, and accessible labels keep their existing behavior. Login pages use the separate logo below.

## Login logo

On 2026-09-20 the user supplied [azarshin-header-logo-xl@3x.png](../public/assets/azarshin-header-logo-xl@3x.png) for both `/login` and `/admin/login`. The 660 x 180 RGBA PNG (75,036 bytes) is copied unchanged. The shared `.login-story > .brand-logo` rules in [app/globals.css](../app/globals.css) display it at up to 440px wide, shrinking to the story panel's available width. The image keeps its 11:3 proportions with `contain` sizing and is vertically centered in the existing 46px logo slot. This enlarges the detailed artwork while retaining the 60px bottom margin and all surrounding content positions. The existing story-panel hiding below 768px is preserved. Header and default logo asset mappings are unchanged.

## Shared page background

On 2026-09-19 the user supplied `image.png (5).jpeg` as the background for every page. Its unchanged 1500 x 953 JPEG (60,362 bytes) is served from [public/assets/site-background.jpg](../public/assets/site-background.jpg). The shared `body::before` rule in [app/globals.css](../app/globals.css) provides a fixed, non-repeating, cover-sized backdrop across employee, admin, login, loading, and not-found views. Desktop crops are centered; widths up to 767px use a 40% horizontal position to retain a brick corner while keeping the middle clear for content. Footer text has a light backing for contrast over the image. Page containers are transparent; existing cards, inputs, dialogs, navigation, and the login story retain their own surfaces.

Both login pages additionally use a separate fixed backdrop layer with 10px blur and a subtle translucent surface tint. This CSS treatment affects only the background behind the login content; the original image file and the background on other pages remain unchanged.

For current visual conventions, see [UI_AND_DESIGN_SYSTEM.md](UI_AND_DESIGN_SYSTEM.md). For data authority and local accounts, see [API_AND_DATA.md](API_AND_DATA.md).

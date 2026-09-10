# Assets and design references

All five supplied PNG files were inspected before implementation. The original files remain untouched at the workspace root.

| Provided file | Use |
| --- | --- |
| `Screenshot 2026-09-08 212238.png` | Authoritative brand palette and actual Persian logo. Served as `public/assets/brand-guide.png`. The logo component uses a CSS viewport into the original sheet; it is not recreated. |
| `file_000000006ee882469bbcaac19ef3a0d5.png` | Main employee dashboard layout reference, building photograph, and gallery imagery. Served as `public/assets/portal-reference.png`. The `AssetImage` component displays the corresponding source-image regions. |
| `file_00000000bac081f494c69b15ebb736ec.png` | Ticket layout, department selection, priority controls, and common sidebar reference. |
| `file_000000000e808243b02e9a44f3bca74a.png` | Internal-directory layout reference. Supplied authoritative text replaces the illustrative names in this screenshot. |
| `file_000000000e808243b02e9a44f3bca74a(1).png` | Process inbox layout reference. |

The brand sheet takes precedence over the older screenshot colors and logo. Sampled palette: slate `#2c3b4e`, amber `#feb161`, terracotta `#bc5c46`, oatmeal `#ccc0b0`, ivory `#ede9de`, dark slate `#1c2632`. Variations are used for accessible text and controls.

No separate font, high-resolution photograph, transparent logo, or favicon was supplied. Vazirmatn is served locally. Source screenshot imagery is intentionally kept local and mapped centrally in `AssetImage.tsx`, so higher-resolution originals can be substituted later without altering the UI.

News, courses, galleries, announcements, activity history, processes and login identities are clearly designated demo data. The 10 departments and 25 phone-extension records in `data/phoneDirectory.ts` are authoritative and covered by exact-data regression tests.

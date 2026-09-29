# Authentication and permissions

Updated **2026-09-25** for section permissions. All authentication and authorization here are **local/demo UI behavior**. Browser storage, client code and client checks can be changed by the browser user. There are no secure cookies, tokens, password hashes, server permission checks, or production isolation.

## Identities and independent sessions

| Login | Built-in credentials | Managed accounts | Success destination |
| --- | --- | --- | --- |
| `/login` | `employee` / `employee123`; primary admin also accepted | Existing local username/password | First allowed employee section, or employee root empty state |
| `/admin/login` | `admin` / `admin123` | Same local credentials, only with explicit admin entry enabled | First allowed admin section, or admin root empty state |

Sources: [LoginForm](../components/shared/LoginForm.tsx), [authService](../services/authService.ts), [demo identities](../data/employees.ts).

The supplied primary admin has the existing `SUPER_ADMIN` role and stable ID `admin-1`. It is separate from editable EmployeeAccount records and is never listed in employee CRUD or the permission editor. Its full access to all registered sections is derived from the role, regardless of stored grants. Unknown routes remain denied even for this role.

Managed identities project the account's stable ID, username, joined first/last name and position into Employee; position maps to the existing department profile field. Employee sessions project role EMPLOYEE; managed admin sessions project ADMIN. ADMIN does not bypass section permissions or grant permission-management rights. Editable account data cannot provision SUPER_ADMIN.

Session keys remain independent: `azarshin.demo.employee` and `azarshin.demo.admin`. Signing in or out of one panel does not create, change, or remove the other panel's session. A panel switch targets the first section allowed for the current identity; the destination still resolves its own independent session. A missing destination session redirects to that panel's login. Shared demo sessions in one browser origin must not be interpreted as production multi-user security.

## Credentials and identity resolution

Both forms start empty with username/password labels and visibility controls. No demo credential panels or autofill buttons are displayed.

Usernames are trimmed and case-insensitive, 3–40 ASCII letters/digits/dot/underscore/hyphen, starting alphanumeric. Passwords must have trimmed length at least 6 and original length at most 80; comparison preserves exact spaces, case and digit forms. Validation never normalizes a password.

After the existing simulated delay, explicit primary-admin credentials resolve the primary identity. Otherwise, a matching managed username must match its password exactly; a wrong password never falls through to a demo account. With no local match, the employee form can use the built-in employee credentials. The admin form additionally loads permissions and rejects disabled admin entry before writing its session marker.

Both session getters resolve current stored account IDs. Deleted or missing accounts no longer resolve. Primary-admin IDs resolve only to the explicit demo identity; managed account fields are never trusted as a role. Account-save validation reserves both built-in usernames for new/renamed accounts while retaining legacy unchanged usernames; see [API_AND_DATA.md](API_AND_DATA.md).

## Central section contract

[lib/permissions.ts](../lib/permissions.ts) defines stable, non-Persian IDs, labels, panel membership, menu membership, default landing order and an explicit route allowlist. Employee and admin IDs are independent, including news, courses, processes, announcements and activities.

There are **10 builtin employee sections and 10 builtin admin sections**, including primary-admin-only `admin.links` (2026-09-27). The permission editor offers the original 10/9 delegable sections plus custom menu items in the matching panel. Activities and announcements are included even though the original employee sidebar does not list them. Employee gallery previews have no separate page and belong to the workspace permission; calendar/clock remain shared shell utilities. Existing sidebar order is preserved.

Routes match exact registered patterns and single-segment dynamic IDs. Neither root matches every descendant. Similar prefixes, unregistered nested routes, and unknown sections fail closed. Two catch-all page wrappers ensure unknown URLs reach the same guard; they grant no section. See [ROUTES.md](ROUTES.md).

`UserPermissions` contains account ID, employee section IDs, admin entry flag and admin section IDs. No operation-level permissions exist. Allowing a section preserves its current create/edit/delete/publish/enrollment behavior. Disabling admin entry blocks every admin section even if its section selections are retained.

Managed accounts without a permission record have no grants. Existing user records are not overwritten or seeded with named examples. The supplied demo employee retains the existing employee sections by default. The primary admin always has all registered sections.

## Editing and persistence

[AdminEmployees](../components/admin/AdminEmployees.tsx) displays the named shield action only to the primary admin. [PermissionEditor](../components/admin/PermissionEditor.tsx) reuses Modal, Button, states and toast. It loads saved permissions into an isolated draft, has two keyboard-operable tabs, panel-scoped select/clear actions, disabled admin choices without entry, responsive scrolling and fixed form actions. Cancel, Escape, backdrop and close discard the draft. Successful save displays a Persian toast.

[permissionService](../services/permissionService.ts) exposes `getForUser`, `saveForUser`, `removeCustomSection` and `subscribe`. Its private repository uses `azarshin.portal.v1.permissions`; each record's ID is the user's stable account ID. Save rechecks the current admin session for SUPER_ADMIN, rejects the primary-admin target and missing accounts, validates the record, then persists and notifies. Reads validate field shapes and panel-scoped IDs; a syntactically valid custom ID grants nothing unless its active item still exists. Saves prune missing custom IDs. This is a mock service boundary, not protection against browser tampering.

## Guards and UI consumers

Custom menu items share `UserPermissions` and section-level grants; they have no operation-level permissions. A new custom ID is allowed for the primary admin and denied for every other account (including the supplied demo employee) until assigned. Title, URL, icon, order and active edits retain the ID and grants. Inactive items remain marked in the permission editor but are hidden from usable menu/shortcut entries. Unknown, deleted or malformed custom entries do not grant access, even if an ID remains in an old draft. Saving permissions prunes deleted custom IDs; item deletion cleans that ID from stored grants only.

Builtin menu entries can also be deleted (2026-09-28). This removes their navigation entries and exact-entry links while preserving the underlying section grants and direct route access. It does not revoke a user's access to the page. Removing `admin.links` from the menu preserves its SUPER_ADMIN-only direct route.

`useAccess.resolveItem/resolveHref` require the source item's section, active status and ready settings. Internal destinations additionally require the destination page's existing section grant. An absolute same-origin HTTP/HTTPS link is also checked against the route allowlist. No link can grant admin entry or bypass `admin.links`, which remains restricted to SUPER_ADMIN even with a forged section selection. External-system authorization belongs to that system. Frontend controls here only govern portal navigation. A user with custom links but no builtin pages receives a usable link landing view in the existing panel root.

[AuthGuard](../components/shared/AuthGuard.tsx) resolves identity and permissions before protected content mounts. It subscribes to session, account and permission changes, ignores stale async results, and hides protected content during refresh. Read failures show a Persian error with retry/logout. Account deletion and cross-tab logout refresh the mounted guard.

[useAccess](../hooks/useAccess.ts) exposes section/path checks, first allowed destination and primary-admin management capability. [SectionGuard](../components/shared/SectionGuard.tsx) inside the shell gates page children on every navigation. Direct denied URLs display «شما به این بخش دسترسی ندارید». A panel without any allowed sections displays «برای حساب شما دسترسی تعیین نشده است؛ با مدیر سامانه تماس بگیرید» with logout and no redirect loop.

Initial login targets an allowed section. Opening a panel root without dashboard access targets its first allowed section. When saved grants remove access to a mounted page, the guard replaces that URL with the first allowed page or the panel's empty root.

[PortalShell](../components/shared/PortalShell.tsx) filters desktop/mobile navigation, support links, panel switches and notifications. [PermissionLink / MenuLink / SectionAccess](../components/shared/PermissionLink.tsx) and useAccess gate dashboard cards, quick links, news ticker, activity/announcement previews, CRM support, and configured course/task links. Same-origin HTTP/HTTPS links are checked as internal paths; external destinations use browser anchors with safe new-tab attributes. Exact-entry notifications follow configured destinations; hidden notification links are excluded from counts and “read all”.

## Existing data visibility and limits

Section permissions do not change ownership contracts: processes/tickets/feedback filter employee IDs; process activities use display names, other activities remain shared; notifications/read flags are shared. Published/active filters and exact directory records remain unchanged. All local repositories are browser-readable, so these filters do not establish privacy.

Account edits preserve IDs and associated records. Password changes do not revoke sessions. Deletion does not cascade data or permission records; missing accounts cannot log in and new accounts receive different IDs. Local collection writes still lack transactions and conflict resolution.

## Future backend connection

Replace permissionService reads/writes/subscriptions with an authenticated permission API, and replace authService's mock identity/session resolution with trusted server identities. The server must determine the primary-admin role and validate permission changes, target identities, panel entry, section access and data ownership on **every API request**. Client menus/guards remain UX controls. No backend, endpoint, database, SSO, or real authentication was added.

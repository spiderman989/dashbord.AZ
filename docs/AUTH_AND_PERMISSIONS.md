# Authentication and permissions

All authentication here is **local/demo UI behavior**. There are no session cookies, tokens, server checks, password hashes, session expiry, credential recovery, or real access control. Credentials and session markers can be inspected/changed in browser storage. Do not describe client filtering as secure isolation.

## Entry points and identities

| Login | Form / service | Built-in credentials | Success destination |
| --- | --- | --- | --- |
| `/login` | `LoginForm` → `loginEmployee` | `employee` / `employee123` | `/` |
| `/admin/login` | `LoginForm admin` → `loginAdmin` | `admin` / `admin123` | `/admin` |

Sources: [LoginForm.tsx](../components/shared/LoginForm.tsx), [authService.ts](../services/authService.ts), [data/employees.ts](../data/employees.ts). Both forms start with empty fields and provide a password-visibility control. Demo credential panels and sample-fill controls are absent from both login pages. Both fields are named **نام کاربری** and **رمز عبور**. Personnel-code/national-ID login is no longer the current implementation; `personnelCode` remains in the identity type for compatibility.

Local employees created through `/admin/employees` can sign in on `/login` at the same browser origin. The management list starts empty; it does not edit the built-in demo employee or admin. Account creation does not provision admin roles.

## Employee login flow

1. Trim/lowercase username; require 3–40 ASCII letters/digits/`.`/`_`/`-`, starting with a letter or digit.
2. Require a nonblank password, trimmed length at least 6 and original length no greater than 80. Trimming is used for validation only.
3. After a simulated 450ms delay, find a case-insensitive username match in `employeeService.list()`.
4. If a local match exists, compare the password **exactly**, including case, whitespace, and Persian/Arabic/ASCII digit forms. A wrong password on that match does not fall through to the demo account.
5. With no matching local record, accept only the built-in employee credentials.
6. Write the resulting ID to `azarshin.demo.employee`; return an `Employee` identity and navigate to `/`.

The employee login form uses text input mode, username autocomplete, current-password autocomplete, and explicit Persian validation. It does not normalize passwords or accept a ten-digit national-ID contract. Admin login remains separate: trim the username and compare case-sensitively to `admin`, compare the password exactly to `admin123`, then write `admin-1` to `azarshin.demo.admin`.

`getCurrentEmployee()` resolves the stored ID on guard mount: the built-in ID resolves to demo data; other IDs are looked up in the current local account collection. Its account projection retains `id` and `username`, joins first/last name into `name`, maps `position` to the existing `department` profile field, sets `personnelCode` to empty, and always sets role `EMPLOYEE`. Password is not returned in this context. This compatibility mapping does not link the account to the directory's departments.

`getCurrentAdmin()` accepts only the built-in admin ID. Both session getters return null server-side. See [API_AND_DATA.md](API_AND_DATA.md) for account-save validation, duplicate usernames, and the reserved demo username rule.

## Guards and capabilities

[AuthGuard.tsx](../components/shared/AuthGuard.tsx) loads the current identity in a client effect. While waiting it renders LoadingState. Missing identity redirects with `router.replace` to the relevant login. Service errors render ErrorState. The admin mode additionally accepts only `ADMIN`, `SUPER_ADMIN`, `CONTENT_MANAGER`, or `HR`.

Only demo `ADMIN` and employee identities are currently supplied by the services. There are no separate HR/content-manager screens, role editors, per-action checks, or permission hierarchy. Every admitted admin uses the same admin navigation and capabilities.

| Data/action | Current UI visibility or capability |
| --- | --- |
| Processes/details | Employee components filter `employeeId === current.id`; detail also checks requested record ID |
| Course enrollment | Employee ID + course reference marks a previously submitted request |
| Tickets / feedback | Submit with current employee ID; show only records with that ID |
| News | Employees see only published records; admins manage all statuses |
| Courses | Employees see active and finished; request action only for active courses; admins manage all statuses |
| Announcements / gallery / quick links | Employee views filter `active`; admin content views include all |
| Directory | Employees see active extensions; admin manages all departments/extensions |
| Accounts | Admin CRUD through its guarded page; account repository itself has no permission checks |
| Activities | Admin sees all; employees see own-name process activities **and all non-process activities** |
| Notifications | Shared records/read flags across identities and panels; no owner scoping |

All repositories expose all records to any caller. Public client bundles and localStorage are not confidential. An employee account does not inherit an admin session; an admin session does not automatically create an employee session. Panel-switch and admin support links can lead to an employee login if that independent session is absent.

## Updates, deletion, and logout

Editing username/password keeps a stable account ID, so existing local feedback/tickets/processes remain associated. Changing a password does not revoke sessions. Account deletion prevents later login and causes the next guard reload/remount to redirect; it does not immediately invalidate an already mounted EmployeeContext, remove the stale session key, or delete dependent records.

AuthGuard has no storage-event subscription, so logout in another tab is not an immediate cross-tab guard refresh. Each logout function removes only its own session key; PortalShell then redirects to its own login. Collections and the other panel's session remain intact.

Real authentication, server-enforced permissions, multi-user privacy, and external SSO are **NOT CURRENTLY IMPLEMENTED**. Any future authorized security integration must inspect the server boundary and replace these local assumptions explicitly; the current source defines no production identity/API contract.

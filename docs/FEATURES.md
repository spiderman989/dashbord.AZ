# Features

All working business features below are **implemented as local/demo frontend behavior** unless explicitly marked otherwise. There are no business APIs. Read [FEATURE_MAP.md](FEATURE_MAP.md) for exact component/service paths, [ROUTES.md](ROUTES.md) for page files, and [API_AND_DATA.md](API_AND_DATA.md) for fields and validation. This catalog focuses on user flow and change impact.

## Login and shared shell

**Entry:** public `/login` and `/admin/login`; guarded employee/admin layouts. `LoginForm → authService → AuthGuard → PortalShell`. Local session IDs resolve into EmployeeContext; local shell state controls sidebar collapse, mobile drawer, profile, and notifications.

Employees use username/password, including admin-created local accounts; admin login accepts the primary demo admin and managed accounts with admin entry enabled. Success targets the first allowed section or an empty panel state. The shell provides menu links, panel switching, profile and logout. Notifications use a shared repository: opening one marks it read, and “read all” replaces the collection. There is no notification delivery service or per-user notification ownership.

**Change considerations:** shared form/shell changes affect both panels. Keep sessions independent; profile `department` represents account position for managed employees. Guard state subscribes to account/session/permission changes and redirects revoked pages. Full semantics: [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md).

## Employee dashboard and information rail

**Entry:** `/` → `Dashboard`; every employee route also includes `InfoRail`. Initial server seeds become subscribed browser data. Dashboard derives own process counts/action-required notice, active ordered quick links (within employee process access), own-name process activities plus shared non-process activities, two published news records, and the first active announcement. Cards, internal shortcuts, information rail and cross-section links are filtered by the same section permissions as routes.

`QuickProcesses`, `ProcessStatus`, and `RecentActivities` are composed views. InfoRail uses news/gallery repositories and local time/index/modal state: actual Jalali calendar with month navigation/return to today; Tehran digital/analog clock; manually cycled published-news ticker; up to four active gallery items with modal preview. It is not a calendar event scheduler or auto-rotating news feed.

**Change considerations:** editing news/gallery affects every employee page. “Latest” content follows collection order, not a date-sorting service. AdminDashboard also reuses ProcessStatus/RecentActivities, so their changes have two-panel impact.

## Processes

**Entry:** `/processes`, `/processes/new`, `/processes/[id]`; sidebar, dashboard shortcuts, and status links. `ProcessInbox`, `ProcessRequestForm`, `ProcessDetails` use current identity and `processService`; request creation also uses `activityService`.

The employee sees only own-ID requests, searches title/type/reference, filters status, sorts and pages results, opens a detail/timeline, or creates one of four request types. A new request receives a local tracking reference, `new` status, current timestamps, and a responsible unit. Creating it saves a process followed by an activity, then navigates to its detail. Details accept an optional validated task URL; without one, a button opens a demo explanation.

**Partially implemented:** tracking is local display/submission. Workflow execution, approvals, editing returned requests, server tasks, and status progression are **NOT CURRENTLY IMPLEMENTED**. Course enrollment also creates process records. Admin `/admin/processes` manages shortcuts, not these requests. Activity-write failure after process creation is not rolled back.

## Phone directory

**Entry:** employee `/phone-directory` → `PhoneDirectory`; admin `/admin/phone-directory` → `AdminPhoneDirectory`. Both use `phoneDirectoryService`; admin nested mutations use `saveExtension`/`removeExtension`.

Employees search Persian/Arabic spellings or digit forms, filter by department, view active extensions, copy a number with success/error feedback, or follow a `tel:` link. Admins search/filter, add/edit/delete departments, and add/edit/delete/enable/disable nested extensions with confirmations for removal. Manager labels are preserved in parentheses.

**Change considerations:** preserve the exact 10-department/25-extension seed and independent IDs. The two entries for `دکتر شهرور افشار` at 253/254 are intentional; 114 and 109 remain under تدارکات. Account management is separate from this directory. Ticket department options depend on it, but existing tickets keep department name strings. Local admin edits do not alter source seed files.

## News

**Entry:** employee `/news` and `/news/[id]` → `NewsList`/`NewsDetail`; admin `/admin/news`, `/new`, `/[id]` suffixes → `ContentManager` with `newsConfig`. Source: `newsService`; local search/category/editor/preview state.

Employees browse only published items, filter/search, and open a plain-text article split into paragraphs. Admins create drafts, edit content/status, preview, publish/archive, and confirm deletion. Route editors use ContentForm, date controls, and optional image upload. Successful mutations refresh dashboard/rail/list/detail consumers and log content activity separately.

**Change considerations:** changing visibility affects both direct detail access and every news consumer. Draft/archive visibility is a UI filter. There is no rich-text HTML renderer, scheduling service, or server publication workflow.

## Courses and enrollment

**Entry:** employee `/courses` → `CoursesPage`; admin course list/new/ID routes → `ContentManager` with `courseConfig`. Uses course repository plus process/activity repositories for enrollment.

Employees search active/finished courses, view details in a modal, follow a permitted information link, and request an active course. A request creates a `ProcessItem` with reference `COURSE-${course.id}` and a training activity. The loaded process list disables duplicate requests for that employee/course. Admins maintain course details, dates, images, links, and four statuses; the editor rejects end dates before start dates.

**Change considerations:** enrollment is not a distinct collection. There is no capacity, attendance, certificate, approval workflow, or atomic duplicate constraint. Removing a course does not remove its processes. Training activities are shared by the existing non-process activity filter.

## Tickets

**Entry:** `/tickets` → `TicketsPage`; sidebar and support links. State: directory and ticket resources, current identity, selected department/priority/description, busy/error flags.

Select a directory department, describe the issue, choose priority, and submit. The local `new` record appears in own-ID history and survives reload; successful submission resets the form and shows a Persian toast. Clear-form action resets drafts without submitting.

**Partially implemented:** submission/history work. Replies, admin ticket handling, attachments, delivery to a department, and status transitions are **NOT CURRENTLY IMPLEMENTED**, even though introductory copy mentions following a response. Department renames do not update existing ticket strings.

## Feedback

**Entry:** `/feedback`, sidebar صندوق انتقادات و پیشنهادات → `FeedbackPage`. State: `feedbackService`, EmployeeContext, form type/subject/message and busy/error flags. `submitFeedback` owns validation and timestamp/status creation.

The employee must select exactly **پیشنهاد (`suggestion`)** or **انتقاد (`criticism`)**, complete the title/message, and submit. Successful local persistence resets the form, shows `پیام شما با موفقیت ثبت شد.`, and refreshes own-ID history. History supports search, sorting, pagination, date/time, type, subject, and ثبت شده status; the stored full message is searchable but not expanded in a detail viewer.

**Change considerations:** retain only the two permitted types. There is no thanks/other category, admin feedback inbox, review/reply workflow, deletion/editing UI, or backend delivery. TypeScript and runtime validation both constrain message type. Account renames retain history through stable IDs; employee deletion leaves records in storage.

## Employee accounts

**Entry:** admin `/admin/employees`, مدیریت کارکنان → `AdminEmployees` and its internal `EmployeeEditor`. Uses `employeeService`/`saveEmployee`, shared DataTable, form primitives, Modal/ConfirmDialog, and toasts.

Admin searches/sorts first name, last name, clearly visible organizational position, and username. Add/edit opens a dedicated modal with Persian required-field checks. Password is never listed or prefilled; empty password on edit preserves the current value. Duplicate usernames are rejected case-insensitively. Delete requires confirmation. Changes synchronize across collection subscribers and persist locally. The saved username/password works through the existing employee login.

**Change considerations:** preserve the distinction between editable EmployeeAccount and session Employee. No role selector, real user provisioning, directory linkage, or delete cascade exists. The primary admin alone can open a two-tab section-permission editor from each account row; drafts save explicitly and persist by account ID. Managed accounts without grants see the no-access state. See [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md). The removed bottom mock-account notice remains absent, and PortalShell omits the copyright sentence only on this exact route; other footer text remains.

## Admin dashboard and content management

**Entry:** `/admin` → `AdminDashboard`; management links and sidebar → `ContentManager`. The overview reads six repositories (news, courses, gallery, announcements, processes, activities), waits for them, then shows five counts, recent news, process chart, activity list, and quick links. It does not count employee accounts or feedback.

Content configurations define fields, defaults, parser, columns, filters, and optional toggle/reorder behavior. News/courses edit on routes; gallery/announcements/quick links edit in modals. Preview is built from configured values; delete uses ConfirmDialog. Content logging is separate from the primary write. Quick-link reorder replaces the full ordered collection and does not log an activity.

**Change considerations:** shared generic changes affect five content resources. ProcessStatus reused on the admin overview links to employee `/processes` only when that employee-section grant is present; navigation still requires the separate employee session. Admin activity history is read-only; there is no general process administration screen.

## Gallery, announcements, and quick links

| Feature | Admin entry / data | Employee surface and behavior | Change considerations |
| --- | --- | --- | --- |
| Gallery | `/admin/gallery`, `galleryConfig`, gallery repository | InfoRail: first four active items, modal image/description/date | Image decoding/data URLs consume local quota; no gallery route or remote asset service |
| Announcements | `/admin/announcements`, `announcementConfig`, announcement repository | `/announcements` via AnnouncementsPage; first active item on dashboard | Types are notice/important/warning/general, **separate from feedback types**; active toggles visibility, not scheduled release |
| Quick processes | `/admin/processes`, `quickProcessConfig`, quick-process repository | Dashboard QuickProcesses; active items ordered numerically, safe link or inbox fallback | Icon/link/display configuration only; drag-and-drop/workflow modeling are absent; reorder uses up/down actions |

## Page and link management

**Implemented (local/demo), 2026-09-27:** primary admins use `/admin/links` to select a panel and any actual sidebar item, edit destinations/opening mode, reset a builtin destination, or create/edit/disable/delete a custom item. Builtins derive from the existing menu registry; headings and logout are excluded, and the settings entry itself has a fixed destination. The table and forms reuse the existing UI and show Persian field errors, explicit save/cancel, dirty-form warnings and deletion confirmation.

**Deletion expanded 2026-09-28:** every row has a trash action, including builtin items and the fixed-destination settings entry. Confirmation removes the entry from the table, picker and shared navigation; builtin removal persists across reloads without deleting pages, content or section grants. After deleting the settings entry, the primary admin can still open `/admin/links` directly. Custom-item deletion retains its existing grant cleanup.

Custom items have a fixed panel and UUID permission ID, an existing project icon with preview, a concrete same-panel page or full HTTP/HTTPS URL, and a position before another item or at the end of the panel's single menu group. The existing per-person permission editor includes them automatically. Builtins keep their original identity and grants; internal targets require destination permission too. Shared destination resolution covers sidebar links, section headings, dashboard section cards, support and exact-entry notifications/quick links, while detail/filter links retain their meaning. Local storage is shared by accounts at the same origin/browser; no page content, backend, subdomain or SSO is created.

## Activities

**Entry:** `/activities` and `/admin/activities` → shared `ActivityHistory`; RecentActivities previews on dashboards. Resource: activity repository; UI state: table search, type filter, sort and pagination. Employee history shows matching display-name process activities and all other types; admin history shows everything. New process, enrollment, and content actions generate some records; many other mutations (accounts, feedback, tickets, directory) do not log activity.

**Change considerations:** this is not a complete audit log. Ownership is name-based for process activity, so renames can hide entries and identical names can collide. Do not infer security/audit guarantees from the history UI.

## CRM

**Entry:** `/crm` → static `CrmPage` in its page wrapper. No feature store/service/API. It shows preparation text, illustrative capability labels, and a working link to `/tickets`. Customer records, sales reports, and relationship tracking are **NOT CURRENTLY IMPLEMENTED**.

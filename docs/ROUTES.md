# Routes

The current tree has **28 page routes**. Parenthesized App Router groups do not appear in the URL. All file links below point to the actual page wrapper; component implementation paths are indexed in [COMPONENTS.md](COMPONENTS.md) and [FEATURE_MAP.md](FEATURE_MAP.md).

Access keys:

- **Public:** no AuthGuard. An existing local session does not automatically redirect away from the login page.
- **Employee:** [employee layout](<../app/(employee)/layout.tsx>) → `AuthGuard` → employee `PortalShell` plus `InfoRail`; requires the employee session or redirects client-side to `/login`.
- **Admin:** [admin layout](<../app/admin/(panel)/layout.tsx>) → `AuthGuard admin` → admin `PortalShell`; requires the independent admin identity and common admin-role check or redirects client-side to `/admin/login`.

These are UI requirements, not server access controls; see [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md). Every employee page additionally consumes news/gallery through InfoRail, and both shells consume notifications.

## Complete catalog

| Route | Page source | Access | Main component | Required data / behavior | Navigation entry |
| --- | --- | --- | --- | --- | --- |
| `/login` | [page.tsx](../app/login/page.tsx) | Public | `LoginForm` | Local account lookup or demo employee login | Guard redirect; admin-login switch |
| `/admin/login` | [page.tsx](../app/admin/login/page.tsx) | Public | `LoginForm admin` | Built-in admin login | Admin guard redirect; employee-login switch |
| `/` | [page.tsx](<../app/(employee)/page.tsx>) | Employee | `Dashboard` | Initial processes, quick links, activities, news, announcements; subscribed reconciliation | میز کار |
| `/processes` | [page.tsx](<../app/(employee)/processes/page.tsx>) | Employee | `ProcessInbox` | Initial processes, current employee ID; optional `status` query | فرآیندها; dashboard/chart links |
| `/processes/new` | [page.tsx](<../app/(employee)/processes/new/page.tsx>) | Employee | `ProcessRequestForm` | Identity, optional `type` query; writes process and activity | Inbox new-request button; quick links |
| `/processes/[id]` | [page.tsx](<../app/(employee)/processes/[id]/page.tsx>) | Employee | `ProcessDetails` | ID, initial processes; ownership filter; preview/task link | Inbox row; creation redirect; notification |
| `/phone-directory` | [page.tsx](<../app/(employee)/phone-directory/page.tsx>) | Employee | `PhoneDirectory` | Initial departments/extensions; active entries only | شماره‌های داخلی |
| `/news` | [page.tsx](<../app/(employee)/news/page.tsx>) | Employee | `NewsList` | Published news, search/category | اخبار; dashboard |
| `/news/[id]` | [page.tsx](<../app/(employee)/news/[id]/page.tsx>) | Employee | `NewsDetail` | ID must resolve to published news | News cards; dashboard; rail ticker |
| `/courses` | [page.tsx](<../app/(employee)/courses/page.tsx>) | Employee | `CoursesPage` | Courses, processes, identity; modal detail/enrollment | آموزش; notification |
| `/tickets` | [page.tsx](<../app/(employee)/tickets/page.tsx>) | Employee | `TicketsPage` | Departments, own tickets, identity | تیکت; shell support; CRM support |
| `/feedback` | [page.tsx](<../app/(employee)/feedback/page.tsx>) | Employee | `FeedbackPage` | Identity, own feedback; two-type submission | صندوق انتقادات و پیشنهادات |
| `/activities` | [page.tsx](<../app/(employee)/activities/page.tsx>) | Employee | `ActivityHistory` | Activity collection and identity | RecentActivities “view all”; no sidebar item |
| `/announcements` | [page.tsx](<../app/(employee)/announcements/page.tsx>) | Employee | `AnnouncementsPage` | Active announcements | Dashboard announcement strip; no sidebar item |
| `/crm` | [page.tsx](<../app/(employee)/crm/page.tsx>) | Employee | `CrmPage` | Static preparation state, support link | CRM |
| `/admin` | [page.tsx](<../app/admin/(panel)/page.tsx>) | Admin | `AdminDashboard` | News, courses, gallery, announcements, processes, activities | داشبورد |
| `/admin/news` | [page.tsx](<../app/admin/(panel)/news/page.tsx>) | Admin | `ContentManager kind="news"` | All news, search/filter, preview/delete | اخبار; admin dashboard |
| `/admin/news/new` | [page.tsx](<../app/admin/(panel)/news/new/page.tsx>) | Admin | `ContentManager kind="news" recordId="new"` | News defaults; route editor | News list; admin dashboard |
| `/admin/news/[id]` | [page.tsx](<../app/admin/(panel)/news/[id]/page.tsx>) | Admin | `ContentManager kind="news" recordId={id}` | Existing local news; missing record state | News edit action; admin latest news |
| `/admin/courses` | [page.tsx](<../app/admin/(panel)/courses/page.tsx>) | Admin | `ContentManager kind="courses"` | All courses; preview/delete | آموزش / دوره‌ها |
| `/admin/courses/new` | [page.tsx](<../app/admin/(panel)/courses/new/page.tsx>) | Admin | `ContentManager kind="courses" recordId="new"` | Course defaults; date/link validation | Course list; admin dashboard |
| `/admin/courses/[id]` | [page.tsx](<../app/admin/(panel)/courses/[id]/page.tsx>) | Admin | `ContentManager kind="courses" recordId={id}` | Existing course; missing record state | Course edit action |
| `/admin/gallery` | [page.tsx](<../app/admin/(panel)/gallery/page.tsx>) | Admin | `ContentManager kind="gallery"` | Gallery; modal CRUD/image upload/toggle | گالری |
| `/admin/announcements` | [page.tsx](<../app/admin/(panel)/announcements/page.tsx>) | Admin | `ContentManager kind="announcements"` | Announcements; modal CRUD/toggle | اطلاعیه‌ها |
| `/admin/processes` | [page.tsx](<../app/admin/(panel)/processes/page.tsx>) | Admin | `ContentManager kind="processes"` | **Quick-process links**, modal CRUD/toggle/reorder | فرآیندها |
| `/admin/activities` | [page.tsx](<../app/admin/(panel)/activities/page.tsx>) | Admin | `ActivityHistory admin` | All activity records; read-only | فعالیت‌ها; admin recent activities |
| `/admin/phone-directory` | [page.tsx](<../app/admin/(panel)/phone-directory/page.tsx>) | Admin | `AdminPhoneDirectory` | Departments and nested extensions | شماره‌های داخلی; admin dashboard |
| `/admin/employees` | [page.tsx](<../app/admin/(panel)/employees/page.tsx>) | Admin | `AdminEmployees` | Local accounts; modal CRUD | مدیریت کارکنان |

## Parameters and navigation conventions

Dynamic `params` and page `searchParams` are awaited promises. `[id]` is a route parameter, not a literal record ID. `new` has its own page and is passed to the generic editor as a create sentinel. Unknown news/process/content IDs produce a feature EmptyState; they are not routed through `notFound()`.

`/processes?status=action_required` initializes the table's local status filter. Supported status values come from `processLabels`; the URL is not kept synchronized as filters change. `/processes/new?type=leave` (also `mission`, `equipment`, `purchase`) initializes the request form; default is `leave`. Other feature filters and dialogs do not introduce URLs.

[lib/navigation.ts](../lib/navigation.ts) defines ordered sidebar items. Employee order: `/`, `/processes`, `/crm`, `/phone-directory`, `/tickets`, `/news`, `/courses`, `/feedback`. Admin order: `/admin`, `/admin/news`, `/admin/courses`, `/admin/gallery`, `/admin/announcements`, `/admin/processes`, `/admin/activities`, `/admin/phone-directory`, `/admin/employees`. Preserve order unless the task requests otherwise. PortalShell marks roots by exact equality and other items by pathname prefix; the same menu is used in the mobile drawer.

## Layout and boundary files (not routes)

[app/layout.tsx](../app/layout.tsx) wraps everything. [app/not-found.tsx](../app/not-found.tsx) handles unmatched URLs and links home. [Employee loading](<../app/(employee)/loading.tsx>) uses LoadingState; [employee error](<../app/(employee)/error.tsx>) provides a Persian error and reset. [Admin loading](<../app/admin/(panel)/loading.tsx>) and [admin error](<../app/admin/(panel)/error.tsx>) re-export those boundaries. No business API routes or middleware are present.

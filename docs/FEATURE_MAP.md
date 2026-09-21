# Feature map

Start with the matching row, read its [feature behavior](FEATURES.md), then inspect only the linked implementation and its necessary contracts. [ROUTES.md](ROUTES.md) maps every route to its exact page file. All data sources below are local; repository storage keys are in [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md).

## Entry points and implementation

| Feature / entry | Route or page | Main components / source | State → data/service | Utilities / impact |
| --- | --- | --- | --- | --- |
| [Login](FEATURES.md#login-and-shared-shell) | `/login`, `/admin/login` | [LoginForm](../components/shared/LoginForm.tsx), [AuthGuard](../components/shared/AuthGuard.tsx) | Form state → [authService](../services/authService.ts) → [employeeService](../services/employeeService.ts), [demo identities](../data/employees.ts) | EmployeeContext; account validation; profile and all employee ownership |
| Shell/navigation/profile/notifications | Both guarded layouts | [PortalShell](../components/shared/PortalShell.tsx), [BrandLogo](../components/shared/BrandLogo.tsx), [navigation](../lib/navigation.ts) | Drawer/profile/collapse state, useEmployee; useResource → [notificationService](../services/notificationService.ts) | Modal, toast, logout; both panels |
| [Employee workspace](FEATURES.md#employee-dashboard-and-information-rail) | `/` | [Dashboard](../components/employee/Dashboard.tsx), [QuickProcesses](../components/employee/QuickProcesses.tsx), [ProcessStatus](../components/employee/ProcessStatus.tsx), [RecentActivities](../components/employee/RecentActivities.tsx) | Five initial arrays + useResource → process/quick-process, activity, news, announcement services | Identity filters, Persian date/number formatting |
| Shared employee rail | [employee layout](<../app/(employee)/layout.tsx>) | [InfoRail](../components/employee/InfoRail.tsx), [Calendar](../components/employee/Calendar.tsx), [Clock](../components/employee/Clock.tsx) | Now/index/modal state + news/gallery resources | [date.ts](../lib/date.ts), AssetImage; every employee route |
| [Process inbox/details](FEATURES.md#processes) | `/processes`, `/processes/[id]` | [ProcessInbox](../components/employee/ProcessInbox.tsx), [ProcessDetails](../components/employee/ProcessDetails.tsx) | Initial processes + identity → [processService](../services/processService.ts) → [process seeds](../data/processes.ts) | DataTable, labels, date, safeHref; process chart and course enrollment |
| Process creation | `/processes/new?type=leave` | [ProcessRequestForm](../components/employee/ProcessRequestForm.tsx) | Local form → processService + [activityService](../services/activityService.ts) | Identity, toast/router; four request choices |
| [Directory](FEATURES.md#phone-directory) | `/phone-directory`, `/admin/phone-directory` | [PhoneDirectory](../components/employee/PhoneDirectory.tsx), [AdminPhoneDirectory](../components/admin/AdminPhoneDirectory.tsx) | Search/editor state → [phoneDirectoryService](../services/phoneDirectoryService.ts) → [authoritative seed](../data/phoneDirectory.ts) | Persian search/digits, clipboard; ticket department options |
| [News](FEATURES.md#news) | `/news`, `/news/[id]`; admin news list/new/ID | [NewsPages](../components/employee/NewsPages.tsx), [ContentManager](../components/admin/ContentManager.tsx), [newsConfig](../components/admin/resourceConfig.tsx) | Search/editor/useResource → [newsService](../services/newsService.ts) → [news seed](../data/news.ts) | AssetImage, date; both dashboards and employee rail |
| [Courses/enrollment](FEATURES.md#courses-and-enrollment) | `/courses`; admin course list/new/ID | [CoursesPage](../components/employee/CoursesPage.tsx), ContentManager + [courseConfig](../components/admin/resourceConfig.tsx) | [courseService](../services/courseService.ts) → [course seed](../data/courses.ts); enrollment writes process/activity | safeHref, dates; employee inbox, chart, activity history |
| [Tickets](FEATURES.md#tickets) | `/tickets` | [TicketsPage](../components/employee/TicketsPage.tsx) | Form + identity → [ticketService](../services/ticketService.ts), directory resource | Current department names; own-ID history |
| [Feedback](FEATURES.md#feedback) | `/feedback` | [FeedbackPage](../components/employee/FeedbackPage.tsx) | Form + identity → [feedbackService / submitFeedback](../services/feedbackService.ts) | DataTable, date, toast; exactly two types |
| [Employee accounts](FEATURES.md#employee-accounts) | `/admin/employees` | [AdminEmployees / EmployeeEditor](../components/admin/AdminEmployees.tsx) | List/editor/delete state → [employeeService / saveEmployee](../services/employeeService.ts) | DataTable, Modal, ConfirmDialog; authService and identity projection |
| [Admin overview](FEATURES.md#admin-dashboard-and-content-management) | `/admin` | [AdminDashboard](../components/admin/AdminDashboard.tsx) | useResource for news/courses/gallery/announcements/processes/activities | Shared ProcessStatus and RecentActivities; no account/feedback stats |
| [Gallery](FEATURES.md#gallery-announcements-and-quick-links) | `/admin/gallery`; employee rail | ContentManager + [galleryConfig](../components/admin/resourceConfig.tsx), InfoRail | [galleryService](../services/galleryService.ts) → [gallery seed](../data/gallery.ts) | [ContentForm](../components/ui/ContentForm.tsx) image upload → [AssetImage](../components/shared/AssetImage.tsx) |
| Announcements | `/admin/announcements`, `/announcements`, dashboard | ContentManager + [announcementConfig](../components/admin/resourceConfig.tsx), [AnnouncementsPage](../components/employee/AnnouncementsPage.tsx) | [announcementService](../services/announcementService.ts) → [announcement seed](../data/announcements.ts) | Separate announcement types, active filtering, date |
| Quick links | `/admin/processes`; dashboard | ContentManager + [quickProcessConfig](../components/admin/resourceConfig.tsx), QuickProcesses, [ProcessIcon](../components/shared/ProcessIcon.tsx) | quickProcessService in [processService.ts](../services/processService.ts) → quick-process seed | safeHref, order/active; no process-instance administration |
| [Activities](FEATURES.md#activities) | `/activities`, `/admin/activities`; dashboards | [ActivityHistory](../components/shared/ActivityHistory.tsx), RecentActivities | [activityService](../services/activityService.ts) → [activity seed](../data/activities.ts) | DataTable, [labels](../lib/labels.ts), date; name-based process visibility |
| [CRM placeholder](FEATURES.md#crm) | `/crm` | [CrmPage](<../app/(employee)/crm/page.tsx>) | None beyond guarded shell | Static content and `/tickets` link |

## Shared change surfaces

| Request affects | Inspect first | Expand only when needed |
| --- | --- | --- |
| One content field/validation | `components/admin/resourceConfig.tsx`, matching type/service/employee viewer | ContentForm if the input behavior itself must change |
| One new admin/employee page | Nearest existing feature, appropriate route group, `lib/navigation.ts` | PortalShell/layout only if the new page needs a different shared capability |
| Account login/profile | `services/authService.ts`, `services/employeeService.ts`, LoginForm, AuthGuard, PortalShell | Current employee-ID and name consumers |
| Local persistence or refresh | `services/mockRepository.ts`, `hooks/useResource.ts` | All collection consumers and cross-tab QA |
| Shared form/table/modal behavior | [Primitives](../components/ui/Primitives.tsx), [DataTable](../components/ui/DataTable.tsx), [Modal](../components/ui/Modal.tsx), ContentForm | Both panels; associated rules in [app/globals.css](../app/globals.css) |
| Search, date, link behavior | [utils.ts](../lib/utils.ts), [date.ts](../lib/date.ts), [domain tests](../tests/domain.test.ts) | All consumers of the changed helper |
| Loading/error/toast behavior | [States](../components/ui/States.tsx), [Toast](../components/ui/Toast.tsx), useResource | Error boundaries and forms |

## Dependency chains to preserve

`AdminEmployees → saveEmployee → employees collection → authService → AuthGuard/useEmployee → own process/ticket/feedback records`.

`AdminPhoneDirectory → phone-directory collection → PhoneDirectory + TicketsPage department picker` (no account synchronization).

`ContentManager → resourceConfig → collection repository → same-tab/storage event → useResource → employee consumers`.

`CoursesPage enrollment → processService + activityService → ProcessInbox/ProcessDetails/Dashboard + ActivityHistory`.

`InfoRail → newsService + galleryService + lib/date.ts → every employee route`.

For a data-shape change, start at [types/index.ts](../types/index.ts), then inspect the relevant chain in both directions. Existing stored JSON is not automatically migrated.

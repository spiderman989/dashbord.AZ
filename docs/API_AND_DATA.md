# API and data contracts

## What exists

**The business functionality is frontend-only.** There are no application HTTP endpoints, route handlers, server actions, database models/connections, external data fetches, or real backend authentication in this repository. Next.js rendering and static-asset requests are framework infrastructure, not a business API. Accordingly, endpoint request/response/authentication contracts are **NOT CURRENTLY IMPLEMENTED**.

The async functions in [services/](../services/) are local TypeScript interfaces. They must not be described as REST endpoints. [types/index.ts](../types/index.ts) is the shared model authority; [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) lists storage keys and seeds.

## Repository contract

[createMockRepository](../services/mockRepository.ts) implements `Repository<T extends { id: string }>`:

| Method | Input → resolved output | Behavior |
| --- | --- | --- |
| `list` | none → `T[]` | Browser stored array, or cloned seed when absent/server-side |
| `get` | `id: string` → `T` or `undefined` | Finds a record in the same collection |
| `create` | `Omit<T, "id">` → `T` | Generates collection-name + UUID ID, prepends, persists and notifies |
| `update` | ID, partial non-ID fields → `T` | Merges into current record, preserves ID; missing record throws |
| `remove` | ID → `void` | Missing record throws; no automatic cascading |
| `replace` | `T[]` → `T[]` | Replaces the whole collection, used for ordering/read flags |
| `subscribe` | listener → unsubscribe function | Browser-only same-tab event and cross-tab storage subscription |

Mutation methods reject on storage failure and on attempted server-side writes. Malformed stored JSON/non-array data/non-string IDs produce a Persian read error. Full field/schema validation is not performed by this adapter; `replace` also accepts its typed input without runtime model validation. Write failures use a common storage-space error, which does not distinguish every browser storage failure cause.

## Models

Fields below are required unless marked `?`. Dates are strings; creation helpers use ISO timestamps, and editorial forms commonly use `YYYY-MM-DD`. These are interfaces, not database schemas.

| Model | Fields and constraints in the type |
| --- | --- |
| `Employee` | `id`, `personnelCode`, `name`, `department`, `role: Role`, `username?`; session/profile projection, not an editable account |
| `EmployeeAccount` | `id`, `firstName`, `lastName`, `position`, `username`, `password`; plaintext local mock credentials |
| `Feedback` | `id`, `employeeId`, `type: FeedbackType`, `subject`, `message`, `createdAt`, `status: "submitted"` |
| `News` | `id`, `title`, `summary`, `content`, `image`, `date`, `category`, `author`, `status: ContentStatus` |
| `Course` | `id`, `title`, `description`, `image`, `instructor`, `startDate`, `endDate`, `status: CourseStatus`, `link`, `category` |
| `GalleryItem` | `id`, `title`, `description`, `image`, `date`, `active: boolean` |
| `Announcement` | `id`, `title`, `text`, `type: notice / important / warning / general`, `date`, `active: boolean` |
| `QuickProcess` | `id`, `title`, `description`, `icon: IconName`, `link`, `active: boolean`, `order: number` |
| `ProcessItem` | `id`, `employeeId`, `title`, `type: string`, `status: ProcessStatus`, `date`, `updatedAt`, `priority: normal / high / low`, `description`, `currentState`, `reference`, `assignee`, `backendTaskUrl?` |
| `RecentActivity` | `id`, `user` (display name), `title`, `description`, `date`, `type: process / content / training / system`, `status: success / pending / info` |
| `Notification` | `id`, `title`, `description`, `date`, `read: boolean`, `href`; no employee-owner field |
| `Department` | `id`, `name`, `extensions: PhoneExtension[]` |
| `PhoneExtension` | `id`, `extension` (string), `name`, `managerLabel?`, `active: boolean` |
| `Ticket` | `id`, `employeeId`, `department` (name string), `description`, `priority: low / normal / high`, `date`, `status: new / in_progress / completed` |

| Union | Exactly declared values |
| --- | --- |
| `Role` | `EMPLOYEE`, `ADMIN`, `SUPER_ADMIN`, `HR`, `CONTENT_MANAGER` |
| `FeedbackType` | `suggestion`, `criticism` — only پیشنهاد and انتقاد |
| `ContentStatus` | `draft`, `published`, `archived` |
| `CourseStatus` | `draft`, `active`, `finished`, `inactive` |
| `ProcessStatus` | `new`, `in_progress`, `completed`, `action_required` |
| `IconName` | `leave`, `mission`, `equipment`, `purchase`, `support`, `report` |

Most status display labels come from [lib/labels.ts](../lib/labels.ts); feedback labels are local to [FeedbackPage.tsx](../components/employee/FeedbackPage.tsx). Type declarations do not imply that the UI can transition between every declared status.

## Domain helpers and validation

| Contract and implementation | Validation / mutation rules |
| --- | --- |
| `saveEmployee(values, id?)` — [employeeService.ts](../services/employeeService.ts) | Trims names/position/username. First/last name: 2–60 characters; position: 2–100; each must contain a Unicode letter. Username: 3–40 ASCII letters/digits/`.`/`_`/`-`, starting alphanumeric; case-insensitive uniqueness. Reserves `employee` for new/renamed accounts, while retaining a legacy record already using it. Password: trimmed length ≥6 and original length ≤80, stored unchanged. Editing with exactly empty password retains the current one; spaces alone are invalid. Checks edit target still exists. |
| `submitFeedback({employeeId,type,subject,message})` — [feedbackService.ts](../services/feedbackService.ts) | Type must be suggestion or criticism; trimmed subject 3–180, trimmed message 10–5000, each containing a Unicode letter or number. Employee ID must be nonblank. Creates timestamp and `submitted` status. Does not verify the identity against an account repository. |
| `saveExtension(departmentId, extension, id?)`, `removeExtension(departmentId,id)` — [phoneDirectoryService.ts](../services/phoneDirectoryService.ts) | Reads the department and updates its nested array; extension creation generates an independent `ext-` UUID. Admin UI normalizes Persian/Arabic digits and requires 2–6 digits. It preserves manager text in parentheses. No uniqueness requirement for names or extension numbers. |
| `logContentChange(title)` — [activityService.ts](../services/activityService.ts) | Creates content activity under the fixed display name مدیر سامانه; timestamp now, success status. |
| Process creation — [ProcessRequestForm.tsx](../components/employee/ProcessRequestForm.tsx) | Trimmed title ≥4, description ≥10; native controls cap at 140/3000. Four request choices: leave/mission/equipment/purchase. Creates `new` process then awaits activity logging. |
| Course enrollment — [CoursesPage.tsx](../components/employee/CoursesPage.tsx) | Active-course UI action; checks loaded processes for matching employee ID and `COURSE-${course.id}` reference. Creates a new training process and separate activity; no enrollment API or atomic uniqueness. |
| Tickets — [TicketsPage.tsx](../components/employee/TicketsPage.tsx) | Selected department required; trimmed description ≥10, native maximum 500; creates `new` ticket. No service-level field validation. |
| Editorial forms — [ContentForm.tsx](../components/ui/ContentForm.tsx), [resourceConfig.tsx](../components/admin/resourceConfig.tsx) | Required fields and configured minimum lengths plus native constraints. Shared title 3–180; news summary 10–500, news body/course description ≥10; announcement text ≥5. Course end date cannot precede start; optional course link and required quick-process link must pass `safeHref`. Quick-process order is an integer ≥0 (zero is accepted despite the message saying positive). Gallery image is required. |

Login normalization and password comparison belong to [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md). Validation is implemented manually; no schema or form-validation dependency is installed. Native browser validation and explicit Persian validation coexist. Account, feedback, and employee login forms use `noValidate` so their own Persian checks run.

## Data relationships and assets

Processes, tickets, and feedback store `employeeId`; they do not embed credentials. Course enrollment references a course through a formatted process reference. Activities use names, not stable employee foreign keys. Tickets store department names, so renaming a directory department does not rewrite old tickets. Phone extensions and employee accounts are separate data sets, with no linking ID or synchronization.

The directory seed is authoritative; populated editorial/process/activity/identity/notification seeds are demonstrations. Sample prose about CRM or review workflows is not implementation evidence. Most list order follows array order; newly created records are prepended, not automatically sorted by date. Quick links explicitly sort by `order`.

Images are `reference:*` crop identifiers, local `/assets/` paths, or browser-created PNG/JPEG/WebP base64 data URLs. The upload control checks MIME type, maximum 1,000,000 bytes, and browser decoding before FileReader conversion. There is no upload endpoint. [AssetImage.tsx](../components/shared/AssetImage.tsx) rejects unsupported source forms with a visual fallback. Original mappings are in [ASSETS.md](ASSETS.md).

[safeHref](../lib/utils.ts) accepts local paths starting `/` except protocol-relative/backslash forms, or parsed HTTPS URLs. It is used for course links, quick links, and optional process-task links. It is not a site allowlist, ownership check, or general URL guard automatically applied to every link. `backendTaskUrl` is an optional display contract only: no task API, SSO, ProcessMaker integration, or seeded task URL exists.

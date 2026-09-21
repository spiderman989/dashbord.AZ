# Components

Component exports are usually named, while App Router wrappers default-export pages/layouts. Most interactive features declare `"use client"`; pure presentational components can be rendered within either compatible component tree. All paths are linked below. [FEATURE_MAP.md](FEATURE_MAP.md) supplies consumer relationships and [API_AND_DATA.md](API_AND_DATA.md) supplies model shapes.

## Shared infrastructure

| Component / path | Props | State, dependencies, and behavior | Modification considerations |
| --- | --- | --- | --- |
| [AuthGuard / useEmployee](../components/shared/AuthGuard.tsx) | `admin?: boolean`, `children` | Identity/error state; authService and router; private EmployeeContext; loading/error/redirect flow | No storage subscription; must wrap consumers calling useEmployee; UI guard only |
| [PortalShell](../components/shared/PortalShell.tsx) | `children`, `rail?: ReactNode`, `admin?: boolean` | Identity, pathname/router, navigation, notification resource; drawer/collapse/profile/notice local state | Both panels share this shell; mobile uses Modal; footer copyright excluded only at `/admin/employees` |
| [LoginForm](../components/shared/LoginForm.tsx) | `admin?: boolean` | Identity/password/visible/busy/error; auth service, router, branding and form primitives | Shared labels are username/password; employee and admin validation differ |
| [ActivityHistory](../components/shared/ActivityHistory.tsx) | `admin?: boolean` | Activity resource, identity; DataTable type filter/search/sort/date badges | Employee visibility is own-name process activities plus all other types |
| [AssetImage](../components/shared/AssetImage.tsx) | `src`, `alt`, `className?`, `priority?` | No owned state; Next Image, five reference crops, data URL/local-path handling, fallback | Crop coordinates rely on original source dimensions; external HTTPS images are not accepted |
| [BrandLogo](../components/shared/BrandLogo.tsx) | `href?` (default `/`), `large?` | Next Link and CSS logo viewport; supplied transparent PNG in headers, brand-sheet crop elsewhere | Keep header asset scoped to `.topbar`; preserve responsive scaling, source assets, and accessible label |
| [ProcessIcon](../components/shared/ProcessIcon.tsx) | `name: IconName`, `size?` (22) | Lucide icon mapping; calendar fallback | Quick-process configuration uses the same six-name union |

## UI primitives

[Primitives.tsx](../components/ui/Primitives.tsx) exports the shared building blocks. Most props extend the matching native HTML attributes, so callers supply event handlers, required constraints, ARIA attributes and input direction.

| Export | Main contract / behavior |
| --- | --- |
| `Button` | Native button props plus `variant: primary / secondary / ghost / danger`, `loading`; loading disables and adds spinner/`aria-busy`. Default variant primary. Set `type` explicitly inside forms when it should not submit. |
| `Card` | Section HTML props plus className; shared border/radius/padding and `min-width: 0`. |
| `PageHeading` | `title`, optional `description`, `eyebrow`, `children` action area; owns the page h1. |
| `SectionHeading` | `title`, optional `icon`, `href`, `action`, `description`; h2 and optional “view all” link. `href` takes precedence over action. |
| `Badge` | `children`, `status?`, `className?`; status-to-tone mapping plus colored dot. Text must still describe status. |
| `Input`, `Textarea`, `Select` | Native props and common classes; no controlled state or domain validation inside the wrapper. |
| `Field` | `label`, `htmlFor`, `children`, optional `hint`, `error`, `required`, `className`; renders label, hint/error IDs and error alert. Caller wires `aria-describedby`/other input attributes. Required star alone does not enforce validation. |
| `SearchInput` | Controlled `value`, `onChange(value)`, optional `placeholder`, `label`; search input with accessible name. |

[States.tsx](../components/ui/States.tsx) supplies `EmptyState({title?,description?,action?})`, `LoadingState({compact?})` with status role, and `ErrorState({message?,retry?})` with alert role. [Toast.tsx](../components/ui/Toast.tsx) exports `ToastProvider({children})` and `useToast() → (message, kind?)`; kind is success/error, default success. It renders one polite live-region message with close control and a resettable 4.5-second timer.

### DataTable

[DataTable.tsx](../components/ui/DataTable.tsx) is generic over records with string IDs. Required props are `data`, `columns`, and `searchFields(item)`. Optional props include search placeholder, filters, loading/error/retry, `initialFilters`, `initialPageSize` (6), empty title, and toolbar.

`Column<T>` defines key, Persian label, `render(item)`, optional `sortValue(item)` and className. `TableFilter<T>` defines key, label, options and `getValue(item)`. Internal state owns query, selected filters, sort, page and page size. Search uses Persian normalization; filters combine with AND; sorting compares numbers or Persian numeric-aware strings; pagination operates on the full local array. Page-size choices are the initial size plus 12 and 24.

The table provides loading/error/empty states, resettable filters, pagination, `aria-sort`, and a mobile sort select. CSS changes rows to labeled cards on small screens using `data-label`. Initial filters are read into state once, not continuously synchronized with props/URLs. Pass already authorized/visible rows; DataTable does not enforce ownership. Preserve `primary-cell`/`actions-cell` conventions and stable IDs when extending columns.

### ContentForm and image input

[ContentForm.tsx](../components/ui/ContentForm.tsx) accepts `fields: FormField[]`, `initialValues: FormValues`, async `onSave(values)`, `onCancel`, and optional `saveLabel`. FormValues is a dictionary of string/boolean values. FormField supports text, textarea, date, number, select, image, and toggle, plus required/length/hint/full-width/options metadata.

Internal state owns values/busy/error. Required and minimum trimmed lengths are explicitly checked; native input validation also applies. It forwards caught save errors to a Persian alert. Values initialize once; the route editor uses recordId as a React key. There is no password field type, so EmployeeEditor uses primitives directly.

Its private ImageUpload owns decode/read state and errors, accepts PNG/JPEG/WebP up to 1,000,000 bytes, and creates a data URL after successful browser decoding. It is a local file picker/preview, not a drag-and-drop server uploader. Callers' parsers perform domain-specific date/link checks. See [API_AND_DATA.md](API_AND_DATA.md).

### Modal and confirmation

[Modal.tsx](../components/ui/Modal.tsx) exports `Modal({title,children,onClose,className?})`. It uses native `<dialog>.showModal()`, an accessible title ID, native focus/modal behavior, and body-scroll lock restored on cleanup. Escape, backdrop and close button all request `onClose`. The caller owns visibility and decides whether closure is permitted during a save; not every existing caller blocks it.

`ConfirmDialog({title?,description,onConfirm,onClose})` owns busy/error state, awaits async confirmation, disables repeated actions and cancellation while busy, surfaces failure, and closes after success. Use it for established destructive local actions. Do not replace it with a different dialog system for a small feature.

## Feature components

| Component / file | Props and owned state | Main dependencies / usage |
| --- | --- | --- |
| [Dashboard](../components/employee/Dashboard.tsx) | `initial` object with processes, quick, activities, news, announcements | Five useResource calls, identity, QuickProcesses/ProcessStatus/RecentActivities; `/` |
| [InfoRail](../components/employee/InfoRail.tsx) | `initialNow`, `initialNews`, `initialGallery`; now/news index/selected gallery item | Timer, two resources, Calendar/Clock/AssetImage/Modal; employee layout |
| [Calendar](../components/employee/Calendar.tsx), [Clock](../components/employee/Clock.tsx) | Both `now: Date`; Calendar alone owns month offset | `lib/date.ts`; Clock hands use computed CSS custom properties |
| [QuickProcesses](../components/employee/QuickProcesses.tsx) | `items: QuickProcess[]`; derived active/sorted list | safeHref, ProcessIcon, dashboard |
| [ProcessStatus](../components/employee/ProcessStatus.tsx) | `processes: ProcessItem[]`; derived counts/percent/SVG segments | No owned state; used by both dashboards; always links employee inbox |
| [RecentActivities](../components/employee/RecentActivities.tsx) | `items: RecentActivity[]`, `admin?`; first five entries | Badge/date formatting; history link changes by admin prop; caller filters data |
| [ProcessInbox](../components/employee/ProcessInbox.tsx) | `initial: ProcessItem[]`, `initialStatus?` | Resource and employee ID; derived stats, DataTable |
| [ProcessDetails](../components/employee/ProcessDetails.tsx) | `id`, `initial: ProcessItem[]`; preview flag | Resource/identity, safeHref, timeline, Modal |
| [ProcessRequestForm](../components/employee/ProcessRequestForm.tsx) | `initialType?`; form/busy/error | Process and activity writes, identity, toast/router |
| [PhoneDirectory](../components/employee/PhoneDirectory.tsx) | `initial: Department[]`; query/department/copied state | Directory resource, normalized search, clipboard and tel links |
| [NewsList / NewsDetail](../components/employee/NewsPages.tsx) | List: no props, query/category; detail: `id` | News resource and published filter, AssetImage/date |
| [CoursesPage](../components/employee/CoursesPage.tsx) | No props; query/status/selected/busy | Course/process resources, activity writes, identity, Modal |
| [TicketsPage](../components/employee/TicketsPage.tsx) | No props; department/description/priority/busy/error | Directory and tickets resources, identity, toast |
| [FeedbackPage](../components/employee/FeedbackPage.tsx) | No props; type/subject/message/busy/error | Feedback resource, submitFeedback, identity, history DataTable |
| [AnnouncementsPage](../components/employee/AnnouncementsPage.tsx) | No props; resource state only | Active announcements, badges/date |
| [AdminDashboard](../components/admin/AdminDashboard.tsx) | No props; six resources, derived counts | News/course/gallery/announcement/process/activity services; shared dashboard views |
| [AdminEmployees](../components/admin/AdminEmployees.tsx) | No props; resource/editing/removing state | Employee service, DataTable, ConfirmDialog; internal EmployeeEditor accepts optional account + onClose, owns form/busy/error |
| [AdminPhoneDirectory](../components/admin/AdminPhoneDirectory.tsx) | No props; resource/query/active/editor/removing/busy | Nested directory helpers; ContentForm/Modal/ConfirmDialog |
| [ContentManager](../components/admin/ContentManager.tsx) | `kind: ContentKind`, `recordId?` | Dispatches internal ResourceList/ResourceEditor using typed configs |

ContentManager's private ResourceList owns editing/removing/viewing/mutation state and uses `config.repository`, columns, fields, filters, parser and optional toggle/reorder. ResourceEditor owns a subscribed record lookup, uses `recordId === "new"` for creation, and routes back to the list after save. ContentPreview renders configured values as text/date/label/image. [resourceConfig.tsx](../components/admin/resourceConfig.tsx) declares `ResourceConfig<T>` and news/course/gallery/announcement/quick-process configurations. Its optional `viewHref` is currently unused by the manager. Inspect both files when changing shared content-editor behavior.

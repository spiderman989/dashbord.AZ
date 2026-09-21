# State management

## Ownership

| State | Owner | Consumers / changes |
| --- | --- | --- |
| Persistent domain collections | [createMockRepository](../services/mockRepository.ts) via module-level service instances | Services mutate arrays; feature components read through `useResource` |
| Resource view state | [useResource](../hooks/useResource.ts): `data`, `loading`, `error`, `reload` | One state instance per mounted consumer, synchronized by repository events |
| Current identity | [AuthGuard](../components/shared/AuthGuard.tsx) private EmployeeContext | `useEmployee()` below guarded layouts; loaded by authService |
| Session markers | [authService](../services/authService.ts) | Two independent localStorage keys, described in [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md) |
| Toast | [ToastProvider](../components/ui/Toast.tsx) at root | `useToast()`; one success/error message, replaced by the next, dismissed after 4.5 seconds |
| Search/filter/sort/page | DataTable and individual feature components | React `useState`; generally resets on component remount, not persisted |
| Forms/modals/drawer/sidebar/profile | Component that renders the UI | Local `useState`; drafts and sidebar collapse do not survive reload |
| Calendar/clock | InfoRail owns `now` ticking each second; Calendar owns month offset | Shared Date prop to Calendar/Clock; timer cleaned up on unmount |

There is no Redux, Zustand, React Query, SWR, global domain context, or separate state-management dependency.

## Persistent collections

Every collection uses the exact prefix `azarshin.portal.v1.` plus the suffix below. Counts are the audited **seed counts**, not live storage counts.

| Suffix | Service instance and source | Seed source / count |
| --- | --- | --- |
| `activities` | `activityService` — [activityService.ts](../services/activityService.ts) | [data/activities.ts](../data/activities.ts), 7 |
| `announcements` | `announcementService` — [announcementService.ts](../services/announcementService.ts) | [data/announcements.ts](../data/announcements.ts), 3 |
| `courses` | `courseService` — [courseService.ts](../services/courseService.ts) | [data/courses.ts](../data/courses.ts), 4 |
| `gallery` | `galleryService` — [galleryService.ts](../services/galleryService.ts) | [data/gallery.ts](../data/gallery.ts), 4 |
| `news` | `newsService` — [newsService.ts](../services/newsService.ts) | [data/news.ts](../data/news.ts), 6 |
| `notifications` | `notificationService` — [notificationService.ts](../services/notificationService.ts) | [data/employees.ts](../data/employees.ts), 2 shared notifications |
| `phone-directory` | `phoneDirectoryService` — [phoneDirectoryService.ts](../services/phoneDirectoryService.ts) | [data/phoneDirectory.ts](../data/phoneDirectory.ts), 10 departments / 25 nested extensions |
| `processes` | `processService` — [processService.ts](../services/processService.ts) | [data/processes.ts](../data/processes.ts), 12 |
| `quick-processes` | `quickProcessService` — [processService.ts](../services/processService.ts) | [data/processes.ts](../data/processes.ts), 4 |
| `tickets` | `ticketService` — [ticketService.ts](../services/ticketService.ts) | Empty array |
| `employees` | `employeeService` — [employeeService.ts](../services/employeeService.ts) | Empty array; built-in demo identity is separate |
| `feedback` | `feedbackService` — [feedbackService.ts](../services/feedbackService.ts) | Empty array |

Session keys are **not** collection keys: `azarshin.demo.employee` and `azarshin.demo.admin` contain a plain identity ID, not a JSON collection.

## Read/write lifecycle

1. On the server, `list`/`get` read a `structuredClone` of the seed. They cannot see a particular browser's saved state.
2. In the browser, missing/empty storage values fall back to a cloned seed. A stored empty JSON array remains empty; it does not restore seeds. No seed is written merely by reading.
3. `useResource(repository, initial?)` starts with `initial ?? []`; `loading` initially equals `!initial`. On mount it reads the repository even when initial data was supplied, then subscribes.
4. A mutation reads the current array, writes JSON synchronously through localStorage, then dispatches `portal:${name}`. Subscribers in the same tab reread immediately through their async read function.
5. Native `storage` events refresh other same-origin tabs when the matching key changes or the event key is null (storage clear). The browser origin includes protocol, host, and port.
6. Hook cleanup marks the effect inactive and unsubscribes, preventing its pending reads from setting state after unmount. `reload()` clears errors on success and ends loading; it does not set loading back to true for a refresh.

Passing stable service instances matters: constructing a repository in a component render would repeatedly replace the effect dependency. Keep domain mutations in their service/helper and use the repository event mechanism rather than adding a parallel cache or manually patching several views.

## Consistency and persistence limits

All local records persist across reloads and logout until changed or browser storage is removed. They are shared by accounts using the same origin/browser profile, even if the UI filters ownership. They are not encrypted, synchronized across devices, transactionally updated, or backed up by this application.

Repositories read the latest array when mutating but replace the whole array; concurrent read/modify/write operations can lose updates. No automatic migration, referential integrity, delete cascade, conflict resolution, undo, or reset UI exists. Changing a seed file does not override an already stored collection. Do not clear storage to “fix” a feature without considering the user's local records; use isolated test contexts for validation.

AuthGuard does **not** subscribe to session or employee repository changes. A mounted identity may remain stale until a reload/remount, even though the employee list refreshes across tabs. Activity filtering uses `user === employee.name` for process activities; a name change can hide old process activity entries. Other non-process activities and notifications are shared. See [AUTH_AND_PERMISSIONS.md](AUTH_AND_PERMISSIONS.md) for the exact visibility rules.

export type Role = "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN" | "HR" | "CONTENT_MANAGER";
export interface Employee { id: string; personnelCode: string; name: string; department: string; role: Role; }
export type ContentStatus = "draft" | "published" | "archived";
export type CourseStatus = "draft" | "active" | "finished" | "inactive";
export type ProcessStatus = "new" | "in_progress" | "completed" | "action_required";
export type IconName = "leave" | "mission" | "equipment" | "purchase" | "support" | "report";
export interface News { id: string; title: string; summary: string; content: string; image: string; date: string; category: string; author: string; status: ContentStatus; }
export interface Course { id: string; title: string; description: string; image: string; instructor: string; startDate: string; endDate: string; status: CourseStatus; link: string; category: string; }
export interface GalleryItem { id: string; title: string; description: string; image: string; date: string; active: boolean; }
export interface Announcement { id: string; title: string; text: string; type: "notice" | "important" | "warning" | "general"; date: string; active: boolean; }
export interface QuickProcess { id: string; title: string; description: string; icon: IconName; link: string; active: boolean; order: number; }
export interface RecentActivity { id: string; user: string; title: string; description: string; date: string; type: "process" | "content" | "training" | "system"; status: "success" | "pending" | "info"; }
export interface ProcessItem { id: string; employeeId: string; title: string; type: string; status: ProcessStatus; date: string; updatedAt: string; priority: "normal" | "high" | "low"; description: string; currentState: string; reference: string; assignee: string; backendTaskUrl?: string; }
export interface Notification { id: string; title: string; description: string; date: string; read: boolean; href: string; }
export interface PhoneExtension { id: string; extension: string; name: string; managerLabel?: string; active: boolean; }
export interface Department { id: string; name: string; extensions: PhoneExtension[]; }
export interface Ticket { id: string; employeeId: string; department: string; description: string; priority: "low" | "normal" | "high"; date: string; status: "new" | "in_progress" | "completed"; }
export interface Repository<T extends { id: string }> {
  list: () => Promise<T[]>;
  get: (id: string) => Promise<T | undefined>;
  create: (item: Omit<T, "id">) => Promise<T>;
  update: (id: string, item: Partial<Omit<T, "id">>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  replace: (items: T[]) => Promise<T[]>;
  subscribe: (listener: () => void) => () => void;
}

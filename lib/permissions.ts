import type { Employee } from "@/types";

export type Panel = "employee" | "admin";
/** Stable section IDs and explicit route allowlist shared by every UI consumer. */
export const sections = [
  { id: "employee.home", panel: "employee", label: "میز کار", href: "/", routes: ["/"], menu: true },
  { id: "employee.processes", panel: "employee", label: "فرآیندها", href: "/processes", routes: ["/processes", "/processes/new", "/processes/:id"], menu: true },
  { id: "employee.crm", panel: "employee", label: "CRM", href: "/crm", routes: ["/crm"], menu: true },
  { id: "employee.directory", panel: "employee", label: "شماره‌های داخلی", href: "/phone-directory", routes: ["/phone-directory"], menu: true },
  { id: "employee.tickets", panel: "employee", label: "تیکت", href: "/tickets", routes: ["/tickets"], menu: true },
  { id: "employee.news", panel: "employee", label: "اخبار", href: "/news", routes: ["/news", "/news/:id"], menu: true },
  { id: "employee.courses", panel: "employee", label: "آموزش", href: "/courses", routes: ["/courses"], menu: true },
  { id: "employee.feedback", panel: "employee", label: "صندوق انتقادات و پیشنهادات", href: "/feedback", routes: ["/feedback"], menu: true },
  { id: "employee.activities", panel: "employee", label: "فعالیت‌ها", href: "/activities", routes: ["/activities"], menu: false },
  { id: "employee.announcements", panel: "employee", label: "اطلاعیه‌ها", href: "/announcements", routes: ["/announcements"], menu: false },
  { id: "admin.home", panel: "admin", label: "داشبورد", href: "/admin", routes: ["/admin"], menu: true },
  { id: "admin.news", panel: "admin", label: "اخبار", href: "/admin/news", routes: ["/admin/news", "/admin/news/new", "/admin/news/:id"], menu: true },
  { id: "admin.courses", panel: "admin", label: "آموزش / دوره‌ها", href: "/admin/courses", routes: ["/admin/courses", "/admin/courses/new", "/admin/courses/:id"], menu: true },
  { id: "admin.gallery", panel: "admin", label: "گالری", href: "/admin/gallery", routes: ["/admin/gallery"], menu: true },
  { id: "admin.announcements", panel: "admin", label: "اطلاعیه‌ها", href: "/admin/announcements", routes: ["/admin/announcements"], menu: true },
  { id: "admin.processes", panel: "admin", label: "فرآیندها", href: "/admin/processes", routes: ["/admin/processes"], menu: true },
  { id: "admin.activities", panel: "admin", label: "فعالیت‌ها", href: "/admin/activities", routes: ["/admin/activities"], menu: true },
  { id: "admin.directory", panel: "admin", label: "شماره‌های داخلی", href: "/admin/phone-directory", routes: ["/admin/phone-directory"], menu: true },
  { id: "admin.employees", panel: "admin", label: "مدیریت کارکنان", href: "/admin/employees", routes: ["/admin/employees"], menu: true },
  { id: "admin.links", panel: "admin", label: "مدیریت صفحات و لینک‌ها", href: "/admin/links", routes: ["/admin/links"], menu: true },
] as const;
export type BuiltinSectionId = typeof sections[number]["id"];
export type CustomSectionId = `${Panel}.custom.${string}`;
export type SectionId = BuiltinSectionId | CustomSectionId;
export interface CustomSection { id: CustomSectionId; panel: Panel; label: string; active: boolean; }
export const isCustomSectionId = (id: unknown, panel: Panel): id is CustomSectionId => typeof id === "string" && new RegExp(`^${panel}\\.custom\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, "i").test(id);
export interface UserPermissions {
  /** Account ID, never a display name or username. */
  id: string;
  employeeSections: SectionId[];
  adminAccess: boolean;
  adminSections: SectionId[];
}
export const sectionsForPanel = (panel: Panel) => sections.filter((section) => section.panel === panel);
export const isSuperAdmin = (identity: Employee) => identity.role === "SUPER_ADMIN";
export const emptyPermissions = (id: string): UserPermissions => ({ id, employeeSections: [], adminAccess: false, adminSections: [] });

export function sectionForPath(href: string) {
  if (!href.startsWith("/") || href.startsWith("//") || href.includes("\\")) return undefined;
  let path: string;
  try { path = decodeURIComponent(href.split(/[?#]/)[0]).replace(/\/+$/, "") || "/"; }
  catch { return undefined; }
  const parts = path.split("/");
  if (parts.some((part) => part === "." || part === "..")) return undefined;
  return sections.find((section) => section.routes.some((route) => {
    const expected = route.split("/");
    return expected.length === parts.length && expected.every((part, index) => part === ":id" ? Boolean(parts[index]) : part === parts[index]);
  }));
}
export function canAccessSection(identity: Employee, permissions: UserPermissions, id: SectionId, custom: readonly CustomSection[] = []) {
  const section = sections.find((item) => item.id === id) ?? custom.find((item) => item.id === id && isCustomSectionId(item.id, item.panel));
  if (!section || permissions.id !== identity.id) return false;
  if ("active" in section && !section.active) return false;
  if (isSuperAdmin(identity)) return true;
  if (id === "admin.links") return false;
  return section.panel === "admin"
    ? permissions.adminAccess && permissions.adminSections.includes(id)
    : permissions.employeeSections.includes(id);
}
export function canAccessPath(identity: Employee, permissions: UserPermissions, path: string) {
  const section = sectionForPath(path);
  return Boolean(section && canAccessSection(identity, permissions, section.id));
}
export function firstAllowedPath(identity: Employee, permissions: UserPermissions, panel: Panel) {
  return sectionsForPanel(panel).find((section) => canAccessSection(identity, permissions, section.id))?.href ?? null;
}

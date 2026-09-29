import { LayoutDashboard, Workflow, UsersRound, Phone, Ticket, Newspaper, GraduationCap, Images, Megaphone, History, MessageSquare, Link2 } from "lucide-react";
import { sectionsForPanel, type BuiltinSectionId } from "./permissions";

export const navigationIcons = {
  dashboard: { label: "داشبورد", component: LayoutDashboard }, workflow: { label: "فرآیند", component: Workflow },
  users: { label: "کاربران", component: UsersRound }, phone: { label: "تلفن", component: Phone },
  ticket: { label: "تیکت", component: Ticket }, news: { label: "خبر", component: Newspaper },
  training: { label: "آموزش", component: GraduationCap }, images: { label: "گالری", component: Images },
  announcement: { label: "اطلاعیه", component: Megaphone }, history: { label: "فعالیت", component: History },
  message: { label: "پیام", component: MessageSquare }, link: { label: "لینک", component: Link2 },
};
export type NavigationIcon = keyof typeof navigationIcons;
const icons = {
  "employee.home": "dashboard", "employee.processes": "workflow", "employee.crm": "users",
  "employee.directory": "phone", "employee.tickets": "ticket", "employee.news": "news",
  "employee.courses": "training", "employee.feedback": "message", "employee.activities": "history",
  "employee.announcements": "announcement", "admin.home": "dashboard", "admin.news": "news",
  "admin.courses": "training", "admin.gallery": "images", "admin.announcements": "announcement",
  "admin.processes": "workflow", "admin.activities": "history", "admin.directory": "phone", "admin.employees": "users", "admin.links": "link",
} satisfies Record<BuiltinSectionId, NavigationIcon>;
export const employeeNavigation = sectionsForPanel("employee").filter((s) => s.menu).map((s, index) => ({ ...s, icon: icons[s.id], order: index * 1024 }));
export const adminNavigation = sectionsForPanel("admin").filter((s) => s.menu).map((s, index) => ({ ...s, icon: icons[s.id], order: index * 1024 }));

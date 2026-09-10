import { LayoutDashboard, Workflow, UsersRound, Phone, Ticket, Newspaper, GraduationCap, Images, Megaphone, History } from "lucide-react";
export const employeeNavigation = [
  { href: "/", label: "میز کار", icon: LayoutDashboard },
  { href: "/processes", label: "فرآیندها", icon: Workflow },
  { href: "/crm", label: "CRM", icon: UsersRound },
  { href: "/phone-directory", label: "شماره‌های داخلی", icon: Phone },
  { href: "/tickets", label: "تیکت", icon: Ticket },
  { href: "/news", label: "اخبار", icon: Newspaper },
  { href: "/courses", label: "آموزش", icon: GraduationCap },
];
export const adminNavigation = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/news", label: "اخبار", icon: Newspaper },
  { href: "/admin/courses", label: "آموزش / دوره‌ها", icon: GraduationCap },
  { href: "/admin/gallery", label: "گالری", icon: Images },
  { href: "/admin/announcements", label: "اطلاعیه‌ها", icon: Megaphone },
  { href: "/admin/processes", label: "فرآیندها", icon: Workflow },
  { href: "/admin/activities", label: "فعالیت‌ها", icon: History },
  { href: "/admin/phone-directory", label: "شماره‌های داخلی", icon: Phone },
];

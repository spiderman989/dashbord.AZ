import type { Employee, Notification } from "@/types";
/** Explicitly demo identities, not authoritative directory records. */
export const demoEmployee: Employee = { id: "employee-1001", personnelCode: "1001", name: "علی محمدی", department: "IT", role: "EMPLOYEE" };
export const demoAdmin: Employee = { id: "admin-1", personnelCode: "admin", name: "مدیر سامانه", department: "IT", role: "ADMIN" };
export const notifications: Notification[] = [
  { id: "notification-1", title: "یک درخواست نیازمند اقدام شماست", description: "مشخصات درخواست خرید را تکمیل کنید.", date: "2026-09-09T08:10:00+03:30", read: false, href: "/processes/process-1" },
  { id: "notification-2", title: "دوره‌های جدید در دسترس هستند", description: "برنامه آموزشی شهریور را مشاهده کنید.", date: "2026-09-08T12:00:00+03:30", read: false, href: "/courses" },
];

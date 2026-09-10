import type { Course } from "@/types";
export const courses: Course[] = [
  { id: "course-1", title: "مهارت‌های کاربردی اکسل", description: "از فرمول‌های روزمره تا ساخت گزارش‌های دقیق؛ یک دوره کاربردی برای همکاران همه واحدها.", image: "reference:training", instructor: "مدرس نمونه آموزش", startDate: "2026-09-15", endDate: "2026-09-25", status: "active", link: "/tickets", category: "مهارت‌های دیجیتال" },
  { id: "course-2", title: "ارتباط مؤثر و کار تیمی", description: "تمرین گفت‌وگوی سازنده، ارائه بازخورد و همکاری بهتر در محیط کار.", image: "reference:meeting", instructor: "تیم آموزش منابع انسانی", startDate: "2026-09-20", endDate: "2026-09-21", status: "active", link: "/tickets", category: "توسعه فردی" },
  { id: "course-3", title: "آشنایی با سامانه CRM", description: "راهنمای استفاده از امکانات جدید سامانه ارتباط با مشتریان.", image: "reference:analytics", instructor: "واحد IT", startDate: "2026-08-20", endDate: "2026-08-22", status: "finished", link: "/crm", category: "نرم‌افزارهای سازمانی" },
  { id: "course-4", title: "ایمنی در محیط کار", description: "مرور اصول ایمنی و آمادگی در شرایط اضطراری.", image: "reference:building", instructor: "تیم آموزش", startDate: "2026-10-01", endDate: "2026-10-03", status: "draft", link: "", category: "ایمنی و سلامت" },
];

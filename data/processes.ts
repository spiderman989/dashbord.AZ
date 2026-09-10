import type { ProcessItem, QuickProcess } from "@/types";
export const quickProcesses: QuickProcess[] = [
  { id: "quick-1", title: "درخواست مرخصی", description: "استحقاقی، ساعتی و استعلاجی", icon: "leave", link: "/processes/new?type=leave", active: true, order: 1 },
  { id: "quick-2", title: "درخواست مأموریت", description: "ثبت و پیگیری مأموریت کاری", icon: "mission", link: "/processes/new?type=mission", active: true, order: 2 },
  { id: "quick-3", title: "درخواست تجهیزات", description: "تجهیزات و ملزومات مورد نیاز", icon: "equipment", link: "/processes/new?type=equipment", active: true, order: 3 },
  { id: "quick-4", title: "درخواست خرید", description: "ثبت درخواست خرید سازمانی", icon: "purchase", link: "/processes/new?type=purchase", active: true, order: 4 },
];
export const processes: ProcessItem[] = [
  { id: "process-1", employeeId: "employee-1001", title: "درخواست خرید تجهیزات اداری", type: "خرید", status: "action_required", date: "2026-09-08T08:30:00+03:30", updatedAt: "2026-09-09T08:10:00+03:30", priority: "high", description: "درخواست تهیه یک دستگاه نمایشگر و ملزومات میز کار. لطفاً اطلاعات مدل و مشخصات فنی مورد نظر را تکمیل کنید.", currentState: "در انتظار تکمیل مشخصات توسط درخواست‌کننده", reference: "AZ-1405-0248", assignee: "تدارکات" },
  { id: "process-2", employeeId: "employee-1001", title: "مرخصی استحقاقی شهریور", type: "مرخصی", status: "in_progress", date: "2026-09-08T09:30:00+03:30", updatedAt: "2026-09-09T07:40:00+03:30", priority: "normal", description: "درخواست دو روز مرخصی استحقاقی از تاریخ ۲۵ شهریور. هماهنگی لازم برای تحویل فعالیت‌های جاری انجام شده است.", currentState: "در انتظار تأیید مدیر واحد", reference: "AZ-1405-0247", assignee: "منابع انسانی" },
  { id: "process-3", employeeId: "employee-1001", title: "تأیید گزارش مأموریت", type: "مأموریت", status: "new", date: "2026-09-07T10:00:00+03:30", updatedAt: "2026-09-08T11:30:00+03:30", priority: "normal", description: "بررسی گزارش مأموریت کاری و تأیید هزینه‌های ثبت‌شده.", currentState: "آماده بررسی توسط شما", reference: "AZ-1405-0243", assignee: "مالی" },
  ...Array.from({ length: 9 }, (_, index): ProcessItem => ({
    id: `process-${index + 4}`, employeeId: "employee-1001",
    title: ["درخواست تجهیزات رایانه‌ای", "تسویه هزینه مأموریت", "درخواست مرخصی ساعتی", "تأیید گزارش ماهانه", "درخواست ملزومات اداری", "بررسی قرارداد ماهانه", "درخواست مأموریت کاری", "تأیید صورت‌هزینه", "درخواست دسترسی سامانه"][index],
    type: ["تجهیزات", "مأموریت", "مرخصی", "گزارش", "خرید", "قرارداد", "مأموریت", "مالی", "تجهیزات"][index],
    status: index === 8 ? "in_progress" : "completed", date: `2026-09-0${Math.max(1, 7 - index)}T08:00:00+03:30`, updatedAt: "2026-09-08T12:00:00+03:30", priority: "normal",
    description: "این درخواست به‌صورت نمونه برای نمایش روند پیگیری فرآیندهای داخلی ثبت شده است.", currentState: index === 8 ? "در حال بررسی توسط واحد IT" : "فرآیند با موفقیت تکمیل شده است", reference: `AZ-1405-0${240 - index}`, assignee: index === 8 ? "IT" : "منابع انسانی",
  })),
];

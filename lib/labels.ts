import type { CourseStatus, ContentStatus, ProcessStatus } from "@/types";
export const processLabels: Record<ProcessStatus, string> = { new: "جدید", in_progress: "در حال انجام", completed: "تکمیل شده", action_required: "نیازمند اقدام" };
export const contentLabels: Record<ContentStatus, string> = { draft: "پیش‌نویس", published: "منتشر شده", archived: "بایگانی شده" };
export const courseLabels: Record<CourseStatus, string> = { draft: "پیش‌نویس", active: "فعال", finished: "پایان یافته", inactive: "غیرفعال" };
export const activityLabels = { process: "فرآیند", content: "محتوا", training: "آموزش", system: "سامانه" };
export const activityStatusLabels = { success: "تکمیل شده", pending: "در انتظار اقدام", info: "ثبت شده" };
export const announcementLabels = { notice: "اطلاعیه", important: "خبر مهم", warning: "هشدار", general: "عمومی" };
export const priorityLabels = { normal: "عادی", high: "مهم", low: "کم" };

import { activities } from "@/data/activities";
import { createMockRepository } from "./mockRepository";
export const activityService = createMockRepository("activities", activities);
export const getRecentActivities = activityService.list;
export async function logContentChange(title: string) {
  return activityService.create({ user: "مدیر سامانه", title, description: "تغییر محتوای پورتال", date: new Date().toISOString(), type: "content", status: "success" });
}

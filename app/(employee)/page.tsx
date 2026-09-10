import { Dashboard } from "@/components/employee/Dashboard";
import { getProcesses, getQuickProcesses } from "@/services/processService";
import { getRecentActivities } from "@/services/activityService";
import { getNews } from "@/services/newsService";
import { getAnnouncements } from "@/services/announcementService";
export default async function HomePage() {
  const [processes, quick, activities, news, announcements] = await Promise.all([getProcesses(), getQuickProcesses(), getRecentActivities(), getNews(), getAnnouncements()]);
  return <Dashboard initial={{ processes, quick, activities, news, announcements }} />;
}

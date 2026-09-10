import { AuthGuard } from "@/components/shared/AuthGuard";
import { PortalShell } from "@/components/shared/PortalShell";
import { InfoRail } from "@/components/employee/InfoRail";
import { getGallery } from "@/services/galleryService";
import { getNews } from "@/services/newsService";
export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [news, gallery] = await Promise.all([getNews(), getGallery()]);
  return <AuthGuard><PortalShell rail={<InfoRail initialNow={new Date().toISOString()} initialNews={news} initialGallery={gallery} />}>{children}</PortalShell></AuthGuard>;
}

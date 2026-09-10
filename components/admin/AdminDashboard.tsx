"use client";
import Link from "next/link";
import { ArrowUpLeft, GraduationCap, Images, Megaphone, Newspaper, Plus, Settings2, Workflow } from "lucide-react";
import { Badge, Card, PageHeading, SectionHeading } from "@/components/ui/Primitives";
import { ErrorState, LoadingState, EmptyState } from "@/components/ui/States";
import { AssetImage } from "@/components/shared/AssetImage";
import { ProcessStatus } from "@/components/employee/ProcessStatus";
import { RecentActivities } from "@/components/employee/RecentActivities";
import { useResource } from "@/hooks/useResource";
import { newsService } from "@/services/newsService";
import { courseService } from "@/services/courseService";
import { galleryService } from "@/services/galleryService";
import { announcementService } from "@/services/announcementService";
import { processService } from "@/services/processService";
import { activityService } from "@/services/activityService";
import { contentLabels } from "@/lib/labels";
import { faNumber } from "@/lib/utils";
import { persianDate } from "@/lib/date";

export function AdminDashboard() {
  const news = useResource(newsService); const courses = useResource(courseService); const gallery = useResource(galleryService); const announcements = useResource(announcementService); const processes = useResource(processService); const activities = useResource(activityService);
  const resources = [news, courses, gallery, announcements, processes, activities]; const error = resources.find((resource) => resource.error);
  if (resources.some((resource) => resource.loading)) return <LoadingState />;
  if (error) return <ErrorState message={error.error ?? undefined} retry={error.reload} />;
  const stats = [{ label: "اخبار", count: news.data.length, detail: `${faNumber(news.data.filter((item) => item.status === "published").length)} خبر منتشر شده`, icon: Newspaper, href: "/admin/news" }, { label: "دوره‌های آموزشی", count: courses.data.length, detail: `${faNumber(courses.data.filter((item) => item.status === "active").length)} دوره فعال`, icon: GraduationCap, href: "/admin/courses" }, { label: "اطلاعیه‌ها", count: announcements.data.length, detail: `${faNumber(announcements.data.filter((item) => item.active).length)} اطلاعیه فعال`, icon: Megaphone, href: "/admin/announcements" }, { label: "تصاویر گالری", count: gallery.data.length, detail: "قاب‌هایی از لحظه‌های سازمان", icon: Images, href: "/admin/gallery" }, { label: "فرآیندها", count: processes.data.length, detail: `${faNumber(processes.data.filter((item) => item.status === "completed").length)} فرآیند تکمیل شده`, icon: Workflow, href: "/admin/processes" }];
  return <><PageHeading title="نبض پورتال در دستان شما" description="نمایی از محتوا، فعالیت‌ها و آنچه در سازمان می‌گذرد." eyebrow="مدیریت پورتال / داشبورد"><Link href="/admin/news/new" className="button button-primary"><Plus size={17} />ایجاد خبر جدید</Link></PageHeading><div className="admin-welcome"><span className="admin-welcome-icon"><Settings2 size={27} /></span><div><strong>به پنل مدیریت آذرشین خوش آمدید.</strong><p>محتوای به‌روز، همکارانی آگاه‌تر و ارتباطی نزدیک‌تر.</p></div><span className="admin-mode-label"><span />نسخه نمایشی</span></div><div className="admin-stat-grid">{stats.map(({ icon: Icon, ...item }) => <Link href={item.href} key={item.href} className="card admin-stat"><div className="admin-stat-top"><span><Icon size={20} strokeWidth={1.6} /></span><ArrowUpLeft size={16} /></div><strong>{faNumber(item.count)}</strong><h2>{item.label}</h2><p>{item.detail}</p></Link>)}</div><div className="admin-overview-grid"><Card className="admin-latest-news"><SectionHeading title="آخرین اخبار" icon={<Newspaper size={18} />} href="/admin/news" />{news.data.length ? <div className="admin-news-list">{news.data.slice(0, 4).map((item) => <Link key={item.id} href={`/admin/news/${item.id}`}><AssetImage src={item.image} alt="" /><span><strong>{item.title}</strong><small>{persianDate(item.date)} · {item.author}</small></span><Badge status={item.status}>{contentLabels[item.status]}</Badge><ArrowUpLeft size={16} /></Link>)}</div> : <EmptyState title="خبری ثبت نشده است." />}</Card><ProcessStatus processes={processes.data} /></div><RecentActivities items={activities.data} admin /><div className="admin-quick-links"><Link href="/admin/news/new"><Newspaper size={20} /><span>یک خبر تازه منتشر کنید</span><ArrowUpLeft size={18} /></Link><Link href="/admin/courses/new"><GraduationCap size={20} /><span>مسیر یادگیری تازه‌ای بسازید</span><ArrowUpLeft size={18} /></Link><Link href="/admin/phone-directory"><Workflow size={20} /><span>اطلاعات واحدها را مدیریت کنید</span><ArrowUpLeft size={18} /></Link></div></>;
}

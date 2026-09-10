"use client";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Bell, CheckCircle2, CircleHelp, Sparkles } from "lucide-react";
import { useEmployee } from "@/components/shared/AuthGuard";
import { AssetImage } from "@/components/shared/AssetImage";
import { Card, PageHeading, SectionHeading } from "@/components/ui/Primitives";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { useResource } from "@/hooks/useResource";
import { processService, quickProcessService } from "@/services/processService";
import { activityService } from "@/services/activityService";
import { newsService } from "@/services/newsService";
import { announcementService } from "@/services/announcementService";
import type { Announcement, News, ProcessItem, QuickProcess, RecentActivity } from "@/types";
import { faNumber } from "@/lib/utils";
import { persianDate } from "@/lib/date";
import { ProcessStatus } from "./ProcessStatus";
import { QuickProcesses } from "./QuickProcesses";
import { RecentActivities } from "./RecentActivities";

export function Dashboard({ initial }: { initial: { processes: ProcessItem[]; quick: QuickProcess[]; activities: RecentActivity[]; news: News[]; announcements: Announcement[] } }) {
  const employee = useEmployee(); const processes = useResource(processService, initial.processes); const quick = useResource(quickProcessService, initial.quick); const activities = useResource(activityService, initial.activities); const news = useResource(newsService, initial.news); const announcements = useResource(announcementService, initial.announcements);
  const mine = processes.data.filter((item) => item.employeeId === employee.id); const pending = mine.filter((item) => item.status === "action_required").length;
  const announcement = announcements.data.find((item) => item.active); const latestNews = news.data.filter((item) => item.status === "published").slice(0, 2);
  const failed = [processes, quick, activities, news, announcements].find((resource) => resource.error);
  return <><PageHeading title="میز کار شما" description={`سلام ${employee.name.split(" ")[0]}، به فضای کاری خودتان خوش آمدید.`} eyebrow="خانه / پورتال کارکنان"><span className="online-indicator"><i />سامانه در دسترس است</span></PageHeading><section className="welcome-hero" aria-label="به پورتال آذرشین خوش آمدید"><div className="hero-copy"><span className="hero-eyebrow"><span />همراهِ هر روز کاری شما</span><h2>کنار هم،<br /><span>یک قدم رو به آینده.</span></h2><p>دسترسی به فرآیندها، ارتباط با همکاران و تازه‌های آذرشین؛ همه در یک جا.</p><Link href="/processes" className="hero-link">ورود به کارتابل من <ArrowLeft size={17} /></Link></div><div className="hero-photo"><AssetImage src="reference:hero" alt="ساختمان آذرشین از تصویر مرجع سازمان" priority /><span className="hero-photo-caption"><span />AZARSHIN<span className="caption-line" /></span></div><span className="hero-corner" /></section>{failed && <ErrorState message={failed.error ?? undefined} retry={failed.reload} />}<div className="dashboard-note"><span className="note-icon">{pending ? <Bell size={18} /> : <CheckCircle2 size={18} />}</span><p>{pending ? <><strong>{faNumber(pending)} درخواست نیازمند اقدام شماست.</strong><span> با بررسی کارتابل، کارها را یک قدم جلو ببرید.</span></> : <strong>همه درخواست‌های شما به‌روز است.</strong>}</p><Link href="/processes?status=action_required">بررسی <ArrowLeft size={15} /></Link></div><div className="dashboard-middle"><QuickProcesses items={quick.data} /><ProcessStatus processes={mine} /></div><RecentActivities items={activities.data.filter((item) => item.user === employee.name || item.type !== "process")} /><Card className="dashboard-news"><SectionHeading title="تازه‌های آذرشین" icon={<Sparkles size={18} />} href="/news" /><div className="dashboard-news-grid">{latestNews.map((item) => <Link href={`/news/${item.id}`} className="compact-news" key={item.id}><AssetImage src={item.image} alt={item.title} /><span><small>{item.category} <i /> {persianDate(item.date, { year: undefined })}</small><strong>{item.title}</strong><span className="compact-news-more">بیشتر بخوانید <ArrowUpLeft size={14} /></span></span></Link>)}</div>{latestNews.length === 0 && <EmptyState title="خبری منتشر نشده است." />}</Card>{announcement && <div className="announcement-strip"><CircleHelp size={21} /><div><strong>{announcement.title}</strong><p>{announcement.text}</p></div><Link href="/announcements" className="text-link">اطلاعیه‌ها <ArrowLeft size={16} /></Link></div>}</>;
}

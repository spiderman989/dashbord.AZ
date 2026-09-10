import { History, ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import type { RecentActivity } from "@/types";
import { Badge, Card, SectionHeading } from "@/components/ui/Primitives";
import { activityStatusLabels } from "@/lib/labels";
import { persianTime, shortDate } from "@/lib/date";
import { EmptyState } from "@/components/ui/States";

export function RecentActivities({ items, admin = false }: { items: RecentActivity[]; admin?: boolean }) {
  return <Card className="recent-activities"><SectionHeading title="آخرین فعالیت‌ها" icon={<History size={18} />} href={admin ? "/admin/activities" : "/activities"} />{items.length ? <div className="activity-table"><div className="activity-table-head"><span>عنوان فعالیت</span><span>تاریخ و ساعت</span><span>وضعیت</span><span>کاربر</span></div>{items.slice(0, 5).map((item) => <div className="activity-table-row" key={item.id}><span className={`activity-title activity-${item.type}`}><span className="activity-row-icon"><ArrowUpLeft size={17} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span></span><span className="activity-date"><span>{shortDate(item.date)}</span><small>{persianTime(item.date)}</small></span><Badge status={item.status}>{activityStatusLabels[item.status]}</Badge><span className="activity-user">{item.user}</span></div>)}</div> : <EmptyState title="فعالیتی ثبت نشده است." />}{!admin && <div className="activity-footer"><span className="muted">همه فعالیت‌های شما، در یک نگاه</span><Link href="/activities">تاریخچه فعالیت‌ها <ArrowUpLeft size={14} /></Link></div>}</Card>;
}

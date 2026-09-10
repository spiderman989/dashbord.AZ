"use client";
import { Megaphone } from "lucide-react";
import { Badge, Card, PageHeading } from "@/components/ui/Primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useResource } from "@/hooks/useResource";
import { announcementService } from "@/services/announcementService";
import { announcementLabels } from "@/lib/labels";
import { persianDate } from "@/lib/date";
export function AnnouncementsPage() { const resource = useResource(announcementService); const items = resource.data.filter((item) => item.active); return <><PageHeading title="اطلاعیه‌های سازمان" description="آنچه لازم است همکاران از آن باخبر باشند." eyebrow="میز کار / اطلاعیه‌ها" />{resource.loading ? <LoadingState /> : resource.error ? <ErrorState message={resource.error} retry={resource.reload} /> : items.length ? items.map((item) => <Card key={item.id} className="announcement-card"><div><Megaphone size={20} /><Badge status={item.type === "warning" ? "warning" : "neutral"}>{announcementLabels[item.type]}</Badge><time dateTime={item.date}>{persianDate(item.date)}</time></div><h2>{item.title}</h2><p>{item.text}</p></Card>) : <EmptyState title="اطلاعیه‌ای منتشر نشده است." />}</>; }

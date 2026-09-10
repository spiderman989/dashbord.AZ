"use client";
import { Badge, Card, PageHeading } from "@/components/ui/Primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useResource } from "@/hooks/useResource";
import { activityService } from "@/services/activityService";
import { activityLabels, activityStatusLabels } from "@/lib/labels";
import { shortDate, persianTime } from "@/lib/date";
import { useEmployee } from "./AuthGuard";
import type { RecentActivity } from "@/types";
const columns: Column<RecentActivity>[] = [
  { key: "title", label: "فعالیت", className: "primary-cell", sortValue: (item) => item.title, render: (item) => <span className="table-title"><strong>{item.title}</strong><small>{item.description}</small></span> },
  { key: "user", label: "کاربر", sortValue: (item) => item.user, render: (item) => item.user },
  { key: "type", label: "نوع", sortValue: (item) => item.type, render: (item) => activityLabels[item.type] },
  { key: "date", label: "تاریخ و ساعت", sortValue: (item) => item.date, render: (item) => <span className="table-date">{shortDate(item.date)}<small>{persianTime(item.date)}</small></span> },
  { key: "status", label: "وضعیت", render: (item) => <Badge status={item.status}>{activityStatusLabels[item.status]}</Badge> },
];
export function ActivityHistory({ admin = false }: { admin?: boolean }) { const employee = useEmployee(); const resource = useResource(activityService); return <><PageHeading title="تاریخچه فعالیت‌ها" description={admin ? "مرور فعالیت کاربران و تغییرات محتوای پورتال" : "همه رویدادها و فعالیت‌های اخیر شما"} eyebrow={admin ? "مدیریت پورتال / فعالیت‌ها" : "میز کار / فعالیت‌ها"} /><Card className="table-card"><DataTable data={resource.data.filter((item) => admin || item.user === employee.name || item.type !== "process")} columns={columns} searchFields={(item) => [item.title, item.description, item.user]} filters={[{ key: "type", label: "همه فعالیت‌ها", options: Object.entries(activityLabels).map(([value, label]) => ({ value, label })), getValue: (item) => item.type }]} loading={resource.loading} error={resource.error} onRetry={resource.reload} /></Card></>; }

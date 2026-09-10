"use client";
import Link from "next/link";
import { ArrowUpLeft, FilePlus2, Workflow, Clock3, CircleAlert, CircleCheck } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge, Card, PageHeading } from "@/components/ui/Primitives";
import { useResource } from "@/hooks/useResource";
import { processService } from "@/services/processService";
import { useEmployee } from "@/components/shared/AuthGuard";
import { processLabels, priorityLabels } from "@/lib/labels";
import { persianTime, shortDate } from "@/lib/date";
import { faNumber } from "@/lib/utils";
import type { ProcessItem } from "@/types";

const columns: Column<ProcessItem>[] = [
  { key: "title", label: "عنوان فرآیند", sortValue: (item) => item.title, className: "primary-cell", render: (item) => <Link href={`/processes/${item.id}`} className="table-title"><strong>{item.title}</strong><small><bdi>{item.reference}</bdi> <span>·</span> {item.type}</small></Link> },
  { key: "status", label: "وضعیت", sortValue: (item) => processLabels[item.status], render: (item) => <Badge status={item.status}>{processLabels[item.status]}</Badge> },
  { key: "priority", label: "اولویت", sortValue: (item) => item.priority, render: (item) => <span className={`priority-text priority-${item.priority}`}><i />{priorityLabels[item.priority]}</span> },
  { key: "date", label: "تاریخ ثبت", sortValue: (item) => item.date, render: (item) => <span className="table-date">{shortDate(item.date)}</span> },
  { key: "updated", label: "آخرین تغییر", sortValue: (item) => item.updatedAt, render: (item) => <span className="table-date">{shortDate(item.updatedAt)}<small>{persianTime(item.updatedAt)}</small></span> },
  { key: "action", label: "عملیات", className: "actions-cell", render: (item) => <Link href={`/processes/${item.id}`} className="icon-button table-open" aria-label={`مشاهده ${item.title}`}><ArrowUpLeft size={19} /></Link> },
];
export function ProcessInbox({ initial, initialStatus = "" }: { initial: ProcessItem[]; initialStatus?: string }) {
  const employee = useEmployee(); const resource = useResource(processService, initial); const mine = resource.data.filter((item) => item.employeeId === employee.id);
  const stats = [{ label: "همه فرآیندها", icon: Workflow, count: mine.length, className: "slate" }, { label: "در حال انجام", icon: Clock3, count: mine.filter((item) => item.status === "in_progress").length, className: "blue" }, { label: "نیازمند اقدام", icon: CircleAlert, count: mine.filter((item) => item.status === "action_required").length, className: "amber" }, { label: "تکمیل شده", icon: CircleCheck, count: mine.filter((item) => item.status === "completed").length, className: "green" }];
  return <><PageHeading title="کارتابل فرآیندها" description="درخواست‌ها و کارهای شما، منظم و قابل پیگیری" eyebrow="میز کار / فرآیندها"><Link className="button button-primary" href="/processes/new"><FilePlus2 size={17} />درخواست جدید</Link></PageHeading><div className="process-stats">{stats.map(({ icon: Icon, ...item }) => <div className={`mini-stat mini-stat-${item.className}`} key={item.label}><span><Icon size={19} /></span><div><strong>{faNumber(item.count)}</strong><small>{item.label}</small></div></div>)}</div><Card className="table-card"><div className="table-card-heading"><h2>فهرست فرآیندها</h2><span className="tiny-label">{faNumber(mine.length)} درخواست</span></div><DataTable data={mine} columns={columns} searchFields={(item) => [item.title, item.type, item.reference]} searchPlaceholder="جستجوی عنوان یا شماره پیگیری..." filters={[{ key: "status", label: "همه وضعیت‌ها", options: Object.entries(processLabels).map(([value, label]) => ({ value, label })), getValue: (item) => item.status }]} initialFilters={{ status: initialStatus }} loading={resource.loading} error={resource.error} onRetry={resource.reload} emptyTitle="هنوز درخواستی در کارتابل شما نیست." /></Card><p className="page-helper">برای مشاهده جزئیات و مرحله فعلی، روی عنوان فرآیند کلیک کنید.</p></>;
}

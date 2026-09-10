"use client";
import { useState } from "react";
import { CalendarDays, Check, GraduationCap, UserRound } from "lucide-react";
import { Badge, Button, Card, PageHeading, SearchInput, Select } from "@/components/ui/Primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { AssetImage } from "@/components/shared/AssetImage";
import { useEmployee } from "@/components/shared/AuthGuard";
import { useToast } from "@/components/ui/Toast";
import { useResource } from "@/hooks/useResource";
import { courseService } from "@/services/courseService";
import { processService } from "@/services/processService";
import { activityService } from "@/services/activityService";
import { courseLabels } from "@/lib/labels";
import { errorMessage, matchesSearch, safeHref } from "@/lib/utils";
import { persianDate } from "@/lib/date";
import type { Course } from "@/types";

export function CoursesPage() {
  const employee = useEmployee(); const resource = useResource(courseService); const processes = useResource(processService); const toast = useToast(); const [query, setQuery] = useState(""); const [status, setStatus] = useState(""); const [selected, setSelected] = useState<Course | null>(null); const [busy, setBusy] = useState(false);
  const items = resource.data.filter((item) => ["active", "finished"].includes(item.status) && matchesSearch(query, item.title, item.description, item.instructor, item.category) && (!status || item.status === status));
  const enrolled = (item: Course) => processes.data.some((process) => process.employeeId === employee.id && process.reference === `COURSE-${item.id}`);
  async function enroll(item: Course) { if (busy || enrolled(item)) return; setBusy(true); try { const date = new Date().toISOString(); await processService.create({ employeeId: employee.id, title: `شرکت در دوره ${item.title}`, type: "آموزش", description: item.description, status: "new", priority: "normal", date, updatedAt: date, currentState: "درخواست شرکت در دوره برای واحد آموزش ارسال شد", reference: `COURSE-${item.id}`, assignee: "منابع انسانی" }); void activityService.create({ user: employee.name, title: `ثبت‌نام ${item.title}`, description: "درخواست شرکت در دوره ارسال شد.", date, type: "training", status: "info" }).catch(() => toast("درخواست ثبت شد؛ ثبت تاریخچه ممکن نشد.", "error")); toast("درخواست شرکت در دوره ثبت شد؛ از کارتابل پیگیری کنید."); } catch (err) { toast(errorMessage(err), "error"); } finally { setBusy(false); } }
  return <><PageHeading title="یادگیری، یک مسیر همیشگی" description="دوره‌های آموزشی و فرصت‌های رشد شما در آذرشین" eyebrow="میز کار / آموزش" /><Card><div className="table-toolbar"><SearchInput value={query} onChange={setQuery} placeholder="جستجوی دوره، مدرس یا موضوع..." /><Select aria-label="وضعیت دوره" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">همه دوره‌ها</option><option value="active">فعال</option><option value="finished">پایان یافته</option></Select></div></Card>{resource.loading ? <LoadingState /> : resource.error ? <ErrorState message={resource.error} retry={resource.reload} /> : items.length ? <div className="news-page-grid">{items.map((item) => <Card className="course-card" key={item.id}><AssetImage src={item.image} alt={item.title} /><div className="course-card-copy"><div className="course-card-top"><span className="news-category">{item.category}</span><Badge status={item.status}>{courseLabels[item.status]}</Badge></div><h2>{item.title}</h2><p>{item.description}</p><small><UserRound size={14} />{item.instructor}</small><small><CalendarDays size={14} />{persianDate(item.startDate, { year: undefined })}</small><Button variant="secondary" onClick={() => setSelected(item)}>مشاهده دوره <GraduationCap size={16} /></Button></div></Card>)}</div> : <EmptyState title="دوره‌ای برای نمایش وجود ندارد." />}{selected && <Modal title={selected.title} onClose={() => setSelected(null)}><AssetImage src={selected.image} alt={selected.title} /><p className="mt-4">{selected.description}</p><dl className="detail-grid"><div><dt>مدرس</dt><dd>{selected.instructor}</dd></div><div><dt>وضعیت</dt><dd>{courseLabels[selected.status]}</dd></div><div><dt>شروع دوره</dt><dd>{persianDate(selected.startDate)}</dd></div><div><dt>پایان دوره</dt><dd>{persianDate(selected.endDate)}</dd></div></dl><div className="form-actions">{selected.status === "active" && <Button loading={busy} disabled={enrolled(selected)} onClick={() => void enroll(selected)}>{enrolled(selected) ? <><Check size={17} />درخواست شما ثبت شده</> : "درخواست شرکت در دوره"}</Button>}{safeHref(selected.link) && <a href={safeHref(selected.link)} className="button button-secondary">اطلاعات بیشتر</a>}</div></Modal>}</>;
}

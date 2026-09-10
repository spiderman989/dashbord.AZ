"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpLeft, Check, Clock3, FileText, Info } from "lucide-react";
import { Badge, Button, Card, PageHeading, SectionHeading } from "@/components/ui/Primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { useResource } from "@/hooks/useResource";
import { processService } from "@/services/processService";
import { useEmployee } from "@/components/shared/AuthGuard";
import { processLabels, priorityLabels } from "@/lib/labels";
import { persianDate, persianTime } from "@/lib/date";
import { safeHref } from "@/lib/utils";
import type { ProcessItem } from "@/types";

export function ProcessDetails({ id, initial }: { id: string; initial: ProcessItem[] }) {
  const employee = useEmployee(); const resource = useResource(processService, initial); const [preview, setPreview] = useState(false); const item = resource.data.find((item) => item.id === id && item.employeeId === employee.id);
  if (resource.loading) return <LoadingState />;
  if (resource.error) return <ErrorState message={resource.error} retry={resource.reload} />;
  if (!item) return <EmptyState title="فرآیند مورد نظر پیدا نشد." action={<Link href="/processes" className="button button-secondary">بازگشت به کارتابل</Link>} />;
  const taskUrl = item.backendTaskUrl ? safeHref(item.backendTaskUrl) : undefined;
  return <><Link href="/processes" className="back-link"><ArrowRight size={16} />بازگشت به کارتابل</Link><PageHeading title={item.title} eyebrow={`فرآیندها / ${item.type}`}><Badge status={item.status}>{processLabels[item.status]}</Badge></PageHeading><Card><SectionHeading title="اطلاعات درخواست" icon={<FileText size={18} />} action={<bdi className="reference-code">{item.reference}</bdi>} /><dl className="detail-grid"><div><dt>تاریخ ثبت</dt><dd>{persianDate(item.date)}</dd></div><div><dt>آخرین به‌روزرسانی</dt><dd>{persianDate(item.updatedAt)}، {persianTime(item.updatedAt)}</dd></div><div><dt>واحد مسئول</dt><dd>{item.assignee}</dd></div><div><dt>اولویت</dt><dd>{priorityLabels[item.priority]}</dd></div><div><dt>نوع فرآیند</dt><dd>{item.type}</dd></div><div><dt>درخواست‌کننده</dt><dd>{employee.name}</dd></div></dl><div className="detail-description"><h3>شرح درخواست</h3><p>{item.description}</p></div></Card><Card><SectionHeading title="مسیر درخواست شما" icon={<Clock3 size={18} />} /><ol className="process-timeline"><li className="done"><span><Check size={15} /></span><div><strong>ثبت درخواست</strong><small>{persianDate(item.date)}</small></div></li><li className={item.status === "completed" ? "done" : "current"}><span>{item.status === "completed" ? <Check size={15} /> : <Clock3 size={15} />}</span><div><strong>بررسی و اقدام</strong><small>{item.currentState}</small></div></li><li className={item.status === "completed" ? "done" : ""}><span>{item.status === "completed" ? <Check size={15} /> : <Check size={15} />}</span><div><strong>تکمیل فرآیند</strong><small>{item.status === "completed" ? persianDate(item.updatedAt) : "پس از تأیید نهایی"}</small></div></li></ol><div className="detail-action"><span><Info size={17} />{item.currentState}</span>{taskUrl ? <a href={taskUrl} className="button button-primary" target="_blank" rel="noopener noreferrer">مشاهده فرآیند <ArrowUpLeft size={17} /></a> : <Button onClick={() => setPreview(true)}>مشاهده فرآیند <ArrowUpLeft size={17} /></Button>}</div></Card>{preview && <Modal title="مشاهده فرآیند" onClose={() => setPreview(false)}><div className="process-preview"><span className="state-icon"><FileText size={30} /></span><h3>{item.title}</h3><Badge status={item.status}>{processLabels[item.status]}</Badge><p>{item.currentState}</p><p className="muted">این فرآیند در نسخه نمایشی قابل مشاهده است. ادامه مراحل پس از راه‌اندازی سامانه سازمانی در دسترس قرار می‌گیرد.</p><Button variant="secondary" onClick={() => setPreview(false)}>متوجه شدم</Button></div></Modal>}</>;
}

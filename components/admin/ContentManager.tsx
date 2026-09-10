"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUp, Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Badge, Button, Card, PageHeading } from "@/components/ui/Primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ContentForm, type FormValues } from "@/components/ui/ContentForm";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { ErrorState, LoadingState, EmptyState } from "@/components/ui/States";
import { AssetImage } from "@/components/shared/AssetImage";
import { useResource } from "@/hooks/useResource";
import { useToast } from "@/components/ui/Toast";
import { logContentChange } from "@/services/activityService";
import { errorMessage, faNumber } from "@/lib/utils";
import { persianDate } from "@/lib/date";
import { announcementConfig, courseConfig, galleryConfig, newsConfig, quickProcessConfig, type ContentKind, type ResourceConfig } from "./resourceConfig";

export function ContentManager({ kind, recordId }: { kind: ContentKind; recordId?: string }) {
  switch (kind) {
    case "news": return recordId ? <ResourceEditor config={newsConfig} recordId={recordId} /> : <ResourceList config={newsConfig} />;
    case "courses": return recordId ? <ResourceEditor config={courseConfig} recordId={recordId} /> : <ResourceList config={courseConfig} />;
    case "gallery": return <ResourceList config={galleryConfig} />;
    case "announcements": return <ResourceList config={announcementConfig} />;
    case "processes": return <ResourceList config={quickProcessConfig} />;
  }
}
function ResourceList<T extends { id: string }>({ config }: { config: ResourceConfig<T> }) {
  const resource = useResource(config.repository); const toast = useToast(); const [editing, setEditing] = useState<T | "new" | null>(null); const [removing, setRemoving] = useState<T | null>(null); const [viewing, setViewing] = useState<T | null>(null); const [mutation, setMutation] = useState(false);
  const routeForm = config.kind === "news" || config.kind === "courses"; const base = `/admin/${config.kind}`; const reorder = config.reorder;
  const data = reorder ? [...resource.data].sort((a, b) => reorder.get(a) - reorder.get(b)) : resource.data;
  function recordChange(title: string) { void logContentChange(title).catch(() => toast("تغییر ذخیره شد؛ ثبت تاریخچه ممکن نشد.", "error")); }
  async function save(values: FormValues) { const parsed = config.parse(values); if (editing && editing !== "new") await config.repository.update(editing.id, parsed); else await config.repository.create(parsed); setEditing(null); toast("با موفقیت ذخیره شد."); recordChange(`${config.singular} ذخیره شد`); }
  async function toggle(item: T) { if (!config.toggle || mutation) return; setMutation(true); try { await config.repository.update(item.id, config.toggle(item)); toast("وضعیت با موفقیت تغییر کرد."); recordChange(`وضعیت ${config.singular} تغییر کرد`); } catch (err) { toast(errorMessage(err), "error"); } finally { setMutation(false); } }
  async function move(item: T, direction: -1 | 1) { if (!reorder || mutation) return; const index = data.findIndex((row) => row.id === item.id); if (index + direction < 0 || index + direction >= data.length) return; setMutation(true); try { const reordered = [...data]; [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]]; await config.repository.replace(reordered.map((row, index) => reorder.withOrder(row, index + 1))); toast("ترتیب نمایش ذخیره شد."); } catch (err) { toast(errorMessage(err), "error"); } finally { setMutation(false); } }
  const columns: Column<T>[] = [...config.columns, { key: "actions", label: "عملیات", className: "actions-cell", render: (item) => <div className="row-actions">{reorder && <><button className="icon-button" disabled={mutation || data[0]?.id === item.id} onClick={() => void move(item, -1)} aria-label={`انتقال ${config.getTitle(item)} به بالا`}><ArrowUp size={15} /></button><button className="icon-button" disabled={mutation || data[data.length - 1]?.id === item.id} onClick={() => void move(item, 1)} aria-label={`انتقال ${config.getTitle(item)} به پایین`}><ArrowDown size={15} /></button></>}<button className="icon-button" aria-label={`مشاهده ${config.getTitle(item)}`} onClick={() => setViewing(item)}><Eye size={16} /></button>{routeForm ? <Link className="icon-button" href={`${base}/${item.id}`} aria-label={`ویرایش ${config.getTitle(item)}`}><Pencil size={15} /></Link> : <button className="icon-button" aria-label={`ویرایش ${config.getTitle(item)}`} onClick={() => setEditing(item)}><Pencil size={15} /></button>}{config.toggle && <button className={`icon-button${config.isActive?.(item) ? " enabled-action" : ""}`} disabled={mutation} aria-label={`${config.isActive?.(item) ? "غیرفعال" : "فعال"} کردن ${config.getTitle(item)}`} onClick={() => void toggle(item)}><Power size={15} /></button>}<button className="icon-button delete-action" aria-label={`حذف ${config.getTitle(item)}`} onClick={() => setRemoving(item)}><Trash2 size={15} /></button></div> }];
  return <><PageHeading title={config.title} description={config.description} eyebrow="مدیریت پورتال / مدیریت محتوا">{routeForm ? <Link href={`${base}/new`} className="button button-primary"><Plus size={18} />{config.singular} جدید</Link> : <Button onClick={() => setEditing("new")}><Plus size={18} />{config.singular} جدید</Button>}</PageHeading><Card className="table-card"><div className="table-card-heading"><h2>فهرست {config.singular === "خبر" ? "اخبار" : config.singular === "دوره" ? "دوره‌ها" : config.singular === "تصویر" ? "تصاویر" : config.singular === "اطلاعیه" ? "اطلاعیه‌ها" : "فرآیندها"}</h2><Badge>{faNumber(resource.data.length)} مورد</Badge></div><DataTable data={data} columns={columns} searchFields={config.searchFields} searchPlaceholder={`جستجو در ${config.title.replace("مدیریت ", "")}...`} filters={config.filters} loading={resource.loading} error={resource.error} onRetry={resource.reload} /></Card><p className="page-helper">تغییرات این نسخه به‌صورت محلی در همین مرورگر ذخیره می‌شوند.</p>{editing && <Modal title={`${editing === "new" ? "افزودن" : "ویرایش"} ${config.singular}`} onClose={() => setEditing(null)} className="editor-modal"><ContentForm fields={config.fields} initialValues={config.values(editing === "new" ? undefined : editing)} onSave={save} onCancel={() => setEditing(null)} /></Modal>}{removing && <ConfirmDialog title={`حذف ${config.singular}`} description={`«${config.getTitle(removing)}» حذف شود؟ این تغییر از فهرست پورتال هم اعمال می‌شود.`} onClose={() => setRemoving(null)} onConfirm={async () => { await config.repository.remove(removing.id); toast("آیتم با موفقیت حذف شد."); recordChange(`${config.singular} حذف شد`); }} />}{viewing && <Modal title={`پیش‌نمایش ${config.singular}`} onClose={() => setViewing(null)} className="preview-modal"><ContentPreview config={config} record={viewing} /></Modal>}</>;
}
function ResourceEditor<T extends { id: string }>({ config, recordId }: { config: ResourceConfig<T>; recordId: string }) {
  const router = useRouter(); const toast = useToast(); const resource = useResource(config.repository); const isNew = recordId === "new"; const item = resource.data.find((item) => item.id === recordId); const base = `/admin/${config.kind}`;
  if (resource.loading && !isNew) return <LoadingState />;
  if (resource.error) return <ErrorState message={resource.error} retry={resource.reload} />;
  if (!isNew && !item) return <EmptyState title="آیتم مورد نظر پیدا نشد." action={<Link href={base} className="button button-secondary">بازگشت به فهرست</Link>} />;
  async function save(values: FormValues) { const parsed = config.parse(values); if (isNew) await config.repository.create(parsed); else await config.repository.update(recordId, parsed); toast("با موفقیت ذخیره شد."); void logContentChange(`${config.singular} ${isNew ? "ایجاد" : "ویرایش"} شد`).catch(() => toast("تغییر ذخیره شد؛ ثبت تاریخچه ممکن نشد.", "error")); router.push(base); }
  return <><Link href={base} className="back-link"><ArrowRight size={16} />بازگشت به فهرست</Link><PageHeading title={`${isNew ? "ایجاد" : "ویرایش"} ${config.singular}`} description={isNew ? `اطلاعات ${config.singular} جدید را تکمیل کنید.` : "تغییرات خود را اعمال کنید و سپس ذخیره کنید."} eyebrow={`مدیریت پورتال / ${config.title}`} /><Card className="editor-card"><ContentForm key={recordId} fields={config.fields} initialValues={config.values(item)} onSave={save} onCancel={() => router.push(base)} /></Card></>;
}
function ContentPreview<T extends { id: string }>({ config, record }: { config: ResourceConfig<T>; record: T }) {
  const values = config.values(record);
  return <article className="content-preview"><h3>{config.getTitle(record)}</h3>{config.fields.filter((field) => field.key !== "title").map((field) => {
    const value = values[field.key]; if (field.type === "image") return value ? <AssetImage key={field.key} src={String(value)} alt={config.getTitle(record)} /> : null;
    const display = field.type === "select" ? field.options?.find((option) => option.value === value)?.label ?? String(value) : field.type === "toggle" ? value ? "فعال" : "غیرفعال" : field.type === "date" ? persianDate(String(value)) : String(value || "—");
    return <div key={field.key}><span className="muted">{field.label}</span><p>{display}</p></div>;
  })}</article>;
}

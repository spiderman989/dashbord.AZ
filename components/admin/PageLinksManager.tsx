"use client";
import "./page-links.css";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Edit3, Link2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAccess } from "@/hooks/useAccess";
import { Badge, Button, Card, Field, Input, PageHeading, Select, SectionHeading } from "@/components/ui/Primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { navigationIcons, type NavigationIcon } from "@/lib/navigation";
import { customLinkErrors, destinationError, internalPages, menuItems, type LinkFieldErrors, type LinkOpening, type MenuItem } from "@/lib/pageLinks";
import type { Panel, SectionId } from "@/lib/permissions";
import { errorMessage } from "@/lib/utils";
import { pageLinksService } from "@/services/pageLinksService";

const panelLabel = (panel: Panel) => panel === "employee" ? "کارکنان" : "مدیریت";
const groupLabel = (panel: Panel) => panel === "employee" ? "فضای کاری شما" : "مدیریت پورتال";
interface Draft { panel: Panel; label: string; icon: NavigationIcon; type: "internal" | "external"; href: string; opening: LinkOpening; active: boolean; beforeId: string; }
function initialDraft(panel: Panel, items: MenuItem[], item?: MenuItem): Draft {
  const index = items.findIndex((entry) => entry.id === item?.id);
  return { panel, label: item?.label ?? "", icon: item?.icon ?? "link", type: item?.destination.type ?? "internal", href: item?.destination.href ?? internalPages(panel)[0].href, opening: item?.opening ?? "same-tab", active: item?.active ?? true, beforeId: item && index >= 0 ? items[index + 1]?.id ?? "" : "" };
}
function DiscardDialog({ onDiscard, onClose }: { onDiscard: () => void; onClose: () => void }) {
  return <Modal title="تغییرات ذخیره‌نشده" onClose={onClose} className="confirm-modal"><p>تغییرات این فرم ذخیره نشده است. از آن‌ها صرف‌نظر می‌کنید؟</p><div className="form-actions"><Button type="button" variant="danger" onClick={onDiscard}>صرف‌نظر از تغییرات</Button><Button type="button" variant="secondary" onClick={onClose}>ادامه ویرایش</Button></div></Modal>;
}

function LinkEditor({ panel, item, onDirty, onSaved, onCancel }: { panel: Panel; item?: MenuItem; onDirty: (dirty: boolean) => void; onSaved: (panel: Panel, id: SectionId) => void; onCancel: () => void }) {
  const access = useAccess(); const toast = useToast(); const prefix = useId();
  const [initial] = useState(() => initialDraft(panel, access.menu(panel), item));
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<LinkFieldErrors>({}); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false); const [nextPanel, setNextPanel] = useState<Panel | null>(null);
  const custom = !item || item.kind === "custom";
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const items = access.menu(draft.panel).filter((entry) => entry.id !== item?.id);
  const Icon = navigationIcons[draft.icon].component;
  function update(patch: Partial<Draft>) {
    const next = { ...draft, ...patch }; setDraft(next); setErrors({}); setError(""); onDirty(JSON.stringify(next) !== JSON.stringify(initial));
  }
  function changePanel(next: Panel) {
    const value = initialDraft(next, access.menu(next)); setDraft(value); setErrors({}); setError(""); onDirty(JSON.stringify(value) !== JSON.stringify(initial)); setNextPanel(null);
  }
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const follow = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || link.href === window.location.href || link.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm("تغییرات ذخیره نشده است. از تغییرات صرف‌نظر کرده و این صفحه را ترک می‌کنید؟")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", prevent);
    document.addEventListener("click", follow, true);
    return () => { window.removeEventListener("beforeunload", prevent); document.removeEventListener("click", follow, true); };
  }, [dirty]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const values = { panel: draft.panel, label: draft.label, icon: draft.icon, destination: { type: draft.type, href: draft.href }, opening: draft.opening, active: draft.active };
    const validation = custom ? customLinkErrors(values, access.pageLinks, item?.id) : { destination: destinationError(draft.panel, values.destination) };
    setErrors(validation); if (Object.values(validation).some(Boolean)) return;
    setBusy(true); setError("");
    try {
      let id = item?.id;
      if (custom) id = (await pageLinksService.saveCustom(values, draft.beforeId || null, item?.id)).id;
      else if (item) await pageLinksService.saveBuiltin(draft.panel, item.id, values.destination, draft.opening);
      onDirty(false); toast("تنظیمات دکمه با موفقیت ذخیره شد."); if (id) onSaved(draft.panel, id);
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  async function restore() {
    if (!item || busy) return;
    setBusy(true); setError("");
    try { await pageLinksService.resetBuiltin(panel, item.id); onDirty(false); setResetConfirm(false); toast("مقصد پیش‌فرض بازگردانده شد."); onSaved(panel, item.id); }
    catch (err) { setError(errorMessage(err)); setResetConfirm(false); }
    finally { setBusy(false); }
  }
  const fieldProps = (key: keyof LinkFieldErrors) => ({ "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `${prefix}-${key}-error` : undefined });
  return <form className="page-link-form" noValidate onSubmit={(event) => void submit(event)}>
    <fieldset disabled={busy} className="page-link-fieldset"><div className="form-grid">
      {custom && <>
        <Field label="پنل مقصد" htmlFor={`${prefix}-panel`}><Select id={`${prefix}-panel`} value={draft.panel} disabled={Boolean(item)} onChange={(event) => { const next = event.target.value as Panel; if (dirty) setNextPanel(next); else changePanel(next); }}><option value="employee">کارکنان</option><option value="admin">مدیریت</option></Select></Field>
        <Field label="عنوان دکمه" htmlFor={`${prefix}-label`} required error={errors.label}><Input id={`${prefix}-label`} value={draft.label} maxLength={100} {...fieldProps("label")} onChange={(event) => update({ label: event.target.value })} /></Field>
        <Field label="آیکون" htmlFor={`${prefix}-icon`} error={errors.icon}><div className="link-icon-picker"><Select id={`${prefix}-icon`} value={draft.icon} {...fieldProps("icon")} onChange={(event) => update({ icon: event.target.value as NavigationIcon })}>{Object.entries(navigationIcons).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select><span role="img" aria-label={`پیش‌نمایش آیکون ${navigationIcons[draft.icon].label}`}><Icon size={24} aria-hidden="true" /></span></div></Field>
      </>}
      <Field label="نوع مقصد" htmlFor={`${prefix}-type`}><Select id={`${prefix}-type`} value={draft.type} onChange={(event) => { const type = event.target.value as Draft["type"]; update({ type, href: type === "internal" ? internalPages(draft.panel)[0].href : "" }); }}><option value="internal">صفحه داخلی</option><option value="external">سایت دیگر</option></Select></Field>
      <Field label={draft.type === "internal" ? "صفحه داخلی" : "آدرس مقصد خارجی"} htmlFor={`${prefix}-destination`} required error={errors.destination} className="full-width" hint={draft.type === "external" ? "دسترسی به سایت مقصد توسط همان سایت مدیریت می‌شود." : undefined}>
        {draft.type === "internal" ? <Select id={`${prefix}-destination`} value={draft.href} {...fieldProps("destination")} onChange={(event) => update({ href: event.target.value })}>{internalPages(draft.panel).map((page) => <option key={page.href} value={page.href}>{page.label}</option>)}</Select> : <Input id={`${prefix}-destination`} type="url" dir="ltr" placeholder="https://service.example.com:8443/dashboard" autoComplete="off" spellCheck={false} value={draft.href} {...fieldProps("destination")} onChange={(event) => update({ href: event.target.value })} />}
      </Field>
      <Field label="نحوه بازشدن" htmlFor={`${prefix}-opening`} error={errors.opening}><Select id={`${prefix}-opening`} value={draft.opening} {...fieldProps("opening")} onChange={(event) => update({ opening: event.target.value as LinkOpening })}><option value="same-tab">همین تب</option><option value="new-tab">تب جدید</option></Select></Field>
      {custom && <>
        <Field label="گروه منو" htmlFor={`${prefix}-group`}><Select id={`${prefix}-group`} value={draft.panel} onChange={() => undefined}><option value={draft.panel}>{groupLabel(draft.panel)}</option></Select></Field>
        <Field label="جایگاه در منو" htmlFor={`${prefix}-position`} error={errors.position}><Select id={`${prefix}-position`} value={draft.beforeId} {...fieldProps("position")} onChange={(event) => update({ beforeId: event.target.value })}>{items.map((entry) => <option key={entry.id} value={entry.id}>پیش از {entry.label}</option>)}<option value="">انتهای منو</option></Select></Field>
        <Field label="وضعیت" htmlFor={`${prefix}-active`}><Select id={`${prefix}-active`} value={draft.active ? "active" : "inactive"} onChange={(event) => update({ active: event.target.value === "active" })}><option value="active">فعال</option><option value="inactive">غیرفعال</option></Select></Field>
      </>}
    </div></fieldset>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><Button type="submit" loading={busy}><Save size={17} />{item ? "ذخیره تغییرات" : "ذخیره"}</Button><Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>انصراف</Button>{!custom && <Button type="button" variant="ghost" disabled={busy} onClick={() => setResetConfirm(true)}><RotateCcw size={16} />بازگرداندن مقصد پیش‌فرض</Button>}</div>
    {resetConfirm && <Modal title="بازگرداندن مقصد پیش‌فرض" onClose={() => { if (!busy) setResetConfirm(false); }} className="confirm-modal"><p>مقصد و نحوه بازشدن «{item?.label}» به حالت اولیه بازگردد؟ تغییرات ذخیره‌نشده این فرم کنار گذاشته می‌شود.</p><div className="form-actions"><Button type="button" loading={busy} onClick={() => void restore()}>بازگرداندن</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => setResetConfirm(false)}>انصراف</Button></div></Modal>}
    {nextPanel && <DiscardDialog onClose={() => setNextPanel(null)} onDiscard={() => changePanel(nextPanel)} />}
  </form>;
}

export function PageLinksManager() {
  const access = useAccess(); const toast = useToast();
  const [panel, setPanel] = useState<Panel>("employee"); const [selectedId, setSelectedId] = useState<SectionId | "">("");
  const [adding, setAdding] = useState(false); const [dirty, setDirty] = useState(false); const [revision, setRevision] = useState(0);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null); const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const items = menuItems(panel, access.pageLinks); const selected = items.find((item) => item.id === selectedId);
  function change(action: () => void) { if (dirty) setDiscardAction(() => action); else action(); }
  function select(id: SectionId | "") { setDirty(false); setSelectedId(id); setRevision((value) => value + 1); }
  function saved(nextPanel: Panel, id: SectionId) { setDirty(false); setAdding(false); setPanel(nextPanel); select(id); }
  if (!access.canManagePermissions) return <Card><EmptyState title="شما به این بخش دسترسی ندارید" /></Card>;
  if (access.linksError) return <ErrorState message={access.linksError} retry={() => window.location.reload()} />;
  if (!access.linksReady && !items.length) return <LoadingState />;
  const columns: Column<MenuItem>[] = [
    { key: "label", label: "عنوان", render: (item) => { const Icon = navigationIcons[item.icon].component; return <span className="link-item-title"><Icon size={18} /><span>{item.label}</span></span>; }, sortValue: (item) => item.label },
    { key: "kind", label: "نوع آیتم", render: (item) => item.kind === "builtin" ? "اصلی" : "سفارشی" },
    { key: "type", label: "نوع مقصد", render: (item) => item.destination.type === "internal" ? "صفحه داخلی" : "سایت دیگر" },
    { key: "href", label: "مقصد", render: (item) => <span className="link-destination" dir="ltr">{item.destination.href}</span> },
    { key: "opening", label: "نحوه بازشدن", render: (item) => item.opening === "new-tab" ? "تب جدید" : "همین تب" },
    { key: "active", label: "وضعیت", render: (item) => <Badge status={item.active ? "active" : "inactive"}>{item.active ? "فعال" : "غیرفعال"}</Badge> },
    { key: "actions", label: "عملیات", render: (item) => <div className="table-actions">{item.locked ? <span className="muted">مقصد ثابت</span> : <button type="button" className="icon-button" aria-label={`ویرایش ${item.label}`} onClick={() => change(() => select(item.id))}><Edit3 size={17} /></button>}<button type="button" className="icon-button danger-text" aria-label={`حذف ${item.label}`} onClick={() => change(() => { select(""); setDeleting(item); })}><Trash2 size={17} /></button></div> },
  ];
  return <div className="page-links-manager"><PageHeading title="مدیریت صفحات و لینک‌ها" description="مقصد دکمه‌های منو را تنظیم کنید یا دکمه تازه‌ای به پنل اضافه کنید."><Button disabled={!access.linksReady} onClick={() => change(() => { select(""); setAdding(true); })}><Plus size={17} />افزودن دکمه جدید</Button></PageHeading>
    <Card className="page-links-settings"><div className="form-grid">
      <Field label="انتخاب پنل" htmlFor="links-panel"><Select id="links-panel" value={panel} onChange={(event) => { const next = event.target.value as Panel; change(() => { setPanel(next); select(""); }); }}><option value="employee">کارکنان</option><option value="admin">مدیریت</option></Select></Field>
      <Field label="انتخاب دکمه" htmlFor="links-item"><Select id="links-item" value={selectedId} disabled={!access.linksReady} onChange={(event) => { const next = event.target.value as SectionId | ""; change(() => select(next)); }}><option value="">یک دکمه انتخاب کنید</option>{items.map((item) => <option key={item.id} value={item.id}>{item.label}{item.locked ? " — مقصد ثابت" : item.kind === "custom" ? " — سفارشی" : ""}{!item.active ? " — غیرفعال" : ""}</option>)}</Select></Field>
    </div>
    {selected && <div className="page-links-editor"><SectionHeading title={`تنظیمات ${selected.label}`} icon={<Link2 size={18} />} />{selected.locked ? <p className="muted">مقصد این صفحه ثابت است تا دسترسی مدیر اصلی به تنظیمات حفظ شود.</p> : <LinkEditor key={`${panel}:${selected.id}:${revision}`} panel={panel} item={selected} onDirty={setDirty} onSaved={saved} onCancel={() => change(() => select(""))} />}</div>}
    </Card>
    <Card className="table-card"><div className="table-card-heading"><SectionHeading title={`دکمه‌های پنل ${panelLabel(panel)}`} /></div><DataTable key={panel} data={items} columns={columns} loading={!access.linksReady} searchFields={(item) => [item.label, item.destination.href]} initialPageSize={12} /></Card>
    {adding && <Modal title="افزودن دکمه جدید" className="editor-modal page-link-modal" onClose={() => change(() => { setAdding(false); setDirty(false); })}><LinkEditor panel={panel} onDirty={setDirty} onSaved={saved} onCancel={() => change(() => { setAdding(false); setDirty(false); })} /></Modal>}
    {discardAction && <DiscardDialog onClose={() => setDiscardAction(null)} onDiscard={() => { const action = discardAction; setDiscardAction(null); setDirty(false); action(); }} />}
    {deleting && <ConfirmDialog title="حذف دکمه" description={deleting.kind === "custom" ? `دکمه «${deleting.label}» و دسترسی‌های مربوط به آن حذف شوند؟ صفحه یا اطلاعات مقصد حذف نمی‌شود.` : `دکمه «${deleting.label}» از منو حذف شود؟ صفحه، اطلاعات و دسترسی‌های آن حفظ می‌شوند.${deleting.id === "admin.links" ? " برای ورود دوباره به این صفحه، آدرس \u2066/admin/links\u2069 را باز کنید." : ""}`} onClose={() => setDeleting(null)} onConfirm={async () => { if (deleting.kind === "custom") { await pageLinksService.removeCustom(deleting.panel, deleting.id); toast("دکمه سفارشی و دسترسی‌های آن حذف شدند."); } else { await pageLinksService.removeBuiltin(deleting.panel, deleting.id); toast("دکمه از منو حذف شد."); } }} />}
  </div>;
}

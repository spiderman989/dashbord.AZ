"use client";
import { useEffect, useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Save, ShieldCheck, UsersRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Primitives";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useAccess } from "@/hooks/useAccess";
import { permissionService } from "@/services/permissionService";
import { accountIdentity } from "@/services/authService";
import { type Panel, type SectionId, type UserPermissions } from "@/lib/permissions";
import { errorMessage } from "@/lib/utils";
import type { EmployeeAccount } from "@/types";

export function PermissionEditor({ employee, onClose }: { employee: EmployeeAccount; onClose: () => void }) {
  const access = useAccess(); const toast = useToast(); const id = useId();
  const [panel, setPanel] = useState<Panel>("employee");
  const [draft, setDraft] = useState<UserPermissions | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    permissionService.getForUser(accountIdentity(employee)).then((value) => { if (active) setDraft(value); }).catch((err: unknown) => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, [employee]);
  if (!access.canManagePermissions) return null;
  const key = panel === "employee" ? "employeeSections" : "adminSections";
  const disabled = busy || !draft || !access.linksReady || (panel === "admin" && !draft.adminAccess);
  const options = access.permissionSections(panel);
  function toggle(section: SectionId, checked: boolean) {
    setDraft((previous) => previous ? { ...previous, [key]: checked ? [...previous[key], section] : previous[key].filter((item) => item !== section) } : previous);
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "employee" : event.key === "End" ? "admin" : panel === "employee" ? "admin" : "employee";
    setPanel(next); document.getElementById(`${id}-${next}`)?.focus();
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!draft || busy || !access.canManagePermissions) return;
    setBusy(true); setError("");
    try { await permissionService.saveForUser(employee.id, draft); toast("سطح دسترسی با موفقیت ذخیره شد."); onClose(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <Modal title={`سطح دسترسی — ${employee.firstName} ${employee.lastName}`} onClose={() => { if (!busy) onClose(); }} className="permission-modal">
    {!draft ? error ? <ErrorState message={error} /> : <LoadingState /> : <form onSubmit={(event) => void submit(event)} className="permission-form">
      <div className="permission-tabs" role="tablist" aria-label="انتخاب پنل">
        {(["employee", "admin"] as const).map((item) => <button key={item} type="button" role="tab" id={`${id}-${item}`} aria-controls={`${id}-panel`} aria-selected={panel === item} tabIndex={panel === item ? 0 : -1} onKeyDown={tabKey} onClick={() => setPanel(item)}>{item === "employee" ? <UsersRound size={18} /> : <ShieldCheck size={18} />}{item === "employee" ? "پنل کارکنان" : "پنل مدیریت"}</button>)}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${panel}`} className="permission-panel" tabIndex={0}>
        {panel === "admin" && <label className="permission-entry"><input type="checkbox" checked={draft.adminAccess} disabled={busy} onChange={(event) => setDraft({ ...draft, adminAccess: event.target.checked })} />اجازه ورود به پنل مدیریت</label>}
        {panel === "admin" && !draft.adminAccess && <p className="muted">برای انتخاب بخش‌های مدیریت، اجازه ورود را فعال کنید.</p>}
        <fieldset disabled={disabled} className="permission-fieldset">
          <legend className="sr-only">بخش‌های {panel === "employee" ? "پنل کارکنان" : "پنل مدیریت"}</legend>
          <div className="permission-bulk"><Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, [key]: options.map((section) => section.id) })}>انتخاب همه</Button><Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, [key]: [] })}>لغو انتخاب همه</Button></div>
          <div className="permission-options">{options.map((section) => <label key={section.id} className="permission-option"><input type="checkbox" checked={draft[key].includes(section.id)} onChange={(event) => toggle(section.id, event.target.checked)} /><span>{section.label}{!section.active && <small className="muted"> — غیرفعال در منو</small>}</span></label>)}</div>
        </fieldset>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="submit" loading={busy}><Save size={17} />ذخیره تغییرات</Button><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>انصراف</Button></div>
    </form>}
  </Modal>;
}

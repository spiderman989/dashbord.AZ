"use client";
import { useState, type FormEvent } from "react";
import { Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { Badge, Button, Card, Field, Input, PageHeading } from "@/components/ui/Primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useAccess } from "@/hooks/useAccess";
import { PermissionEditor } from "./PermissionEditor";
import { useResource } from "@/hooks/useResource";
import { employeeService, saveEmployee } from "@/services/employeeService";
import { errorMessage, faNumber } from "@/lib/utils";
import type { EmployeeAccount } from "@/types";

export function AdminEmployees() {
  const resource = useResource(employeeService);
  const access = useAccess();
  const [permissionsFor, setPermissionsFor] = useState<EmployeeAccount | null>(null);
  const toast = useToast();
  const [editing, setEditing] = useState<EmployeeAccount | "new" | null>(null);
  const [removing, setRemoving] = useState<EmployeeAccount | null>(null);
  const columns: Column<EmployeeAccount>[] = [
    { key: "firstName", label: "نام", sortValue: (item) => item.firstName, render: (item) => item.firstName },
    { key: "lastName", label: "نام خانوادگی", sortValue: (item) => item.lastName, render: (item) => item.lastName },
    { key: "position", label: "پست / سمت سازمانی", sortValue: (item) => item.position, render: (item) => <strong>{item.position}</strong> },
    { key: "username", label: "نام کاربری", sortValue: (item) => item.username, render: (item) => <bdi>{item.username}</bdi> },
    { key: "actions", label: "عملیات", className: "actions-cell", render: (item) => <div className="row-actions">
      {access.canManagePermissions && <Button type="button" variant="ghost" className="permission-action" aria-label={`سطح دسترسی ${item.firstName} ${item.lastName}`} onClick={() => setPermissionsFor(item)}><ShieldCheck size={16} />سطح دسترسی</Button>}
      <button type="button" className="icon-button" aria-label={`ویرایش ${item.firstName} ${item.lastName}`} onClick={() => setEditing(item)}><Pencil size={15} /></button>
      <button type="button" className="icon-button delete-action" aria-label={`حذف ${item.firstName} ${item.lastName}`} onClick={() => setRemoving(item)}><Trash2 size={15} /></button>
    </div> },
  ];
  return <>
    <PageHeading title="مدیریت کارکنان" description="اطلاعات و سمت سازمانی کارکنان را ثبت و مدیریت کنید." eyebrow="مدیریت پورتال / کارکنان">
      <Button onClick={() => setEditing("new")} disabled={resource.loading || Boolean(resource.error)}><Plus size={18} />افزودن کارمند</Button>
    </PageHeading>
    <Card className="table-card">
      <div className="table-card-heading"><h2>فهرست کارکنان</h2><Badge>{faNumber(resource.data.length)} نفر</Badge></div>
      {!resource.loading && !resource.error && !resource.data.length ? <EmptyState title="هنوز کارمندی ثبت نشده است." description="برای شروع، از دکمه «افزودن کارمند» استفاده کنید." /> : <DataTable
        data={resource.data} columns={columns} searchFields={(item) => [item.firstName, item.lastName, `${item.firstName} ${item.lastName}`, item.position, item.username]}
        searchPlaceholder="جستجوی نام، سمت یا نام کاربری..." loading={resource.loading} error={resource.error} onRetry={resource.reload}
      />}
    </Card>
    {permissionsFor && access.canManagePermissions && <PermissionEditor employee={permissionsFor} onClose={() => setPermissionsFor(null)} />}
    {editing && <EmployeeEditor employee={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    {removing && <ConfirmDialog title="حذف کارمند" description={`کارمند «${removing.firstName} ${removing.lastName}» با سمت «${removing.position}» حذف شود؟ این کار قابل بازگشت نیست.`} onClose={() => setRemoving(null)} onConfirm={async () => {
      await employeeService.remove(removing.id);
      toast("کارمند با موفقیت حذف شد.");
    }} />}
  </>;
}

function EmployeeEditor({ employee, onClose }: { employee?: EmployeeAccount; onClose: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({ firstName: employee?.firstName ?? "", lastName: employee?.lastName ?? "", position: employee?.position ?? "", username: employee?.username ?? "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof values, value: string) => setValues((previous) => ({ ...previous, [key]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      await saveEmployee(values, employee?.id);
      toast(employee ? "اطلاعات کارمند با موفقیت ویرایش شد." : "کارمند با موفقیت افزوده شد.");
      onClose();
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <Modal title={employee ? "ویرایش کارمند" : "افزودن کارمند"} onClose={() => { if (!busy) onClose(); }} className="editor-modal">
    <form className="content-form" noValidate onSubmit={(event) => void submit(event)}>
      <div className="form-grid">
        <Field label="نام" htmlFor="employee-first-name" required><Input id="employee-first-name" value={values.firstName} onChange={(event) => set("firstName", event.target.value)} required minLength={2} maxLength={60} autoComplete="off" disabled={busy} /></Field>
        <Field label="نام خانوادگی" htmlFor="employee-last-name" required><Input id="employee-last-name" value={values.lastName} onChange={(event) => set("lastName", event.target.value)} required minLength={2} maxLength={60} autoComplete="off" disabled={busy} /></Field>
        <Field label="پست / سمت سازمانی" htmlFor="employee-position" required className="full-width"><Input id="employee-position" value={values.position} onChange={(event) => set("position", event.target.value)} required minLength={2} maxLength={100} placeholder="مانند کارشناس منابع انسانی" disabled={busy} /></Field>
        <Field label="نام کاربری" htmlFor="employee-username" required hint="۳ تا ۴۰ نویسه: حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط.">
          <Input id="employee-username" value={values.username} onChange={(event) => set("username", event.target.value)} required minLength={3} maxLength={40} dir="ltr" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-describedby="employee-username-hint" disabled={busy} />
        </Field>
        <Field label="رمز عبور" htmlFor="employee-password" required={!employee} hint={employee ? "برای حفظ رمز فعلی، خالی بگذارید؛ رمز جدید باید ۶ تا ۸۰ نویسه باشد." : "رمز آزمایشی بین ۶ تا ۸۰ نویسه وارد کنید."}>
          <Input id="employee-password" type="password" value={values.password} onChange={(event) => set("password", event.target.value)} required={!employee} minLength={6} maxLength={80} dir="ltr" autoComplete="new-password" aria-describedby="employee-password-hint" disabled={busy} />
        </Field>
      </div>
      {error && <p className="form-error mt-5" role="alert">{error}</p>}
      <div className="form-actions"><Button type="submit" loading={busy}><Save size={17} />{busy ? "در حال ذخیره..." : "ذخیره"}</Button><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>انصراف</Button><span className="save-hint">فیلدهای ستاره‌دار الزامی هستند.</span></div>
    </form>
  </Modal>;
}

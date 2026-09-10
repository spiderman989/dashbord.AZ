"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import { Button, Card, Field, Input, PageHeading, Select, Textarea } from "@/components/ui/Primitives";
import { processService } from "@/services/processService";
import { activityService } from "@/services/activityService";
import { useEmployee } from "@/components/shared/AuthGuard";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/utils";
import type { ProcessItem } from "@/types";
const processTypes = { leave: "مرخصی", mission: "مأموریت", equipment: "تجهیزات", purchase: "خرید" };
export function ProcessRequestForm({ initialType = "leave" }: { initialType?: string }) {
  const employee = useEmployee(); const router = useRouter(); const toast = useToast(); const [type, setType] = useState(initialType in processTypes ? initialType : "leave"); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [priority, setPriority] = useState<ProcessItem["priority"]>("normal"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    if (title.trim().length < 4 || description.trim().length < 10) { setError("عنوان باید حداقل ۴ حرف و شرح درخواست حداقل ۱۰ حرف داشته باشد."); return; }
    setBusy(true); setError("");
    try { const date = new Date().toISOString(); const item = await processService.create({ employeeId: employee.id, title: title.trim(), description: description.trim(), type: processTypes[type as keyof typeof processTypes], priority, date, updatedAt: date, status: "new", currentState: "درخواست ثبت شد و در انتظار بررسی واحد مسئول است", reference: `AZ-DEMO-${Date.now().toString().slice(-7)}`, assignee: type === "leave" ? "منابع انسانی" : type === "equipment" ? "IT" : "تدارکات" }); await activityService.create({ user: employee.name, title: `${title.trim()} ثبت شد`, description: "درخواست جدید به واحد مسئول ارسال شد.", date, type: "process", status: "info" }); toast("درخواست شما با موفقیت ثبت شد."); router.push(`/processes/${item.id}`); } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }
  return <><Link href="/processes" className="back-link"><ArrowRight size={16} />بازگشت به کارتابل</Link><PageHeading title="ثبت درخواست جدید" description="اطلاعات درخواست خود را وارد کنید؛ پیگیری آن از کارتابل امکان‌پذیر است." /><Card><form onSubmit={(event) => void submit(event)}><div className="form-grid"><Field label="نوع درخواست" htmlFor="request-type" required><Select id="request-type" value={type} onChange={(event) => setType(event.target.value)}>{Object.entries(processTypes).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select></Field><Field label="اولویت" htmlFor="request-priority"><Select id="request-priority" value={priority} onChange={(event) => setPriority(event.target.value as ProcessItem["priority"])}><option value="normal">عادی</option><option value="high">مهم</option><option value="low">کم</option></Select></Field><Field label="عنوان درخواست" htmlFor="request-title" className="full-width" required><Input id="request-title" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={4} maxLength={140} placeholder="عنوانی کوتاه و مشخص بنویسید" /></Field><Field label="شرح درخواست" htmlFor="request-description" className="full-width" required><Textarea id="request-description" value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={3000} rows={6} placeholder="جزئیات و اطلاعات لازم برای بررسی درخواست را بنویسید..." /></Field></div>{error && <p role="alert" className="form-error mt-4">{error}</p>}<div className="form-actions"><Button type="submit" loading={busy}><Send size={16} />ثبت درخواست</Button><Link href="/processes" className="button button-secondary">انصراف</Link></div></form></Card></>;
}

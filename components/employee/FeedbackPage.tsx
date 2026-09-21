"use client";
import { useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Badge, Button, Card, Field, Input, PageHeading, SectionHeading, Select, Textarea } from "@/components/ui/Primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useEmployee } from "@/components/shared/AuthGuard";
import { useResource } from "@/hooks/useResource";
import { feedbackService, submitFeedback } from "@/services/feedbackService";
import { errorMessage, faNumber } from "@/lib/utils";
import { shortDate, persianTime } from "@/lib/date";
import type { Feedback, FeedbackType } from "@/types";

const typeLabels: Record<FeedbackType, string> = { suggestion: "پیشنهاد", criticism: "انتقاد" };
const columns: Column<Feedback>[] = [
  { key: "subject", label: "عنوان", className: "primary-cell", sortValue: (item) => item.subject, render: (item) => <span className="table-title"><strong>{item.subject}</strong></span> },
  { key: "type", label: "نوع", sortValue: (item) => typeLabels[item.type], render: (item) => <Badge>{typeLabels[item.type]}</Badge> },
  { key: "createdAt", label: "تاریخ ارسال", sortValue: (item) => item.createdAt, render: (item) => <span className="table-date">{shortDate(item.createdAt)}<small>{persianTime(item.createdAt)}</small></span> },
  { key: "status", label: "وضعیت", render: () => <Badge status="info">ثبت شده</Badge> },
];

export function FeedbackPage() {
  const employee = useEmployee();
  const resource = useResource(feedbackService);
  const toast = useToast();
  const [type, setType] = useState<FeedbackType | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mine = resource.data.filter((item) => item.employeeId === employee.id);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      await submitFeedback({ employeeId: employee.id, type, subject, message });
      setType(""); setSubject(""); setMessage("");
      toast("پیام شما با موفقیت ثبت شد.");
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <>
    <PageHeading title="صندوق انتقادات و پیشنهادات" description="پیشنهادها و انتقادهای خود را درباره محیط کار با ما در میان بگذارید." eyebrow="میز کار / انتقادات و پیشنهادات" />
    <Card>
      <SectionHeading title="ثبت پیام جدید" icon={<MessageSquare size={18} />} />
      <form noValidate onSubmit={(event) => void submit(event)}>
        <div className="form-grid">
          <Field label="نوع پیام" htmlFor="feedback-type" required className="full-width">
            <Select id="feedback-type" value={type} onChange={(event) => { const value = event.target.value; if (value === "suggestion" || value === "criticism") setType(value); }} required disabled={busy}>
              <option value="" disabled>نوع پیام را انتخاب کنید</option>
              <option value="suggestion">پیشنهاد</option>
              <option value="criticism">انتقاد</option>
            </Select>
          </Field>
          <Field label="عنوان" htmlFor="feedback-subject" required className="full-width" hint="عنوانی مشخص، بین ۳ تا ۱۸۰ نویسه بنویسید.">
            <Input id="feedback-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={3} maxLength={180} aria-describedby="feedback-subject-hint" disabled={busy} />
          </Field>
          <Field label="متن پیام" htmlFor="feedback-message" required className="full-width" hint="جزئیات پیام را بین ۱۰ تا ۵۰۰۰ نویسه بنویسید.">
            <Textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} required minLength={10} maxLength={5000} rows={6} aria-describedby="feedback-message-hint" disabled={busy} />
          </Field>
        </div>
        <span className="character-count">{faNumber(message.length)} / ۵۰۰۰</span>
        {error && <p className="form-error mt-4" role="alert">{error}</p>}
        <div className="form-actions"><Button type="submit" loading={busy}><Send size={17} />{busy ? "در حال ارسال..." : "ارسال پیام"}</Button><span className="save-hint">فیلدهای ستاره‌دار الزامی هستند.</span></div>
      </form>
    </Card>
    <Card className="table-card">
      <div className="table-card-heading"><h2>پیام‌های قبلی شما</h2><Badge>{faNumber(mine.length)} پیام</Badge></div>
      {!resource.loading && !resource.error && !mine.length ? <EmptyState title="هنوز پیامی ثبت نکرده‌اید." description="پس از ارسال پیشنهاد یا انتقاد، پیام شما در این بخش نمایش داده می‌شود." /> : <DataTable
        data={mine} columns={columns} searchFields={(item) => [item.subject, item.message, typeLabels[item.type]]}
        searchPlaceholder="جستجو در پیام‌های شما..." loading={resource.loading} error={resource.error} onRetry={resource.reload}
      />}
    </Card>
    <p className="page-helper">پیام‌های این نسخه نمایشی فقط در همین مرورگر ذخیره می‌شوند.</p>
  </>;
}

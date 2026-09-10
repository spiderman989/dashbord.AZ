"use client";
import { useState, type FormEvent } from "react";
import { Check, Save, UploadCloud, X } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "./Primitives";
import { AssetImage } from "@/components/shared/AssetImage";
import { errorMessage } from "@/lib/utils";

export type FormValues = Record<string, string | boolean>;
export interface FormField { key: string; label: string; type?: "text" | "textarea" | "date" | "number" | "select" | "image" | "toggle"; required?: boolean; minLength?: number; maxLength?: number; hint?: string; fullWidth?: boolean; options?: { value: string; label: string }[]; }
export function ContentForm({ fields, initialValues, onSave, onCancel, saveLabel = "ذخیره" }: { fields: FormField[]; initialValues: FormValues; onSave: (values: FormValues) => Promise<void>; onCancel: () => void; saveLabel?: string }) {
  const [values, setValues] = useState(initialValues); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const set = (key: string, value: string | boolean) => setValues((previous) => ({ ...previous, [key]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (busy) return; for (const field of fields) { if (field.required && !String(values[field.key] ?? "").trim()) { setError(`فیلد «${field.label}» را تکمیل کنید.`); return; } if (field.minLength && String(values[field.key] ?? "").trim().length < field.minLength) { setError(`«${field.label}» باید دست‌کم ${field.minLength} حرف داشته باشد.`); return; } } setBusy(true); setError(""); try { await onSave(values); } catch (err) { setError(errorMessage(err)); setBusy(false); } }
  return <form onSubmit={(event) => void submit(event)} className="content-form"><div className="form-grid">{fields.map((field) => {
    const id = `field-${field.key}`; const value = String(values[field.key] ?? "");
    return <Field key={field.key} htmlFor={id} label={field.label} required={field.required} hint={field.hint} className={field.fullWidth ? "full-width" : undefined}>{field.type === "textarea" ? <Textarea id={id} value={value} onChange={(event) => set(field.key, event.target.value)} required={field.required} minLength={field.minLength} maxLength={field.maxLength ?? 12000} rows={field.key === "content" ? 9 : 4} aria-describedby={field.hint ? `${id}-hint` : undefined} /> : field.type === "select" ? <Select id={id} value={value} onChange={(event) => set(field.key, event.target.value)} required={field.required}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select> : field.type === "image" ? <ImageUpload id={id} value={value} onChange={(value) => set(field.key, value)} /> : field.type === "toggle" ? <button id={id} type="button" role="switch" aria-checked={Boolean(values[field.key])} className={`toggle-control${values[field.key] ? " is-on" : ""}`} onClick={() => set(field.key, !values[field.key])}><span><i>{values[field.key] && <Check size={10} />}</i></span>{values[field.key] ? "فعال" : "غیرفعال"}</button> : <Input id={id} type={field.type ?? "text"} value={value} onChange={(event) => set(field.key, event.target.value)} required={field.required} minLength={field.minLength} maxLength={field.maxLength ?? 250} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? 1 : undefined} aria-describedby={field.hint ? `${id}-hint` : undefined} />}</Field>;
  })}</div>{error && <p className="form-error mt-5" role="alert">{error}</p>}<div className="form-actions"><Button type="submit" loading={busy}><Save size={17} />{busy ? "در حال ذخیره..." : saveLabel}</Button><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>انصراف</Button><span className="save-hint">فیلدهای ستاره‌دار الزامی هستند.</span></div></form>;
}
function ImageUpload({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return; setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("فرمت تصویر باید JPG، PNG یا WebP باشد."); return; }
    if (file.size > 1_000_000) { setError("حجم تصویر باید کمتر از یک مگابایت باشد."); return; }
    setBusy(true);
    try { const bitmap = await createImageBitmap(file); bitmap.close(); const reader = new FileReader(); reader.onload = () => { onChange(String(reader.result)); setBusy(false); }; reader.onerror = () => { setError("خواندن تصویر ممکن نشد."); setBusy(false); }; reader.readAsDataURL(file); } catch { setError("فایل انتخاب‌شده یک تصویر معتبر نیست."); setBusy(false); }
  }
  return <div className="image-upload">{value && <div className="upload-preview"><AssetImage src={value} alt="پیش‌نمایش تصویر" /><button type="button" className="icon-button" aria-label="حذف تصویر انتخاب‌شده" onClick={() => onChange("")}><X size={16} /></button></div>}<label className="upload-dropzone" htmlFor={id}><UploadCloud size={26} /><strong>{busy ? "در حال آماده‌سازی تصویر..." : value ? "انتخاب تصویر دیگر" : "انتخاب تصویر"}</strong><span>JPG، PNG یا WebP · حداکثر ۱ مگابایت</span><input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} disabled={busy} /></label>{error && <small className="field-error" role="alert">{error}</small>}</div>;
}

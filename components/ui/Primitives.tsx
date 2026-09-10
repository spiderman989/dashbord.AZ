import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", loading, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; loading?: boolean }) {
  return <button className={cn("button", `button-${variant}`, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <LoaderCircle size={17} className="spin" />}{children}</button>;
}
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) { return <section className={cn("card", className)} {...props} />; }
export function SectionHeading({ title, icon, href, action, description }: { title: string; icon?: ReactNode; href?: string; action?: ReactNode; description?: string }) {
  return <div className="section-heading"><div><h2>{icon}<span>{title}</span></h2>{description && <p className="muted text-sm mt-1">{description}</p>}</div>{href ? <Link href={href} className="text-link">مشاهده همه <ArrowLeft size={15} /></Link> : action}</div>;
}
const toneMap: Record<string, string> = { completed: "success", success: "success", published: "success", active: "success", in_progress: "info", info: "info", new: "info", action_required: "warning", pending: "warning", draft: "neutral", archived: "neutral", finished: "neutral", inactive: "neutral", high: "danger", warning: "warning" };
export function Badge({ children, status = "neutral", className }: { children: ReactNode; status?: string; className?: string }) { return <span className={cn("badge", `badge-${toneMap[status] ?? status}`, className)}><span className="badge-dot" />{children}</span>; }
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("input", className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("input textarea", className)} {...props} />; }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn("input select", className)} {...props} />; }
export function Field({ label, htmlFor, children, hint, error, required, className }: { label: string; htmlFor: string; children: ReactNode; hint?: string; error?: string; required?: boolean; className?: string }) {
  return <div className={cn("field", className)}><label htmlFor={htmlFor}>{label}{required && <span className="required" aria-hidden="true"> *</span>}</label>{children}{hint && <small id={`${htmlFor}-hint`} className="muted">{hint}</small>}{error && <small id={`${htmlFor}-error`} role="alert" className="field-error">{error}</small>}</div>;
}
export function SearchInput({ value, onChange, placeholder = "جستجو...", label = "جستجو" }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string }) {
  return <div className="search-input"><Search size={18} aria-hidden="true" /><input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
export function PageHeading({ title, description, children, eyebrow }: { title: string; description?: string; children?: ReactNode; eyebrow?: string }) { return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="muted">{description}</p>}</div>{children && <div className="page-heading-action">{children}</div>}</div>; }

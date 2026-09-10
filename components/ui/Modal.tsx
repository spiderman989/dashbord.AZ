"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "./Primitives";
import { errorMessage } from "@/lib/utils";

export function Modal({ title, children, onClose, className = "" }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null); const titleId = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-content"><div className="modal-heading"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="بستن پنجره" onClick={onClose}><X size={20} /></button></div>{children}</div></dialog>;
}
export function ConfirmDialog({ title = "حذف آیتم", description, onConfirm, onClose }: { title?: string; description: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function confirm() { if (busy) return; setBusy(true); try { await onConfirm(); onClose(); } catch (err) { setError(errorMessage(err)); setBusy(false); } }
  return <Modal title={title} onClose={() => { if (!busy) onClose(); }} className="confirm-modal"><span className="confirm-icon"><Trash2 size={26} /></span><p className="confirm-description">{description}</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><Button variant="danger" loading={busy} onClick={() => void confirm()}>حذف</Button><Button variant="secondary" disabled={busy} onClick={onClose}>انصراف</Button></div></Modal>;
}

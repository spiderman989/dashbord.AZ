"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastKind = "success" | "error";
const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((message: string, kind: ToastKind = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind }); timer.current = setTimeout(() => setToast(null), 4500);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <ToastContext.Provider value={show}>{children}<div aria-live="polite" aria-atomic="true" className="toast-region">{toast && <div className={`toast toast-${toast.kind}`}>{toast.kind === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}<span>{toast.message}</span><button type="button" className="icon-button" aria-label="بستن پیام" onClick={() => setToast(null)}><X size={16} /></button></div>}</div></ToastContext.Provider>;
}
export function useToast() { return useContext(ToastContext); }

import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "./Primitives";
import type { ReactNode } from "react";

export function EmptyState({ title = "اطلاعاتی برای نمایش وجود ندارد.", description = "فیلترها را تغییر دهید یا بعداً دوباره سر بزنید.", action }: { title?: string; description?: string; action?: ReactNode }) { return <div className="empty-state"><span className="state-icon"><Inbox size={28} /></span><h3>{title}</h3><p className="muted">{description}</p>{action}</div>; }
export function LoadingState({ compact = false }: { compact?: boolean }) { return <div className={compact ? "loading-state compact" : "loading-state"} role="status"><LoaderCircle size={24} className="spin" /><span>در حال دریافت اطلاعات...</span></div>; }
export function ErrorState({ message = "خطایی رخ داده است.", retry }: { message?: string; retry?: () => void }) { return <div className="error-state" role="alert"><AlertCircle size={24} /><p>{message}</p>{retry && <Button variant="secondary" onClick={retry}>تلاش دوباره</Button>}</div>; }

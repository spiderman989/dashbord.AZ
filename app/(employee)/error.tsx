"use client";
import { ErrorState } from "@/components/ui/States";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <ErrorState message="دریافت اطلاعات با مشکل روبه‌رو شد. لطفاً دوباره تلاش کنید." retry={reset} />; }

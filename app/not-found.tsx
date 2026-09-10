import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
export default function NotFound() { return <main className="not-found"><SearchX size={48} /><span>۴۰۴</span><h1>این صفحه پیدا نشد.</h1><p>ممکن است آدرس تغییر کرده یا صفحه حذف شده باشد.</p><Link href="/" className="button button-primary"><ArrowRight size={18} />بازگشت به میز کار</Link></main>; }

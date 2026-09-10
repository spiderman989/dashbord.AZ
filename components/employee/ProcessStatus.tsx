import Link from "next/link";
import { ArrowUpLeft, ChartPie } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import type { ProcessItem, ProcessStatus as Status } from "@/types";
import { processLabels } from "@/lib/labels";
import { faNumber } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

const statuses: Status[] = ["completed", "in_progress", "action_required", "new"];
export function ProcessStatus({ processes }: { processes: ProcessItem[] }) {
  const total = processes.length; const completed = processes.filter((item) => item.status === "completed").length; const percent = total ? Math.round(completed / total * 100) : 0;
  const counts = statuses.map((status) => processes.filter((item) => item.status === status).length);
  return <Card className="process-status-card"><SectionHeading title="وضعیت فرآیندها" icon={<ChartPie size={18} />} action={<span className="tiny-label">نمای کلی درخواست‌های شما</span>} />{total ? <><div className="process-status-body"><div className="donut" role="img" aria-label={`${faNumber(total)} فرآیند؛ ${faNumber(percent)} درصد تکمیل شده`}><svg viewBox="0 0 140 140" aria-hidden="true"><circle className="donut-base" cx="70" cy="70" r="56" fill="none" strokeWidth="15" />{statuses.map((status) => {
    const index = statuses.indexOf(status);
    const value = counts[index] / total * 100;
    const start = counts.slice(0, index).reduce((sum, count) => sum + count, 0) / total * 100;
    return <circle key={status} className={`donut-segment segment-${status}`} cx="70" cy="70" r="56" fill="none" strokeWidth="15" pathLength="100" strokeDasharray={`${Math.max(value - 1.2, 0)} ${100 - Math.max(value - 1.2, 0)}`} strokeDashoffset={-start} />;
  })}</svg><div className="donut-center"><strong>{faNumber(percent)}<small>٪</small></strong><span>تکمیل شده</span></div></div><ul className="status-legend">{statuses.map((status) => <li key={status}><span className={`legend-dot legend-${status}`} /><span>{processLabels[status]}</span><strong>{faNumber(processes.filter((item) => item.status === status).length)}</strong></li>)}</ul></div><div className="status-card-footer"><span><strong>{faNumber(total)}</strong> فرآیند در کارتابل شما</span><Link href="/processes">رفتن به کارتابل <ArrowUpLeft size={16} /></Link></div></> : <EmptyState title="هنوز فرآیندی ندارید." />}</Card>;
}

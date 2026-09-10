import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import type { QuickProcess } from "@/types";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { EmptyState } from "@/components/ui/States";
import { ProcessIcon } from "@/components/shared/ProcessIcon";
import { safeHref } from "@/lib/utils";

export function QuickProcesses({ items }: { items: QuickProcess[] }) {
  const active = items.filter((item) => item.active).sort((a, b) => a.order - b.order);
  return <Card className="quick-process-card"><SectionHeading title="فرآیندهای سریع" icon={<Zap size={18} />} /><div className="quick-process-list">{active.map((item) => <Link className="quick-process" key={item.id} href={safeHref(item.link) ?? "/processes"}><span className="quick-icon"><ProcessIcon name={item.icon} size={20} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><ChevronLeft size={17} /></Link>)}</div>{active.length === 0 && <EmptyState title="فرآیند سریعی تعریف نشده است." />}</Card>;
}

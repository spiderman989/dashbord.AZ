import { CalendarDays, BriefcaseBusiness, Monitor, ShoppingBag, Headphones, ChartNoAxesCombined } from "lucide-react";
import type { IconName } from "@/types";
const icons = { leave: CalendarDays, mission: BriefcaseBusiness, equipment: Monitor, purchase: ShoppingBag, support: Headphones, report: ChartNoAxesCombined };
export function ProcessIcon({ name, size = 22 }: { name: IconName; size?: number }) { const Icon = icons[name] ?? CalendarDays; return <Icon size={size} strokeWidth={1.7} />; }

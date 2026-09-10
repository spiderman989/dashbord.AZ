const timeZone = "Asia/Tehran";
export function persianDate(date: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric", timeZone, ...options }).format(value);
}
export function shortDate(date: string | Date): string { return persianDate(date, { month: "2-digit", day: "2-digit" }); }
export function persianTime(date: string | Date, seconds = false): string {
  return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", ...(seconds ? { second: "2-digit" as const } : {}), hour12: false, timeZone }).format(new Date(date));
}
export function jalaliParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric", timeZone }).formatToParts(date);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}
const DAY_MS = 86_400_000;
/** Uses the browser's actual Persian calendar, including Jalali leap years. */
export function jalaliMonth(anchor: Date, offset = 0) {
  let first = new Date(anchor.getTime() - (jalaliParts(anchor).day - 1) * DAY_MS);
  for (let i = 0; i < Math.abs(offset); i++) {
    const probe = new Date(first.getTime() + (offset > 0 ? 32 : -1) * DAY_MS);
    first = new Date(probe.getTime() - (jalaliParts(probe).day - 1) * DAY_MS);
  }
  const current = jalaliParts(first);
  const days: { date: Date; day: number }[] = [];
  for (let index = 0; index < 32; index++) {
    const date = new Date(first.getTime() + index * DAY_MS);
    if (jalaliParts(date).month !== current.month) break;
    days.push({ date, day: index + 1 });
  }
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(first);
  return { ...current, first, days, leading: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(weekday), label: persianDate(first, { day: undefined }) };
}

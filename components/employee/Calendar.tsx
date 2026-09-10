"use client";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { jalaliMonth, jalaliParts, persianDate } from "@/lib/date";
import { cn, faNumber } from "@/lib/utils";

export function Calendar({ now }: { now: Date }) {
  const [offset, setOffset] = useState(0); const month = jalaliMonth(now, offset); const today = jalaliParts(now);
  return <Card className="calendar-card"><SectionHeading title="تقویم شمسی" icon={<CalendarDays size={18} />} action={<span className="tiny-label">{faNumber(today.year)}</span>} /><div className="calendar-controls"><button className="icon-button" aria-label="ماه قبل" onClick={() => setOffset(offset - 1)}><ChevronRight size={17} /></button><strong aria-live="polite">{month.label}</strong><button className="icon-button" aria-label="ماه بعد" onClick={() => setOffset(offset + 1)}><ChevronLeft size={17} /></button></div><div className="calendar-grid"><div className="calendar-weekdays">{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day, index) => <span key={day} className={index === 6 ? "friday" : undefined}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: month.leading }, (_, i) => <span className="calendar-blank" key={`blank-${i}`} />)}{month.days.map(({ day, date }, index) => {
    const current = today.year === month.year && today.month === month.month && today.day === day;
    return <span key={day} className={cn("calendar-day", (month.leading + index) % 7 === 6 && "friday", current && "today")} aria-current={current ? "date" : undefined} title={persianDate(date)}>{faNumber(day)}</span>;
  })}</div></div><div className="calendar-footer"><span><i />امروز، {persianDate(now, { year: undefined })}</span>{offset !== 0 ? <button onClick={() => setOffset(0)}>بازگشت به امروز</button> : <span className="muted">روز خوبی داشته باشید</span>}</div></Card>;
}

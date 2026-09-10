"use client";
import type { CSSProperties } from "react";
import { Card } from "@/components/ui/Primitives";
import { persianDate, persianTime } from "@/lib/date";

export function Clock({ now }: { now: Date }) {
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now).split(":").map(Number);
  const style = { "--hour": `${time[0] * 30 + time[1] * 0.5}deg`, "--minute": `${time[1] * 6 + time[2] * 0.1}deg`, "--second": `${time[2] * 6}deg` } as CSSProperties;
  return <Card className="clock-card"><div className="clock-information"><span className="eyebrow">به وقت یک روز تازه</span><time dateTime={now.toISOString()} className="digital-clock">{persianTime(now)}<span>{persianTime(now, true).split(":")[2]}</span></time><p>{persianDate(now, { weekday: "long", year: undefined })}</p><span className="clock-rule" /></div><div className="analog-clock" style={style} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span className="clock-tick" key={i} style={{ transform: `rotate(${i * 30}deg)` }} />)}<span className="clock-hand hour-hand" /><span className="clock-hand minute-hand" /><span className="clock-hand second-hand" /><span className="clock-center" /></div></Card>;
}

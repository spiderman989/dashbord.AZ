"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Images, Megaphone } from "lucide-react";
import type { GalleryItem, News } from "@/types";
import { Card, SectionHeading } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { AssetImage } from "@/components/shared/AssetImage";
import { useResource } from "@/hooks/useResource";
import { galleryService } from "@/services/galleryService";
import { newsService } from "@/services/newsService";
import { persianDate } from "@/lib/date";
import { Calendar } from "./Calendar";
import { Clock } from "./Clock";

export function InfoRail({ initialNow, initialNews, initialGallery }: { initialNow: string; initialNews: News[]; initialGallery: GalleryItem[] }) {
  const [now, setNow] = useState(() => new Date(initialNow)); const [newsIndex, setNewsIndex] = useState(0); const [selected, setSelected] = useState<GalleryItem | null>(null);
  const news = useResource(newsService, initialNews); const gallery = useResource(galleryService, initialGallery);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const published = news.data.filter((item) => item.status === "published"); const current = published[newsIndex % (published.length || 1)];
  return <><Calendar now={now} /><Clock now={now} /><Card className="news-ticker"><SectionHeading title="روی خط آذرشین" icon={<Megaphone size={18} />} action={<div className="ticker-controls"><button className="icon-button" aria-label="خبر قبل" disabled={published.length < 2} onClick={() => setNewsIndex((newsIndex + published.length - 1) % published.length)}><ChevronRight size={15} /></button><button className="icon-button" aria-label="خبر بعد" disabled={published.length < 2} onClick={() => setNewsIndex((newsIndex + 1) % published.length)}><ChevronLeft size={15} /></button></div>} />{news.error ? <ErrorState message={news.error} retry={news.reload} /> : current ? <Link className="ticker-item" href={`/news/${current.id}`}><span className="ticker-dot" /><span>{current.title}</span><ArrowLeft size={15} /></Link> : <p className="muted text-sm">خبر جدیدی منتشر نشده است.</p>}</Card><Card className="rail-gallery"><SectionHeading title="قاب آذرشین" icon={<Images size={18} />} action={<span className="tiny-label">گالری تصاویر</span>} />{gallery.error ? <ErrorState message={gallery.error} retry={gallery.reload} /> : <div className="gallery-grid">{gallery.data.filter((item) => item.active).slice(0, 4).map((item) => <button className="gallery-tile" key={item.id} onClick={() => setSelected(item)}><AssetImage src={item.image} alt={item.title} /><span>{item.title}<ArrowLeft size={13} /></span></button>)}</div>}{!gallery.data.some((item) => item.active) && <EmptyState title="تصویری منتشر نشده است." />}</Card><div className="rail-quote"><span>«</span><p>دستاوردهای بزرگ،<br />از همراهی‌های کوچک آغاز می‌شوند.</p><i /></div>{selected && <Modal title={selected.title} onClose={() => setSelected(null)} className="gallery-modal"><AssetImage src={selected.image} alt={selected.title} /><p className="mt-4">{selected.description}</p><small className="muted">{persianDate(selected.date)}</small></Modal>}</>;
}

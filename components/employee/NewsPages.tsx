"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from "lucide-react";
import { Badge, Card, PageHeading, SearchInput, Select } from "@/components/ui/Primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { AssetImage } from "@/components/shared/AssetImage";
import { useResource } from "@/hooks/useResource";
import { newsService } from "@/services/newsService";
import { matchesSearch } from "@/lib/utils";
import { persianDate } from "@/lib/date";

export function NewsList() {
  const resource = useResource(newsService); const [query, setQuery] = useState(""); const [category, setCategory] = useState(""); const published = resource.data.filter((item) => item.status === "published"); const items = published.filter((item) => matchesSearch(query, item.title, item.summary, item.category) && (!category || item.category === category));
  return <><PageHeading title="تازه‌های آذرشین" description="خبرها، رویدادها و روایت‌های زندگی در سازمان" eyebrow="میز کار / اخبار" /><Card><div className="table-toolbar"><SearchInput value={query} onChange={setQuery} placeholder="جستجو در اخبار..." /><Select aria-label="دسته‌بندی اخبار" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">همه دسته‌ها</option>{[...new Set(published.map((item) => item.category))].map((item) => <option key={item}>{item}</option>)}</Select></div></Card>{resource.loading ? <LoadingState /> : resource.error ? <ErrorState message={resource.error} retry={resource.reload} /> : items.length ? <div className="news-page-grid">{items.map((item) => <article className="card news-page-card" key={item.id}><Link href={`/news/${item.id}`}><AssetImage src={item.image} alt={item.title} /><div className="news-card-copy"><span className="news-category">{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><div><time dateTime={item.date}>{persianDate(item.date, { year: undefined })}</time><span>بیشتر بخوانید <ArrowLeft size={14} /></span></div></div></Link></article>)}</div> : <EmptyState title="خبری برای نمایش وجود ندارد." />}</>;
}
export function NewsDetail({ id }: { id: string }) {
  const resource = useResource(newsService); const item = resource.data.find((item) => item.id === id && item.status === "published");
  if (resource.loading) return <LoadingState />;
  if (resource.error) return <ErrorState message={resource.error} retry={resource.reload} />;
  if (!item) return <EmptyState title="این خبر در دسترس نیست." description="ممکن است خبر هنوز منتشر نشده یا بایگانی شده باشد." action={<Link href="/news" className="button button-secondary">بازگشت به اخبار</Link>} />;
  return <><Link href="/news" className="back-link"><ArrowRight size={16} />بازگشت به اخبار</Link><Card className="article-page"><Badge>{item.category}</Badge><h1>{item.title}</h1><div className="article-meta"><span><CalendarDays size={15} />{persianDate(item.date)}</span><span><UserRound size={15} />{item.author}</span></div><AssetImage src={item.image} alt={item.title} /><p className="article-summary">{item.summary}</p><div className="article-body">{item.content.split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></Card></>;
}

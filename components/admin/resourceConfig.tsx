"use client";
import type { Announcement, Course, GalleryItem, News, QuickProcess, Repository } from "@/types";
import type { Column, TableFilter } from "@/components/ui/DataTable";
import type { FormField, FormValues } from "@/components/ui/ContentForm";
import { AssetImage } from "@/components/shared/AssetImage";
import { ProcessIcon } from "@/components/shared/ProcessIcon";
import { Badge } from "@/components/ui/Primitives";
import { contentLabels, courseLabels, announcementLabels } from "@/lib/labels";
import { faNumber, safeHref } from "@/lib/utils";
import { shortDate } from "@/lib/date";
import { newsService } from "@/services/newsService";
import { courseService } from "@/services/courseService";
import { galleryService } from "@/services/galleryService";
import { announcementService } from "@/services/announcementService";
import { quickProcessService } from "@/services/processService";

export type ContentKind = "news" | "courses" | "gallery" | "announcements" | "processes";
export interface ResourceConfig<T extends { id: string }> { kind: ContentKind; title: string; singular: string; description: string; repository: Repository<T>; columns: Column<T>[]; searchFields: (item: T) => string[]; filters: TableFilter<T>[]; fields: FormField[]; values: (item?: T) => FormValues; parse: (values: FormValues) => Omit<T, "id">; getTitle: (item: T) => string; toggle?: (item: T) => Partial<Omit<T, "id">>; isActive?: (item: T) => boolean; reorder?: { get: (item: T) => number; withOrder: (item: T, order: number) => T }; viewHref?: (item: T) => string; }
const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
const today = () => new Date().toISOString().slice(0, 10);
const text = (values: FormValues, key: string) => String(values[key] ?? "").trim();
const titleField: FormField = { key: "title", label: "عنوان", required: true, minLength: 3, maxLength: 180, fullWidth: true };
const imageField: FormField = { key: "image", label: "تصویر", type: "image", fullWidth: true };
const activeField: FormField = { key: "active", label: "وضعیت نمایش", type: "toggle" };
const dateField: FormField = { key: "date", label: "تاریخ انتشار", type: "date", required: true, hint: "تاریخ در فرم میلادی و در پورتال به‌صورت شمسی نمایش داده می‌شود." };
function thumbnailTitle(item: { title: string; image: string }, summary?: string) { return <span className="thumbnail-title"><AssetImage src={item.image} alt="" /><span className="table-title"><strong>{item.title}</strong>{summary && <small>{summary}</small>}</span></span>; }
function activeBadge(active: boolean) { return <Badge status={active ? "active" : "inactive"}>{active ? "فعال" : "غیرفعال"}</Badge>; }
const activeOptions = [{ value: "true", label: "فعال" }, { value: "false", label: "غیرفعال" }];

export const newsConfig: ResourceConfig<News> = {
  kind: "news", title: "مدیریت اخبار", singular: "خبر", description: "تازه‌های سازمان را ایجاد، ویرایش و منتشر کنید.", repository: newsService,
  columns: [
    { key: "title", label: "عنوان خبر", className: "primary-cell", sortValue: (item) => item.title, render: (item) => thumbnailTitle(item, item.category) },
    { key: "author", label: "نویسنده", sortValue: (item) => item.author, render: (item) => item.author },
    { key: "date", label: "تاریخ انتشار", sortValue: (item) => item.date, render: (item) => shortDate(item.date) },
    { key: "status", label: "وضعیت", sortValue: (item) => item.status, render: (item) => <Badge status={item.status}>{contentLabels[item.status]}</Badge> },
  ], searchFields: (item) => [item.title, item.summary, item.author, item.category], filters: [{ key: "status", label: "همه وضعیت‌ها", options: options(contentLabels), getValue: (item) => item.status }],
  fields: [titleField, { key: "summary", label: "خلاصه خبر", type: "textarea", required: true, minLength: 10, maxLength: 500, fullWidth: true }, { key: "content", label: "متن خبر", type: "textarea", required: true, minLength: 10, fullWidth: true }, imageField, dateField, { key: "author", label: "نویسنده", required: true }, { key: "category", label: "دسته‌بندی", required: true }, { key: "status", label: "وضعیت", type: "select", options: options(contentLabels) }],
  values: (item) => item ? { title: item.title, summary: item.summary, content: item.content, image: item.image, date: item.date, author: item.author, category: item.category, status: item.status } : { title: "", summary: "", content: "", image: "reference:building", date: today(), author: "روابط عمومی", category: "رویدادهای سازمان", status: "draft" },
  parse: (values) => ({ title: text(values, "title"), summary: text(values, "summary"), content: text(values, "content"), image: text(values, "image"), date: text(values, "date"), author: text(values, "author"), category: text(values, "category"), status: text(values, "status") as News["status"] }), getTitle: (item) => item.title, viewHref: (item) => `/news/${item.id}`,
};
export const courseConfig: ResourceConfig<Course> = {
  kind: "courses", title: "مدیریت دوره‌های آموزشی", singular: "دوره", description: "برنامه‌های یادگیری و دوره‌های آموزشی همکاران را مدیریت کنید.", repository: courseService,
  columns: [
    { key: "title", label: "عنوان دوره", className: "primary-cell", sortValue: (item) => item.title, render: (item) => thumbnailTitle(item, item.category) },
    { key: "instructor", label: "مدرس", sortValue: (item) => item.instructor, render: (item) => item.instructor },
    { key: "date", label: "تاریخ شروع", sortValue: (item) => item.startDate, render: (item) => shortDate(item.startDate) },
    { key: "status", label: "وضعیت", sortValue: (item) => item.status, render: (item) => <Badge status={item.status}>{courseLabels[item.status]}</Badge> },
  ], searchFields: (item) => [item.title, item.description, item.instructor, item.category], filters: [{ key: "status", label: "همه وضعیت‌ها", options: options(courseLabels), getValue: (item) => item.status }],
  fields: [titleField, { key: "description", label: "توضیحات", type: "textarea", required: true, minLength: 10, fullWidth: true }, imageField, { key: "instructor", label: "مدرس", required: true }, { key: "category", label: "دسته‌بندی", required: true }, { key: "startDate", label: "تاریخ شروع", type: "date", required: true, hint: "ورودی تاریخ میلادی است؛ نمایش در پورتال شمسی خواهد بود." }, { key: "endDate", label: "تاریخ پایان", type: "date", required: true }, { key: "status", label: "وضعیت", type: "select", options: options(courseLabels) }, { key: "link", label: "لینک دوره", hint: "آدرس داخلی یا یک لینک امن با https://" }],
  values: (item) => item ? { title: item.title, description: item.description, image: item.image, instructor: item.instructor, category: item.category, startDate: item.startDate, endDate: item.endDate, status: item.status, link: item.link } : { title: "", description: "", image: "reference:training", instructor: "", category: "مهارت‌های دیجیتال", startDate: today(), endDate: today(), status: "draft", link: "" },
  parse: (values) => { if (text(values, "endDate") < text(values, "startDate")) throw new Error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد."); if (text(values, "link") && !safeHref(text(values, "link"))) throw new Error("لینک دوره باید یک مسیر داخلی یا آدرس معتبر https باشد."); return { title: text(values, "title"), description: text(values, "description"), image: text(values, "image"), instructor: text(values, "instructor"), category: text(values, "category"), startDate: text(values, "startDate"), endDate: text(values, "endDate"), status: text(values, "status") as Course["status"], link: text(values, "link") }; }, getTitle: (item) => item.title,
};
export const galleryConfig: ResourceConfig<GalleryItem> = {
  kind: "gallery", title: "مدیریت گالری", singular: "تصویر", description: "لحظه‌های سازمان را در قاب گالری به اشتراک بگذارید.", repository: galleryService,
  columns: [{ key: "title", label: "تصویر و عنوان", className: "primary-cell", sortValue: (item) => item.title, render: (item) => thumbnailTitle(item, item.description) }, { key: "date", label: "تاریخ", sortValue: (item) => item.date, render: (item) => shortDate(item.date) }, { key: "active", label: "وضعیت", sortValue: (item) => Number(item.active), render: (item) => activeBadge(item.active) }],
  searchFields: (item) => [item.title, item.description], filters: [{ key: "active", label: "همه وضعیت‌ها", options: activeOptions, getValue: (item) => String(item.active) }],
  fields: [titleField, { ...imageField, required: true }, { key: "description", label: "توضیحات", type: "textarea", fullWidth: true }, dateField, activeField],
  values: (item) => item ? { title: item.title, description: item.description, image: item.image, date: item.date, active: item.active } : { title: "", description: "", image: "", date: today(), active: true },
  parse: (values) => ({ title: text(values, "title"), description: text(values, "description"), image: text(values, "image"), date: text(values, "date"), active: Boolean(values.active) }), getTitle: (item) => item.title, toggle: (item) => ({ active: !item.active }), isActive: (item) => item.active,
};
export const announcementConfig: ResourceConfig<Announcement> = {
  kind: "announcements", title: "مدیریت اطلاعیه‌ها", singular: "اطلاعیه", description: "پیام‌های مهم را به‌موقع به اطلاع همکاران برسانید.", repository: announcementService,
  columns: [{ key: "title", label: "عنوان اطلاعیه", className: "primary-cell", sortValue: (item) => item.title, render: (item) => <span className="table-title"><strong>{item.title}</strong><small>{item.text}</small></span> }, { key: "type", label: "نوع", sortValue: (item) => item.type, render: (item) => announcementLabels[item.type] }, { key: "date", label: "تاریخ", sortValue: (item) => item.date, render: (item) => shortDate(item.date) }, { key: "active", label: "وضعیت", render: (item) => activeBadge(item.active) }],
  searchFields: (item) => [item.title, item.text], filters: [{ key: "type", label: "همه انواع", options: options(announcementLabels), getValue: (item) => item.type }, { key: "active", label: "همه وضعیت‌ها", options: activeOptions, getValue: (item) => String(item.active) }],
  fields: [titleField, { key: "text", label: "متن اطلاعیه", type: "textarea", required: true, minLength: 5, fullWidth: true }, { key: "type", label: "نوع اطلاعیه", type: "select", options: options(announcementLabels) }, dateField, activeField],
  values: (item) => item ? { title: item.title, text: item.text, type: item.type, date: item.date, active: item.active } : { title: "", text: "", type: "notice", date: today(), active: true },
  parse: (values) => ({ title: text(values, "title"), text: text(values, "text"), type: text(values, "type") as Announcement["type"], date: text(values, "date"), active: Boolean(values.active) }), getTitle: (item) => item.title, toggle: (item) => ({ active: !item.active }), isActive: (item) => item.active,
};
export const quickProcessConfig: ResourceConfig<QuickProcess> = {
  kind: "processes", title: "مدیریت فرآیندهای سریع", singular: "فرآیند", description: "میان‌برهای پرکاربرد و ترتیب نمایش آن‌ها در میز کار را تنظیم کنید.", repository: quickProcessService, reorder: { get: (item) => item.order, withOrder: (item, order) => ({ ...item, order }) },
  columns: [{ key: "title", label: "عنوان فرآیند", className: "primary-cell", sortValue: (item) => item.title, render: (item) => <span className="thumbnail-title"><span className="quick-icon"><ProcessIcon name={item.icon} /></span><span className="table-title"><strong>{item.title}</strong><small>{item.description}</small></span></span> }, { key: "order", label: "ترتیب نمایش", sortValue: (item) => item.order, render: (item) => faNumber(item.order) }, { key: "link", label: "لینک", render: (item) => <span dir="ltr" className="table-url">{item.link}</span> }, { key: "active", label: "وضعیت", render: (item) => activeBadge(item.active) }],
  searchFields: (item) => [item.title, item.description], filters: [{ key: "active", label: "همه وضعیت‌ها", options: activeOptions, getValue: (item) => String(item.active) }],
  fields: [titleField, { key: "description", label: "توضیحات", type: "textarea", required: true, fullWidth: true }, { key: "icon", label: "آیکون", type: "select", options: options({ leave: "تقویم / مرخصی", mission: "کیف / مأموریت", equipment: "رایانه / تجهیزات", purchase: "خرید", support: "پشتیبانی", report: "گزارش" }) }, { key: "order", label: "ترتیب نمایش", type: "number", required: true }, { key: "link", label: "لینک", required: true, fullWidth: true, hint: "آدرس داخلی مانند /processes یا یک لینک معتبر https://" }, activeField],
  values: (item) => item ? { title: item.title, description: item.description, icon: item.icon, order: String(item.order), link: item.link, active: item.active } : { title: "", description: "", icon: "leave", order: "1", link: "/processes", active: true },
  parse: (values) => { const link = text(values, "link"); if (!safeHref(link)) throw new Error("لینک باید یک مسیر داخلی یا آدرس معتبر https باشد."); const order = Number(values.order); if (!Number.isInteger(order) || order < 0) throw new Error("ترتیب نمایش باید یک عدد صحیح و مثبت باشد."); return { title: text(values, "title"), description: text(values, "description"), icon: text(values, "icon") as QuickProcess["icon"], order, link, active: Boolean(values.active) }; }, getTitle: (item) => item.title, toggle: (item) => ({ active: !item.active }), isActive: (item) => item.active,
};

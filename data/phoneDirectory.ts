import type { Department } from "@/types";

/** Authoritative organizational records. Preserve spelling, grouping and duplicates. */
export const phoneDirectory: Department[] = [
  { id: "management", name: "مدیریت", extensions: [
    { id: "ext-108", extension: "108", name: "حمید سپیده", active: true },
    { id: "ext-253", extension: "253", name: "دکتر شهرور افشار", active: true },
    { id: "ext-254", extension: "254", name: "دکتر شهرور افشار", active: true },
  ] },
  { id: "finance", name: "مالی", extensions: [
    { id: "ext-107", extension: "107", name: "مجتبی فولادی (مدیر مالی)", managerLabel: "مدیر مالی", active: true },
    { id: "ext-105", extension: "105", name: "رضا فولادگر", active: true },
    { id: "ext-111", extension: "111", name: "امیرعلی هاشم‌زاده", active: true },
    { id: "ext-115", extension: "115", name: "سجاد حیدری", active: true },
  ] },
  { id: "sales", name: "فروش", extensions: [
    { id: "ext-118", extension: "118", name: "حامد اسدی (مدیر فروش)", managerLabel: "مدیر فروش", active: true },
    { id: "ext-101", extension: "101", name: "مجید کمانی", active: true },
    { id: "ext-102", extension: "102", name: "سوگند کاظمی", active: true },
    { id: "ext-103", extension: "103", name: "بهار رضایی", active: true },
    { id: "ext-106", extension: "106", name: "علی شهبابی", active: true },
    { id: "ext-113", extension: "113", name: "سعید سلیمانی", active: true },
    { id: "ext-116", extension: "116", name: "مصطفی حصاری", active: true },
    { id: "ext-117", extension: "117", name: "آرش احمدی", active: true },
  ] },
  { id: "secretariat", name: "دبیرخانه", extensions: [
    { id: "ext-104", extension: "104", name: "مریم یوسف‌پور", active: true },
  ] },
  { id: "public-relations", name: "روابط عمومی", extensions: [
    { id: "ext-110", extension: "110", name: "واحد روابط عمومی", active: true },
  ] },
  { id: "it", name: "IT", extensions: [
    { id: "ext-200", extension: "200", name: "بهزاد قوامی (مدیر IT)", managerLabel: "مدیر IT", active: true },
    { id: "ext-201", extension: "201", name: "واحد IT", active: true },
  ] },
  { id: "warehouse", name: "انبار", extensions: [
    { id: "ext-120", extension: "120", name: "داوود صادقی", active: true },
  ] },
  { id: "procurement", name: "تدارکات", extensions: [
    { id: "ext-114", extension: "114", name: "علیرضا میراحمدی", active: true },
    { id: "ext-109", extension: "109", name: "آشپزخانه", active: true },
  ] },
  { id: "hr", name: "منابع انسانی", extensions: [
    { id: "ext-112", extension: "112", name: "عبدالرضا پناه‌پوری", active: true },
    { id: "ext-119", extension: "119", name: "ساز کاظمی", active: true },
  ] },
  { id: "security", name: "حراست", extensions: [
    { id: "ext-300", extension: "300", name: "حراست", active: true },
  ] },
];

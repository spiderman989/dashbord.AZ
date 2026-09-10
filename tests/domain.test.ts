import { test } from "node:test";
import assert from "node:assert/strict";
import { phoneDirectory } from "../data/phoneDirectory.ts";
import { jalaliMonth, jalaliParts, persianDate } from "../lib/date.ts";
import { matchesSearch, safeHref, toEnglishDigits } from "../lib/utils.ts";

test("all authoritative phone records and grouping remain exact, including duplicates", () => {
  const expected = [
    ["مدیریت", ["108 — حمید سپیده", "253 — دکتر شهرور افشار", "254 — دکتر شهرور افشار"]],
    ["مالی", ["107 — مجتبی فولادی (مدیر مالی)", "105 — رضا فولادگر", "111 — امیرعلی هاشم‌زاده", "115 — سجاد حیدری"]],
    ["فروش", ["118 — حامد اسدی (مدیر فروش)", "101 — مجید کمانی", "102 — سوگند کاظمی", "103 — بهار رضایی", "106 — علی شهبابی", "113 — سعید سلیمانی", "116 — مصطفی حصاری", "117 — آرش احمدی"]],
    ["دبیرخانه", ["104 — مریم یوسف‌پور"]],
    ["روابط عمومی", ["110 — واحد روابط عمومی"]],
    ["IT", ["200 — بهزاد قوامی (مدیر IT)", "201 — واحد IT"]],
    ["انبار", ["120 — داوود صادقی"]],
    ["تدارکات", ["114 — علیرضا میراحمدی", "109 — آشپزخانه"]],
    ["منابع انسانی", ["112 — عبدالرضا پناه‌پوری", "119 — ساز کاظمی"]],
    ["حراست", ["300 — حراست"]],
  ];
  assert.deepEqual(phoneDirectory.map((department) => [department.name, department.extensions.map((entry) => `${entry.extension} — ${entry.name}`)]), expected);
  assert.equal(phoneDirectory.flatMap((department) => department.extensions).length, 25);
  assert.equal(new Set(phoneDirectory.flatMap((department) => department.extensions.map((item) => item.id))).size, 25);
});
test("Persian search matches Arabic variants, both digit sets, spaces and half spaces", () => {
  assert.ok(matchesSearch("علي", "علی محمدی"));
  assert.ok(matchesSearch("كاظمي", "ساز کاظمی"));
  assert.ok(matchesSearch("هاشم زاده", "امیرعلی هاشم‌زاده"));
  assert.ok(matchesSearch("یوسفپور", "مریم یوسف‌پور"));
  assert.ok(matchesSearch("۲۵۴", "254"));
  assert.ok(matchesSearch("٢٥٣", "253"));
  assert.equal(toEnglishDigits("۰۰۱۲۳۴۵۶۷۸"), "0012345678");
});
test("Jalali calendar handles the current date, leap year and year boundaries", () => {
  assert.deepEqual(jalaliParts(new Date("2026-09-09T12:00:00Z")), { year: 1405, month: 6, day: 18 });
  const leap = jalaliMonth(new Date("2025-03-15T12:00:00Z"));
  assert.equal(leap.days.length, 30);
  assert.equal(leap.month, 12);
  const next = jalaliMonth(new Date("2025-03-15T12:00:00Z"), 1);
  assert.equal(next.year, 1404);
  assert.equal(next.month, 1);
  assert.equal(next.days.length, 31);
  const previous = jalaliMonth(new Date("2026-03-23T12:00:00Z"), -1);
  assert.equal(previous.year, 1404);
  assert.equal(previous.month, 12);
  assert.equal(previous.days.length, 29);
  assert.equal(jalaliMonth(new Date("2026-09-09T12:00:00Z")).leading, 1);
  assert.equal(persianDate("not-a-date"), "—");
});
test("future case links allow local and HTTPS URLs and reject executable schemes", () => {
  assert.equal(safeHref("/processes/process-1"), "/processes/process-1");
  assert.equal(safeHref("https://portal.example.test/task/123"), "https://portal.example.test/task/123");
  assert.equal(safeHref("javascript:alert(1)"), undefined);
  assert.equal(safeHref("//other.example.test"), undefined);
  assert.equal(safeHref("/\\evil.example.test"), undefined);
  assert.equal(safeHref("data:text/html,test"), undefined);
  assert.equal(safeHref("http://insecure.example.test"), undefined);
});

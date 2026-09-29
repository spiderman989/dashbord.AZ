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

import { canAccessPath, canAccessSection, emptyPermissions, firstAllowedPath, sectionForPath, sections, type UserPermissions } from "../lib/permissions.ts";
import type { Employee } from "../types/index.ts";

const limited: Employee = { id: "qa-user", name: "Test", personnelCode: "", department: "", role: "EMPLOYEE" };
test("section permissions keep panels independent and require explicit admin entry", () => {
  const permissions: UserPermissions = { id: limited.id, employeeSections: ["employee.processes", "employee.crm"], adminAccess: false, adminSections: ["admin.news"] };
  assert.equal(canAccessPath(limited, permissions, "/processes/new?type=leave"), true);
  assert.equal(canAccessPath(limited, permissions, "/news/news-1"), false);
  assert.equal(canAccessPath(limited, permissions, "/admin/news/new"), false);
  permissions.adminAccess = true;
  assert.equal(canAccessPath(limited, permissions, "/admin/news/news-1"), true);
  assert.equal(canAccessPath(limited, permissions, "/news/news-1"), false);
  assert.equal(canAccessPath(limited, permissions, "/admin/courses/new"), false);
});
test("unknown routes fail closed, including nested paths and similar prefixes", () => {
  const superAdmin: Employee = { ...limited, role: "SUPER_ADMIN" };
  const permissions = emptyPermissions(superAdmin.id);
  for (const path of ["/future", "/admin/future", "/admin/news/item/extra", "/newsroom", "/processes-extra", "/admin/news/../employees", "//evil.test/news", "/news/%2e%2e", "/news/%ZZ"]) {
    assert.equal(canAccessPath(superAdmin, permissions, path), false, path);
  }
  assert.equal(sectionForPath("/admin/news/news-1/?preview=yes#title")?.id, "admin.news");
  assert.equal(sectionForPath("/news/news-1")?.id, "employee.news");
});
test("landing destinations never depend on access to a dashboard", () => {
  const permissions: UserPermissions = { ...emptyPermissions(limited.id), employeeSections: ["employee.crm", "employee.processes"], adminAccess: true, adminSections: ["admin.news"] };
  assert.equal(firstAllowedPath(limited, permissions, "employee"), "/processes");
  assert.equal(firstAllowedPath(limited, permissions, "admin"), "/admin/news");
  assert.equal(firstAllowedPath(limited, emptyPermissions(limited.id), "employee"), null);
  assert.equal(firstAllowedPath(limited, emptyPermissions(limited.id), "admin"), null);
});
test("primary admin retains all known sections but another user's record grants nothing", () => {
  const primary: Employee = { ...limited, role: "SUPER_ADMIN" };
  for (const section of sections) assert.equal(canAccessSection(primary, emptyPermissions(primary.id), section.id), true);
  assert.equal(canAccessPath(limited, { ...emptyPermissions("another-user"), employeeSections: ["employee.home"] }, "/"), false);
  assert.equal(canAccessPath({ ...limited, role: "ADMIN" }, emptyPermissions(limited.id), "/admin/employees"), false);
});

import { externalLinkError, linkTitleError } from "../lib/linkValidation.ts";
test("page link URLs accept complete HTTP(S) addresses and reject credentials, malformed ports and executable schemes", () => {
  for (const url of ["https://service.example.com:8443/dashboard?q=one#view", "http://localhost:3100/path", "http://192.168.1.5:8080/app", "http://[::1]:3000/", "https://example.com/a?q=%20"]) assert.equal(externalLinkError(url), undefined, url);
  for (const url of ["", "  ", "javascript:alert(1)", "data:text/html,test", "//example.com", "ftp://example.com", "https://user:pass@example.com", "https://user@example.com", "https://@example.com", "https://example.com:99999", "https://example.com:0", "https://example.com:port", "https://", "https://exam ple.com", "https://example.com/\npath", "https://example.com\\evil"]) assert.ok(externalLinkError(url), url);
});
test("page link titles reject whitespace and same-panel duplicates after whitespace normalization", () => {
  assert.ok(linkTitleError("  ", []));
  assert.ok(linkTitleError(" سامانه   منابع انسانی ", ["سامانه منابع انسانی"]));
  assert.ok(linkTitleError("crm", ["CRM"]));
  assert.equal(linkTitleError(" سامانه جدید ", ["سامانه دیگر"]), undefined);
});
test("custom grants use stable IDs, deny inactive or missing entries and cannot unlock primary-admin settings", () => {
  const custom = { id: "employee.custom.11111111-1111-4111-8111-111111111111" as const, panel: "employee" as const, label: "سامانه", active: true };
  const permissions = { ...emptyPermissions(limited.id), employeeSections: [custom.id] };
  assert.equal(canAccessSection(limited, permissions, custom.id), false);
  assert.equal(canAccessSection(limited, emptyPermissions(limited.id), custom.id, [custom]), false);
  assert.equal(canAccessSection(limited, permissions, custom.id, [custom]), true);
  assert.equal(canAccessSection(limited, permissions, custom.id, [{ ...custom, label: "عنوان تازه" }]), true);
  assert.equal(canAccessSection(limited, permissions, custom.id, [{ ...custom, active: false }]), false);
  const adminCustom = { ...custom, id: "admin.custom.11111111-1111-4111-8111-111111111111" as const, panel: "admin" as const };
  assert.equal(canAccessSection(limited, { ...permissions, adminSections: [adminCustom.id] }, adminCustom.id, [adminCustom]), false);
  assert.equal(canAccessSection(limited, { ...permissions, adminAccess: true, adminSections: ["admin.links"] }, "admin.links"), false);
});

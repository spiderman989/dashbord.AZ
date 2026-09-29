/* All accounts/settings below live in a fresh, isolated Chrome context. */
(async () => {
  const { chromium } = await import("playwright");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const fs = await import("node:fs/promises");
  const assert = (await import("node:assert/strict")).default;
  const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:3102";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "fa-IR", timezoneId: "Asia/Tehran" });
  const admin = await context.newPage(); const employee = await context.newPage();
  const report = { startedAt: new Date().toISOString(), base, browser: browser.version(), checks: [], audits: [], errors: [], screenshots: [] };
  const key = "azarshin.portal.v1.page-links"; const grantsKey = "azarshin.portal.v1.permissions";
  for (const page of [admin, employee]) { page.setDefaultTimeout(15000); page.on("pageerror", (e) => report.errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") report.errors.push(m.text()); }); }
  const go = (page, path) => page.goto(base + path, { waitUntil: "networkidle" });
  const field = (page, name) => page.getByLabel(new RegExp("^" + name + "(?:\\s*\\*)?$"));
  const nav = (page, label) => page.locator(".desktop-sidebar nav").getByRole("link", { name: label, exact: true });
  const check = async (name, run) => { await run(); report.checks.push(name); console.log("PASS " + name); };
  const records = () => admin.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), key);
  const grants = () => admin.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), grantsKey);
  const selected = () => admin.locator(".page-links-editor");
  async function signIn(page, username, panel = "employee") {
    await go(page, panel === "admin" ? "/admin/login" : "/login");
    await field(page, "نام کاربری").fill(username); await field(page, "رمز عبور").fill(username === "admin" ? "admin123" : username === "employee" ? "employee123" : "Demo123!");
    await page.getByRole("button", { name: "ورود", exact: true }).click();
  }
  async function manager(panel = "employee", id) {
    if (!new URL(admin.url()).pathname.endsWith("/links")) await go(admin, "/admin/links");
    await field(admin, "انتخاب پنل").selectOption(panel);
    if (id) await field(admin, "انتخاب دکمه").selectOption(id);
  }
  async function save() {
    await selected().getByRole("button", { name: "ذخیره تغییرات", exact: true }).click();
    await admin.getByText("تنظیمات دکمه با موفقیت ذخیره شد.", { exact: true }).waitFor();
    await admin.waitForFunction(() => !document.querySelector('.page-link-form button[aria-busy="true"]'));
  }
  async function target(panel, id, type, href, opening = "same-tab") {
    await manager(panel, id); await field(selected(), "نوع مقصد").selectOption(type);
    if (type === "external") await field(selected(), "آدرس مقصد خارجی").fill(href); else await field(selected(), "صفحه داخلی").selectOption(href);
    await field(selected(), "نحوه بازشدن").selectOption(opening); await save();
    await admin.waitForFunction(({ key, id, href }) => JSON.parse(localStorage.getItem(key)).some((item) => item.id === id && item.destination.href === href), { key, id, href });
  }
  async function create(panel, label, type, href, before = "") {
    await manager(panel); await admin.getByRole("button", { name: "افزودن دکمه جدید", exact: true }).click();
    const dialog = admin.getByRole("dialog", { name: "افزودن دکمه جدید", exact: true });
    await field(dialog, "عنوان دکمه").fill(label); await field(dialog, "آیکون").selectOption("users");
    await field(dialog, "نوع مقصد").selectOption(type);
    if (type === "external") await field(dialog, "آدرس مقصد خارجی").fill(href); else await field(dialog, "صفحه داخلی").selectOption(href);
    await field(dialog, "جایگاه در منو").selectOption(before);
    await dialog.getByRole("button", { name: "ذخیره", exact: true }).click(); await dialog.waitFor({ state: "hidden" });
    return (await records()).find((item) => item.kind === "custom" && item.panel === panel && item.label === label).id;
  }
  async function openGrants() {
    await go(admin, "/admin/employees"); await admin.getByRole("button", { name: "سطح دسترسی لینک آزمایشی", exact: true }).click();
    await admin.getByRole("dialog").getByRole("checkbox", { name: "میز کار", exact: true }).waitFor();
    return admin.getByRole("dialog");
  }
  async function saveGrants(dialog) { await dialog.getByRole("button", { name: "ذخیره تغییرات", exact: true }).click(); await dialog.waitFor({ state: "hidden" }); }
  async function audit(label) { const result = await new AxeBuilder({ page: admin }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); report.audits.push({ label, violations: result.violations }); assert.deepEqual(result.violations, [], label); }
  async function screenshot(label) { const path = `test-results/page-links-${label}.png`; await admin.screenshot({ path, fullPage: !label.includes("mobile") }); report.screenshots.push(path); }
  async function viewport(width, height = 820) {
    await admin.setViewportSize({ width, height });
    // Existing sidebar margin transitions need to settle before measuring responsive layout.
    await admin.evaluate(async () => { await Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))); });
  }
  let externalId, internalId, adminId;
  const external = "https://workflow.example.test:8443/dashboard?view=mine";
  const hr = "http://hr.intranet.test:8080/dashboard?view=team";
  await fs.mkdir("test-results", { recursive: true });
  try {
    if (process.argv.includes("--delete-dialog")) {
      await check("final deletion controls and RTL dialog preserve direct settings access after self-removal", async () => {
        await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin"); await manager("admin");
        assert.equal(await admin.getByRole("button", { name: /^حذف / }).count(), 10);
        await admin.locator("main").focus(); await admin.evaluate(() => window.scrollTo(0, 0)); await screenshot("delete-final-desktop");
        await viewport(390); await admin.getByRole("button", { name: "حذف مدیریت صفحات و لینک‌ها", exact: true }).click();
        const dialog = admin.getByRole("dialog", { name: "حذف دکمه", exact: true });
        assert.ok((await dialog.locator(".confirm-description").textContent()).includes("\u2066/admin/links\u2069"));
        assert.equal(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        await screenshot("delete-final-mobile-dialog"); await audit("final mobile builtin deletion");
        await dialog.getByRole("button", { name: "حذف", exact: true }).click(); await dialog.waitFor({ state: "hidden" });
        await admin.reload({ waitUntil: "networkidle" }); await manager("admin");
        await admin.locator(".page-links-manager").waitFor();
        assert.equal(await admin.getByRole("button", { name: "حذف مدیریت صفحات و لینک‌ها", exact: true }).count(), 0);
        assert.equal(await admin.getByRole("button", { name: /^حذف / }).count(), 9);
        assert.equal(await nav(admin, "مدیریت صفحات و لینک‌ها").count(), 0);
      });
      assert.deepEqual(report.errors, []); return;
    }
    if (process.argv.includes("--notifications")) {
      await check("notification entries share destinations and read-all preserves hidden notifications", async () => {
        await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
        await target("employee", "employee.news", "internal", "/courses");
        await target("employee", "employee.processes", "external", external);
        await signIn(employee, "employee"); await employee.waitForURL(base + "/");
        await employee.evaluate(() => {
          const id = localStorage.getItem("azarshin.demo.employee");
          localStorage.setItem("azarshin.portal.v1.permissions", JSON.stringify([{ id, employeeSections: ["employee.home", "employee.news", "employee.processes"], adminAccess: false, adminSections: [] }]));
          localStorage.setItem("azarshin.portal.v1.notifications", JSON.stringify([
            { id: "visible", title: "اعلان ورودی فرآیند", description: "آزمون", date: "2026-09-27", read: false, href: "/processes" },
            { id: "hidden", title: "اعلان ورودی خبر", description: "آزمون", date: "2026-09-27", read: false, href: "/news" },
            { id: "detail", title: "اعلان خبر مشخص", description: "آزمون", date: "2026-09-27", read: false, href: "/news/news-1" },
          ]));
          window.dispatchEvent(new Event("portal:permissions")); window.dispatchEvent(new Event("portal:notifications"));
        });
        await employee.getByRole("button", { name: "اعلان‌ها؛ ۲ خوانده‌نشده", exact: true }).click();
        const notices = employee.getByRole("dialog", { name: "اعلان‌های شما", exact: true });
        assert.equal(await notices.getByText("اعلان ورودی خبر", { exact: true }).count(), 0);
        assert.equal(await notices.getByRole("link").filter({ hasText: "اعلان ورودی فرآیند" }).getAttribute("href"), external);
        assert.equal(await notices.getByRole("link").filter({ hasText: "اعلان خبر مشخص" }).getAttribute("href"), "/news/news-1");
        await notices.getByRole("button", { name: "خواندن همه اعلان‌ها", exact: true }).click();
        await employee.waitForFunction(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.notifications")).filter((item) => item.read).length === 2);
        assert.equal(await employee.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.notifications")).find((item) => item.id === "hidden").read), false);
      });
      assert.deepEqual(report.errors, []); return;
    }
    if (process.argv.includes("--external-tab")) {
      await check("external new-tab browser navigation and resetting opening mode to same-tab", async () => {
        await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
        const url = "https://service.example.test:8443/dashboard?tab=one";
        await context.route(url, (route) => route.fulfill({ contentType: "text/html", body: "<title>External tab fixture</title>" }));
        await target("admin", "admin.processes", "external", url, "new-tab");
        const anchor = nav(admin, "فرآیندها"); assert.equal(await anchor.getAttribute("target"), "_blank"); assert.equal(await anchor.getAttribute("rel"), "noopener noreferrer");
        const opened = context.waitForEvent("page"); await anchor.click(); const tab = await opened; await tab.waitForURL(url); assert.equal(await tab.evaluate(() => window.opener), null); assert.equal(new URL(admin.url()).pathname, "/admin/links"); await tab.close();
        await selected().getByRole("button", { name: "بازگرداندن مقصد پیش‌فرض", exact: true }).click(); await admin.getByRole("dialog").getByRole("button", { name: "بازگرداندن", exact: true }).click();
        await admin.waitForFunction(() => document.querySelector('.desktop-sidebar nav a[href="/admin/processes"]'));
        assert.equal(await nav(admin, "فرآیندها").getAttribute("target"), null);
        assert.equal((await records()).length, 0);
      });
      assert.deepEqual(report.errors, []); return;
    }
    if (process.argv.includes("--inspect")) {
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
      await create("employee", "سامانه همکاران", "external", hr, "employee.crm");
      await viewport(360);
      console.log(JSON.stringify(await admin.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, overflow: [...document.querySelectorAll("body *")].map((el) => ({ tag: el.tagName, className: el.className, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, position: getComputedStyle(el).position })).filter((r) => r.width && (r.right > innerWidth + 1 || r.left < -1)).slice(0, 30) })), null, 2));
      await admin.screenshot({ path: "test-results/page-links-inspect-mobile.png" }); return;
    }
    await check("full real menu inventory in both panels; settings route stays fixed", async () => {
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
      const adminLabels = await admin.locator(".desktop-sidebar nav a").allTextContents();
      await signIn(employee, "admin"); await employee.waitForURL(base + "/");
      const employeeLabels = await employee.locator(".desktop-sidebar nav a").allTextContents();
      await manager();
      assert.deepEqual((await field(admin, "انتخاب دکمه").locator("option").allTextContents()).slice(1), employeeLabels);
      assert.equal(await admin.getByRole("button", { name: /^حذف / }).count(), employeeLabels.length);
      await manager("admin");
      assert.deepEqual((await field(admin, "انتخاب دکمه").locator("option").allTextContents()).slice(1).map((s) => s.replace(" — مقصد ثابت", "")), adminLabels);
      assert.equal(await admin.getByRole("button", { name: /^حذف / }).count(), adminLabels.length);
      await field(admin, "انتخاب دکمه").selectOption("admin.links");
      assert.equal(await selected().getByRole("button").count(), 0);
    });
    await check("independent builtin destinations, exact-entry shortcuts, direct internal routes without chains", async () => {
      await target("employee", "employee.processes", "external", external);
      await target("employee", "employee.news", "internal", "/courses", "new-tab");
      await target("employee", "employee.courses", "external", "https://training.example.test/learn");
      await target("admin", "admin.processes", "external", "http://localhost:8443/admin/workflow", "new-tab");
      await target("admin", "admin.news", "internal", "/admin/gallery");
      await nav(employee, "فرآیندها").waitFor(); assert.equal(await nav(employee, "فرآیندها").getAttribute("href"), external);
      assert.equal(await employee.locator(".hero-link").getAttribute("href"), external);
      assert.equal(await nav(employee, "اخبار").getAttribute("href"), "/courses");
      assert.equal(await employee.locator(".dashboard-news .section-heading a").getAttribute("href"), "/courses");
      assert.ok(await employee.locator('a[href^="/news/news-"]').count());
      assert.equal(await nav(admin, "فرآیندها").getAttribute("href"), "http://localhost:8443/admin/workflow");
      assert.equal(await nav(admin, "اخبار").getAttribute("href"), "/admin/gallery");
      assert.equal(await nav(employee, "شماره‌های داخلی").getAttribute("href"), "/phone-directory");
    });
    await check("browser navigation uses same tab or safe new tab, including ports and paths", async () => {
      await context.route(external, (route) => route.fulfill({ contentType: "text/html", body: "<title>External destination</title><p>Destination fixture</p>" }));
      await nav(employee, "فرآیندها").click(); await employee.waitForURL(external);
      assert.equal(await employee.title(), "External destination"); await go(employee, "/");
      const news = nav(employee, "اخبار"); assert.equal(await news.getAttribute("target"), "_blank"); assert.equal(await news.getAttribute("rel"), "noopener noreferrer");
      const opened = context.waitForEvent("page"); await news.click(); const newPage = await opened; await newPage.waitForURL(base + "/courses"); assert.equal(await newPage.evaluate(() => window.opener), null); await newPage.close();
    });
    await check("create custom items in both panels with stable IDs, icon and relative position", async () => {
      externalId = await create("employee", "سامانه منابع انسانی", "external", hr, "employee.crm");
      internalId = await create("employee", "میان‌بر آموزش", "internal", "/courses");
      adminId = await create("admin", "سامانه منابع انسانی", "external", "https://admin.example.test/tool");
      assert.match(externalId, /^employee\.custom\.[0-9a-f-]{36}$/); assert.notEqual(externalId, adminId);
      const labels = await employee.locator(".desktop-sidebar nav a").allTextContents(); assert.equal(labels.indexOf("سامانه منابع انسانی") + 1, labels.indexOf("CRM"));
      await manager("employee"); assert.ok(await field(admin, "انتخاب دکمه").locator(`option[value="${externalId}"]`).count());
      assert.equal(await admin.getByRole("button", { name: "حذف فرآیندها", exact: true }).count(), 1);
      await manager("employee", externalId); assert.equal(await field(selected(), "پنل مقصد").isDisabled(), true);
      assert.equal(await selected().getByRole("button", { name: "بازگرداندن مقصد پیش‌فرض", exact: true }).count(), 0);
    });
    await check("custom entries are denied by default; permission editor includes correct panel entries", async () => {
      await signIn(employee, "employee"); await employee.waitForURL(base + "/"); assert.equal(await nav(employee, "سامانه منابع انسانی").count(), 0);
      await go(admin, "/admin/employees"); await admin.getByRole("button", { name: "افزودن کارمند", exact: true }).click();
      const editor = admin.getByRole("dialog");
      for (const [label, value] of [["نام", "لینک"], ["نام خانوادگی", "آزمایشی"], ["پست / سمت سازمانی", "آزمون"], ["نام کاربری", "qa.links"], ["رمز عبور", "Demo123!"]]) await field(editor, label).fill(value);
      await editor.getByRole("button", { name: "ذخیره", exact: true }).click(); await editor.waitFor({ state: "hidden" });
      const dialog = await openGrants();
      for (const label of ["میز کار", "فرآیندها", "اخبار"]) await dialog.getByRole("checkbox", { name: label, exact: true }).check();
      assert.equal(await dialog.getByRole("checkbox", { name: "سامانه منابع انسانی", exact: true }).isChecked(), false);
      assert.equal(await dialog.getByRole("checkbox", { name: "میان‌بر آموزش", exact: true }).isChecked(), false);
      await saveGrants(dialog); await signIn(employee, "qa.links"); await employee.waitForURL(base + "/");
      assert.equal(await nav(employee, "سامانه منابع انسانی").count(), 0); assert.equal(await nav(employee, "اخبار").count(), 0);
      assert.equal(await employee.locator('.dashboard-news .section-heading a').count(), 0);
    });
    await check("grant updates live; both source and internal destination permissions are required", async () => {
      let dialog = await openGrants();
      for (const label of ["سامانه منابع انسانی", "میان‌بر آموزش"]) await dialog.getByRole("checkbox", { name: label, exact: true }).check();
      await saveGrants(dialog); await nav(employee, "سامانه منابع انسانی").waitFor(); assert.equal(await nav(employee, "میان‌بر آموزش").count(), 0);
      dialog = await openGrants(); await dialog.getByRole("checkbox", { name: "آموزش", exact: true }).check(); await saveGrants(dialog);
      await nav(employee, "میان‌بر آموزش").waitFor(); await nav(employee, "اخبار").waitFor();
      const before = await grants(); await target("employee", internalId, "internal", "/tickets");
      await nav(employee, "میان‌بر آموزش").waitFor({ state: "hidden" }); assert.deepEqual(await grants(), before);
      await target("employee", internalId, "internal", "/courses"); await nav(employee, "میان‌بر آموزش").waitFor();
      await go(employee, "/tickets"); await employee.getByRole("heading", { name: "شما به این بخش دسترسی ندارید", exact: true }).waitFor(); await go(employee, "/");
    });
    await check("rename, icon and position edits preserve ID and grants; disable/reactivate preserves settings", async () => {
      const before = await grants(); await manager("employee", externalId);
      await field(selected(), "عنوان دکمه").fill("سامانه همکاران"); await field(selected(), "آیکون").selectOption("link"); await field(selected(), "جایگاه در منو").selectOption("employee.processes"); await save();
      await nav(employee, "سامانه همکاران").waitFor(); assert.deepEqual(await grants(), before);
      assert.equal((await records()).find((r) => r.id === externalId).label, "سامانه همکاران");
      await field(selected(), "وضعیت").selectOption("inactive"); await save(); await nav(employee, "سامانه همکاران").waitFor({ state: "hidden" });
      let dialog = await openGrants(); const option = dialog.getByRole("checkbox", { name: "سامانه همکاران — غیرفعال در منو", exact: true }); assert.equal(await option.isChecked(), true); await dialog.getByRole("button", { name: "انصراف", exact: true }).click();
      await manager("employee", externalId); await field(selected(), "وضعیت").selectOption("active"); await save(); await nav(employee, "سامانه همکاران").waitFor(); assert.deepEqual(await grants(), before);
    });
    await check("draft cancellation and dirty warnings never persist panel/item/modal changes", async () => {
      const before = await records(); await manager("employee", externalId); await field(selected(), "عنوان دکمه").fill("ذخیره نشود");
      await field(admin, "انتخاب پنل").selectOption("admin"); await admin.getByRole("dialog", { name: "تغییرات ذخیره‌نشده" }).getByRole("button", { name: "ادامه ویرایش" }).click(); assert.equal(await field(admin, "انتخاب پنل").inputValue(), "employee");
      await field(admin, "انتخاب دکمه").selectOption("employee.crm"); await admin.getByRole("button", { name: "صرف‌نظر از تغییرات", exact: true }).click();
      assert.deepEqual(await records(), before);
      await admin.getByRole("button", { name: "افزودن دکمه جدید", exact: true }).click(); const dialog = admin.getByRole("dialog", { name: "افزودن دکمه جدید", exact: true });
      await field(dialog, "عنوان دکمه").fill("لغو ساخت"); await admin.keyboard.press("Escape"); await admin.getByRole("button", { name: "صرف‌نظر از تغییرات", exact: true }).click(); await dialog.waitFor({ state: "hidden" }); assert.deepEqual(await records(), before);
      await manager("admin"); assert.equal(await field(admin, "انتخاب دکمه").inputValue(), "");
    });
    await check("Persian inline validation rejects duplicate titles, unsafe URLs and invalid ports", async () => {
      await manager("employee", externalId); await field(selected(), "عنوان دکمه").fill("  میز   کار  "); await selected().getByRole("button", { name: "ذخیره تغییرات", exact: true }).click(); await selected().getByText("دکمه‌ای با این عنوان در همین پنل وجود دارد.", { exact: true }).waitFor();
      await field(selected(), "عنوان دکمه").fill("سامانه همکاران");
      for (const url of ["", "javascript:alert(1)", "data:text/html,x", "https://user:pass@example.test", "https://example.test:99999"]) {
        await field(selected(), "آدرس مقصد خارجی").fill(url); await selected().getByRole("button", { name: "ذخیره تغییرات", exact: true }).click(); assert.equal(await field(selected(), "آدرس مقصد خارجی").getAttribute("aria-invalid"), "true");
      }
      await selected().getByRole("button", { name: "انصراف", exact: true }).click(); await admin.getByRole("button", { name: "صرف‌نظر از تغییرات", exact: true }).click();
      assert.equal((await records()).find((r) => r.id === externalId).destination.href, hr);
    });
    await check("failed persistence shows error and does not apply the new destination", async () => {
      await manager("employee", externalId); const before = await records();
      await admin.evaluate((key) => { window.originalStorageWrite = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException("Quota", "QuotaExceededError"); return window.originalStorageWrite.call(this, k, v); }; }, key);
      await field(selected(), "آدرس مقصد خارجی").fill("https://should-not-save.example.test/"); await selected().getByRole("button", { name: "ذخیره تغییرات", exact: true }).click(); await selected().locator(".form-error").waitFor();
      assert.deepEqual(await records(), before); assert.equal(await nav(employee, "سامانه همکاران").getAttribute("href"), hr);
      await admin.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; });
      await selected().getByRole("button", { name: "انصراف", exact: true }).click(); await admin.getByRole("button", { name: "صرف‌نظر از تغییرات", exact: true }).click();
    });
    await check("reload persistence and loading gate prevent a flash of old builtin destinations", async () => {
      const before = await records(); await admin.reload({ waitUntil: "networkidle" }); assert.deepEqual(await records(), before);
      await employee.addInitScript(() => { window.wrongDestinations = []; new MutationObserver(() => { for (const a of document.querySelectorAll(".desktop-sidebar nav a")) if (a.textContent === "فرآیندها" && a.getAttribute("href") === "/processes") window.wrongDestinations.push(a.href); }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] }); });
      await employee.reload({ waitUntil: "networkidle" }); await nav(employee, "فرآیندها").waitFor(); assert.equal(await nav(employee, "فرآیندها").getAttribute("href"), external); assert.deepEqual(await employee.evaluate(() => window.wrongDestinations), []);
    });
    await check("desktop/mobile table and editor layout, LTR URL and accessibility", async () => {
      await manager("employee", externalId); assert.equal(await field(selected(), "آدرس مقصد خارجی").getAttribute("dir"), "ltr"); await screenshot("desktop"); await audit("desktop editor/table");
      for (const width of [360, 390, 768]) { await viewport(width); assert.equal(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `overflow ${width}`); }
      await viewport(390); await screenshot("mobile"); await audit("mobile editor/table");
      await admin.getByRole("button", { name: "افزودن دکمه جدید", exact: true }).click(); await screenshot("mobile-create"); await audit("mobile create modal"); await admin.keyboard.press("Escape"); await viewport(1440, 1000);
    });
    await check("delete confirmation removes only custom ID and its grants; builtin reset is independent", async () => {
      const before = await grants(); const otherBefore = (await records()).filter((r) => r.id !== externalId);
      await admin.getByRole("button", { name: "حذف سامانه همکاران", exact: true }).click(); await admin.getByRole("dialog").getByRole("button", { name: "انصراف", exact: true }).click(); assert.ok((await records()).some((r) => r.id === externalId));
      await admin.getByRole("button", { name: "حذف سامانه همکاران", exact: true }).click(); await admin.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await nav(employee, "سامانه همکاران").waitFor({ state: "hidden" });
      assert.deepEqual(await records(), otherBefore); assert.deepEqual(await grants(), before.map((r) => ({ ...r, employeeSections: r.employeeSections.filter((id) => id !== externalId), adminSections: r.adminSections.filter((id) => id !== externalId) })));
      await manager("employee", "employee.processes"); await selected().getByRole("button", { name: "بازگرداندن مقصد پیش‌فرض", exact: true }).click(); await admin.getByRole("dialog").getByRole("button", { name: "بازگرداندن", exact: true }).click();
      await employee.waitForFunction(() => [...document.querySelectorAll(".desktop-sidebar nav a")].some((a) => a.textContent === "فرآیندها" && a.getAttribute("href") === "/processes")); assert.ok((await records()).some((r) => r.id === "admin.processes"));
    });
    await check("admin entry remains separate, custom grants do not grant settings access", async () => {
      let dialog = await openGrants(); await dialog.getByRole("tab", { name: "پنل مدیریت", exact: true }).click(); await dialog.getByRole("checkbox", { name: "اجازه ورود به پنل مدیریت", exact: true }).check(); await dialog.getByRole("checkbox", { name: "سامانه منابع انسانی", exact: true }).check(); await dialog.getByRole("checkbox", { name: "اجازه ورود به پنل مدیریت", exact: true }).uncheck(); await saveGrants(dialog);
      await signIn(admin, "qa.links", "admin"); await admin.getByRole("alert").filter({ hasText: "اجازه ورود به پنل مدیریت را ندارید" }).waitFor();
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin"); dialog = await openGrants(); await dialog.getByRole("tab", { name: "پنل مدیریت", exact: true }).click(); await dialog.getByRole("checkbox", { name: "اجازه ورود به پنل مدیریت", exact: true }).check(); await saveGrants(dialog);
      await signIn(admin, "qa.links", "admin"); await admin.waitForURL(base + "/admin"); await nav(admin, "سامانه منابع انسانی").waitFor(); assert.equal(await nav(admin, "مدیریت صفحات و لینک‌ها").count(), 0);
      await go(admin, "/admin/links"); assert.equal(await admin.locator(".page-links-manager").count(), 0);
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
    });
    await check("malformed stored records fail safely, fixed settings destination survives and bad JSON restores builtin defaults", async () => {
      const original = await records();
      await admin.evaluate(({ key, original, internalId }) => {
        const bad = original.map((r) => r.id === internalId ? { ...r, destination: { type: "external", href: "javascript:alert(1)" } } : r);
        bad.push({ id: "employee.processes", kind: "builtin", panel: "employee", destination: { type: "external", href: "https://user:pass@example.test" }, opening: "same-tab" });
        bad.push({ id: "admin.links", kind: "builtin", panel: "admin", destination: { type: "external", href: "https://evil.example.test" }, opening: "same-tab" });
        localStorage.setItem(key, JSON.stringify(bad)); window.dispatchEvent(new Event("portal:page-links"));
      }, { key, original, internalId });
      await nav(employee, "میان‌بر آموزش").waitFor({ state: "hidden" }); assert.equal(await nav(employee, "فرآیندها").getAttribute("href"), "/processes");
      assert.equal(await nav(admin, "مدیریت صفحات و لینک‌ها").getAttribute("href"), "/admin/links");
      await admin.evaluate((key) => { localStorage.setItem(key, "{bad JSON"); window.dispatchEvent(new Event("portal:page-links")); }, key);
      await admin.reload({ waitUntil: "networkidle" }); assert.equal(await nav(admin, "اخبار").getAttribute("href"), "/admin/news"); await manager("admin", "admin.links");
      await admin.evaluate(({ key, original }) => { localStorage.setItem(key, JSON.stringify(original)); window.dispatchEvent(new Event("portal:page-links")); }, { key, original });
    });
    await check("builtin deletion supports cancel, storage failure/retry, live menus and reload without changing grants or content", async () => {
      await manager("employee"); await go(employee, "/");
      const before = await records(); const beforeGrants = await grants();
      const content = await admin.evaluate(() => localStorage.getItem("azarshin.portal.v1.news"));
      await nav(employee, "اخبار").waitFor();
      const remove = () => admin.getByRole("button", { name: "حذف اخبار", exact: true }).click();
      await remove(); await admin.getByRole("dialog").getByRole("button", { name: "انصراف", exact: true }).click();
      assert.deepEqual(await records(), before); await nav(employee, "اخبار").waitFor();
      await remove();
      await admin.evaluate((key) => { window.originalStorageWrite = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException("Quota", "QuotaExceededError"); return window.originalStorageWrite.call(this, k, v); }; }, key);
      try {
        await admin.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click();
        await admin.getByRole("dialog").getByRole("alert").waitFor();
        assert.deepEqual(await records(), before); await nav(employee, "اخبار").waitFor();
      } finally { await admin.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; }); }
      await admin.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click();
      await admin.getByRole("dialog").waitFor({ state: "hidden" });
      await nav(employee, "اخبار").waitFor({ state: "hidden" });
      assert.equal(await admin.getByRole("button", { name: "حذف اخبار", exact: true }).count(), 0);
      assert.equal(await field(admin, "انتخاب دکمه").locator('option[value="employee.news"]').count(), 0);
      assert.equal(await employee.locator(".dashboard-news .section-heading a").count(), 0);
      assert.deepEqual((await records()).filter((r) => r.id !== "employee.news"), before.filter((r) => r.id !== "employee.news"));
      assert.deepEqual(await grants(), beforeGrants);
      assert.equal(await admin.evaluate(() => localStorage.getItem("azarshin.portal.v1.news")), content);
      await employee.reload({ waitUntil: "networkidle" }); assert.equal(await nav(employee, "اخبار").count(), 0);
      await go(employee, "/news"); await employee.getByRole("heading", { name: "تازه‌های آذرشین", exact: true }).waitFor();
      await admin.reload({ waitUntil: "networkidle" }); assert.equal(await field(admin, "انتخاب دکمه").locator('option[value="employee.news"]').count(), 0);
      await manager("admin"); assert.equal(await admin.getByRole("button", { name: "حذف اخبار", exact: true }).count(), 1);
    });
    await check("mobile builtin delete dialog is accessible and every remaining row can be deleted, including settings itself", async () => {
      await manager("admin"); await viewport(390);
      await screenshot("delete-mobile-table");
      await admin.getByRole("button", { name: "حذف مدیریت صفحات و لینک‌ها", exact: true }).click();
      await screenshot("delete-mobile-dialog"); await audit("mobile builtin deletion");
      assert.equal(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await admin.keyboard.press("Escape"); await viewport(1440, 1000);
      await admin.locator("main").focus(); await admin.evaluate(() => window.scrollTo(0, 0)); await screenshot("delete-desktop-table");
      const beforeGrants = await grants();
      for (const panel of ["employee", "admin"]) {
        await manager(panel);
        const names = await admin.getByRole("button", { name: /^حذف / }).evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
        for (const name of names) {
          await admin.getByRole("button", { name, exact: true }).click();
          await admin.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click();
          await admin.getByRole("dialog").waitFor({ state: "hidden" });
          assert.equal(await admin.getByRole("button", { name, exact: true }).count(), 0);
        }
        assert.equal(await field(admin, "انتخاب دکمه").locator("option").count(), 1);
        assert.equal(await admin.locator("tbody tr").count(), 0);
      }
      assert.equal(await nav(admin, "مدیریت صفحات و لینک‌ها").count(), 0);
      assert.ok((await records()).some((r) => r.id === "admin.links" && r.deleted === true));
      assert.deepEqual(await grants(), beforeGrants.map((record) => ({ ...record, employeeSections: record.employeeSections.filter((id) => !id.includes(".custom.")), adminSections: record.adminSections.filter((id) => !id.includes(".custom.")) })));
      await admin.reload({ waitUntil: "networkidle" }); await admin.locator(".page-links-manager").waitFor();
      for (const panel of ["employee", "admin"]) { await manager(panel); assert.equal(await field(admin, "انتخاب دکمه").locator("option").count(), 1); }
      assert.equal(await admin.locator(".desktop-sidebar nav a").count(), 0);
      await go(admin, "/admin/news"); await admin.locator("main h1").waitFor();
      await go(admin, "/admin/links"); await admin.locator(".page-links-manager").waitFor();
    });
    await check("custom replacements can reuse deleted builtin titles and survive stored record reordering", async () => {
      const id = await create("employee", "اخبار", "internal", "/news");
      await admin.evaluate(({ key, id }) => {
        const entries = JSON.parse(localStorage.getItem(key));
        localStorage.setItem(key, JSON.stringify([entries.find((r) => r.id === id), ...entries.filter((r) => r.id !== id)]));
        window.dispatchEvent(new Event("portal:page-links"));
      }, { key, id });
      await admin.reload({ waitUntil: "networkidle" }); await manager("employee", id);
      assert.equal(await field(selected(), "عنوان دکمه").inputValue(), "اخبار");
      assert.equal(await field(admin, "انتخاب دکمه").locator("option").count(), 2);
      assert.equal(await field(admin, "انتخاب دکمه").locator('option[value="employee.news"]').count(), 0);
    });
    assert.deepEqual(report.errors, [], "no runtime/console errors");
  } catch (error) { report.failure = String(error.stack || error); console.error(report.failure); await admin.screenshot({ path: "test-results/page-links-failure.png", fullPage: true }); process.exitCode = 1; }
  finally { report.finishedAt = new Date().toISOString(); await fs.writeFile(process.argv.includes("--delete-dialog") ? "test-results/page-links-delete-final-report.json" : process.argv.includes("--inspect") ? "test-results/page-links-inspect.json" : process.argv.includes("--notifications") ? "test-results/page-links-notifications-report.json" : process.argv.includes("--external-tab") ? "test-results/page-links-external-tab-report.json" : "test-results/page-links-report.json", JSON.stringify(report, null, 2)); await browser.close(); }
})();

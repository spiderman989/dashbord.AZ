/* End-to-end checks against a running production server; no external services. */
(async () => {
  const { chromium } = await import("playwright");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const fs = await import("node:fs/promises");
  const assert = (await import("node:assert/strict")).default;
  const base = process.env.PORTAL_TEST_URL || "http://localhost:3000";
  const inspection = process.argv[2] === "--inspect";
  await fs.mkdir("test-results", { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "fa-IR", timezoneId: "Asia/Tehran", permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  const errors = [];
  const a11y = [];
  const report = { environment: { browser: `Chrome ${browser.version()}`, node: process.version, base, startedAt: new Date().toISOString() }, checks: [], routes: [], audits: [], overflow: [], images: [], errors, a11y };
  function watchErrors(target) {
    target.on("pageerror", (error) => errors.push(error.message));
    target.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  }
  watchErrors(page);
  async function go(path) { await page.goto(base + path, { waitUntil: "networkidle" }); await page.locator("h1").first().waitFor(); }
  // Playwright label text includes the visually displayed required marker.
  const field = (name) => page.getByLabel(new RegExp("^" + name + "(?:\\s*\\*)?$"));
  async function check(name, fn) { await fn(); report.checks.push(name); console.log(`PASS ${name}`); }
  async function toast(text) { await page.getByText(text, { exact: true }).last().waitFor(); }
  async function audit(label) { const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); report.audits.push(label); if (result.violations.length) a11y.push({ label, violations: result.violations.map((item) => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary, html: node.html.slice(0, 300) })) })) }); }
  async function layout(path, width) {
    await page.setViewportSize({ width, height: 1000 }); await go(path);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(async (image) => {
        image.loading = "eager";
        try { await image.decode(); } catch { /* Broken images are recorded below. */ }
      }));
    });
    const result = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, rtl: document.documentElement.dir, lang: document.documentElement.lang, brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.src), overflowNodes: [...document.querySelectorAll("body *")].filter((element) => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return rect.width && style.position !== "absolute" && rect.right > document.documentElement.clientWidth + 2 && !element.closest(".reference-image, .brand-logo, .skip-link, dialog:not([open])"); }).slice(0, 8).map((element) => ({ tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right })) }));
    report.routes.push({ path, width, heading: await page.locator("h1").first().innerText(), rtl: result.rtl });
    if (result.scroll > result.width + 1) report.overflow.push({ path, width, ...result });
    if (result.brokenImages.length) report.images.push({ path, width, images: result.brokenImages });
    assert.equal(result.rtl, "rtl"); assert.equal(result.lang, "fa");
  }
  try {
    if (inspection) {
      await page.setViewportSize({ width: Number(process.argv[4]) || 1440, height: 1000 });
      await go("/login");
      await page.evaluate(() => {
        localStorage.setItem("azarshin.demo.employee", "employee-1001");
        localStorage.setItem("azarshin.demo.admin", "admin-1");
      });
      await go(process.argv[3] || "/login");
      report.inspection = {
        path: new URL(page.url()).pathname,
        layout: await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          nodes: [...document.querySelectorAll("body *")].filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1) && !element.closest(".reference-image, .brand-logo, .skip-link, dialog:not([open])");
          }).slice(0, 15).map((element) => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 100), left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right })),
        })),
        snapshot: await page.locator("body").ariaSnapshot(),
        labels: await page.locator("label").allTextContents(),
        exactPersonnelLabelMatches: await page.getByLabel("کد پرسنلی", { exact: true }).count(),
        partialPersonnelLabelMatches: await page.getByLabel("کد پرسنلی").count(),
      };
      await audit("inspection");
      await page.screenshot({ path: "test-results/inspection.png", fullPage: true });
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    await check("employee login, validation, Persian digits and protected routes", async () => {
      await go("/"); assert.equal(new URL(page.url()).pathname, "/login");
      await audit("employee login desktop");
      await field("کد پرسنلی").fill("1001"); await field("کد ملی").fill("0012345679");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نادرست" }).waitFor();
      await field("کد پرسنلی").fill("۱۰۰۱"); await field("کد ملی").fill("۰۰۱۲۳۴۵۶۷۸"); await page.getByRole("button", { name: "ورود", exact: true }).click();
      await page.waitForURL(base + "/"); await page.getByRole("heading", { name: "میز کار شما" }).waitFor();
      assert.ok(await page.locator(".topbar-user").innerText().then((text) => text.includes("علی محمدی")));
      await page.screenshot({ path: "test-results/portal-desktop.png", fullPage: true }); await audit("employee dashboard desktop");
    });
    await check("directory authoritative records, Persian search and copying", async () => {
      await go("/phone-directory"); assert.equal(await page.locator(".extension-number").count(), 25);
      assert.deepEqual(await page.locator(".department-heading h2").allTextContents(), ["مدیریت", "مالی", "فروش", "دبیرخانه", "روابط عمومی", "IT", "انبار", "تدارکات", "منابع انسانی", "حراست"]);
      assert.equal(await page.getByText("دکتر شهرور افشار", { exact: true }).count(), 2);
      const afsharRows = page.locator(".department-card li").filter({ hasText: "دکتر شهرور افشار" });
      assert.deepEqual(await afsharRows.locator(".extension-number").allTextContents(), ["253", "254"]);
      await page.getByRole("searchbox").fill("۲۵۴"); assert.equal(await page.locator(".extension-number").count(), 1); assert.equal(await page.locator(".extension-number").innerText(), "254");
      await page.getByRole("button", { name: "کپی داخلی 254" }).click(); await toast("داخلی ۲۵۴ کپی شد.");
      await page.getByRole("searchbox").fill("كاظمي"); assert.equal(await page.locator(".extension-number").count(), 2);
      await page.getByRole("searchbox").fill("تدارکات"); assert.deepEqual(await page.locator(".extension-number").allTextContents(), ["114", "109"]);
      await page.getByRole("searchbox").fill("نامناموجود"); await page.getByRole("heading", { name: "داخلی مورد نظر پیدا نشد." }).waitFor();
      await page.getByRole("button", { name: "نمایش همه داخلی‌ها" }).click(); assert.equal(await page.locator(".extension-number").count(), 25);
      await audit("directory desktop");
    });
    await check("process search, filtering, details and request creation", async () => {
      await go("/processes"); await page.getByRole("combobox", { name: "همه وضعیت‌ها" }).selectOption("action_required"); assert.equal(await page.locator(".data-table tbody tr").count(), 1);
      await page.getByRole("link", { name: /درخواست خرید تجهیزات اداری/ }).first().click(); await page.getByRole("button", { name: "مشاهده فرآیند", exact: true }).click(); await page.getByRole("dialog").waitFor(); await page.keyboard.press("Escape");
      await go("/processes/new?type=leave"); await field("عنوان درخواست").fill("درخواست مرخصی آزمایشی QA"); await field("شرح درخواست").fill("درخواست نمونه برای بررسی ثبت و پیگیری مرخصی در نسخه نمایشی."); await page.getByRole("button", { name: "ثبت درخواست", exact: true }).click();
      await page.waitForURL(/\/processes\/processes-/); await page.getByRole("heading", { name: "درخواست مرخصی آزمایشی QA" }).waitFor(); await page.reload({ waitUntil: "networkidle" }); await page.getByRole("heading", { name: "درخواست مرخصی آزمایشی QA" }).waitFor();
    });
    await check("ticket submission and persisted ticket history", async () => {
      await go("/tickets"); await page.getByRole("button", { name: "IT", exact: true }).click(); await field("شرح درخواست").fill("این یک تیکت نمونه برای بررسی نمایش درخواست‌های پشتیبانی است."); await page.getByRole("button", { name: "ثبت تیکت", exact: true }).click(); await toast("تیکت شما با موفقیت ثبت شد."); assert.equal(await page.locator(".ticket-list article").count(), 1); await page.reload({ waitUntil: "networkidle" }); assert.equal(await page.locator(".ticket-list article").count(), 1);
    });
    await check("course enrollment creates one employee process", async () => {
      await go("/courses"); await page.getByRole("button", { name: "مشاهده دوره" }).first().click(); await page.getByRole("button", { name: "درخواست شرکت در دوره", exact: true }).click(); await page.getByRole("button", { name: "درخواست شما ثبت شده" }).waitFor(); assert.ok(await page.getByRole("button", { name: "درخواست شما ثبت شده" }).isDisabled()); await page.keyboard.press("Escape");
    });
    await check("admin route isolation and mock login", async () => {
      await go("/admin"); assert.equal(new URL(page.url()).pathname, "/admin/login");
      await field("نام کاربری").fill("admin"); await field("رمز عبور").fill("wrong-password"); await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نادرست" }).waitFor();
      await field("رمز عبور").fill("admin123"); await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.waitForURL(base + "/admin"); await page.getByRole("heading", { name: "نبض پورتال در دستان شما" }).waitFor(); await page.screenshot({ path: "test-results/admin-desktop.png", fullPage: true }); await audit("admin dashboard desktop");
    });
    await check("admin news create, preview, publish, cross-portal persistence and delete", async () => {
      await go("/admin/news/new"); await field("عنوان").fill("خبر آزمایشی QA"); await field("خلاصه خبر").fill("این خلاصه خبر برای بررسی گردش کامل مدیریت محتوای پورتال ثبت شده است."); await field("متن خبر").fill("این متن آزمایشی برای بررسی ایجاد، انتشار، ویرایش و حذف خبر است."); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.waitForURL(base + "/admin/news");
      await page.getByRole("searchbox").fill("خبر آزمایشی QA"); assert.equal(await page.locator("tbody tr").count(), 1); await page.getByRole("button", { name: "مشاهده خبر آزمایشی QA", exact: true }).click(); await page.getByRole("dialog").waitFor(); await page.keyboard.press("Escape");
      const employeeTab = await context.newPage(); watchErrors(employeeTab);
      await employeeTab.goto(base + "/news", { waitUntil: "networkidle" });
      assert.equal(await employeeTab.getByRole("heading", { name: "خبر آزمایشی QA", exact: true }).count(), 0, "Draft news stays hidden in the employee portal");
      await page.getByRole("link", { name: "ویرایش خبر آزمایشی QA", exact: true }).click(); await field("وضعیت").selectOption("published"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.waitForURL(base + "/admin/news");
      await employeeTab.getByRole("heading", { name: "خبر آزمایشی QA", exact: true }).waitFor();
      await employeeTab.reload({ waitUntil: "networkidle" }); await employeeTab.getByRole("heading", { name: "خبر آزمایشی QA", exact: true }).waitFor();
      await go("/news"); await page.getByRole("heading", { name: "خبر آزمایشی QA", exact: true }).waitFor();
      await go("/admin/news"); await page.getByRole("searchbox").fill("خبر آزمایشی QA"); await page.getByRole("button", { name: "حذف خبر آزمایشی QA", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد."); assert.equal(await page.locator("tbody tr").count(), 0);
      await employeeTab.getByRole("heading", { name: "خبر آزمایشی QA", exact: true }).waitFor({ state: "hidden" }); await employeeTab.close();
      await go("/admin/news"); await page.getByRole("combobox", { name: "همه وضعیت‌ها" }).selectOption("draft"); assert.equal(await page.locator("tbody tr").count(), 1); await page.getByRole("button", { name: "عنوان خبر", exact: true }).click(); await audit("admin news desktop");
    });
    await check("admin course validation, create, edit and delete", async () => {
      await go("/admin/courses/new"); await field("عنوان").fill("دوره آزمایشی QA"); await field("توضیحات").fill("دوره نمونه برای بررسی قابلیت مدیریت آموزش کارکنان."); await field("مدرس").fill("مدرس نمونه"); await field("تاریخ شروع").fill("2026-09-20"); await field("تاریخ پایان").fill("2026-09-19"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "تاریخ پایان" }).waitFor();
      await field("تاریخ پایان").fill("2026-09-21"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.waitForURL(base + "/admin/courses"); await page.getByRole("searchbox").fill("دوره آزمایشی QA"); await page.getByRole("link", { name: "ویرایش دوره آزمایشی QA" }).click(); await field("وضعیت").selectOption("active"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.waitForURL(base + "/admin/courses"); await page.getByRole("searchbox").fill("دوره آزمایشی QA"); await page.getByRole("button", { name: "حذف دوره آزمایشی QA", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد.");
    });
    await check("gallery upload, preview, disable and delete", async () => {
      await go("/admin/gallery"); await page.getByRole("button", { name: "تصویر جدید", exact: true }).click(); await field("عنوان").fill("تصویر آزمایشی QA"); await page.locator('input[type="file"]').setInputFiles("public/assets/brand-guide.png"); await page.locator(".upload-preview img").waitFor(); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد."); await page.getByRole("searchbox").fill("تصویر آزمایشی QA"); await page.getByRole("button", { name: "غیرفعال کردن تصویر آزمایشی QA", exact: true }).click(); await toast("وضعیت با موفقیت تغییر کرد."); await page.getByRole("button", { name: "مشاهده تصویر آزمایشی QA" }).click(); await page.getByRole("dialog").waitFor(); await page.keyboard.press("Escape"); await page.getByRole("button", { name: "حذف تصویر آزمایشی QA" }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد.");
    });
    await check("announcement CRUD and active filter", async () => {
      await go("/admin/announcements"); await page.getByRole("button", { name: "اطلاعیه جدید", exact: true }).click(); await field("عنوان").fill("اطلاعیه آزمایشی QA"); await field("متن اطلاعیه").fill("متن نمونه برای بررسی مدیریت اطلاعیه‌ها."); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد."); await page.getByRole("searchbox").fill("اطلاعیه آزمایشی QA"); await page.getByRole("button", { name: "غیرفعال کردن اطلاعیه آزمایشی QA" }).click(); await toast("وضعیت با موفقیت تغییر کرد."); await page.getByRole("combobox", { name: "همه وضعیت‌ها" }).selectOption("true"); assert.equal(await page.locator("tbody tr").count(), 0); await page.getByRole("combobox", { name: "همه وضعیت‌ها" }).selectOption(""); await page.getByRole("button", { name: "حذف اطلاعیه آزمایشی QA" }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد.");
    });
    await check("quick process reorder and CRUD", async () => {
      await go("/admin/processes"); const before = await page.locator("tbody tr").first().innerText(); await page.getByRole("button", { name: "انتقال درخواست مرخصی به پایین" }).click(); await toast("ترتیب نمایش ذخیره شد."); assert.notEqual(await page.locator("tbody tr").first().innerText(), before); await page.getByRole("button", { name: "انتقال درخواست مرخصی به بالا" }).click(); await toast("ترتیب نمایش ذخیره شد.");
      await page.getByRole("button", { name: "فرآیند جدید", exact: true }).click(); await field("عنوان").fill("فرآیند آزمایشی QA"); await field("توضیحات").fill("توضیح فرآیند نمونه"); await field("لینک").fill("javascript:alert(1)"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "لینک باید" }).waitFor(); await field("لینک").fill("/processes"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد."); await page.getByRole("searchbox").fill("فرآیند آزمایشی QA"); await page.getByRole("button", { name: "حذف فرآیند آزمایشی QA" }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد.");
    });
    await check("directory department and extension CRUD without modifying source records", async () => {
      await go("/admin/phone-directory"); await page.getByRole("button", { name: "افزودن واحد", exact: true }).click(); await field("نام واحد").fill("واحد آزمایشی QA"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد."); await page.getByRole("button", { name: "افزودن داخلی به واحد آزمایشی QA", exact: true }).click(); await field("نام کارمند / واحد").fill("همکار نمونه"); await field("شماره داخلی").fill("۹۹۹"); await field("عنوان مدیریت").fill("مدیر نمونه"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد."); await page.getByRole("button", { name: "ویرایش داخلی 999", exact: true }).click(); await field("نام کارمند / واحد").fill("همکار ویرایش شده"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("با موفقیت ذخیره شد.");
      await go("/phone-directory"); await page.getByRole("searchbox").fill("999"); await page.getByText("همکار ویرایش شده (مدیر نمونه)", { exact: true }).waitFor();
      await go("/admin/phone-directory"); await page.getByRole("button", { name: "غیرفعال کردن داخلی 999", exact: true }).click(); await toast("وضعیت با موفقیت تغییر کرد."); await go("/phone-directory"); await page.getByRole("searchbox").fill("999"); assert.equal(await page.locator(".extension-number").count(), 0);
      await go("/admin/phone-directory"); await page.getByRole("button", { name: "حذف واحد واحد آزمایشی QA", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("آیتم با موفقیت حذف شد."); await go("/phone-directory"); assert.equal(await page.locator(".extension-number").count(), 25);
    });
    await check("activity search and pagination", async () => {
      await go("/admin/activities"); assert.equal(await page.locator("tbody tr").count(), 6); await page.getByRole("button", { name: "صفحه بعد", exact: true }).click(); await page.getByRole("searchbox").fill("خبر ایجاد شد"); assert.ok(await page.locator("tbody tr").count() >= 1);
    });
    const routes = ["/login", "/", "/processes", "/processes/process-1", "/processes/new", "/phone-directory", "/admin/login", "/admin", "/admin/news", "/admin/news/new", "/admin/news/news-1", "/admin/courses", "/admin/courses/new", "/admin/courses/course-1", "/admin/gallery", "/admin/announcements", "/admin/processes", "/admin/activities", "/admin/phone-directory", "/crm", "/tickets", "/news", "/news/news-1", "/courses", "/activities", "/announcements"];
    for (const width of [1440, 390]) { for (const path of routes) { await layout(path, width); } console.log(`Verified ${routes.length} routes at ${width}px`); }
    for (const width of [1920, 1280, 1024, 768, 360]) { for (const path of ["/", "/processes", "/phone-directory", "/admin", "/admin/news", "/admin/phone-directory"]) await layout(path, width); console.log(`Verified responsive layouts at ${width}px`); }
    for (const width of [360, 768]) { for (const path of ["/admin/courses/new", "/admin/courses/course-1"]) await layout(path, width); }
    await check("mobile drawer, navigation, dialog keyboard behavior and logout", async () => {
      await page.setViewportSize({ width: 390, height: 844 }); await go("/"); await page.screenshot({ path: "test-results/portal-mobile.png", fullPage: true }); await audit("employee dashboard mobile");
      await page.getByRole("button", { name: "باز کردن منو", exact: true }).click(); await page.getByRole("dialog").getByRole("link", { name: "شماره‌های داخلی", exact: true }).click(); await page.waitForURL(base + "/phone-directory"); assert.equal(await page.getByRole("dialog").count(), 0); await page.screenshot({ path: "test-results/directory-mobile.png", fullPage: true });
      await audit("directory mobile");
      await page.getByRole("button", { name: "باز کردن منو", exact: true }).click(); await page.keyboard.press("Escape"); assert.equal(await page.getByRole("dialog").count(), 0); assert.equal(await page.evaluate(() => document.body.style.overflow), "");
      await go("/admin/news"); await page.screenshot({ path: "test-results/admin-news-mobile.png", fullPage: true }); await audit("admin news mobile");
      await go("/admin/news/new"); await audit("admin form mobile");
      await go("/admin/courses/new"); await audit("admin course form mobile"); await page.screenshot({ path: "test-results/admin-course-mobile.png", fullPage: true });
      await go("/"); await page.getByRole("button", { name: "نمایش پروفایل", exact: true }).click(); await page.getByRole("button", { name: "خروج از حساب", exact: true }).click(); await page.waitForURL(base + "/login");
      await go("/admin"); await page.getByRole("button", { name: "نمایش پروفایل", exact: true }).click(); await page.getByRole("button", { name: "خروج از حساب", exact: true }).click(); await page.waitForURL(base + "/admin/login"); await page.screenshot({ path: "test-results/login-mobile.png", fullPage: true }); await audit("admin login mobile");
    });
    assert.deepEqual(report.overflow, [], "No horizontal overflow at any tested breakpoint");
    assert.deepEqual(report.images, [], "No missing images");
    assert.deepEqual(errors, [], "No console or hydration errors");
    assert.deepEqual(a11y, [], "No WCAG A/AA violations on audited pages");
    console.log(`PASS all ${report.checks.length} flows and ${report.routes.length} responsive route checks`);
  } catch (error) { report.failure = String(error.stack || error); console.error(report.failure); await page.screenshot({ path: "test-results/failure.png", fullPage: true }); process.exitCode = 1; }
  finally { report.environment.finishedAt = new Date().toISOString(); await fs.writeFile(inspection ? "test-results/inspection.json" : "test-results/qa-report.json", JSON.stringify(report, null, 2)); await browser.close(); }
})();

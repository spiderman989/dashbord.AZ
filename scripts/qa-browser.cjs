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
        exactUsernameLabelMatches: await page.getByLabel("نام کاربری", { exact: true }).count(),
        partialUsernameLabelMatches: await page.getByLabel("نام کاربری").count(),
      };
      await audit("inspection");
      await page.screenshot({ path: "test-results/inspection.png", fullPage: true });
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    await check("employee username/password login, validation and protected routes", async () => {
      await go("/"); assert.equal(new URL(page.url()).pathname, "/login");
      await audit("employee login desktop");
      assert.equal(await field("نام کاربری").getAttribute("inputmode"), "text");
      assert.equal(await field("رمز عبور").getAttribute("inputmode"), "text");
      assert.equal(await field("رمز عبور").getAttribute("maxlength"), "80");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نام کاربری را وارد کنید" }).waitFor();
      await field("نام کاربری").fill("employee"); await field("رمز عبور").fill("   ");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "رمز عبور را وارد کنید" }).waitFor();
      await field("رمز عبور").fill("short"); await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "۶ تا ۸۰" }).waitFor();
      await field("نام کاربری").fill("bad username"); await field("رمز عبور").fill("employee123");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نام کاربری باید" }).waitFor();
      await field("نام کاربری").fill("employee"); await field("رمز عبور").fill("Employee123");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نادرست" }).waitFor();
      await field("رمز عبور").fill("employee123");
      await page.screenshot({ path: "test-results/employee-login-desktop.png", fullPage: true });
      await field("نام کاربری").fill(" EMPLOYEE "); await page.getByRole("button", { name: "ورود", exact: true }).click();
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
    await check("local employee management validation, CRUD, cross-tab persistence and confirmation", async () => {
      await go("/admin/employees");
      await page.getByRole("heading", { name: "هنوز کارمندی ثبت نشده است." }).waitFor();
      assert.equal(await page.getByRole("link", { name: "مدیریت کارکنان", exact: true }).getAttribute("aria-current"), "page");
      const employeeTab = await context.newPage(); watchErrors(employeeTab);
      await employeeTab.goto(base + "/admin/employees", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "افزودن کارمند", exact: true }).click();
      await page.getByRole("button", { name: "ذخیره", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: "نام" }).waitFor();
      await field("نام").fill("   "); await field("نام خانوادگی").fill("رضایی"); await field("پست / سمت سازمانی").fill("کارشناس منابع انسانی");
      await field("نام کاربری").fill("bad username"); await field("رمز عبور").fill("123");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "«نام»" }).waitFor();
      await field("نام").fill("مهسا");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نام کاربری باید" }).waitFor();
      await field("نام کاربری").fill(" qa.employee ");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "رمز عبور آزمایشی" }).waitFor();
      await field("رمز عبور").fill("demo123"); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("کارمند با موفقیت افزوده شد.");
      await employeeTab.getByRole("cell", { name: "کارشناس منابع انسانی", exact: true }).waitFor();
      assert.equal(await page.locator("tbody tr").count(), 1);
      assert.ok(!(await page.locator("tbody").innerText()).includes("demo123"));
      await page.getByRole("button", { name: "افزودن کارمند", exact: true }).click();
      await field("نام").fill("رضا"); await field("نام خانوادگی").fill("احمدی"); await field("پست / سمت سازمانی").fill("کارشناس فروش"); await field("نام کاربری").fill("QA.EMPLOYEE"); await field("رمز عبور").fill("demo456");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "قبلاً ثبت شده" }).waitFor();
      await page.getByRole("button", { name: "انصراف", exact: true }).click();
      await page.getByRole("button", { name: "ویرایش مهسا رضایی", exact: true }).click();
      assert.equal(await field("رمز عبور").inputValue(), "");
      await field("نام").fill("مریم"); await field("نام خانوادگی").fill("احمدی"); await field("پست / سمت سازمانی").fill("مدیر منابع انسانی"); await field("نام کاربری").fill("qa.manager");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("اطلاعات کارمند با موفقیت ویرایش شد.");
      await employeeTab.getByRole("cell", { name: "مدیر منابع انسانی", exact: true }).waitFor();
      await page.reload({ waitUntil: "networkidle" }); await page.getByRole("cell", { name: "qa.manager", exact: true }).waitFor();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.employees")));
      assert.equal(stored.length, 1); assert.equal(stored[0].password, "demo123"); assert.equal(stored[0].firstName, "مریم"); assert.equal(stored[0].lastName, "احمدی");
      await page.getByRole("searchbox").fill("مدیر منابع انسانی"); assert.equal(await page.locator("tbody tr").count(), 1);
      await page.getByRole("searchbox").fill("نامناموجود"); await page.getByRole("heading", { name: "نتیجه‌ای برای جستجوی شما پیدا نشد." }).waitFor();
      await page.getByRole("button", { name: "پاک کردن فیلترها", exact: true }).last().click();
      await page.screenshot({ path: "test-results/employees-desktop.png", fullPage: true }); await audit("employee management desktop");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "ویرایش مریم احمدی", exact: true }).click();
      await field("رمز عبور").fill("changed456");
      await page.screenshot({ path: "test-results/employee-form-mobile.png", fullPage: true }); await audit("employee editor mobile");
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("اطلاعات کارمند با موفقیت ویرایش شد.");
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.employees"))[0].password), "changed456");
      await page.screenshot({ path: "test-results/employees-mobile.png", fullPage: true }); await audit("employee management mobile");
      await page.getByRole("button", { name: "حذف مریم احمدی", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "انصراف", exact: true }).click(); assert.equal(await page.locator("tbody tr").count(), 1);
      await page.getByRole("button", { name: "حذف مریم احمدی", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("کارمند با موفقیت حذف شد.");
      await employeeTab.getByRole("heading", { name: "هنوز کارمندی ثبت نشده است." }).waitFor(); await employeeTab.close();
      await page.reload({ waitUntil: "networkidle" }); await page.getByRole("heading", { name: "هنوز کارمندی ثبت نشده است." }).waitFor();
      await page.getByRole("button", { name: "باز کردن منو", exact: true }).click();
      await page.getByRole("dialog").getByRole("link", { name: "مدیریت کارکنان", exact: true }).click(); assert.equal(await page.getByRole("dialog").count(), 0);
      await page.setViewportSize({ width: 1440, height: 1000 });
    });
    await check("feedback has exactly two types, Persian validation, local history and employee isolation", async () => {
      await go("/feedback");
      await page.getByRole("heading", { name: "هنوز پیامی ثبت نکرده‌اید." }).waitFor();
      assert.equal(await page.getByRole("link", { name: "صندوق انتقادات و پیشنهادات", exact: true }).getAttribute("aria-current"), "page");
      assert.deepEqual(await field("نوع پیام").locator("option").evaluateAll((options) => options.filter((option) => option.value).map((option) => option.value)), ["suggestion", "criticism"]);
      await page.getByRole("button", { name: "ارسال پیام", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "نوع پیام" }).waitFor();
      await field("نوع پیام").selectOption("suggestion"); await field("عنوان").fill("   ");
      await page.getByRole("button", { name: "ارسال پیام", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "عنوان پیام" }).waitFor();
      await field("عنوان").fill("  پیشنهاد بهبود فضای کار  "); await field("متن پیام").fill("          ");
      await page.getByRole("button", { name: "ارسال پیام", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "متن پیام" }).waitFor();
      const feedbackTab = await context.newPage(); watchErrors(feedbackTab); await feedbackTab.goto(base + "/feedback", { waitUntil: "networkidle" });
      await field("متن پیام").fill("  پیشنهاد می‌کنم زمان مشخصی برای گفت‌وگوی همکاران در نظر بگیریم.  ");
      await page.getByRole("button", { name: "ارسال پیام", exact: true }).click(); await toast("پیام شما با موفقیت ثبت شد.");
      await feedbackTab.getByRole("cell", { name: "پیشنهاد بهبود فضای کار", exact: true }).waitFor();
      assert.equal(await field("نوع پیام").inputValue(), ""); assert.equal(await field("عنوان").inputValue(), ""); assert.equal(await field("متن پیام").inputValue(), "");
      await field("نوع پیام").selectOption("criticism"); await field("عنوان").fill("انتقاد از تأخیر اطلاع‌رسانی"); await field("متن پیام").fill("اطلاع‌رسانی تغییر ساعت جلسه‌ها باید زودتر و با جزئیات کافی انجام شود.");
      await page.screenshot({ path: "test-results/feedback-desktop.png", fullPage: true }); await audit("feedback desktop");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "ارسال پیام", exact: true }).click(); await toast("پیام شما با موفقیت ثبت شد.");
      await feedbackTab.getByRole("cell", { name: "انتقاد از تأخیر اطلاع‌رسانی", exact: true }).waitFor(); await feedbackTab.close();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.feedback")));
      assert.equal(stored.length, 2); assert.deepEqual(stored.map((item) => item.type), ["criticism", "suggestion"]);
      assert.ok(stored.every((item) => item.employeeId === "employee-1001" && item.status === "submitted" && Number.isFinite(Date.parse(item.createdAt))));
      assert.equal(stored[1].subject, "پیشنهاد بهبود فضای کار"); assert.equal(stored[1].message, stored[1].message.trim());
      await page.evaluate(() => {
        const key = "azarshin.portal.v1.feedback"; const items = JSON.parse(localStorage.getItem(key));
        localStorage.setItem(key, JSON.stringify([...items, { ...items[0], id: "qa-other-feedback", employeeId: "another-employee", subject: "پیام همکار دیگر" }]));
      });
      await page.reload({ waitUntil: "networkidle" }); assert.equal(await page.locator("tbody tr").count(), 2); assert.equal(await page.getByText("پیام همکار دیگر", { exact: true }).count(), 0);
      await page.screenshot({ path: "test-results/feedback-mobile.png", fullPage: true }); await audit("feedback mobile");
      await page.getByRole("button", { name: "باز کردن منو", exact: true }).click();
      await page.getByRole("dialog").getByRole("link", { name: "صندوق انتقادات و پیشنهادات", exact: true }).click(); assert.equal(await page.getByRole("dialog").count(), 0);
      await page.setViewportSize({ width: 1440, height: 1000 });
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
    routes.push("/admin/employees", "/feedback");
    for (const width of [1440, 390]) { for (const path of routes) { await layout(path, width); } console.log(`Verified ${routes.length} routes at ${width}px`); }
    for (const width of [1920, 1280, 1024, 768, 360]) { for (const path of ["/", "/processes", "/phone-directory", "/admin", "/admin/news", "/admin/phone-directory"]) await layout(path, width); console.log(`Verified responsive layouts at ${width}px`); }
    for (const width of [360, 768]) { for (const path of ["/admin/courses/new", "/admin/courses/course-1"]) await layout(path, width); }
    for (const width of [1920, 1280, 1024, 768, 360]) { for (const path of ["/admin/employees", "/feedback"]) await layout(path, width); }
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
    await check("managed employee login, exact passwords, persistent identity, credential edits and deletion", async () => {
      await go("/admin/login"); await field("نام کاربری").fill("admin"); await field("رمز عبور").fill("admin123");
      await page.getByRole("button", { name: "ورود", exact: true }).click(); await page.waitForURL(base + "/admin");
      await go("/admin/employees"); await page.getByRole("button", { name: "افزودن کارمند", exact: true }).click();
      const username = "qa.user." + "x".repeat(32); const password = "Local۱۲3! pass  "; const updatedPassword = "Updated۴56!";
      await field("نام").fill("سارا"); await field("نام خانوادگی").fill("احمدی"); await field("پست / سمت سازمانی").fill("کارشناس آموزش");
      await field("نام کاربری").fill("employee"); await field("رمز عبور").fill(password);
      await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "رزرو شده" }).waitFor();
      await field("نام کاربری").fill(username); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("کارمند با موفقیت افزوده شد.");
      const account = await page.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.employees"))[0]);
      // Managed accounts start without grants; authorize this existing login fixture through the UI.
      await page.getByRole("button", { name: "سطح دسترسی سارا احمدی", exact: true }).click();
      await page.getByRole("dialog").getByRole("checkbox", { name: "میز کار", exact: true }).check();
      await page.getByRole("dialog").getByRole("checkbox", { name: "صندوق انتقادات و پیشنهادات", exact: true }).check();
      await page.getByRole("dialog").getByRole("button", { name: "ذخیره تغییرات", exact: true }).click();
      await toast("سطح دسترسی با موفقیت ذخیره شد.");
      const employeeTab = await context.newPage(); watchErrors(employeeTab); await employeeTab.setViewportSize({ width: 390, height: 844 });
      const employeeField = (name) => employeeTab.getByLabel(new RegExp("^" + name + "(?:\\s*\\*)?$"));
      const signIn = async (identity, secret) => {
        await employeeField("نام کاربری").fill(identity); await employeeField("رمز عبور").fill(secret);
        await employeeTab.getByRole("button", { name: "ورود", exact: true }).click();
      };
      const rejected = async () => {
        await employeeTab.waitForFunction(() => document.querySelector(".login-submit")?.disabled === false);
        await employeeTab.getByRole("alert").filter({ hasText: "نام کاربری یا رمز عبور نادرست" }).waitFor();
        assert.equal(new URL(employeeTab.url()).pathname, "/login");
      };
      await employeeTab.goto(base + "/login", { waitUntil: "networkidle" });
      await employeeTab.screenshot({ path: "test-results/employee-login-mobile.png", fullPage: true });
      for (const invalid of [password.trim(), password.replace("۱۲", "12"), password.toLowerCase()]) { await signIn(username, invalid); await rejected(); }
      assert.equal(await employeeTab.evaluate(() => localStorage.getItem("azarshin.demo.employee")), null);
      await employeeField("رمز عبور").fill(password); await employeeTab.getByRole("button", { name: "نمایش رمز", exact: true }).click();
      assert.equal(await employeeField("رمز عبور").getAttribute("type"), "text"); assert.equal(await employeeField("رمز عبور").inputValue(), password);
      await employeeTab.getByRole("button", { name: "پنهان کردن رمز", exact: true }).click();
      await signIn(username.toUpperCase(), password); await employeeTab.waitForURL(base + "/");
      await employeeTab.getByRole("heading", { name: "میز کار شما" }).waitFor();
      assert.ok((await employeeTab.locator(".topbar-user").innerText()).includes("سارا احمدی"));
      assert.equal(await employeeTab.evaluate(() => localStorage.getItem("azarshin.demo.employee")), account.id);
      await employeeTab.reload({ waitUntil: "networkidle" }); await employeeTab.getByRole("button", { name: "نمایش پروفایل", exact: true }).click();
      await employeeTab.getByRole("dialog").getByText(username, { exact: true }).waitFor();
      assert.equal(await employeeTab.getByRole("dialog").evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth + 1), true);
      await employeeTab.keyboard.press("Escape");
      await employeeTab.goto(base + "/feedback", { waitUntil: "networkidle" });
      await employeeTab.getByRole("heading", { name: "هنوز پیامی ثبت نکرده‌اید." }).waitFor();
      await employeeField("نوع پیام").selectOption("suggestion"); await employeeField("عنوان").fill("پیام حساب محلی QA"); await employeeField("متن پیام").fill("این پیام برای بررسی ارتباط بازخورد با حساب کارمند واردشده ثبت می‌شود.");
      await employeeTab.getByRole("button", { name: "ارسال پیام", exact: true }).click();
      await employeeTab.getByRole("cell", { name: "پیام حساب محلی QA", exact: true }).waitFor();
      assert.equal(await employeeTab.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.feedback")).find((item) => item.subject === "پیام حساب محلی QA").employeeId), account.id);
      await page.getByRole("button", { name: "ویرایش سارا احمدی", exact: true }).click();
      await field("نام کاربری").fill("qa.updated"); await field("رمز عبور").fill(updatedPassword); await page.getByRole("button", { name: "ذخیره", exact: true }).click(); await toast("اطلاعات کارمند با موفقیت ویرایش شد.");
      await employeeTab.reload({ waitUntil: "networkidle" }); await employeeTab.getByRole("cell", { name: "پیام حساب محلی QA", exact: true }).waitFor();
      await employeeTab.getByRole("button", { name: "نمایش پروفایل", exact: true }).click(); await employeeTab.getByRole("dialog").getByText("qa.updated", { exact: true }).waitFor();
      await employeeTab.getByRole("button", { name: "خروج از حساب", exact: true }).click(); await employeeTab.waitForURL(base + "/login");
      await signIn(username, updatedPassword); await rejected(); await signIn("qa.updated", password); await rejected();
      await signIn("qa.updated", updatedPassword); await employeeTab.waitForURL(base + "/"); await employeeTab.getByRole("heading", { name: "میز کار شما" }).waitFor();
      await page.getByRole("button", { name: "حذف سارا احمدی", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "حذف", exact: true }).click(); await toast("کارمند با موفقیت حذف شد.");
      await employeeTab.reload({ waitUntil: "networkidle" }); await employeeTab.waitForURL(base + "/login");
      await signIn("qa.updated", updatedPassword); await rejected(); await employeeTab.close();
      await go("/login"); await audit("employee login mobile");
    });
    assert.deepEqual(report.overflow, [], "No horizontal overflow at any tested breakpoint");
    assert.deepEqual(report.images, [], "No missing images");
    assert.deepEqual(errors, [], "No console or hydration errors");
    assert.deepEqual(a11y, [], "No WCAG A/AA violations on audited pages");
    console.log(`PASS all ${report.checks.length} flows and ${report.routes.length} responsive route checks`);
  } catch (error) { report.failure = String(error.stack || error); console.error(report.failure); await page.screenshot({ path: "test-results/failure.png", fullPage: true }); process.exitCode = 1; }
  finally { report.environment.finishedAt = new Date().toISOString(); await fs.writeFile(inspection ? "test-results/inspection.json" : "test-results/qa-report.json", JSON.stringify(report, null, 2)); await browser.close(); }
})();

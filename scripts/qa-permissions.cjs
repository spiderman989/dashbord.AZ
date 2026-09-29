/* Isolated browser accounts only; never connects to the user's browser profile. */
(async () => {
  const { chromium } = await import("playwright");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const fs = await import("node:fs/promises");
  const assert = (await import("node:assert/strict")).default;
  const base = process.env.PORTAL_TEST_URL || "http://localhost:3101";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "fa-IR", timezoneId: "Asia/Tehran" });
  const admin = await context.newPage();
  const employee = await context.newPage();
  const report = { startedAt: new Date().toISOString(), base, browser: browser.version(), checks: [], audits: [], errors: [], screenshots: [] };
  const permissionKey = "azarshin.portal.v1.permissions";
  for (const page of [admin, employee]) {
    page.setDefaultTimeout(12000);
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") report.errors.push(message.text()); });
  }
  await fs.mkdir("test-results", { recursive: true });
  const field = (page, name) => page.getByLabel(new RegExp("^" + name + "(?:\\s*\\*)?$"));
  const dialog = () => admin.getByRole("dialog");
  const check = async (name, run) => { await run(); report.checks.push(name); console.log("PASS " + name); };
  const go = (page, path) => page.goto(base + path, { waitUntil: "networkidle" });
  async function signIn(page, name, panel = "employee") {
    await go(page, panel === "admin" ? "/admin/login" : "/login");
    await field(page, "نام کاربری").fill(name);
    await field(page, "رمز عبور").fill(name === "admin" ? "admin123" : "Demo123!");
    await page.getByRole("button", { name: "ورود", exact: true }).click();
  }
  async function open(name) {
    await admin.getByRole("button", { name: "سطح دسترسی " + name + " آزمایشی", exact: true }).click();
    await dialog().getByRole("checkbox", { name: "میز کار", exact: true }).waitFor();
  }
  async function save() {
    await dialog().getByRole("button", { name: "ذخیره تغییرات", exact: true }).click();
    await admin.getByText("سطح دسترسی با موفقیت ذخیره شد.", { exact: true }).last().waitFor();
    await dialog().waitFor({ state: "hidden" });
  }
  async function grants(name, employeeLabels, adminLabels, entry = false) {
    await open(name);
    await dialog().getByRole("button", { name: "لغو انتخاب همه", exact: true }).click();
    for (const label of employeeLabels) await dialog().getByRole("checkbox", { name: label, exact: true }).check();
    await dialog().getByRole("tab", { name: "پنل مدیریت", exact: true }).click();
    const entryBox = dialog().getByRole("checkbox", { name: "اجازه ورود به پنل مدیریت", exact: true });
    await entryBox.check();
    await dialog().getByRole("button", { name: "لغو انتخاب همه", exact: true }).click();
    for (const label of adminLabels) await dialog().getByRole("checkbox", { name: label, exact: true }).check();
    await entryBox.setChecked(entry);
    await save();
  }
  async function logout(page, panel) {
    await page.getByRole("button", { name: "نمایش پروفایل", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "خروج از حساب", exact: true }).click();
    await page.waitForURL(base + (panel === "admin" ? "/admin/login" : "/login"));
  }
  async function screenshot(name) {
    const path = "test-results/permissions-" + name + ".png";
    await admin.screenshot({ path, fullPage: true }); report.screenshots.push(path);
  }
  async function audit(page, label) {
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    report.audits.push({ label, violations: result.violations });
    assert.deepEqual(result.violations, [], label);
  }
  async function denied(page, path) {
    await go(page, path);
    await page.getByRole("heading", { name: "شما به این بخش دسترسی ندارید", exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, path);
  }
  async function empty(page, path) {
    await page.getByRole("heading", { name: "برای حساب شما دسترسی تعیین نشده است؛ با مدیر سامانه تماس بگیرید", exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, path);
    assert.equal(await page.locator(".desktop-sidebar nav a").count(), 0);
    assert.equal(await page.locator("main").getByRole("button", { name: "خروج از حساب", exact: true }).count(), 1);
  }
  let ali;
  try {
    await check("create isolated Danial, Ali and no-access accounts through existing employee UI", async () => {
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin");
      await go(admin, "/admin/employees");
      assert.equal(await admin.getByRole("button", { name: "سطح دسترسی مدیر سامانه", exact: true }).count(), 0);
      for (const [name, username] of [["دانیال", "qa.danial"], ["علی", "qa.ali"], ["بدون", "qa.empty"]]) {
        await admin.getByRole("button", { name: "افزودن کارمند", exact: true }).click();
        await field(admin, "نام").fill(name); await field(admin, "نام خانوادگی").fill("آزمایشی");
        await field(admin, "پست / سمت سازمانی").fill("حساب آزمایشی");
        await field(admin, "نام کاربری").fill(username); await field(admin, "رمز عبور").fill("Demo123!");
        await dialog().getByRole("button", { name: "ذخیره", exact: true }).click();
        await dialog().waitFor({ state: "hidden" });
      }
      ali = await admin.evaluate(() => JSON.parse(localStorage.getItem("azarshin.portal.v1.employees")).find((u) => u.username === "qa.ali"));
    });
    await check("complete section inventory, disabled admin selection, bulk actions and cancel/Escape/backdrop discard drafts", async () => {
      const before = await admin.evaluate((key) => localStorage.getItem(key), permissionKey);
      await open("دانیال");
      assert.equal(await dialog().getByRole("checkbox").count(), 10);
      await dialog().getByRole("button", { name: "انتخاب همه", exact: true }).click();
      assert.equal(await dialog().locator("input:checked").count(), 10);
      await dialog().getByRole("button", { name: "لغو انتخاب همه", exact: true }).click();
      assert.equal(await dialog().locator("input:checked").count(), 0);
      await dialog().getByRole("checkbox", { name: "فرآیندها", exact: true }).check();
      await dialog().getByRole("tab", { name: "پنل مدیریت", exact: true }).click();
      assert.equal(await dialog().getByRole("checkbox").count(), 10);
      assert.equal(await dialog().getByRole("checkbox", { name: "اخبار", exact: true }).isDisabled(), true);
      assert.equal(await dialog().getByRole("button", { name: "انتخاب همه", exact: true }).isDisabled(), true);
      await dialog().getByRole("checkbox", { name: "اجازه ورود به پنل مدیریت", exact: true }).check();
      await dialog().getByRole("button", { name: "انتخاب همه", exact: true }).click();
      assert.equal(await dialog().locator("input:checked").count(), 10);
      await dialog().getByRole("button", { name: "انصراف", exact: true }).click();
      for (const close of ["escape", "backdrop", "button"]) {
        await open("دانیال");
        assert.equal(await dialog().locator("input:checked").count(), 0);
        await dialog().getByRole("checkbox", { name: "CRM", exact: true }).check();
        if (close === "escape") await admin.keyboard.press("Escape");
        else if (close === "backdrop") await admin.mouse.click(2, 2);
        else await dialog().getByRole("button", { name: "بستن پنجره", exact: true }).click();
        await dialog().waitFor({ state: "hidden" });
      }
      assert.equal(await admin.evaluate((key) => localStorage.getItem(key), permissionKey), before);
    });
    await check("save/reopen/reload persist, responsive modal scrolling and keyboard tabs", async () => {
      await grants("دانیال", ["فرآیندها", "CRM"], []);
      await grants("علی", [], ["اخبار"], true);
      await admin.reload({ waitUntil: "networkidle" }); await open("دانیال");
      assert.equal(await dialog().getByRole("checkbox", { name: "فرآیندها", exact: true }).isChecked(), true);
      assert.equal(await dialog().getByRole("checkbox", { name: "CRM", exact: true }).isChecked(), true);
      assert.equal(await dialog().locator("input:checked").count(), 2);
      await screenshot("desktop"); await audit(admin, "permission dialog desktop");
      await dialog().getByRole("tab", { name: "پنل کارکنان", exact: true }).focus(); await admin.keyboard.press("ArrowLeft");
      assert.equal(await dialog().getByRole("tab", { name: "پنل مدیریت", exact: true }).getAttribute("aria-selected"), "true");
      await admin.keyboard.press("Home");
      for (const width of [360, 390, 768]) {
        await admin.setViewportSize({ width, height: 740 });
        await dialog().getByRole("checkbox", { name: "اطلاعیه‌ها", exact: true }).scrollIntoViewIfNeeded();
        assert.equal(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        assert.equal(await dialog().evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
        await dialog().getByRole("button", { name: "ذخیره تغییرات", exact: true }).scrollIntoViewIfNeeded();
        assert.equal(await dialog().getByRole("button", { name: "ذخیره تغییرات", exact: true }).isVisible(), true);
      }
      await admin.setViewportSize({ width: 390, height: 740 }); await screenshot("mobile"); await audit(admin, "permission dialog mobile");
      await admin.keyboard.press("Escape"); await admin.setViewportSize({ width: 1440, height: 1000 });
      await logout(admin, "admin");
    });
    await check("Danial lands on processes, sees only processes/CRM and cannot log into admin", async () => {
      await signIn(employee, "qa.danial"); await employee.waitForURL(base + "/processes");
      await employee.getByRole("heading", { name: "کارتابل فرآیندها", exact: true }).waitFor();
      assert.deepEqual(await employee.locator(".desktop-sidebar nav a").evaluateAll((a) => a.map((el) => el.getAttribute("href"))), ["/processes", "/crm"]);
      await go(employee, "/crm");
      assert.equal(await employee.locator('a[href="/tickets"],a[href="/admin"],.news-ticker,.rail-gallery').count(), 0);
      for (const path of ["/news", "/news/news-1", "/courses", "/phone-directory", "/tickets", "/feedback", "/activities", "/announcements", "/future", "/processes/x/extra"]) await denied(employee, path);
      await go(employee, "/processes/new"); await employee.getByRole("heading", { name: "ثبت درخواست جدید", exact: true }).waitFor();
      await signIn(admin, "qa.danial", "admin");
      await admin.getByRole("alert").filter({ hasText: "اجازه ورود به پنل مدیریت را ندارید" }).waitFor();
      assert.equal(await admin.evaluate(() => localStorage.getItem("azarshin.demo.admin")), null);
      await go(admin, "/admin/news"); await admin.waitForURL(base + "/admin/login");
    });
    await check("saved grants revoke an open employee page across tabs, empty accounts do not redirect-loop", async () => {
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin"); await go(admin, "/admin/employees");
      await go(employee, "/processes");
      await grants("دانیال", ["CRM"], []);
      await employee.waitForURL(base + "/crm"); await employee.getByRole("heading", { name: "ارتباط با مشتریان", exact: true }).waitFor();
      await grants("دانیال", [], []);
      await employee.waitForURL(base + "/"); await empty(employee, "/");
      await employee.reload({ waitUntil: "networkidle" }); await empty(employee, "/");
      await audit(employee, "no-access employee state");
      await grants("دانیال", ["میز کار", "CRM"], []);
      await employee.getByRole("heading", { name: "میز کار شما", exact: true }).waitFor();
      assert.equal(await employee.locator(".quick-process,.process-status-card,.dashboard-note,.recent-activities,.dashboard-news,.announcement-strip,.news-ticker").count(), 0);
      const hrefs = await employee.locator('a[href^="/"]').evaluateAll((a) => a.map((el) => el.getAttribute("href")));
      assert.ok(hrefs.every((href) => ["/", "/crm"].includes(href)), JSON.stringify(hrefs));
      await logout(employee, "employee"); await signIn(employee, "qa.empty"); await employee.waitForURL(base + "/"); await empty(employee, "/");
      await employee.locator("main").getByRole("button", { name: "خروج از حساب", exact: true }).click(); await employee.waitForURL(base + "/login");
      await grants("دانیال", ["فرآیندها", "CRM"], []);
      await logout(admin, "admin");
    });
    await check("Ali has admin news only; nested forbidden routes, unknown routes and employee inheritance are blocked", async () => {
      await signIn(admin, "qa.ali", "admin"); await admin.waitForURL(base + "/admin/news");
      await admin.getByRole("heading", { name: "مدیریت اخبار", exact: true }).waitFor();
      assert.deepEqual(await admin.locator(".desktop-sidebar nav a").evaluateAll((a) => a.map((el) => el.getAttribute("href"))), ["/admin/news"]);
      for (const path of ["/admin/courses", "/admin/courses/new", "/admin/courses/course-1", "/admin/gallery", "/admin/announcements", "/admin/processes", "/admin/activities", "/admin/phone-directory", "/admin/employees", "/admin/future", "/admin/news/x/extra"]) await denied(admin, path);
      await go(admin, "/admin/news/new");
      await admin.getByRole("button", { name: "ذخیره", exact: true }).waitFor();
      await go(admin, "/admin/news/news-1"); await admin.getByRole("button", { name: "ذخیره", exact: true }).waitFor();
      await signIn(employee, "qa.ali"); await employee.waitForURL(base + "/"); await empty(employee, "/");
      await go(employee, "/news"); await empty(employee, "/news");
      await audit(admin, "limited admin news editor");
      await logout(admin, "admin");
    });
    await check("limited admin with employee-management section cannot edit permissions; primary admin remains unrestricted", async () => {
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin"); await go(admin, "/admin/employees");
      await grants("علی", [], ["اخبار", "مدیریت کارکنان"], true);
      await logout(admin, "admin");
      await signIn(admin, "qa.ali", "admin"); await admin.waitForURL(base + "/admin/news"); await go(admin, "/admin/employees");
      await admin.getByRole("button", { name: "افزودن کارمند", exact: true }).waitFor();
      assert.equal(await admin.getByRole("button", { name: /^سطح دسترسی/ }).count(), 0);
      await logout(admin, "admin");
      await signIn(admin, "admin", "admin"); await admin.waitForURL(base + "/admin"); await go(admin, "/admin/employees");
      await grants("علی", [], ["اخبار"], true);
      assert.equal(await admin.getByRole("button", { name: /^سطح دسترسی/ }).count(), 3);
      assert.equal(await admin.locator(".desktop-sidebar nav a").count(), 10);
      // A stale/edited browser grant cannot downgrade the explicit primary demo role.
      await employee.evaluate((key) => {
        const all = JSON.parse(localStorage.getItem(key));
        localStorage.setItem(key, JSON.stringify([...all, { id: "admin-1", employeeSections: [], adminAccess: false, adminSections: [] }]));
      }, permissionKey);
      await admin.reload({ waitUntil: "networkidle" });
      assert.equal(await admin.locator(".desktop-sidebar nav a").count(), 10);
      await denied(admin, "/admin/unknown");
      await logout(admin, "admin");
    });
    await check("admin entry revocation reacts live, malformed grants fail closed and logout remains available", async () => {
      await signIn(admin, "qa.ali", "admin"); await admin.waitForURL(base + "/admin/news");
      await employee.evaluate(({ key, id }) => {
        const all = JSON.parse(localStorage.getItem(key)); const user = all.find((item) => item.id === id); user.adminAccess = false;
        localStorage.setItem(key, JSON.stringify(all));
      }, { key: permissionKey, id: ali.id });
      await admin.waitForURL(base + "/admin"); await empty(admin, "/admin");
      await admin.reload({ waitUntil: "networkidle" }); await empty(admin, "/admin");
      await employee.evaluate(({ key, id }) => {
        const all = JSON.parse(localStorage.getItem(key)); const user = all.find((item) => item.id === id); user.adminSections = "invalid";
        localStorage.setItem(key, JSON.stringify(all));
      }, { key: permissionKey, id: ali.id });
      await admin.getByRole("alert").filter({ hasText: "قابل خواندن نیست" }).waitFor();
      assert.equal(await admin.getByRole("heading", { name: "مدیریت اخبار", exact: true }).count(), 0);
      await admin.getByRole("button", { name: "خروج از حساب", exact: true }).click(); await admin.waitForURL(base + "/admin/login");
    });
    assert.deepEqual(report.errors, [], "No browser runtime/console errors");
  } catch (error) {
    report.failure = String(error.stack || error); console.error(report.failure);
    await admin.screenshot({ path: "test-results/permissions-failure.png", fullPage: true }); process.exitCode = 1;
  } finally {
    report.finishedAt = new Date().toISOString();
    await fs.writeFile("test-results/permissions-report.json", JSON.stringify(report, null, 2));
    await browser.close();
  }
})();

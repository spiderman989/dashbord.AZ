import { demoAdmin, demoEmployee } from "@/data/employees";
import type { Employee } from "@/types";
import { emptyPermissions, isSuperAdmin, isCustomSectionId, sectionsForPanel, type SectionId, type UserPermissions } from "@/lib/permissions";
import { createMockRepository } from "./mockRepository";
import { employeeService } from "./employeeService";

const repository = createMockRepository<UserPermissions>("permissions", []);
function validate(record: UserPermissions): UserPermissions {
  if (typeof record.adminAccess !== "boolean" || !Array.isArray(record.employeeSections) || !Array.isArray(record.adminSections)) {
    throw new Error("دسترسی‌های ذخیره‌شده قابل خواندن نیست؛ با مدیر سامانه تماس بگیرید.");
  }
  // Unknown IDs never grant access, including IDs from another panel.
  return {
    id: record.id, adminAccess: record.adminAccess,
    employeeSections: [...new Set(record.employeeSections.filter((id) => sectionsForPanel("employee").some((section) => section.id === id) || isCustomSectionId(id, "employee")))],
    adminSections: [...new Set(record.adminSections.filter((id) => (id !== "admin.links" && sectionsForPanel("admin").some((section) => section.id === id)) || isCustomSectionId(id, "admin")))],
  };
}
/** API integration boundary: replace reads/writes/subscriptions with the server contract.
 * This browser mock is UI behavior; the server must authorize every request independently. */
export const permissionService = {
  async getForUser(identity: Employee): Promise<UserPermissions> {
    if (isSuperAdmin(identity)) return { id: identity.id, adminAccess: true, employeeSections: sectionsForPanel("employee").map((s) => s.id), adminSections: sectionsForPanel("admin").map((s) => s.id) };
    const stored = await repository.get(identity.id);
    if (stored) return validate(stored);
    const permissions = emptyPermissions(identity.id);
    // Preserve the supplied demo employee; managed accounts start without grants.
    if (identity.id === demoEmployee.id) permissions.employeeSections = sectionsForPanel("employee").map((s) => s.id);
    return permissions;
  },
  async saveForUser(userId: string, values: UserPermissions): Promise<UserPermissions> {
    const { getCurrentAdmin } = await import("./authService");
    const actor = await getCurrentAdmin();
    if (!actor || !isSuperAdmin(actor)) throw new Error("تنظیم سطح دسترسی فقط برای مدیر اصلی مجاز است.");
    if (userId === demoAdmin.id) throw new Error("دسترسی کامل مدیر اصلی قابل تغییر نیست.");
    if (!await employeeService.get(userId)) throw new Error("این کارمند دیگر در فهرست وجود ندارد.");
    const record = validate({ ...values, id: userId });
    const { pageLinksService } = await import("./pageLinksService");
    const links = await pageLinksService.list();
    // Deleted/unknown custom IDs in an already-open draft cannot be reintroduced.
    record.employeeSections = record.employeeSections.filter((id) => !isCustomSectionId(id, "employee") || links.some((item) => item.id === id));
    record.adminSections = record.adminSections.filter((id) => !isCustomSectionId(id, "admin") || links.some((item) => item.id === id));
    const current = await repository.list();
    await repository.replace([...current.filter((item) => item.id !== userId), record]);
    return record;
  },
  async removeCustomSection(id: SectionId, removeItem: () => Promise<unknown>) {
    const { getCurrentAdmin } = await import("./authService");
    const actor = await getCurrentAdmin();
    if (!actor || !isSuperAdmin(actor) || (!isCustomSectionId(id, "employee") && !isCustomSectionId(id, "admin"))) throw new Error("حذف این دسترسی مجاز نیست.");
    const current = await repository.list();
    const next = current.map((record) => ({ ...record, employeeSections: record.employeeSections.filter((section) => section !== id), adminSections: record.adminSections.filter((section) => section !== id) }));
    const changed = JSON.stringify(next) !== JSON.stringify(current);
    if (changed) await repository.replace(next);
    try { await removeItem(); }
    catch (error) {
      if (changed) {
        try { await repository.replace(current); }
        catch { throw new Error("حذف دکمه انجام نشد و بازیابی مجوز آن ناموفق بود؛ مجوز این دکمه را بررسی کنید."); }
      }
      throw error;
    }
  },
  subscribe: repository.subscribe,
};

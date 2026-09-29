import { createMockRepository } from "./mockRepository";
import { isSuperAdmin, type Panel, type SectionId } from "@/lib/permissions";
import { baseNavigation, customLinkErrors, decodePageLinks, destinationError, insertionOrder, menuItems, type CustomLinkValues, type CustomPageLink, type LinkDestination, type LinkOpening, type PageLinkRecord } from "@/lib/pageLinks";
import { normalizeLinkTitle } from "@/lib/linkValidation";

const repository = createMockRepository<PageLinkRecord>("page-links", [], decodePageLinks);
async function requirePrimaryAdmin() {
  const { getCurrentAdmin } = await import("./authService");
  const actor = await getCurrentAdmin();
  if (!actor || !isSuperAdmin(actor)) throw new Error("مدیریت صفحات و لینک‌ها فقط برای مدیر اصلی مجاز است.");
}
function checkDestination(panel: Panel, destination: LinkDestination, opening: LinkOpening) {
  const error = destinationError(panel, destination);
  if (error) throw new Error(error);
  if (!["same-tab", "new-tab"].includes(opening)) throw new Error("نحوه بازشدن معتبر نیست.");
}
/** API boundary: shared, origin-wide settings; no identity-specific key or server behavior. */
export const pageLinksService = {
  list: repository.list,
  subscribe: repository.subscribe,
  async saveBuiltin(panel: Panel, id: SectionId, destination: LinkDestination, opening: LinkOpening) {
    await requirePrimaryAdmin();
    const base = baseNavigation(panel).find((item) => item.id === id);
    if (!base || id === "admin.links") throw new Error("مقصد این دکمه قابل تغییر نیست.");
    checkDestination(panel, destination, opening);
    const current = await repository.list();
    if (!menuItems(panel, current).some((item) => item.id === id)) throw new Error("دکمه پیدا نشد یا حذف شده است.");
    await repository.replace([...current.filter((item) => item.id !== id), { id: base.id, panel, kind: "builtin", destination: { ...destination, href: destination.href.trim() }, opening }]);
  },
  async resetBuiltin(panel: Panel, id: SectionId) {
    await requirePrimaryAdmin();
    if (id === "admin.links" || !baseNavigation(panel).some((item) => item.id === id)) throw new Error("این دکمه مقصد پیش‌فرض قابل تغییر ندارد.");
    const current = await repository.list();
    if (!menuItems(panel, current).some((item) => item.id === id)) throw new Error("دکمه پیدا نشد یا حذف شده است.");
    await repository.replace(current.filter((item) => item.id !== id));
  },
  async removeBuiltin(panel: Panel, id: SectionId) {
    await requirePrimaryAdmin();
    const base = baseNavigation(panel).find((item) => item.id === id);
    const current = await repository.list();
    if (!base || !menuItems(panel, current).some((item) => item.id === id)) throw new Error("دکمه پیدا نشد یا حذف شده است.");
    // Keep a removal marker so the static menu definition stays removed after reload.
    await repository.replace([...current.filter((item) => item.id !== id), { id: base.id, panel, kind: "builtin", deleted: true, destination: { type: "internal", href: base.href }, opening: "same-tab" }]);
  },
  async saveCustom(values: CustomLinkValues, beforeId: string | null, id?: string): Promise<CustomPageLink> {
    await requirePrimaryAdmin();
    if (!["employee", "admin"].includes(values.panel)) throw new Error("پنل مقصد معتبر نیست.");
    const current = await repository.list();
    const previous = current.find((item) => item.id === id && item.kind === "custom");
    if (id && (!previous || previous.panel !== values.panel)) throw new Error("دکمه پیدا نشد یا پنل آن تغییر کرده است.");
    const errors = customLinkErrors(values, current, id);
    if (Object.values(errors).some(Boolean)) throw new Error(Object.values(errors).find(Boolean));
    const record: CustomPageLink = {
      ...values, destination: { ...values.destination, href: values.destination.href.trim() }, label: normalizeLinkTitle(values.label),
      id: previous?.kind === "custom" ? previous.id : `${values.panel}.custom.${crypto.randomUUID()}`,
      kind: "custom", order: insertionOrder(menuItems(values.panel, current), beforeId, id),
    };
    await repository.replace([...current.filter((item) => item.id !== id), record]);
    return record;
  },
  async removeCustom(panel: Panel, id: SectionId) {
    await requirePrimaryAdmin();
    const current = await repository.list();
    const item = current.find((record) => record.panel === panel && record.id === id && record.kind === "custom");
    if (!item) throw new Error("فقط دکمه سفارشی موجود قابل حذف است.");
    const { permissionService } = await import("./permissionService");
    await permissionService.removeCustomSection(id, () => repository.replace(current.filter((record) => record.id !== id)));
  },
};

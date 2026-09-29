import { adminNavigation, employeeNavigation, navigationIcons, type NavigationIcon } from "./navigation";
import { sectionsForPanel, isCustomSectionId, type BuiltinSectionId, type CustomSectionId, type Panel, type SectionId } from "./permissions";
import { externalLinkError, linkTitleError, normalizeLinkTitle } from "./linkValidation";

export type LinkDestination = { type: "internal" | "external"; href: string };
export type LinkOpening = "same-tab" | "new-tab";
interface LinkSettings { panel: Panel; destination: LinkDestination; opening: LinkOpening; }
export interface BuiltinLinkOverride extends LinkSettings { id: BuiltinSectionId; kind: "builtin"; deleted?: boolean; }
export interface CustomPageLink extends LinkSettings { id: CustomSectionId; kind: "custom"; label: string; icon: NavigationIcon; order: number; active: boolean; }
export type PageLinkRecord = BuiltinLinkOverride | CustomPageLink;
export interface MenuItem extends LinkSettings { id: SectionId; kind: "builtin" | "custom"; label: string; icon: NavigationIcon; order: number; active: boolean; locked: boolean; }
export interface CustomLinkValues extends LinkSettings { label: string; icon: NavigationIcon; active: boolean; }
export type LinkFieldErrors = Partial<Record<"label" | "icon" | "destination" | "opening" | "position" | "active", string>>;
export const baseNavigation = (panel: Panel) => panel === "admin" ? adminNavigation : employeeNavigation;
/** Only concrete existing routes. Record-dependent detail routes are intentionally absent. */
export function internalPages(panel: Panel) {
  return sectionsForPanel(panel).flatMap((section) => section.routes.filter((path) => !path.includes(":")).map((href) => ({ href, label: href === section.href ? section.label : `${section.label} — ایجاد جدید` })));
}
export function destinationError(panel: Panel, destination: LinkDestination): string | undefined {
  if (destination?.type === "external" && typeof destination.href === "string") return externalLinkError(destination.href);
  if (destination?.type !== "internal" || !internalPages(panel).some((page) => page.href === destination.href)) return "یک صفحه معتبر از همین پنل انتخاب کنید.";
  return undefined;
}
export function customLinkErrors(values: CustomLinkValues, records: PageLinkRecord[], id?: string): LinkFieldErrors {
  const labels = menuItems(values.panel, records).filter((item) => item.id !== id).map((item) => item.label);
  return {
    label: linkTitleError(values.label, labels), icon: Object.hasOwn(navigationIcons, values.icon) ? undefined : "آیکون را انتخاب کنید.",
    destination: destinationError(values.panel, values.destination),
    opening: ["same-tab", "new-tab"].includes(values.opening) ? undefined : "نحوه بازشدن را انتخاب کنید.",
    active: typeof values.active === "boolean" ? undefined : "وضعیت دکمه را انتخاب کنید.",
  };
}
export const customPageLinks = (records: readonly PageLinkRecord[]) => records.filter((item): item is CustomPageLink => item.kind === "custom");
export function menuItems(panel: Panel, records: readonly PageLinkRecord[]): MenuItem[] {
  const builtins = baseNavigation(panel).flatMap<MenuItem>((item) => {
    const record = records.find((record): record is BuiltinLinkOverride => record.kind === "builtin" && record.panel === panel && record.id === item.id);
    if (record?.deleted) return [];
    const override = item.id === "admin.links" ? undefined : record;
    return [{ id: item.id, panel, kind: "builtin", label: item.label, icon: item.icon, order: item.order, active: true, locked: item.id === "admin.links", destination: override?.destination ?? { type: "internal", href: item.href }, opening: override?.opening ?? "same-tab" }];
  });
  return [...builtins, ...customPageLinks(records).filter((item) => item.panel === panel).map((item) => ({ ...item, locked: false }))].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
/** Bad overrides use defaults; malformed custom items never become executable. Never writes on read. */
export function decodePageLinks(value: unknown): PageLinkRecord[] {
  if (!Array.isArray(value)) return [];
  const result: PageLinkRecord[] = [];
  const counts = new Map<unknown, number>();
  for (const item of value) if (item && typeof item === "object") counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
  // Apply builtin removals before validating custom titles, including reused titles.
  const ordered = [...value.filter((raw) => raw?.kind === "builtin"), ...value.filter((raw) => raw?.kind === "custom")];
  for (const raw of ordered) {
    if (!raw || typeof raw !== "object" || !["employee", "admin"].includes(raw.panel) || counts.get(raw.id) !== 1) continue;
    const panel: Panel = raw.panel;
    if (!raw.destination || destinationError(panel, raw.destination) || !["same-tab", "new-tab"].includes(raw.opening)) continue;
    const settings = { panel, destination: { type: raw.destination.type, href: raw.destination.href.trim() } as LinkDestination, opening: raw.opening as LinkOpening };
    if (raw.kind === "builtin" && (raw.deleted === undefined || typeof raw.deleted === "boolean") && (raw.id !== "admin.links" || raw.deleted === true) && baseNavigation(panel).some((item) => item.id === raw.id)) result.push({ ...settings, id: raw.id, kind: "builtin", ...(raw.deleted === true ? { deleted: true } : {}) });
    if (raw.kind === "custom" && isCustomSectionId(raw.id, panel) && typeof raw.label === "string" && typeof raw.icon === "string" && Object.hasOwn(navigationIcons, raw.icon) && typeof raw.active === "boolean" && typeof raw.order === "number" && Number.isFinite(raw.order) && !linkTitleError(raw.label, menuItems(panel, result).map((item) => item.label))) {
      result.push({ ...settings, id: raw.id, kind: "custom", label: normalizeLinkTitle(raw.label), icon: raw.icon as NavigationIcon, active: raw.active, order: raw.order });
    }
  }
  return value.flatMap((raw) => result.find((item) => item.id === raw?.id) ?? []);
}
/** No persistent ordering references: deletion cannot strand another item's anchor. */
export function insertionOrder(items: MenuItem[], beforeId: string | null, excludeId?: string) {
  const others = items.filter((item) => item.id !== excludeId);
  const index = beforeId === null ? others.length : others.findIndex((item) => item.id === beforeId);
  if (index < 0) throw new Error("جایگاه انتخاب‌شده دیگر وجود ندارد؛ دوباره انتخاب کنید.");
  const previous = others[index - 1]?.order; const next = others[index]?.order;
  const order = previous === undefined ? (next ?? 0) - 1024 : next === undefined ? previous + 1024 : (previous + next) / 2;
  if (order === previous || order === next) throw new Error("این جایگاه قابل استفاده نیست؛ جایگاه دیگری انتخاب کنید.");
  return order;
}

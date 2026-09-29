"use client";
import { createContext, useContext } from "react";
import type { Employee } from "@/types";
import { canAccessPath, canAccessSection, firstAllowedPath, isSuperAdmin, sectionsForPanel, type Panel, type SectionId, type UserPermissions } from "@/lib/permissions";
import { baseNavigation, customPageLinks, menuItems, type LinkDestination, type LinkOpening, type PageLinkRecord } from "@/lib/pageLinks";
import { externalLinkError } from "@/lib/linkValidation";

export interface ResolvedPortalLink { destination: LinkDestination; opening?: LinkOpening; }
export const AccessContext = createContext<{ identity: Employee; permissions: UserPermissions; loading: boolean; pageLinks: PageLinkRecord[]; linksReady: boolean; linksError: string } | null>(null);
export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) throw new Error("دسترسی‌های حساب در دسترس نیست.");
  const { identity, permissions, loading, pageLinks, linksReady, linksError } = context;
  const custom = customPageLinks(pageLinks);
  const can = (id: SectionId) => !loading && canAccessSection(identity, permissions, id, custom);
  const canVisit = (href: string) => {
    if (loading) return false;
    if (/^https?:\/\//i.test(href)) {
      if (externalLinkError(href)) return false;
      if (typeof window === "undefined") return false;
      const url = new URL(href);
      if (url.origin !== window.location.origin) return true;
      href = url.pathname;
    }
    return canAccessPath(identity, permissions, href);
  };
  const resolveItem = (id: SectionId): ResolvedPortalLink | null => {
    if (!linksReady || !can(id)) return null;
    const item = menuItems(id.startsWith("admin.") ? "admin" : "employee", pageLinks).find((item) => item.id === id);
    if (!item?.active || !canVisit(item.destination.href)) return null;
    return { destination: item.destination, opening: item.opening };
  };
  const resolveHref = (href: string): ResolvedPortalLink | null => {
    // Exact section entry only; detail/query/hash links retain their explicit intent.
    const source = [...baseNavigation("employee"), ...baseNavigation("admin")].find((item) => item.href === href);
    if (source) return resolveItem(source.id);
    if (!linksReady || !canVisit(href)) return null;
    return { destination: { type: /^https?:\/\//i.test(href) ? "external" : "internal", href } };
  };
  return {
    loading, pageLinks, linksReady, linksError,
    canManagePermissions: !loading && isSuperAdmin(identity),
    can, canVisit, resolveItem, resolveHref,
    menu: (panel: Panel) => menuItems(panel, pageLinks),
    permissionSections: (panel: Panel) => [
      ...sectionsForPanel(panel).filter((item) => item.id !== "admin.links").map((item) => ({ id: item.id as SectionId, label: item.label, active: true })),
      ...custom.filter((item) => item.panel === panel).map((item) => ({ id: item.id as SectionId, label: item.label, active: item.active })),
    ],
    firstPath: (panel: Panel) => loading ? null : firstAllowedPath(identity, permissions, panel),
    panelEntryPath: (panel: Panel) => loading ? null : firstAllowedPath(identity, permissions, panel) ?? (custom.some((item) => item.panel === panel && resolveItem(item.id)) ? panel === "admin" ? "/admin" : "/" : null),
  };
}

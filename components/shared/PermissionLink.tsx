"use client";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useAccess, type ResolvedPortalLink } from "@/hooks/useAccess";
import type { SectionId } from "@/lib/permissions";

type PortalLinkProps = Omit<ComponentProps<typeof Link>, "href">;
function ResolvedLink({ resolved, ...props }: PortalLinkProps & { resolved: ResolvedPortalLink | null }) {
  if (!resolved) return null;
  const target = resolved.opening ? resolved.opening === "new-tab" ? "_blank" : undefined : props.target;
  const rel = target === "_blank" ? "noopener noreferrer" : props.rel;
  return resolved.destination.type === "external"
    ? <a {...props} href={resolved.destination.href} target={target} rel={rel} />
    : <Link {...props} href={resolved.destination.href} target={target} rel={rel} />;
}
export function PermissionLink({ href, ...props }: PortalLinkProps & { href: string }) {
  const access = useAccess();
  return <ResolvedLink resolved={access.resolveHref(href)} {...props} />;
}
export function MenuLink({ itemId, ...props }: PortalLinkProps & { itemId: SectionId }) {
  const access = useAccess();
  return <ResolvedLink resolved={access.resolveItem(itemId)} {...props} />;
}
export function SectionAccess({ section, children }: { section: SectionId; children: ReactNode }) {
  const access = useAccess();
  return access.can(section) ? children : null;
}

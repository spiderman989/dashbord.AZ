"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccess } from "@/hooks/useAccess";
import { logoutAdmin, logoutEmployee } from "@/services/authService";
import { Card, Button } from "@/components/ui/Primitives";
import { EmptyState, LoadingState } from "@/components/ui/States";
import type { ReactNode } from "react";
import { MenuLink } from "./PermissionLink";

export function SectionGuard({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const access = useAccess(); const pathname = usePathname(); const router = useRouter();
  if (access.loading) return <LoadingState />;
  const first = access.firstPath(admin ? "admin" : "employee");
  const entries = access.menu(admin ? "admin" : "employee").filter((item) => item.kind === "custom" && access.resolveItem(item.id));
  if (!first && entries.length) return pathname === (admin ? "/admin" : "/")
    ? <Card><EmptyState title="بخش‌های در دسترس شما" description="برای ورود، یکی از دکمه‌های زیر یا منوی کناری را انتخاب کنید." action={<div className="form-actions">{entries.map((item) => <MenuLink key={item.id} itemId={item.id} className="button button-secondary">{item.label}</MenuLink>)}</div>} /></Card>
    : <Card><EmptyState title="شما به این بخش دسترسی ندارید" action={<Link href={admin ? "/admin" : "/"} className="button button-secondary">بازگشت به بخش‌های مجاز</Link>} /></Card>;
  if (!first) return <Card><EmptyState title="برای حساب شما دسترسی تعیین نشده است؛ با مدیر سامانه تماس بگیرید" description="می‌توانید از گزینه خروج از حساب استفاده کنید." action={<Button variant="secondary" onClick={() => void (admin ? logoutAdmin() : logoutEmployee()).then(() => router.replace(admin ? "/admin/login" : "/login"))}>خروج از حساب</Button>} /></Card>;
  if (!access.canVisit(pathname)) return <Card><EmptyState title="شما به این بخش دسترسی ندارید" description="برای تغییر سطح دسترسی با مدیر سامانه تماس بگیرید." action={<Link href={first} className="button button-secondary">بازگشت به بخش مجاز</Link>} /></Card>;
  return children;
}

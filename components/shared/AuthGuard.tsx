"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentAdmin, getCurrentEmployee, logoutAdmin, logoutEmployee, subscribeSession } from "@/services/authService";
import { permissionService } from "@/services/permissionService";
import { canAccessPath, firstAllowedPath, type UserPermissions } from "@/lib/permissions";
import { AccessContext } from "@/hooks/useAccess";
import type { Employee } from "@/types";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { Button } from "@/components/ui/Primitives";
import { errorMessage } from "@/lib/utils";
import { pageLinksService } from "@/services/pageLinksService";
import type { PageLinkRecord } from "@/lib/pageLinks";

const EmployeeContext = createContext<Employee | null>(null);
export function AuthGuard({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<{ identity: Employee; permissions: UserPermissions } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageLinks, setPageLinks] = useState<PageLinkRecord[]>([]);
  const [linksReady, setLinksReady] = useState(false);
  const [linksError, setLinksError] = useState("");
  useEffect(() => {
    let active = true; let request = 0;
    const read = async () => {
      const current = ++request; setLinksReady(false);
      try {
        const records = await pageLinksService.list();
        if (active && current === request) { setPageLinks(records); setLinksError(""); setLinksReady(true); }
      } catch (err) { if (active && current === request) setLinksError(errorMessage(err)); }
    };
    const unsubscribe = pageLinksService.subscribe(() => void read());
    void read();
    return () => { active = false; unsubscribe(); };
  }, []);
  useEffect(() => {
    let active = true; let request = 0;
    const read = async (changed = false) => {
      const current = ++request;
      if (changed) setLoading(true);
      try {
        const identity = await (admin ? getCurrentAdmin() : getCurrentEmployee());
        const permissions = identity ? await permissionService.getForUser(identity) : null;
        if (!active || current !== request) return;
        if (!identity || !permissions) { setSnapshot(null); router.replace(admin ? "/admin/login" : "/login"); return; }
        const path = window.location.pathname;
        const root = admin ? "/admin" : "/";
        const destination = firstAllowedPath(identity, permissions, admin ? "admin" : "employee");
        if (!canAccessPath(identity, permissions, path) && (changed || path === root)) {
          const target = destination ?? root;
          if (path !== target) router.replace(target);
        }
        setSnapshot({ identity, permissions }); setError(""); setLoading(false);
      } catch (err) {
        if (active && current === request) { setError(errorMessage(err)); setLoading(false); }
      }
    };
    const unsubscribeSession = subscribeSession(() => void read(true));
    const unsubscribePermissions = permissionService.subscribe(() => void read(true));
    void read();
    return () => { active = false; unsubscribeSession(); unsubscribePermissions(); };
  }, [admin, router]);
  if (error) return <div className="auth-loading"><ErrorState message={error} retry={() => window.location.reload()} /><Button variant="secondary" onClick={() => void (admin ? logoutAdmin() : logoutEmployee()).then(() => router.replace(admin ? "/admin/login" : "/login"))}>خروج از حساب</Button></div>;
  if (!snapshot) return <div className="auth-loading"><LoadingState /></div>;
  return <EmployeeContext.Provider value={snapshot.identity}><AccessContext.Provider value={{ ...snapshot, loading, pageLinks, linksReady, linksError }}>{children}</AccessContext.Provider></EmployeeContext.Provider>;
}
export function useEmployee(): Employee { const employee = useContext(EmployeeContext); if (!employee) throw new Error("نشست کاربری در دسترس نیست."); return employee; }

"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminRoles, getCurrentAdmin, getCurrentEmployee } from "@/services/authService";
import type { Employee } from "@/types";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { errorMessage } from "@/lib/utils";

const EmployeeContext = createContext<Employee | null>(null);
export function AuthGuard({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const router = useRouter(); const [employee, setEmployee] = useState<Employee | null>(null); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    (admin ? getCurrentAdmin() : getCurrentEmployee()).then((identity) => {
      if (!active) return;
      if (!identity || (admin && !adminRoles.includes(identity.role))) router.replace(admin ? "/admin/login" : "/login");
      else setEmployee(identity);
    }).catch((err: unknown) => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, [admin, router]);
  if (error) return <ErrorState message={error} />;
  if (!employee) return <div className="auth-loading"><LoadingState /></div>;
  return <EmployeeContext.Provider value={employee}>{children}</EmployeeContext.Provider>;
}
export function useEmployee(): Employee { const employee = useContext(EmployeeContext); if (!employee) throw new Error("نشست کاربری در دسترس نیست."); return employee; }

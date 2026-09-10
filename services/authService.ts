import { demoAdmin, demoEmployee } from "@/data/employees";
import { toEnglishDigits } from "@/lib/utils";
import type { Employee, Role } from "@/types";

const EMPLOYEE_KEY = "azarshin.demo.employee";
const ADMIN_KEY = "azarshin.demo.admin";
export const adminRoles: Role[] = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "HR"];
export const demoCredentials = { employee: { personnelCode: "1001", nationalId: "0012345678" }, admin: { username: "admin", password: "admin123" } } as const;
function readSession(key: string, identity: Employee): Employee | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key) === identity.id ? { ...identity } : null;
}
export async function getCurrentEmployee(): Promise<Employee | null> { return readSession(EMPLOYEE_KEY, demoEmployee); }
export async function getCurrentAdmin(): Promise<Employee | null> { return readSession(ADMIN_KEY, demoAdmin); }
export async function loginEmployee(personnelCode: string, nationalId: string): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  if (toEnglishDigits(personnelCode.trim()) !== demoCredentials.employee.personnelCode || toEnglishDigits(nationalId.trim()) !== demoCredentials.employee.nationalId) throw new Error("کد پرسنلی یا کد ملی نادرست است.");
  localStorage.setItem(EMPLOYEE_KEY, demoEmployee.id); return { ...demoEmployee };
}
export async function loginAdmin(username: string, password: string): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  if (username.trim() !== demoCredentials.admin.username || password !== demoCredentials.admin.password) throw new Error("نام کاربری یا رمز عبور نادرست است.");
  localStorage.setItem(ADMIN_KEY, demoAdmin.id); return { ...demoAdmin };
}
export async function logoutEmployee(): Promise<void> { localStorage.removeItem(EMPLOYEE_KEY); }
export async function logoutAdmin(): Promise<void> { localStorage.removeItem(ADMIN_KEY); }
// Demo sessions are convenience UI state, not a security boundary. The production
// backend must verify sessions/roles and use secure HttpOnly session cookies.

import { demoAdmin, demoEmployee, demoEmployeeCredentials } from "@/data/employees";
import { employeeService } from "./employeeService";
import type { Employee, EmployeeAccount, Role } from "@/types";

const EMPLOYEE_KEY = "azarshin.demo.employee";
const ADMIN_KEY = "azarshin.demo.admin";
export const adminRoles: Role[] = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "HR"];
export const demoCredentials = { employee: demoEmployeeCredentials, admin: { username: "admin", password: "admin123" } } as const;
function readSession(key: string, identity: Employee): Employee | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key) === identity.id ? { ...identity } : null;
}
function accountIdentity(account: EmployeeAccount): Employee {
  return { id: account.id, personnelCode: "", username: account.username, name: `${account.firstName} ${account.lastName}`, department: account.position, role: "EMPLOYEE" };
}
export async function getCurrentEmployee(): Promise<Employee | null> {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(EMPLOYEE_KEY);
  if (!id) return null;
  if (id === demoEmployee.id) return { ...demoEmployee, username: demoCredentials.employee.username };
  const account = await employeeService.get(id);
  return account ? accountIdentity(account) : null;
}
export async function getCurrentAdmin(): Promise<Employee | null> { return readSession(ADMIN_KEY, demoAdmin); }
export async function loginEmployee(username: string, password: string): Promise<Employee> {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) throw new Error("نام کاربری را وارد کنید.");
  if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(normalizedUsername)) throw new Error("نام کاربری باید ۳ تا ۴۰ نویسه باشد و با حرف انگلیسی یا عدد شروع شود؛ فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط مجاز است.");
  if (!password.trim()) throw new Error("رمز عبور را وارد کنید.");
  if (password.trim().length < 6 || password.length > 80) throw new Error("رمز عبور باید بین ۶ تا ۸۰ نویسه باشد.");
  await new Promise((resolve) => setTimeout(resolve, 450));
  const account = (await employeeService.list()).find((item) => item.username.toLowerCase() === normalizedUsername);
  const identity = account
    ? account.password === password ? accountIdentity(account) : null
    : normalizedUsername === demoCredentials.employee.username && password === demoCredentials.employee.password
      ? { ...demoEmployee, username: demoCredentials.employee.username } : null;
  if (!identity) throw new Error("نام کاربری یا رمز عبور نادرست است.");
  localStorage.setItem(EMPLOYEE_KEY, identity.id); return identity;
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

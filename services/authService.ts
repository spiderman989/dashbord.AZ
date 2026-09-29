import { demoAdmin, demoEmployee, demoEmployeeCredentials } from "@/data/employees";
import { employeeService } from "./employeeService";
import { permissionService } from "./permissionService";
import type { Employee, EmployeeAccount, Role } from "@/types";

const EMPLOYEE_KEY = "azarshin.demo.employee";
const ADMIN_KEY = "azarshin.demo.admin";
const SESSION_EVENT = "portal:session";
export const adminRoles: Role[] = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "HR"];
export const demoCredentials = { employee: demoEmployeeCredentials, admin: { username: "admin", password: "admin123" } } as const;
export function accountIdentity(account: EmployeeAccount, admin = false): Employee {
  return { id: account.id, personnelCode: "", username: account.username, name: `${account.firstName} ${account.lastName}`, department: account.position, role: admin ? "ADMIN" : "EMPLOYEE" };
}
async function readSession(key: string, admin: boolean): Promise<Employee | null> {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(key);
  if (!id) return null;
  if (id === demoAdmin.id) return { ...demoAdmin, username: demoCredentials.admin.username };
  if (id === demoEmployee.id && !admin) return { ...demoEmployee, username: demoCredentials.employee.username };
  const account = await employeeService.get(id);
  return account ? accountIdentity(account, admin) : null;
}
export async function getCurrentEmployee() { return readSession(EMPLOYEE_KEY, false); }
export async function getCurrentAdmin() { return readSession(ADMIN_KEY, true); }
function setSession(key: string, id?: string) {
  if (id) localStorage.setItem(key, id); else localStorage.removeItem(key);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function subscribeSession(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === EMPLOYEE_KEY || event.key === ADMIN_KEY) listener(); };
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  const unsubscribe = employeeService.subscribe(listener);
  return () => { unsubscribe(); window.removeEventListener(SESSION_EVENT, listener); window.removeEventListener("storage", onStorage); };
}
async function authenticate(username: string, password: string, admin: boolean): Promise<Employee> {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) throw new Error("نام کاربری را وارد کنید.");
  if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(normalizedUsername)) throw new Error("نام کاربری باید ۳ تا ۴۰ نویسه باشد و با حرف انگلیسی یا عدد شروع شود؛ فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط مجاز است.");
  if (!password.trim()) throw new Error("رمز عبور را وارد کنید.");
  if (password.trim().length < 6 || password.length > 80) throw new Error("رمز عبور باید بین ۶ تا ۸۰ نویسه باشد.");
  await new Promise((resolve) => setTimeout(resolve, 450));
  // The explicit primary admin is never projected from editable employee records.
  if (normalizedUsername === demoCredentials.admin.username && password === demoCredentials.admin.password) return { ...demoAdmin, username: demoCredentials.admin.username };
  const account = (await employeeService.list()).find((item) => item.username.toLowerCase() === normalizedUsername);
  const identity = account
    ? account.password === password ? accountIdentity(account, admin) : null
    : !admin && normalizedUsername === demoCredentials.employee.username && password === demoCredentials.employee.password
      ? { ...demoEmployee, username: demoCredentials.employee.username } : null;
  if (!identity) throw new Error("نام کاربری یا رمز عبور نادرست است.");
  return identity;
}
export async function loginEmployee(username: string, password: string): Promise<Employee> {
  const identity = await authenticate(username, password, false);
  setSession(EMPLOYEE_KEY, identity.id);
  return identity;
}
export async function loginAdmin(username: string, password: string): Promise<Employee> {
  const identity = await authenticate(username, password, true);
  const permissions = await permissionService.getForUser(identity);
  if (!permissions.adminAccess) throw new Error("شما اجازه ورود به پنل مدیریت را ندارید.");
  setSession(ADMIN_KEY, identity.id);
  return identity;
}
export async function logoutEmployee(): Promise<void> { setSession(EMPLOYEE_KEY); }
export async function logoutAdmin(): Promise<void> { setSession(ADMIN_KEY); }
// Demo sessions are UI state. The production backend must verify identity and
// section permissions on every request, using secure HttpOnly session cookies.

import type { EmployeeAccount } from "@/types";
import { demoEmployeeCredentials } from "@/data/employees";
import { createMockRepository } from "./mockRepository";

// These mock accounts are persisted and checked only in the browser.
export const employeeService = createMockRepository<EmployeeAccount>("employees", []);

export async function saveEmployee(values: Omit<EmployeeAccount, "id">, id?: string) {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const position = values.position.trim();
  const username = values.username.trim();
  for (const [label, value, max] of [["نام", firstName, 60], ["نام خانوادگی", lastName, 60], ["پست / سمت سازمانی", position, 100]] as const) {
    if (value.length < 2 || value.length > max || !/\p{L}/u.test(value)) {
      throw new Error(`«${label}» را به‌صورت معتبر و بین ۲ تا ${max === 100 ? "۱۰۰" : "۶۰"} حرف وارد کنید.`);
    }
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}$/.test(username)) {
    throw new Error("نام کاربری باید ۳ تا ۴۰ نویسه باشد؛ با حرف انگلیسی یا عدد شروع شود و فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط باشد.");
  }
  if ((!id || values.password !== "") && (values.password.trim().length < 6 || values.password.length > 80)) {
    throw new Error("رمز عبور آزمایشی باید بین ۶ تا ۸۰ نویسه و غیرخالی باشد.");
  }
  const employees = await employeeService.list();
  const current = employees.find((item) => item.id === id);
  if (id && !current) throw new Error("این کارمند دیگر در فهرست وجود ندارد. فهرست را دوباره بررسی کنید.");
  if (username.toLowerCase() === demoEmployeeCredentials.username && current?.username.toLowerCase() !== demoEmployeeCredentials.username) {
    throw new Error("این نام کاربری برای حساب نمونه رزرو شده است. نام کاربری دیگری انتخاب کنید.");
  }
  if (employees.some((item) => item.id !== id && item.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("این نام کاربری قبلاً ثبت شده است. نام کاربری دیگری انتخاب کنید.");
  }
  const record = { firstName, lastName, position, username, password: values.password || current?.password || "" };
  return id ? employeeService.update(id, record) : employeeService.create(record);
}

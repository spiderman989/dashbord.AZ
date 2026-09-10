import { phoneDirectory } from "@/data/phoneDirectory";
import type { PhoneExtension } from "@/types";
import { createMockRepository } from "./mockRepository";
export const phoneDirectoryService = createMockRepository("phone-directory", phoneDirectory);
export const getPhoneDirectory = phoneDirectoryService.list;
export async function saveExtension(departmentId: string, extension: Omit<PhoneExtension, "id">, id?: string) {
  const department = await phoneDirectoryService.get(departmentId);
  if (!department) throw new Error("واحد مورد نظر پیدا نشد.");
  if (id && !department.extensions.some((item) => item.id === id)) throw new Error("شماره داخلی مورد نظر پیدا نشد.");
  const record: PhoneExtension = { ...extension, id: id ?? `ext-${crypto.randomUUID()}` };
  const extensions = id ? department.extensions.map((item) => item.id === id ? record : item) : [...department.extensions, record];
  return phoneDirectoryService.update(departmentId, { extensions });
}
export async function removeExtension(departmentId: string, id: string) {
  const department = await phoneDirectoryService.get(departmentId);
  if (!department) throw new Error("واحد مورد نظر پیدا نشد.");
  return phoneDirectoryService.update(departmentId, { extensions: department.extensions.filter((item) => item.id !== id) });
}

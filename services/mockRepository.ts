import type { Repository } from "@/types";

const PREFIX = "azarshin.portal.v1.";
/** The only mock persistence adapter. Replace repository methods with company API calls. */
export function createMockRepository<T extends { id: string }>(name: string, seed: T[]): Repository<T> {
  const key = PREFIX + name;
  const event = `portal:${name}`;
  function read(): T[] {
    if (typeof window === "undefined") return structuredClone(seed);
    const raw = window.localStorage.getItem(key);
    if (!raw) return structuredClone(seed);
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every((item: unknown) => typeof item === "object" && item !== null && "id" in item && typeof item.id === "string")) throw new Error();
      return parsed as T[];
    } catch { throw new Error("داده‌های ذخیره‌شده قابل خواندن نیست. لطفاً با پشتیبانی تماس بگیرید."); }
  }
  function write(items: T[]) {
    if (typeof window === "undefined") throw new Error("تغییرات نسخه نمایشی فقط در مرورگر قابل ذخیره است.");
    try { window.localStorage.setItem(key, JSON.stringify(items)); }
    catch { throw new Error("فضای ذخیره‌سازی مرورگر کافی نیست. تصویر کوچک‌تری انتخاب کنید و دوباره تلاش کنید."); }
    window.dispatchEvent(new Event(event));
  }
  return {
    async list() { return read(); },
    async get(id) { return read().find((item) => item.id === id); },
    async create(item) { const record = { ...item, id: `${name}-${crypto.randomUUID()}` } as T; write([record, ...read()]); return record; },
    async update(id, item) {
      const items = read(); const index = items.findIndex((record) => record.id === id);
      if (index < 0) throw new Error("آیتم مورد نظر پیدا نشد.");
      const updated = { ...items[index], ...item, id }; items[index] = updated; write(items); return updated;
    },
    async remove(id) { const items = read(); if (!items.some((item) => item.id === id)) throw new Error("آیتم مورد نظر پیدا نشد."); write(items.filter((item) => item.id !== id)); },
    async replace(items) { write(items); return items; },
    subscribe(listener) {
      const storageListener = (e: StorageEvent) => { if (e.key === key || e.key === null) listener(); };
      window.addEventListener(event, listener); window.addEventListener("storage", storageListener);
      return () => { window.removeEventListener(event, listener); window.removeEventListener("storage", storageListener); };
    },
  };
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
export function normalizePersian(value: string): string {
  return toEnglishDigits(value).normalize("NFKC").replace(/ي|ى/g, "ی").replace(/ك/g, "ک").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[\u200c\u200d\s]+/g, "").toLocaleLowerCase("fa");
}
export function matchesSearch(query: string, ...values: (string | number | undefined)[]): boolean {
  return values.some((value) => normalizePersian(String(value ?? "")).includes(normalizePersian(query)));
}
export function faNumber(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
export function cn(...values: (string | false | undefined | null)[]): string { return values.filter(Boolean).join(" "); }
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : "خطایی رخ داده است. لطفاً دوباره تلاش کنید."; }
export function safeHref(value: string): string | undefined {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : undefined; } catch { return undefined; }
}

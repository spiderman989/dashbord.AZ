/** No credentials, scheme guessing or implicit base URL. Shared by forms and storage reads. */
export function externalLinkError(value: string): string | undefined {
  if (!value.trim()) return "آدرس مقصد خارجی را وارد کنید.";
  if (!/^https?:\/\//i.test(value.trim())) return "آدرس کامل باید با http:// یا https:// شروع شود.";
  if (!/^https?:\/\/[^/?#]/i.test(value.trim())) return "دامنه یا نشانی میزبان را بعد از پروتکل وارد کنید.";
  if (/[\u0000-\u0020\u007f\\]/.test(value.trim())) return "آدرس نباید شامل فاصله، نویسه کنترلی یا بک‌اسلش باشد.";
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return "آدرس مقصد معتبر نیست.";
    if (url.username || url.password || value.trim().split(/[/?#]/)[2]?.includes("@")) return "آدرس نباید شامل نام کاربری یا رمز عبور باشد.";
    if (url.port && (Number(url.port) < 1 || Number(url.port) > 65535)) return "پورت باید عددی بین ۱ تا ۶۵۵۳۵ باشد.";
  } catch { return "آدرس یا پورت معتبر نیست؛ آدرس کامل مقصد را وارد کنید."; }
  return undefined;
}
export const normalizeLinkTitle = (value: string) => value.trim().replace(/\s+/g, " ");
export function linkTitleError(value: string, existing: readonly string[]): string | undefined {
  const title = normalizeLinkTitle(value);
  if (!title) return "عنوان دکمه را وارد کنید.";
  if (title.length > 100) return "عنوان دکمه حداکثر ۱۰۰ نویسه باشد.";
  if (existing.some((label) => normalizeLinkTitle(label).toLocaleLowerCase("fa") === title.toLocaleLowerCase("fa"))) return "دکمه‌ای با این عنوان در همین پنل وجود دارد.";
  return undefined;
}

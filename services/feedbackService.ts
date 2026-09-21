import type { Feedback } from "@/types";
import { createMockRepository } from "./mockRepository";

export const feedbackService = createMockRepository<Feedback>("feedback", []);

export async function submitFeedback(values: { employeeId: string; type: string; subject: string; message: string }) {
  const { employeeId, type } = values;
  const subject = values.subject.trim();
  const message = values.message.trim();
  if (type !== "suggestion" && type !== "criticism") throw new Error("نوع پیام را از بین پیشنهاد و انتقاد انتخاب کنید.");
  if (subject.length < 3 || subject.length > 180 || !/[\p{L}\p{N}]/u.test(subject)) throw new Error("عنوان پیام باید بین ۳ تا ۱۸۰ نویسه و غیرخالی باشد.");
  if (message.length < 10 || message.length > 5000 || !/[\p{L}\p{N}]/u.test(message)) throw new Error("متن پیام باید بین ۱۰ تا ۵۰۰۰ نویسه و غیرخالی باشد.");
  if (!employeeId.trim()) throw new Error("نشست کاربری در دسترس نیست. دوباره وارد شوید.");
  return feedbackService.create({ employeeId, type, subject, message, createdAt: new Date().toISOString(), status: "submitted" });
}

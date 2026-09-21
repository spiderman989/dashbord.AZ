import type { Metadata } from "next";
import { FeedbackPage } from "@/components/employee/FeedbackPage";

export const metadata: Metadata = { title: "صندوق انتقادات و پیشنهادات" };
export default function Page() { return <FeedbackPage />; }

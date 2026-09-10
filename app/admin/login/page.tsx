import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/LoginForm";
export const metadata: Metadata = { title: "ورود مدیران" };
export default function AdminLoginPage() { return <LoginForm admin />; }

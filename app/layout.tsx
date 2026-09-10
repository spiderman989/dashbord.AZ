import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const vazirmatn = localFont({ src: "../public/fonts/vazirmatn-arabic-variable.woff2", variable: "--font-vazirmatn", display: "swap", weight: "100 900" });
export const metadata: Metadata = { title: { default: "پورتال کارکنان | آذرشین", template: "%s | آذرشین" }, description: "پورتال کارکنان و مدیریت سازمان آجر آذرشین", robots: { index: false, follow: false }, icons: { icon: "/assets/brand-guide.png" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1c2632" };
export const dynamic = "force-dynamic";
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fa" dir="rtl" className={vazirmatn.variable}><body><ToastProvider>{children}</ToastProvider></body></html>; }

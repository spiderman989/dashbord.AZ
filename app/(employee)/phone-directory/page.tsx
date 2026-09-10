import type { Metadata } from "next";
import { PhoneDirectory } from "@/components/employee/PhoneDirectory";
import { getPhoneDirectory } from "@/services/phoneDirectoryService";
export const metadata: Metadata = { title: "لیست واحدها و داخلی‌ها" };
export default async function PhoneDirectoryPage() { return <PhoneDirectory initial={await getPhoneDirectory()} />; }

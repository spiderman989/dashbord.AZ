import type { Metadata } from "next";
import { AdminEmployees } from "@/components/admin/AdminEmployees";

export const metadata: Metadata = { title: "مدیریت کارکنان" };
export default function EmployeesPage() { return <AdminEmployees />; }

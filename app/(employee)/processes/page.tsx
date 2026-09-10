import type { Metadata } from "next";
import { ProcessInbox } from "@/components/employee/ProcessInbox";
import { getProcesses } from "@/services/processService";
export const metadata: Metadata = { title: "کارتابل فرآیندها" };
export default async function ProcessesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) { const [initial, params] = await Promise.all([getProcesses(), searchParams]); return <ProcessInbox initial={initial} initialStatus={params.status} />; }

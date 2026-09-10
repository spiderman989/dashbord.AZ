import { ProcessDetails } from "@/components/employee/ProcessDetails";
import { getProcesses } from "@/services/processService";
export default async function ProcessPage({ params }: { params: Promise<{ id: string }> }) { const [{ id }, initial] = await Promise.all([params, getProcesses()]); return <ProcessDetails id={id} initial={initial} />; }

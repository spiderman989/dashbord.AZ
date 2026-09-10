import { ProcessRequestForm } from "@/components/employee/ProcessRequestForm";
export default async function NewProcessPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) { const { type } = await searchParams; return <ProcessRequestForm initialType={type} />; }

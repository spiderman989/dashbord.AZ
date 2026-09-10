import { ContentManager } from "@/components/admin/ContentManager";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ContentManager kind="news" recordId={id} />; }

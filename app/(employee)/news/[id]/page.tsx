import { NewsDetail } from "@/components/employee/NewsPages";
export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <NewsDetail id={id} />; }

import Link from "next/link";
import { notFound } from "next/navigation";
import { ResearchForm } from "@/src/components/admin/research-form";
import { getAdminResearch, getCommercialFormOptions } from "@/src/lib/commercial-admin";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export default async function EditResearchPage({ params }: Props) { const id = (await params).id; const [research, options] = await Promise.all([getAdminResearch(id), getCommercialFormOptions()]); if (!research) notFound(); return <div><Link href="/admin/research" className="text-caption font-semibold text-accent">← Research</Link><h1 className="my-6 text-h1 text-text-primary">Edit research</h1><ResearchForm research={research} options={options} /></div>; }

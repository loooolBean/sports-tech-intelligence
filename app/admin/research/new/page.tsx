import Link from "next/link";
import { ResearchForm } from "@/src/components/admin/research-form";
import { getCommercialFormOptions } from "@/src/lib/commercial-admin";
export const dynamic = "force-dynamic";
export default async function NewResearchPage() { const options = await getCommercialFormOptions(); return <div><Link href="/admin/research" className="text-caption font-semibold text-accent">← Research</Link><h1 className="my-6 text-h1 text-text-primary">Add research</h1><ResearchForm options={options} /></div>; }

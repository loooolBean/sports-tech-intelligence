import Link from "next/link";
import { EvidenceForm } from "@/src/components/admin/evidence-form";
import { getCommercialFormOptions } from "@/src/lib/commercial-admin";
export const dynamic = "force-dynamic";
export default async function NewEvidencePage() { const options = await getCommercialFormOptions(); return <div><Link href="/admin/evidence" className="text-caption font-semibold text-accent">← Evidence</Link><h1 className="my-6 text-h1 text-text-primary">Add evidence</h1><EvidenceForm options={options} /></div>; }

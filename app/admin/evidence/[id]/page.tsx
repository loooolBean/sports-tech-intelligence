import Link from "next/link";
import { notFound } from "next/navigation";
import { EvidenceForm } from "@/src/components/admin/evidence-form";
import { getCommercialFormOptions } from "@/src/lib/commercial-admin";
import { prisma } from "@/src/lib/prisma";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export default async function EditEvidencePage({ params }: Props) { const id = (await params).id; const [evidence, options] = await Promise.all([prisma.evidence.findUnique({ where: { id } }), getCommercialFormOptions()]); if (!evidence) notFound(); return <div><Link href="/admin/evidence" className="text-caption font-semibold text-accent">← Evidence</Link><h1 className="my-6 text-h1 text-text-primary">Edit evidence</h1><EvidenceForm evidence={evidence} options={options} /></div>; }

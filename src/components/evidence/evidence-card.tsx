import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { evidenceInclude } from "@/src/lib/evidence";

export const EVIDENCE_SOURCE_LABELS = {
  PEER_REVIEWED: "Peer reviewed",
  INDEPENDENT: "Independent",
  PROFESSIONAL_ADOPTION: "Professional adoption",
  VENDOR_REPORTED: "Vendor reported",
} as const;

type EvidenceData = Prisma.EvidenceGetPayload<{ include: typeof evidenceInclude }>;

export function EvidenceCard({ evidence, fullDetails }: { evidence: EvidenceData; fullDetails: boolean }) {
  const sourceHref = evidence.research ? `/research/${evidence.research.slug}` : evidence.sourceUrl;
  return <article className="rounded-lg border border-border p-5"><div className="flex flex-wrap items-center gap-2"><span className="rounded border border-border bg-bg-elevated px-2 py-1 text-caption font-semibold text-text-secondary">{EVIDENCE_SOURCE_LABELS[evidence.sourceType]}</span><span className="text-caption text-text-tertiary">{evidence.evidenceType.replaceAll("_", " ")}</span></div><h3 className="mt-3 text-h3 text-text-primary">{evidence.title}</h3><p className="mt-2 text-body text-text-secondary">{evidence.summary ?? "Evidence context is being indexed."}</p>{fullDetails && <dl className="mt-4 grid gap-3 text-caption sm:grid-cols-2">{evidence.finding && <div><dt className="font-semibold text-text-primary">Finding</dt><dd className="mt-1 text-text-secondary">{evidence.finding}</dd></div>}{evidence.population && <div><dt className="font-semibold text-text-primary">Population</dt><dd className="mt-1 text-text-secondary">{evidence.population}</dd></div>}{evidence.metric && <div><dt className="font-semibold text-text-primary">Metric</dt><dd className="mt-1 text-text-secondary">{evidence.metric}</dd></div>}{evidence.sampleSize !== null && <div><dt className="font-semibold text-text-primary">Sample size</dt><dd className="mt-1 text-text-secondary">{evidence.sampleSize}</dd></div>}</dl>}{sourceHref && (sourceHref.startsWith("/") ? <Link href={sourceHref} className="mt-4 inline-block text-caption font-semibold text-accent">View research →</Link> : <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-caption font-semibold text-accent">View source ↗</a>)}</article>;
}

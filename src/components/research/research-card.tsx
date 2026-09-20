import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { researchListInclude } from "@/src/lib/research";

type ResearchCardData = Prisma.ResearchGetPayload<{ include: typeof researchListInclude }>;

export function ResearchCard({ research }: { research: ResearchCardData }) {
  const product = research.products[0]?.product;
  return <article className="card-surface flex h-full flex-col p-5"><div className="flex flex-wrap items-center gap-2 text-caption text-text-tertiary"><span>{research.studyType.replaceAll("_", " ")}</span>{research.publicationYear && <span>· {research.publicationYear}</span>}{research.isPeerReviewed && <span className="rounded border border-border px-2 py-0.5">Peer reviewed</span>}</div><h2 className="mt-3 text-h3 text-text-primary"><Link href={`/research/${research.slug}`} className="hover:text-accent">{research.title}</Link></h2><p className="mt-2 line-clamp-3 flex-1 text-body text-text-secondary">{research.abstract ?? "Study context is being indexed."}</p><div className="mt-4 text-caption text-text-tertiary">{research.journal ?? "Journal not recorded"}{product && <> · Related to {product.name}</>}</div><div className="mt-3 flex flex-wrap gap-2">{research.technologies.map(({ technology }) => <span key={technology.id} className="rounded bg-bg-elevated px-2 py-1 text-caption text-text-secondary">{technology.name}</span>)}</div><Link href={`/research/${research.slug}`} className="mt-5 text-caption font-semibold text-accent">View research →</Link></article>;
}

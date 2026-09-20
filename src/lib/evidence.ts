import { EvidenceSourceType, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const evidenceInclude = {
  research: true,
  product: true,
  company: true,
  technology: true,
  useCase: true,
  sport: true,
} satisfies Prisma.EvidenceInclude;

export async function getEvidenceCounts(productId: string) {
  const grouped = await prisma.evidence.groupBy({ by: ["sourceType"], where: { productId }, _count: { _all: true } });
  const counts: Record<EvidenceSourceType, number> = {
    PEER_REVIEWED: 0,
    INDEPENDENT: 0,
    PROFESSIONAL_ADOPTION: 0,
    VENDOR_REPORTED: 0,
  };
  grouped.forEach((item) => { counts[item.sourceType] = item._count._all; });
  return counts;
}

export async function getProductEvidence(productId: string, sourceType?: EvidenceSourceType) {
  return prisma.evidence.findMany({
    where: { productId, ...(sourceType ? { sourceType } : {}) },
    include: evidenceInclude,
    orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }],
  });
}

export async function getCompanyResearchSummary(companyId: string) {
  const where = { OR: [{ companies: { some: { companyId } } }, { products: { some: { product: { companyId } } } }] };
  const [research, researchCount, evidenceCount, productsWithEvidence] = await Promise.all([
    prisma.research.findMany({ where, include: { products: { include: { product: true } } }, orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }], take: 5 }),
    prisma.research.count({ where }),
    prisma.evidence.count({ where: { OR: [{ companyId }, { product: { companyId } }] } }),
    prisma.product.count({ where: { companyId, evidence: { some: {} } } }),
  ]);
  return { research, researchCount, evidenceCount, productsWithEvidence };
}

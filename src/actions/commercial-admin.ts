"use server";

import { CompanyClaimStatus, EvidenceSourceType, EvidenceType, ResearchStudyType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { slugify } from "@/src/utils/content";

const optionalText = z.string().trim().transform((value) => value || null);
const researchSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(300),
  slug: z.string().trim().max(120).optional(),
  abstract: optionalText,
  summary: optionalText,
  authors: optionalText,
  journal: optionalText,
  doi: optionalText,
  url: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
  studyType: z.nativeEnum(ResearchStudyType),
  population: optionalText,
  publicationYear: z.string().trim(),
  publicationDate: z.string().trim(),
  sampleSize: z.string().trim(),
  isPeerReviewed: z.boolean(),
});

const evidenceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(300),
  summary: optionalText,
  finding: optionalText,
  evidenceType: z.nativeEnum(EvidenceType),
  sourceType: z.nativeEnum(EvidenceSourceType),
  metric: optionalText,
  population: optionalText,
  sourceUrl: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
  publicationYear: z.string().trim(),
  sampleSize: z.string().trim(),
  researchId: z.string().trim().transform((value) => value || null),
  productId: z.string().trim().transform((value) => value || null),
  companyId: z.string().trim().transform((value) => value || null),
  technologyId: z.string().trim().transform((value) => value || null),
  useCaseId: z.string().trim().transform((value) => value || null),
  sportId: z.string().trim().transform((value) => value || null),
});

async function requireAdmin() {
  const user = await requireAdminUser();
  if (!user) throw new Error("Administrator access is required.");
  return user;
}

function numberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error("Numeric values must be positive whole numbers.");
  return parsed;
}

function ids(formData: FormData, key: string) {
  return [...new Set(formData.getAll(key).map(String).filter(Boolean))];
}

export async function saveResearch(formData: FormData) {
  await requireAdmin();
  const parsed = researchSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    title: String(formData.get("title") ?? ""), slug: String(formData.get("slug") ?? ""),
    abstract: String(formData.get("abstract") ?? ""), summary: String(formData.get("summary") ?? ""),
    authors: String(formData.get("authors") ?? ""), journal: String(formData.get("journal") ?? ""),
    doi: String(formData.get("doi") ?? ""), url: String(formData.get("url") ?? ""),
    studyType: String(formData.get("studyType") ?? "OTHER"), population: String(formData.get("population") ?? ""),
    publicationYear: String(formData.get("publicationYear") ?? ""), publicationDate: String(formData.get("publicationDate") ?? ""),
    sampleSize: String(formData.get("sampleSize") ?? ""), isPeerReviewed: formData.get("isPeerReviewed") === "on",
  });
  const slug = slugify(parsed.slug || parsed.title);
  if (!slug) throw new Error("Research title must produce a valid slug.");
  const relationData = {
    products: { create: ids(formData, "productIds").map((productId) => ({ product: { connect: { id: productId } } })) },
    companies: { create: ids(formData, "companyIds").map((companyId) => ({ company: { connect: { id: companyId } } })) },
    technologies: { create: ids(formData, "technologyIds").map((technologyId) => ({ technology: { connect: { id: technologyId } } })) },
    useCases: { create: ids(formData, "useCaseIds").map((useCaseId) => ({ useCase: { connect: { id: useCaseId } } })) },
    sports: { create: ids(formData, "sportIds").map((sportId) => ({ sport: { connect: { id: sportId } } })) },
  };
  const core = {
    title: parsed.title, slug, abstract: parsed.abstract, summary: parsed.summary, authors: parsed.authors, journal: parsed.journal,
    publicationYear: numberOrNull(parsed.publicationYear), publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
    doi: parsed.doi, url: parsed.url, studyType: parsed.studyType, population: parsed.population,
    sampleSize: numberOrNull(parsed.sampleSize), isPeerReviewed: parsed.isPeerReviewed,
  };
  const research = parsed.id
    ? await prisma.research.update({ where: { id: parsed.id }, data: { ...core, products: { deleteMany: {}, ...relationData.products }, companies: { deleteMany: {}, ...relationData.companies }, technologies: { deleteMany: {}, ...relationData.technologies }, useCases: { deleteMany: {}, ...relationData.useCases }, sports: { deleteMany: {}, ...relationData.sports } } })
    : await prisma.research.create({ data: { ...core, ...relationData } });
  revalidatePath("/research"); revalidatePath(`/research/${research.slug}`); revalidatePath("/search"); revalidatePath("/sitemap.xml");
  redirect("/admin/research");
}

export async function deleteResearch(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(String(formData.get("id") ?? ""));
  const untraceableEvidence = await prisma.evidence.count({ where: { researchId: id, sourceUrl: null } });
  if (untraceableEvidence) throw new Error("This research is the only traceable source for linked evidence. Add source URLs or delete those evidence records first.");
  await prisma.research.delete({ where: { id } });
  revalidatePath("/research"); revalidatePath("/admin/research"); revalidatePath("/sitemap.xml");
}

export async function saveEvidence(formData: FormData) {
  await requireAdmin();
  const parsed = evidenceSchema.parse(Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)])));
  if (!parsed.researchId && !parsed.sourceUrl) throw new Error("Evidence must link to research or a traceable source URL.");
  const data = {
    title: parsed.title, summary: parsed.summary, finding: parsed.finding, evidenceType: parsed.evidenceType, sourceType: parsed.sourceType,
    metric: parsed.metric, population: parsed.population, sourceUrl: parsed.sourceUrl,
    publicationYear: numberOrNull(parsed.publicationYear), sampleSize: numberOrNull(parsed.sampleSize),
    researchId: parsed.researchId, productId: parsed.productId, companyId: parsed.companyId, technologyId: parsed.technologyId,
    useCaseId: parsed.useCaseId, sportId: parsed.sportId,
  };
  if (parsed.id) await prisma.evidence.update({ where: { id: parsed.id }, data });
  else await prisma.evidence.create({ data });
  revalidatePath("/research"); revalidatePath("/search"); revalidatePath("/products"); revalidatePath("/companies");
  redirect("/admin/evidence");
}

export async function deleteEvidence(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(String(formData.get("id") ?? ""));
  await prisma.evidence.delete({ where: { id } });
  revalidatePath("/admin/evidence"); revalidatePath("/research");
}

export async function reviewCompanyClaim(formData: FormData) {
  const admin = await requireAdmin();
  const claimId = z.string().uuid().parse(String(formData.get("claimId") ?? ""));
  const status = z.nativeEnum(CompanyClaimStatus).parse(String(formData.get("status") ?? ""));
  if (status === CompanyClaimStatus.PENDING) throw new Error("Review must approve or reject the claim.");
  await prisma.$transaction(async (tx) => {
    const pendingClaim = await tx.companyClaim.findUniqueOrThrow({ where: { id: claimId } });
    if (status === CompanyClaimStatus.APPROVED) {
      const existingManager = await tx.companyMember.findFirst({ where: { companyId: pendingClaim.companyId, userId: { not: pendingClaim.userId } } });
      if (existingManager) throw new Error("This company is already managed by another approved user.");
    }
    const claim = await tx.companyClaim.update({ where: { id: claimId }, data: { status, reviewedAt: new Date(), reviewedById: admin.id } });
    if (status === CompanyClaimStatus.APPROVED) {
      await tx.companyMember.upsert({ where: { companyId_userId: { companyId: claim.companyId, userId: claim.userId } }, create: { companyId: claim.companyId, userId: claim.userId }, update: {} });
      await tx.company.update({ where: { id: claim.companyId }, data: { isVerified: true } });
    }
  });
  revalidatePath("/admin/claims"); revalidatePath("/vendor"); revalidatePath("/companies");
}

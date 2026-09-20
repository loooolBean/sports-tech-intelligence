import { Prisma, ResearchStudyType } from "@prisma/client";
import { prisma } from "./prisma";

export type ResearchFilters = {
  query?: string;
  studyType?: ResearchStudyType;
  technology?: string;
  useCase?: string;
  sport?: string;
  year?: number;
  peerReviewed?: boolean;
  page?: number;
};

export const researchListInclude = {
  products: { include: { product: { include: { company: true } } }, take: 3 },
  technologies: { include: { technology: true }, take: 3 },
  useCases: { include: { useCase: true }, take: 3 },
  sports: { include: { sport: true }, take: 3 },
} satisfies Prisma.ResearchInclude;

export async function getResearchList(filters: ResearchFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const take = 18;
  const where: Prisma.ResearchWhereInput = {
    ...(filters.query
      ? { OR: [
          { title: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
          { abstract: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
          { summary: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
          { authors: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
          { journal: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
        ] }
      : {}),
    ...(filters.studyType ? { studyType: filters.studyType } : {}),
    ...(filters.technology ? { technologies: { some: { technology: { slug: filters.technology } } } } : {}),
    ...(filters.useCase ? { useCases: { some: { useCase: { slug: filters.useCase } } } } : {}),
    ...(filters.sport ? { sports: { some: { sport: { slug: filters.sport } } } } : {}),
    ...(filters.year ? { publicationYear: filters.year } : {}),
    ...(filters.peerReviewed !== undefined ? { isPeerReviewed: filters.peerReviewed } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.research.findMany({ where, include: researchListInclude, orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }], skip: (page - 1) * take, take }),
    prisma.research.count({ where }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / take)) };
}

export async function getResearchBySlug(slug: string) {
  return prisma.research.findUnique({
    where: { slug },
    include: {
      products: { include: { product: { include: { company: true } } } },
      companies: { include: { company: true } },
      technologies: { include: { technology: true } },
      useCases: { include: { useCase: true } },
      sports: { include: { sport: true } },
      evidence: { include: { product: true, company: true, technology: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getResearchFilters() {
  const [technologies, useCases, sports, years] = await Promise.all([
    prisma.technology.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.useCase.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.sport.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.research.findMany({ where: { publicationYear: { not: null } }, distinct: ["publicationYear"], select: { publicationYear: true }, orderBy: { publicationYear: "desc" } }),
  ]);
  return { technologies, useCases, sports, years: years.flatMap((item) => item.publicationYear ?? []) };
}

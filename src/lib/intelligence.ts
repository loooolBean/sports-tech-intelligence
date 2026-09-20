import { ArticleStatus, EvidenceSourceType, Prisma, ResearchStudyType } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

const entityInclude = { technologies: { include: { technology: true } }, useCases: { include: { useCase: true } }, sports: { include: { sport: true } } } satisfies Prisma.ProductInclude;
export type ProductWithIntelligence = Prisma.ProductGetPayload<{ include: typeof entityInclude }>;
export type IntelligenceSearchInput = { query?: string; type?: "all" | "companies" | "products" | "research" | "articles"; technology?: string; useCase?: string; sport?: string; evidenceSource?: EvidenceSourceType; studyType?: ResearchStudyType; publicationYear?: number; peerReviewed?: boolean };

const directoryProductSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  company: { select: { name: true, slug: true } },
  technologies: { select: { technology: { select: { id: true, name: true } } }, take: 3 },
  useCases: { select: { useCase: { select: { id: true, name: true } } }, take: 2 },
} satisfies Prisma.ProductSelect;

const getCachedCompaniesDirectory = unstable_cache(
  () => prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      country: true,
      products: { select: directoryProductSelect, take: 3 },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take: 18,
  }),
  ["public-companies-directory-v1"],
  { revalidate: 600, tags: ["intelligence-directory"] },
);

const getCachedProductsDirectory = unstable_cache(
  () => prisma.product.findMany({
    select: directoryProductSelect,
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take: 24,
  }),
  ["public-products-directory-v1"],
  { revalidate: 600, tags: ["intelligence-directory"] },
);

export async function getCompaniesDirectory() {
  return getCachedCompaniesDirectory();
}

export async function getProductsDirectory() {
  return getCachedProductsDirectory();
}

export async function searchIntelligence(input: IntelligenceSearchInput) {
  const query = input.query?.trim() ?? "";
  const technology = input.technology?.trim();
  const useCase = input.useCase?.trim();
  const sport = input.sport?.trim();
  const type = input.type ?? "all";
  const companyTextFilter: Prisma.CompanyWhereInput = query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { shortDescription: { contains: query, mode: "insensitive" } }, { products: { some: { name: { contains: query, mode: "insensitive" } } } }] } : {};
  const productTextFilter: Prisma.ProductWhereInput = query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { shortDescription: { contains: query, mode: "insensitive" } }, { company: { name: { contains: query, mode: "insensitive" } } }, { technologies: { some: { technology: { name: { contains: query, mode: "insensitive" } } } } }, { useCases: { some: { useCase: { name: { contains: query, mode: "insensitive" } } } } }] } : {};
  const productRelationFilter: Prisma.ProductWhereInput = { ...(technology ? { technologies: { some: { technology: { slug: technology } } } } : {}), ...(useCase ? { useCases: { some: { useCase: { slug: useCase } } } } : {}), ...(sport ? { sports: { some: { sport: { slug: sport } } } } : {}), ...(input.evidenceSource ? { evidence: { some: { sourceType: input.evidenceSource } } } : {}) };
  const articleFilter: Prisma.ArticleWhereInput = { status: ArticleStatus.PUBLISHED, duplicateOfId: null, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { excerpt: { contains: query, mode: "insensitive" } }, { body: { contains: query, mode: "insensitive" } }, { articleTags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } }, { companies: { some: { company: { name: { contains: query, mode: "insensitive" } } } } }, { products: { some: { product: { name: { contains: query, mode: "insensitive" } } } } }] } : {}), ...(technology ? { technologies: { some: { technology: { slug: technology } } } } : {}), ...(useCase ? { products: { some: { product: { useCases: { some: { useCase: { slug: useCase } } } } } } } : {}), ...(sport ? { products: { some: { product: { sports: { some: { sport: { slug: sport } } } } } } } : {}) };
  const researchFilter: Prisma.ResearchWhereInput = { ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { abstract: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }, { authors: { contains: query, mode: "insensitive" } }, { journal: { contains: query, mode: "insensitive" } }] } : {}), ...(technology ? { technologies: { some: { technology: { slug: technology } } } } : {}), ...(useCase ? { useCases: { some: { useCase: { slug: useCase } } } } : {}), ...(sport ? { sports: { some: { sport: { slug: sport } } } } : {}), ...(input.studyType ? { studyType: input.studyType } : {}), ...(input.publicationYear ? { publicationYear: input.publicationYear } : {}), ...(input.peerReviewed !== undefined ? { isPeerReviewed: input.peerReviewed } : {}), ...(input.evidenceSource ? { evidence: { some: { sourceType: input.evidenceSource } } } : {}) };
  const [companies, products, research, articles] = await Promise.all([
    type === "products" || type === "research" || type === "articles" ? [] : prisma.company.findMany({ where: { ...companyTextFilter, ...((technology || useCase || sport || input.evidenceSource) ? { products: { some: productRelationFilter } } : {}) }, include: { products: { include: entityInclude, take: 3 } }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], take: 18 }),
    type === "companies" || type === "research" || type === "articles" ? [] : prisma.product.findMany({ where: { ...productTextFilter, ...productRelationFilter }, include: { company: true, ...entityInclude }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], take: 24 }),
    type === "companies" || type === "products" || type === "articles" ? [] : prisma.research.findMany({ where: researchFilter, include: { products: { include: { product: { include: { company: true } } }, take: 2 }, technologies: { include: { technology: true }, take: 3 }, useCases: { include: { useCase: true }, take: 2 }, sports: { include: { sport: true }, take: 2 } }, orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }], take: 24 }),
    type === "companies" || type === "products" || type === "research" ? [] : prisma.article.findMany({ where: articleFilter, include: { source: true, category: true, aiSummary: true, companies: { include: { company: true }, take: 1 } }, orderBy: { publishedAt: "desc" }, take: 24 }),
  ]);
  return { companies, products, research, articles, counts: { companies: companies.length, products: products.length, research: research.length, articles: articles.length } };
}

export async function getHomepageIntelligence() {
  const [featuredCompanies, featuredProducts, latestArticles, companyCount, productCount, articleCount, technologyCount, researchCount, useCases] = await Promise.all([
    prisma.company.findMany({ where: { isFeatured: true }, include: { products: { include: entityInclude, take: 2 } }, orderBy: { name: "asc" }, take: 4 }),
    prisma.product.findMany({ where: { isFeatured: true }, include: { company: true, ...entityInclude }, orderBy: { name: "asc" }, take: 4 }),
    prisma.article.findMany({ where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null }, include: { source: true, category: true, aiSummary: true, companies: { include: { company: true }, take: 1 }, technologies: { include: { technology: true }, take: 2 } }, orderBy: { publishedAt: "desc" }, take: 6 }),
    prisma.company.count(), prisma.product.count(), prisma.article.count({ where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null } }), prisma.technology.count(), prisma.research.count(),
    prisma.useCase.findMany({ orderBy: { name: "asc" }, take: 10 }),
  ]);
  return { featuredCompanies, featuredProducts, latestArticles, stats: { companyCount, productCount, articleCount, technologyCount, researchCount }, useCases };
}

export async function getCompanyBySlug(slug: string) { return prisma.company.findUnique({ where: { slug }, include: { products: { include: entityInclude, orderBy: { name: "asc" } }, articles: { where: { article: { status: ArticleStatus.PUBLISHED, duplicateOfId: null } }, include: { article: { include: { source: true, aiSummary: true } } }, orderBy: { article: { publishedAt: "desc" } }, take: 6 } } }); }
export async function getProductBySlug(slug: string) { return prisma.product.findUnique({ where: { slug }, include: { company: true, ...entityInclude, articles: { where: { article: { status: ArticleStatus.PUBLISHED, duplicateOfId: null } }, include: { article: { include: { source: true, aiSummary: true } } }, orderBy: { article: { publishedAt: "desc" } }, take: 6 } } }); }
export async function getExploreFilters() { const [technologies, useCases, sports] = await Promise.all([prisma.technology.findMany({ orderBy: { name: "asc" } }), prisma.useCase.findMany({ orderBy: { name: "asc" } }), prisma.sport.findMany({ orderBy: { name: "asc" } })]); return { technologies, useCases, sports }; }

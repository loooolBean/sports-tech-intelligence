import { ArticleStatus, type Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type WatchlistSort = "recent" | "name";

export function watchCompany(userId: string, companyId: string) {
  return prisma.watchedCompany.createMany({ data: [{ userId, companyId }], skipDuplicates: true });
}

export function unwatchCompanyForUser(userId: string, companyId: string) {
  return prisma.watchedCompany.deleteMany({ where: { userId, companyId } });
}

export function watchProduct(userId: string, productId: string) {
  return prisma.watchedProduct.createMany({ data: [{ userId, productId }], skipDuplicates: true });
}

export function unwatchProductForUser(userId: string, productId: string) {
  return prisma.watchedProduct.deleteMany({ where: { userId, productId } });
}

export async function isCompanyWatched(userId: string, companyId: string) {
  return Boolean(await prisma.watchedCompany.findUnique({ where: { userId_companyId: { userId, companyId } }, select: { id: true } }));
}

export async function isProductWatched(userId: string, productId: string) {
  return Boolean(await prisma.watchedProduct.findUnique({ where: { userId_productId: { userId, productId } }, select: { id: true } }));
}

export async function getUserWatchlist(userId: string, sort: WatchlistSort = "recent") {
  const companyOrder: Prisma.WatchedCompanyOrderByWithRelationInput = sort === "name" ? { company: { name: "asc" } } : { createdAt: "desc" };
  const productOrder: Prisma.WatchedProductOrderByWithRelationInput = sort === "name" ? { product: { name: "asc" } } : { createdAt: "desc" };
  const technologyOrder: Prisma.WatchedTechnologyOrderByWithRelationInput = sort === "name" ? { technology: { name: "asc" } } : { createdAt: "desc" };
  const [companies, products, technologies, companyActivity, productActivity, technologyActivity] = await Promise.all([
    prisma.watchedCompany.findMany({
      where: { userId }, orderBy: companyOrder, take: 50,
      include: { company: { include: { _count: { select: { products: true } }, articles: { where: { article: { status: ArticleStatus.PUBLISHED } }, include: { article: { select: { publishedAt: true } } }, orderBy: { article: { publishedAt: "desc" } }, take: 1 } } } },
    }),
    prisma.watchedProduct.findMany({
      where: { userId }, orderBy: productOrder, take: 50,
      include: { product: { include: { company: true, technologies: { include: { technology: true } }, useCases: { include: { useCase: true } }, articles: { where: { article: { status: ArticleStatus.PUBLISHED } }, include: { article: { select: { publishedAt: true } } }, orderBy: { article: { publishedAt: "desc" } }, take: 1 } } } },
    }),
    prisma.watchedTechnology.findMany({ where: { userId }, orderBy: technologyOrder, take: 50, include: { technology: true } }),
    prisma.alert.groupBy({ by: ["companyId"], where: { userId, isRead: false, companyId: { not: null } }, _count: true }),
    prisma.alert.groupBy({ by: ["productId"], where: { userId, isRead: false, productId: { not: null } }, _count: true }),
    prisma.alert.groupBy({ by: ["technologyId"], where: { userId, isRead: false, technologyId: { not: null } }, _count: true }),
  ]);
  const companyCounts = new Map(companyActivity.map((item) => [item.companyId, item._count]));
  const productCounts = new Map(productActivity.map((item) => [item.productId, item._count]));
  const technologyCounts = new Map(technologyActivity.map((item) => [item.technologyId, item._count]));
  return {
    companies: companies.map((item) => ({ ...item, unreadActivity: companyCounts.get(item.companyId) ?? 0 })),
    products: products.map((item) => ({ ...item, unreadActivity: productCounts.get(item.productId) ?? 0 })),
    technologies: technologies.map((item) => ({ ...item, unreadActivity: technologyCounts.get(item.technologyId) ?? 0 })),
  };
}

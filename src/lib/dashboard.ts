import { ArticleStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { getUserWatchlist } from "./watchlist";

export async function getDashboardData(userId: string) {
  const [watchlist, unreadAlerts, recentAlerts, suggestedCompanies] = await Promise.all([
    getUserWatchlist(userId),
    prisma.alert.count({ where: { userId, isRead: false } }),
    prisma.alert.findMany({ where: { userId }, include: { article: { select: { slug: true } }, company: { select: { name: true } }, product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.company.findMany({ where: { isFeatured: true, watchers: { none: { userId } } }, select: { id: true, name: true, slug: true, shortDescription: true }, orderBy: { name: "asc" }, take: 4 }),
  ]);
  const companyIds = watchlist.companies.map((item) => item.companyId);
  const productIds = watchlist.products.map((item) => item.productId);
  const technologyIds = watchlist.technologies.map((item) => item.technologyId);
  const watchedFilter = companyIds.length || productIds.length || technologyIds.length ? {
    OR: [
      ...(companyIds.length ? [{ companies: { some: { companyId: { in: companyIds } } } }] : []),
      ...(productIds.length ? [{ products: { some: { productId: { in: productIds } } } }] : []),
      ...(technologyIds.length ? [{ technologies: { some: { technologyId: { in: technologyIds } } } }] : []),
    ],
  } : {};
  let relevantArticles = await prisma.article.findMany({ where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null, ...watchedFilter }, include: { source: true, aiSummary: true }, orderBy: { publishedAt: "desc" }, take: 6 });
  if (!relevantArticles.length && (companyIds.length || productIds.length || technologyIds.length)) {
    relevantArticles = await prisma.article.findMany({ where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null }, include: { source: true, aiSummary: true }, orderBy: { publishedAt: "desc" }, take: 6 });
  }
  const relevantResearch = companyIds.length || productIds.length || technologyIds.length
    ? await prisma.research.findMany({
        where: { OR: [
          ...(companyIds.length ? [{ companies: { some: { companyId: { in: companyIds } } } }, { products: { some: { product: { companyId: { in: companyIds } } } } }] : []),
          ...(productIds.length ? [{ products: { some: { productId: { in: productIds } } } }] : []),
          ...(technologyIds.length ? [{ technologies: { some: { technologyId: { in: technologyIds } } } }] : []),
        ] },
        orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }],
        take: 5,
      })
    : [];
  return { watchlist, unreadAlerts, recentAlerts, relevantArticles, relevantResearch, suggestedCompanies };
}

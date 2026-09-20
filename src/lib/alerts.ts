import { AlertType, ArticleStatus, type PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

export async function getUserAlerts(userId: string, options: { unreadOnly?: boolean; limit?: number } = {}) {
  return prisma.alert.findMany({
    where: { userId, ...(options.unreadOnly ? { isRead: false } : {}) },
    include: { article: { select: { slug: true, title: true } }, company: { select: { slug: true, name: true } }, product: { select: { slug: true, name: true } }, technology: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "desc" }, take: Math.min(options.limit ?? 20, 50),
  });
}

export function getUnreadAlertCount(userId: string) {
  return prisma.alert.count({ where: { userId, isRead: false } });
}

export function markAlertReadForUser(userId: string, alertId: string) {
  return prisma.alert.updateMany({ where: { id: alertId, userId }, data: { isRead: true, readAt: new Date() } });
}

export function markAllAlertsReadForUser(userId: string) {
  return prisma.alert.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
}

export async function generateAlertsForArticle(articleId: string, db: PrismaClient = prisma) {
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    include: { aiSummary: { select: { summary: true } }, companies: { select: { companyId: true } }, products: { select: { productId: true } }, technologies: { select: { technologyId: true } } },
  });
  if (!article) return { created: 0, matchedUsers: 0 };

  // Alert generation runs after ingestion, where predictable pooled-connection
  // use is more important than shaving milliseconds off three small queries.
  const companyWatches = await db.watchedCompany.findMany({ include: { company: { select: { name: true } } } });
  const productWatches = await db.watchedProduct.findMany({ include: { product: { select: { name: true, companyId: true } } } });
  const technologyWatches = await db.watchedTechnology.findMany({ include: { technology: { select: { name: true } } } });
  const companyIds = new Set(article.companies.map((item) => item.companyId));
  const productIds = new Set(article.products.map((item) => item.productId));
  const technologyIds = new Set(article.technologies.map((item) => item.technologyId));
  const searchableText = `${article.title} ${article.excerpt ?? ""} ${article.aiSummary?.summary ?? ""}`;
  type Match = { companyId?: string; productId?: string; technologyId?: string; label: string };
  const matches = new Map<string, Match>();

  for (const watch of companyWatches) {
    if (companyIds.has(watch.companyId) || matchesEntity(searchableText, watch.company.name)) matches.set(watch.userId, { ...matches.get(watch.userId), companyId: watch.companyId, label: watch.company.name });
  }
  for (const watch of productWatches) {
    if (productIds.has(watch.productId) || matchesEntity(searchableText, watch.product.name)) {
      const current = matches.get(watch.userId);
      matches.set(watch.userId, { ...current, productId: watch.productId, companyId: current?.companyId ?? watch.product.companyId, label: current?.label ?? watch.product.name });
    }
  }
  for (const watch of technologyWatches) {
    if (technologyIds.has(watch.technologyId) || matchesEntity(searchableText, watch.technology.name)) {
      const current = matches.get(watch.userId);
      matches.set(watch.userId, { ...current, technologyId: watch.technologyId, label: current?.label ?? watch.technology.name });
    }
  }
  if (!matches.size) return { created: 0, matchedUsers: 0 };
  const result = await db.alert.createMany({
    data: [...matches.entries()].map(([userId, match]) => ({ userId, articleId: article.id, type: AlertType.NEW_INTELLIGENCE, title: `New intelligence about ${match.label}`, message: article.title, companyId: match.companyId, productId: match.productId, technologyId: match.technologyId })),
    skipDuplicates: true,
  });
  return { created: result.count, matchedUsers: matches.size };
}

function matchesEntity(text: string, entityName: string) {
  const escaped = entityName.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return false;
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text.toLowerCase());
}

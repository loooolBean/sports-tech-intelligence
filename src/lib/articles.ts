import { ArticleStatus, type Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const articleInclude = {
  source: true,
  category: true,
  author: true,
  aiSummary: true,
  articleTags: {
    include: {
      tag: true,
    },
  },
  companies: {
    include: { company: true },
  },
  products: {
    include: { product: { include: { company: true } } },
  },
  technologies: {
    include: { technology: true },
  },
} satisfies Prisma.ArticleInclude;

export type ArticlePageData = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export async function getArticleBySlug(slug: string): Promise<ArticlePageData | null> {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      duplicateOfId: null,
    },
    include: articleInclude,
  });
}

export async function getRelatedArticles(article: ArticlePageData): Promise<ArticlePageData[]> {
  const tagIds = article.articleTags.map(({ tagId }) => tagId);

  return prisma.article.findMany({
    where: {
      id: {
        not: article.id,
      },
      status: ArticleStatus.PUBLISHED,
      duplicateOfId: null,
      isHiddenFromFeed: false,
      OR: [
        {
          categoryId: article.categoryId,
        },
        {
          articleTags: {
            some: {
              tagId: {
                in: tagIds,
              },
            },
          },
        },
      ],
    },
    include: articleInclude,
    orderBy: [
      {
        publishedAt: "desc",
      },
    ],
    take: 3,
  });
}

export async function isArticleFromUserWatchlist(
  userId: string,
  article: ArticlePageData,
): Promise<boolean> {
  const companyIds = article.companies.map(({ companyId }) => companyId);
  const productIds = article.products.map(({ productId }) => productId);
  if (companyIds.length === 0 && productIds.length === 0) return false;

  const [companyMatch, productMatch] = await Promise.all([
    companyIds.length
      ? prisma.watchedCompany.count({ where: { userId, companyId: { in: companyIds } } })
      : 0,
    productIds.length
      ? prisma.watchedProduct.count({ where: { userId, productId: { in: productIds } } })
      : 0,
  ]);

  return companyMatch + productMatch > 0;
}

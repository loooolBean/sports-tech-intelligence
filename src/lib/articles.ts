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
} satisfies Prisma.ArticleInclude;

export type ArticlePageData = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export async function getArticleBySlug(slug: string): Promise<ArticlePageData | null> {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
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

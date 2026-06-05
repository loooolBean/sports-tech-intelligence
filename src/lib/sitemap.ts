import { ArticleStatus } from "@prisma/client";
import { prisma } from "./prisma";

export interface SitemapArticleEntry {
  slug: string;
  updatedAt: Date;
}

export interface SitemapTaxonomyEntry {
  slug: string;
  lastModified: Date;
}

export interface SitemapData {
  articles: SitemapArticleEntry[];
  categories: SitemapTaxonomyEntry[];
  tags: SitemapTaxonomyEntry[];
}

export async function getSitemapData(): Promise<SitemapData> {
  const [articles, categories, tags] = await prisma.$transaction([
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        duplicateOfId: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 45000,
    }),
    prisma.category.findMany({
      where: {
        articles: {
          some: {
            status: ArticleStatus.PUBLISHED,
            duplicateOfId: null,
          },
        },
      },
      select: {
        slug: true,
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            duplicateOfId: null,
          },
          select: {
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.tag.findMany({
      where: {
        articleTags: {
          some: {
            article: {
              status: ArticleStatus.PUBLISHED,
              duplicateOfId: null,
            },
          },
        },
      },
      select: {
        slug: true,
        articleTags: {
          where: {
            article: {
              status: ArticleStatus.PUBLISHED,
              duplicateOfId: null,
            },
          },
          select: {
            article: {
              select: {
                updatedAt: true,
              },
            },
          },
          orderBy: {
            article: {
              updatedAt: "desc",
            },
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const now = new Date();

  return {
    articles,
    categories: categories.map((category) => ({
      slug: category.slug,
      lastModified: category.articles[0]?.updatedAt ?? now,
    })),
    tags: tags.map((tag) => ({
      slug: tag.slug,
      lastModified: tag.articleTags[0]?.article.updatedAt ?? now,
    })),
  };
}

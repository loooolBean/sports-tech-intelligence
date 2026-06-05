import { ArticleStatus, type Category, type Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const CATEGORY_PAGE_SIZE = 12;

const categoryArticleInclude = {
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

export type CategoryData = Category;
export type CategoryArticleData = Prisma.ArticleGetPayload<{
  include: typeof categoryArticleInclude;
}>;

export interface CategoryPageData {
  category: CategoryData;
  articles: CategoryArticleData[];
  currentPage: number;
  pageSize: number;
  totalArticles: number;
  totalPages: number;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getCategoryPage(
  slug: string,
  page: number,
  pageSize = CATEGORY_PAGE_SIZE,
): Promise<CategoryPageData | null> {
  const currentPage = Math.max(1, page);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const where = {
    categoryId: category.id,
    status: ArticleStatus.PUBLISHED,
  } satisfies Prisma.ArticleWhereInput;

  const [articles, totalArticles] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: categoryArticleInclude,
      orderBy: {
        publishedAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    category,
    articles,
    currentPage,
    pageSize,
    totalArticles,
    totalPages: Math.max(1, Math.ceil(totalArticles / pageSize)),
  };
}

export async function getStaticCategorySlugs(): Promise<string[]> {
  const categories = await prisma.category.findMany({
    where: {
      articles: {
        some: {
          status: ArticleStatus.PUBLISHED,
        },
      },
    },
    select: {
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => category.slug);
}

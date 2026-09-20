import { ArticleStatus, Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma, withDatabaseRetry } from "./prisma";
import {
  getFeedPeriodStart,
  getIntelligenceCategory,
  INTELLIGENCE_CATEGORIES,
  type IntelligencePeriod,
} from "./intelligence-feed";

export const TOP_INTELLIGENCE_THRESHOLD = 45;
const PUBLIC_FEED_REVALIDATE_SECONDS = 300;

// Feed pages only need these fields. The old broad include loaded tags,
// companies, products and their relations for every story, turning a simple
// navigation into several remote database round trips.
export const feedArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  imageUrl: true,
  publishedAt: true,
  source: { select: { name: true, domain: true } },
  category: { select: { name: true, slug: true } },
  aiSummary: { select: { summary: true } },
} satisfies Prisma.ArticleSelect;

export type FeedArticle = Prisma.ArticleGetPayload<{
  select: typeof feedArticleSelect;
}>;

type CachedFeedArticle = Omit<FeedArticle, "publishedAt"> & { publishedAt: string };

const visibleFeedWhere = {
  status: ArticleStatus.PUBLISHED,
  duplicateOfId: null,
  isHiddenFromFeed: false,
} satisfies Prisma.ArticleWhereInput;

async function queryTodayTopIntelligence(now: Date): Promise<FeedArticle[]> {
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last48Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const rankingWhere = {
    ...visibleFeedWhere,
    OR: [{ isFeatured: true }, { importanceScore: { gte: TOP_INTELLIGENCE_THRESHOLD } }],
  } satisfies Prisma.ArticleWhereInput;

  const top24 = await withDatabaseRetry(() =>
    prisma.article.findMany({
      where: { ...rankingWhere, publishedAt: { gte: last24Hours } },
      select: feedArticleSelect,
      orderBy: [
        { isFeatured: "desc" },
        { importanceScore: "desc" },
        { publishedAt: "desc" },
      ],
      take: 5,
    }),
  );

  if (top24.length >= 5) return top24;

  return withDatabaseRetry(() =>
    prisma.article.findMany({
      where: { ...rankingWhere, publishedAt: { gte: last48Hours } },
      select: feedArticleSelect,
      orderBy: [
        { isFeatured: "desc" },
        { importanceScore: "desc" },
        { publishedAt: "desc" },
      ],
      take: 5,
    }),
  );
}

export async function getTodayTopIntelligence(now = new Date()): Promise<FeedArticle[]> {
  return queryTodayTopIntelligence(now);
}

async function queryLatestIntelligence(input: {
  category?: string;
  period?: IntelligencePeriod;
  take?: number;
}): Promise<FeedArticle[]> {
  const periodStart = getFeedPeriodStart(input.period ?? "all");
  const category = input.category ? getIntelligenceCategory(input.category) : null;

  return withDatabaseRetry(() =>
    prisma.article.findMany({
      where: {
        ...visibleFeedWhere,
        ...(category ? { category: { slug: category.slug } } : {}),
        ...(periodStart ? { publishedAt: { gte: periodStart } } : {}),
      },
      select: feedArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: Math.min(Math.max(input.take ?? 30, 1), 60),
    }),
  );
}

const getCachedLatestIntelligence = unstable_cache(
  async (category: string, period: IntelligencePeriod, take: number) =>
    serializeArticles(await queryLatestIntelligence({ category: category || undefined, period, take })),
  ["public-latest-intelligence-v2"],
  { revalidate: PUBLIC_FEED_REVALIDATE_SECONDS, tags: ["intelligence-feed"] },
);

export async function getLatestIntelligence(input: {
  category?: string;
  period?: IntelligencePeriod;
  take?: number;
} = {}): Promise<FeedArticle[]> {
  const period = input.period ?? "all";
  const take = Math.min(Math.max(input.take ?? 30, 1), 60);
  return restoreArticles(await getCachedLatestIntelligence(input.category ?? "", period, take));
}

async function queryHomepageFeed(now: Date) {
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const latestCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [top, latest, updatesToday] = await Promise.all([
    queryTodayTopIntelligence(now),
    withDatabaseRetry(() =>
      prisma.article.findMany({
        where: { ...visibleFeedWhere, publishedAt: { gte: latestCutoff } },
        select: feedArticleSelect,
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
    ),
    withDatabaseRetry(() =>
      prisma.article.count({
        where: { ...visibleFeedWhere, publishedAt: { gte: last24Hours } },
      }),
    ),
  ]);

  return { top, latest, updatesToday };
}

const getCachedHomepageFeed = unstable_cache(
  async () => {
    const result = await queryHomepageFeed(new Date());
    return {
      top: serializeArticles(result.top),
      latest: serializeArticles(result.latest),
      updatesToday: result.updatesToday,
    };
  },
  ["public-homepage-feed-v2"],
  { revalidate: PUBLIC_FEED_REVALIDATE_SECONDS, tags: ["intelligence-feed"] },
);

export async function getHomepageFeed(now?: Date) {
  if (now) return queryHomepageFeed(now);
  const result = await getCachedHomepageFeed();
  return {
    top: restoreArticles(result.top),
    latest: restoreArticles(result.latest),
    updatesToday: result.updatesToday,
  };
}

const getCachedTopicsOverview = unstable_cache(
  async () => {
    const categories = await withDatabaseRetry(() =>
      prisma.category.findMany({
        where: { slug: { in: INTELLIGENCE_CATEGORIES.map((category) => category.slug) } },
        select: {
          slug: true,
          articles: {
            where: visibleFeedWhere,
            select: feedArticleSelect,
            orderBy: { publishedAt: "desc" },
            take: 3,
          },
        },
      }),
    );
    return categories.map((category) => ({
      slug: category.slug,
      articles: serializeArticles(category.articles),
    }));
  },
  ["public-topics-overview-v2"],
  { revalidate: PUBLIC_FEED_REVALIDATE_SECONDS, tags: ["intelligence-feed"] },
);

export async function getTopicsOverview() {
  const categories = await getCachedTopicsOverview();
  const articlesBySlug = new Map(
    categories.map((category) => [category.slug, restoreArticles(category.articles)]),
  );

  return INTELLIGENCE_CATEGORIES.map((topic) => ({
    ...topic,
    articles: articlesBySlug.get(topic.slug) ?? [],
  }));
}

const getCachedTopicIntelligence = unstable_cache(
  async (slug: string) => {
    const topic = getIntelligenceCategory(slug);
    if (!topic || topic.slug === "other") return null;

    const articles = await withDatabaseRetry(() =>
      prisma.article.findMany({
        where: { ...visibleFeedWhere, category: { slug } },
        select: feedArticleSelect,
        orderBy: { publishedAt: "desc" },
        take: 40,
      }),
    );

    const articleTags = articles.length
      ? await withDatabaseRetry(() =>
          prisma.articleTag.findMany({
            where: { articleId: { in: articles.map((article) => article.id) } },
            select: { tag: { select: { id: true, name: true, slug: true } } },
          }),
        )
      : [];
    const tagCounts = new Map<string, { name: string; slug: string; count: number }>();
    for (const { tag } of articleTags) {
      const existing = tagCounts.get(tag.id);
      tagCounts.set(tag.id, {
        name: tag.name,
        slug: tag.slug,
        count: (existing?.count ?? 0) + 1,
      });
    }

    return {
      topic,
      articles: serializeArticles(articles),
      relatedTags: [...tagCounts.values()]
        .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
        .slice(0, 12),
    };
  },
  ["public-topic-intelligence-v2"],
  { revalidate: PUBLIC_FEED_REVALIDATE_SECONDS, tags: ["intelligence-feed"] },
);

export async function getTopicIntelligence(slug: string) {
  const result = await getCachedTopicIntelligence(slug);
  if (!result) return null;
  return { ...result, articles: restoreArticles(result.articles) };
}

type OfficialSourceArticle = {
  source: { name: string; domain: string | null };
  companies: Array<{ company: { name: string; website: string | null } }>;
};

export function isOfficialIntelligenceSource(article: OfficialSourceArticle): boolean {
  const sourceName = article.source.name.trim().toLowerCase();
  const sourceDomain = article.source.domain?.replace(/^www\./, "").toLowerCase();

  return article.companies.some(({ company }) => {
    if (company.name.trim().toLowerCase() === sourceName) return true;
    if (!sourceDomain || !company.website) return false;
    try {
      return new URL(company.website).hostname.replace(/^www\./, "").toLowerCase() === sourceDomain;
    } catch {
      return false;
    }
  });
}

function serializeArticles(articles: FeedArticle[]): CachedFeedArticle[] {
  return articles.map((article) => ({
    ...article,
    publishedAt: article.publishedAt.toISOString(),
  }));
}

function restoreArticles(articles: CachedFeedArticle[]): FeedArticle[] {
  return articles.map((article) => ({
    ...article,
    publishedAt: new Date(article.publishedAt),
  }));
}

import { ArticleStatus, JobRunStatus } from "@prisma/client";
import { prisma, withDatabaseRetry } from "./prisma";

const PRODUCTION_URL = "https://sports-tech-intelligence.vercel.app";

export const operationsLinks = {
  production: PRODUCTION_URL,
  vercel: "https://vercel.com/douzi-sport-projects1/sports-tech-intelligence",
  clerk: "https://dashboard.clerk.com",
  supabase: "https://supabase.com/dashboard",
  github: "https://github.com/loooolBean/sports-tech-intelligence",
  stripe: "https://dashboard.stripe.com",
} as const;

function getAiProvider() {
  const baseUrl = process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";
  try {
    const url = new URL(baseUrl);
    if (url.hostname === "api.openai.com") {
      return { name: "OpenAI", dashboardUrl: "https://platform.openai.com/usage" };
    }
    return {
      name: "OpenAI-compatible provider",
      dashboardUrl: `${url.protocol}//${url.host}`,
    };
  } catch {
    return { name: "OpenAI-compatible provider", dashboardUrl: "https://platform.openai.com" };
  }
}

function startOfTodayUtc() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function getOperationsSnapshot() {
  const today = startOfTodayUtc();

  const [
    articlesToday,
    publishedToday,
    hiddenOrRejectedToday,
    processedToday,
    unprocessedArticles,
    hiddenArticles,
    duplicateArticles,
    latestArticle,
    latestPublishedArticle,
    latestProcessedArticle,
    latestSourceFetch,
    openFailures,
    latestFailure,
    latestRssRun,
    latestSeoRun,
  ] = await withDatabaseRetry(() => prisma.$transaction([
    prisma.article.count({ where: { createdAt: { gte: today } } }),
    prisma.article.count({
      where: { createdAt: { gte: today }, status: ArticleStatus.PUBLISHED },
    }),
    prisma.article.count({
      where: {
        createdAt: { gte: today },
        OR: [{ isHiddenFromFeed: true }, { status: ArticleStatus.REJECTED }],
      },
    }),
    prisma.aiSummary.count({
      where: { generatedAt: { gte: today }, model: { not: "manual" } },
    }),
    prisma.article.count({ where: { aiSummary: { is: null }, duplicateOfId: null } }),
    prisma.article.count({ where: { isHiddenFromFeed: true } }),
    prisma.article.count({ where: { duplicateOfId: { not: null } } }),
    prisma.article.findFirst({
      orderBy: { createdAt: "desc" },
      select: { title: true, createdAt: true, status: true },
    }),
    prisma.article.findFirst({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      select: { title: true, createdAt: true },
    }),
    prisma.aiSummary.findFirst({
      where: { model: { not: "manual" } },
      orderBy: { generatedAt: "desc" },
      select: { generatedAt: true, article: { select: { title: true } } },
    }),
    prisma.source.findFirst({
      where: { lastFetchedAt: { not: null } },
      orderBy: { lastFetchedAt: "desc" },
      select: { name: true, lastFetchedAt: true },
    }),
    prisma.ingestionFailure.count({ where: { status: "OPEN" } }),
    prisma.ingestionFailure.findFirst({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      select: { stage: true, errorMessage: true, createdAt: true },
    }),
    prisma.jobRun.findFirst({
      where: { jobName: "rss-ingestion" },
      orderBy: { startedAt: "desc" },
    }),
    prisma.jobRun.findFirst({
      where: { jobName: "seo-metadata" },
      orderBy: { startedAt: "desc" },
    }),
  ]));

  return {
    today: {
      articles: articlesToday,
      published: publishedToday,
      hiddenOrRejected: hiddenOrRejectedToday,
      processedByAi: processedToday,
      latestArticleAt: latestArticle?.createdAt ?? null,
      lastIngestionAt: latestRssRun?.finishedAt ?? latestSourceFetch?.lastFetchedAt ?? null,
    },
    content: {
      latestArticle,
      latestPublishedArticle,
      articlesToday,
      unprocessedArticles,
      hiddenArticles,
      duplicateArticles,
      openFailures,
    },
    automations: {
      rss: latestRssRun,
      seo: latestSeoRun,
      ai: {
        lastProcessedAt: latestProcessedArticle?.generatedAt ?? null,
        latestTitle: latestProcessedArticle?.article.title ?? null,
        status:
          latestFailure?.stage === "seo_metadata_generation"
            ? JobRunStatus.FAILED
            : latestProcessedArticle
              ? JobRunStatus.SUCCEEDED
              : null,
      },
      latestFailure,
    },
    configuration: {
      database: Boolean(process.env.DATABASE_URL),
      clerk: Boolean(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") &&
          process.env.CLERK_SECRET_KEY,
      ),
      ai: Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
      stripe: Boolean(
        process.env.STRIPE_SECRET_KEY &&
          process.env.STRIPE_WEBHOOK_SECRET &&
          process.env.STRIPE_PRO_PRICE_ID,
      ),
      aiProvider: getAiProvider(),
    },
  };
}

import { ArticleStatus, SourceType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { slugify } from "../utils/content";
import { generateAlertsForArticle } from "./alerts";
import { requireAdminUser } from "./auth";
import { getIntelligenceCategory } from "./intelligence-feed";

export async function getAdminDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    publishedArticles,
    draftArticles,
    rejectedArticles,
    activeSources,
    openFailures,
    newsletterSubscribers,
    articlesToday,
    research,
    evidence,
    pendingClaims,
    newLeads,
  ] = await prisma.$transaction([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
    prisma.article.count({ where: { status: ArticleStatus.REJECTED } }),
    prisma.source.count({ where: { isActive: true } }),
    prisma.ingestionFailure.count({ where: { status: "OPEN" } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.article.count({ where: { createdAt: { gte: today } } }),
    prisma.research.count(),
    prisma.evidence.count(),
    prisma.companyClaim.count({ where: { status: "PENDING" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);

  return {
    publishedArticles,
    draftArticles,
    rejectedArticles,
    activeSources,
    openFailures,
    newsletterSubscribers,
    articlesToday,
    research,
    evidence,
    pendingClaims,
    newLeads,
  };
}

export async function getAdminArticles(status?: ArticleStatus) {
  return prisma.article.findMany({
    where: status ? { status } : {},
    include: {
      category: true,
      source: true,
      aiSummary: true,
      duplicateOf: { select: { id: true, title: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export async function getAdminArticle(articleId: string) {
  return prisma.article.findUnique({
    where: { id: articleId },
    include: {
      category: true,
      source: true,
      aiSummary: true,
      articleTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function saveArticleEditorialFields(formData: FormData) {
  "use server";

  await assertAdminAction();
  const articleId = String(formData.get("articleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "").trim();
  const whyItMatters = String(formData.get("whyItMatters") ?? "").trim();
  const importanceScore = Number(formData.get("importanceScore") ?? 0);
  const isFeatured = formData.get("isFeatured") === "on";
  const isHiddenFromFeed = formData.get("isHiddenFromFeed") === "on";
  const intelligenceCategory = getIntelligenceCategory(categorySlug);

  if (
    !articleId ||
    !title ||
    !intelligenceCategory ||
    !Number.isInteger(importanceScore) ||
    importanceScore < 0 ||
    importanceScore > 100
  ) {
    throw new Error("Article id, title, category and an importance score from 0-100 are required.");
  }

  const category = await prisma.category.upsert({
    where: { slug: intelligenceCategory.slug },
    create: {
      name: intelligenceCategory.name,
      slug: intelligenceCategory.slug,
      description: intelligenceCategory.description,
    },
    update: {
      name: intelligenceCategory.name,
      description: intelligenceCategory.description,
    },
  });
  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title,
      excerpt: excerpt || null,
      body: body || null,
      categoryId: category.id,
      importanceScore,
      isFeatured,
      isHiddenFromFeed,
      processedAt: whyItMatters ? new Date() : undefined,
      aiSummary: {
        upsert: {
          create: {
            summary: excerpt || title,
            whyItMatters: whyItMatters || null,
            keyTakeaways: [],
            categories: [intelligenceCategory.name],
            tags: [],
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || excerpt || title,
            model: "manual",
          },
          update: {
            whyItMatters: whyItMatters || null,
            categories: [intelligenceCategory.name],
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || excerpt || title,
          },
        },
      },
    },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath(`/article/${article.slug}`);
  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/topics");
  revalidatePath(`/topics/${intelligenceCategory.slug}`);
  revalidatePath(`/category/${article.category.slug}`);
  revalidatePath("/admin/articles");
  revalidatePath("/sitemap.xml");
}

export async function updateArticleStatus(formData: FormData) {
  "use server";

  await assertAdminAction();
  const articleId = String(formData.get("articleId") ?? "");
  const status = String(formData.get("status") ?? "") as ArticleStatus;

  if (!articleId || !Object.values(ArticleStatus).includes(status)) {
    throw new Error("Invalid article status update.");
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { status },
    select: {
      id: true,
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (status === ArticleStatus.PUBLISHED) {
    await generateAlertsForArticle(article.id);
  }

  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/topics");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/article/${article.slug}`);
  revalidatePath(`/category/${article.category.slug}`);
}

export async function getAdminSources() {
  return prisma.source.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: 100,
  });
}

export async function createSource(formData: FormData) {
  "use server";

  await assertAdminAction();
  const name = String(formData.get("name") ?? "").trim();
  const rssUrl = String(formData.get("rssUrl") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const sourceType = String(formData.get("sourceType") ?? SourceType.RSS) as SourceType;
  const reputationScore = Number(formData.get("reputationScore") ?? 0);

  if (!name) {
    throw new Error("Source name is required.");
  }

  await prisma.source.create({
    data: {
      name,
      rssUrl: rssUrl || null,
      websiteUrl: websiteUrl || null,
      sourceType,
      domain: getHostname(websiteUrl),
      reputationScore: new Prisma.Decimal(Number.isFinite(reputationScore) ? reputationScore : 0),
    },
  });

  revalidatePath("/admin/sources");
}

export async function toggleSourceStatus(formData: FormData) {
  "use server";

  await assertAdminAction();
  const sourceId = String(formData.get("sourceId") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";

  await prisma.source.update({
    where: { id: sourceId },
    data: { isActive },
  });

  revalidatePath("/admin/sources");
}

export async function getAdminFailures() {
  return prisma.ingestionFailure.findMany({
    include: {
      source: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export async function resolveFailure(formData: FormData) {
  "use server";

  await assertAdminAction();
  const failureId = String(formData.get("failureId") ?? "");

  await prisma.ingestionFailure.update({
    where: { id: failureId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/admin/failures");
}

export async function getAdminNewsletterSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    orderBy: {
      subscribedAt: "desc",
    },
    take: 200,
  });
}

export async function subscribeToNewsletter(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {
      isActive: true,
      unsubscribedAt: null,
    },
  });

  revalidatePath("/newsletter");
  revalidatePath("/admin/newsletter");
}

export async function getSearchResults(query: string) {
  const q = query.trim();
  if (!q) return [];

  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        {
          articleTags: {
            some: {
              tag: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ],
    },
    include: {
      category: true,
      source: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 30,
  });
}

export async function getPublishedTagPage(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) return null;

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      articleTags: {
        some: {
          tagId: tag.id,
        },
      },
    },
    include: {
      category: true,
      source: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 30,
  });

  return { tag, articles };
}

export async function getStaticTagSlugs() {
  const tags = await prisma.tag.findMany({
    where: {
      articleTags: {
        some: {
          article: {
            status: ArticleStatus.PUBLISHED,
          },
        },
      },
    },
    select: {
      slug: true,
    },
  });

  return tags.map((tag) => tag.slug);
}

export async function getOrCreateCategory(name: string) {
  return prisma.category.upsert({
    where: { slug: slugify(name) },
    create: {
      name,
      slug: slugify(name),
    },
    update: {},
  });
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function saveCategory(formData: FormData) {
  "use server";

  await assertAdminAction();
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("Category name is required.");
  }

  if (categoryId) {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug: slugify(name),
        description: description || null,
      },
    });
  } else {
    await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: description || null,
      },
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/sitemap.xml");
}

export async function getAdminTags() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: {
          articleTags: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    take: 300,
  });
}

function getHostname(value: string): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
}

async function assertAdminAction() {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error("Administrator access is required.");
  }
  return user;
}

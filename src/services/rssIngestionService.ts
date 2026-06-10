import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import Parser from "rss-parser";
import { Prisma, PrismaClient } from "@prisma/client";
import { hashContent, normalizeUrl, slugify, toDateOrNow, truncate } from "../utils/content";
import { prisma as defaultPrisma } from "../lib/prisma";
import { ArticleSummarizationService } from "./articleSummarizationService";

type FeedItem = Parser.Item & {
  "content:encoded"?: string;
};

export interface IngestRssSourceInput {
  sourceId: string;
  rssUrl: string;
  defaultCategorySlug?: string;
  autoPublish?: boolean;
}

export interface IngestionResult {
  sourceId: string;
  fetched: number;
  created: number;
  duplicates: number;
  failed: number;
}

export class RssIngestionService {
  private readonly parser = new Parser<unknown, FeedItem>();

  constructor(
    private readonly db: PrismaClient = defaultPrisma,
    private readonly summarizer = new ArticleSummarizationService(),
  ) {}

  async ingestSource(input: IngestRssSourceInput): Promise<IngestionResult> {
    const result: IngestionResult = {
      sourceId: input.sourceId,
      fetched: 0,
      created: 0,
      duplicates: 0,
      failed: 0,
    };

    try {
      const feed = await this.parser.parseURL(input.rssUrl);
      result.fetched = feed.items.length;

      for (const item of feed.items) {
        try {
          const created = await this.ingestItem(input, item);
          if (created) result.created += 1;
          else result.duplicates += 1;
        } catch (error) {
          result.failed += 1;
          await this.logFailure({
            sourceId: input.sourceId,
            url: item.link,
            stage: "item_ingestion",
            error,
            payload: item as Prisma.InputJsonValue,
          });
        }
      }

      await this.db.source.update({
        where: { id: input.sourceId },
        data: { lastFetchedAt: new Date() },
      });
    } catch (error) {
      result.failed += 1;
      await this.logFailure({
        sourceId: input.sourceId,
        url: input.rssUrl,
        stage: "rss_fetch",
        error,
      });
    }

    return result;
  }

  private async ingestItem(input: IngestRssSourceInput, item: FeedItem): Promise<boolean> {
    if (!item.link || !item.title) {
      throw new Error("RSS item is missing required title or link.");
    }

    const normalizedUrl = normalizeUrl(item.link);
    const existing = await this.db.article.findFirst({
      where: {
        OR: [{ originalUrl: item.link }, { normalizedUrl }],
      },
      select: { id: true },
    });

    if (existing) {
      await this.db.article.update({
        where: { id: existing.id },
        data: {
          lastSeenAt: new Date(),
          seenCount: { increment: 1 },
        },
      });
      return false;
    }

    const extracted = await this.extractArticle(item.link, item);
    const contentHash = hashContent(`${item.title}\n${extracted.content}`);

    const duplicateByHash = await this.db.article.findUnique({
      where: { contentHash },
      select: { id: true },
    });

    if (duplicateByHash) {
      await this.db.article.update({
        where: { id: duplicateByHash.id },
        data: {
          lastSeenAt: new Date(),
          seenCount: { increment: 1 },
        },
      });
      return false;
    }

    const source = await this.db.source.findUniqueOrThrow({
      where: { id: input.sourceId },
      select: { name: true },
    });

    const category = await this.resolveCategory(input.defaultCategorySlug ?? "Uncategorized");
    const author = await this.resolveAuthor(item.creator ?? (item as Record<string, unknown>).author as string | null | undefined);
    const slug = await this.createUniqueSlug(item.title);

    const article = await this.db.article.create({
      data: {
        sourceId: input.sourceId,
        categoryId: category.id,
        authorId: author?.id,
        title: item.title,
        slug,
        originalUrl: item.link,
        normalizedUrl,
        canonicalUrl: extracted.canonicalUrl,
        imageUrl: extracted.imageUrl,
        excerpt: truncate(extracted.content.replace(/\s+/g, " "), 280),
        body: extracted.content,
        contentHash,
        publishedAt: toDateOrNow(item.isoDate ?? item.pubDate),
        status: input.autoPublish ? "PUBLISHED" : "DRAFT",
      },
    });

    try {
      await this.enrichArticleWithAi({
        articleId: article.id,
        title: item.title,
        content: extracted.content,
        sourceName: source.name,
        publishedAt: toDateOrNow(item.isoDate ?? item.pubDate),
      });
    } catch (error) {
      await this.logFailure({
        sourceId: input.sourceId,
        url: item.link,
        stage: "ai_processing",
        error,
        payload: { articleId: article.id },
      });
    }

    return true;
  }

  private async enrichArticleWithAi(input: {
    articleId: string;
    title: string;
    content: string;
    sourceName: string;
    publishedAt: Date;
  }): Promise<void> {
    const summary = await this.summarizer.summarize({
      title: input.title,
      content: input.content,
      sourceName: input.sourceName,
      publishedAt: input.publishedAt,
    });

    const category = await this.resolveCategory(summary.categories[0] ?? "Uncategorized");

    // Use sequential operations instead of interactive transaction
    // to avoid pgbouncer "Transaction not found" errors on Supabase
      await this.db.article.update({
        where: { id: input.articleId },
        data: {
          categoryId: category.id,
          excerpt: truncate(summary.summary.replace(/\s+/g, " "), 280),
        },
      });

      await this.db.aiSummary.upsert({
        where: { articleId: input.articleId },
        create: {
          articleId: input.articleId,
          summary: summary.summary,
          keyTakeaways: summary.keyTakeaways,
          categories: summary.categories,
          tags: summary.tags,
          seoTitle: summary.seoTitle,
          seoDescription: summary.seoDescription,
          confidenceScore: new Prisma.Decimal(summary.confidenceScore ?? 0.8),
          model: this.summarizer.modelName,
        },
        update: {
          summary: summary.summary,
          keyTakeaways: summary.keyTakeaways,
          categories: summary.categories,
          tags: summary.tags,
          seoTitle: summary.seoTitle,
          seoDescription: summary.seoDescription,
          confidenceScore: new Prisma.Decimal(summary.confidenceScore ?? 0.8),
          model: this.summarizer.modelName,
          generatedAt: new Date(),
        },
      });

      for (const tagName of summary.tags) {
        const tag = await this.db.tag.upsert({
          where: { slug: slugify(tagName) },
          create: { name: tagName, slug: slugify(tagName) },
          update: { name: tagName },
        });

        await this.db.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: input.articleId,
              tagId: tag.id,
            },
          },
          create: {
            articleId: input.articleId,
            tagId: tag.id,
          },
          update: {},
        });
      }
  }

  private async extractArticle(url: string, item: FeedItem): Promise<{ content: string; canonicalUrl?: string; imageUrl?: string }> {
    const feedContent = item["content:encoded"] ?? item.content ?? item.contentSnippet;
    if (feedContent && feedContent.trim().length > 500) {
      return {
        content: this.htmlToText(feedContent),
        canonicalUrl: url,
        imageUrl: this.extractImageFromHtml(feedContent),
      };
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SportsTechIntelligenceBot/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Article fetch failed with ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    const content = article?.textContent?.trim();
    if (!content || content.length < 500) {
      throw new Error("Extracted article content did not meet minimum length.");
    }

    const canonicalUrl =
      dom.window.document.querySelector("link[rel='canonical']")?.getAttribute("href") ?? url;

    // Extract image from og:image or first image in content
    const ogImage = dom.window.document.querySelector("meta[property='og:image']")?.getAttribute("content");
    const firstImage = dom.window.document.querySelector("article img, .article-content img, main img")?.getAttribute("src");
    const imageUrl = ogImage || firstImage || this.extractImageFromHtml(feedContent ?? "");

    return { content, canonicalUrl, imageUrl };
  }

  private extractImageFromHtml(html: string): string | undefined {
    const dom = new JSDOM(html);
    const img = dom.window.document.querySelector("img");
    return img?.getAttribute("src") || undefined;
  }

  private htmlToText(html: string): string {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }

  private async resolveCategory(nameOrSlug: string) {
    const slug = slugify(nameOrSlug);
    return this.db.category.upsert({
      where: { slug },
      create: {
        name: nameOrSlug,
        slug,
      },
      update: {},
    });
  }

  private async resolveAuthor(name?: string | null) {
    if (!name) return null;
    return this.db.author.upsert({
      where: {
        name_organization: {
          name,
          organization: "",
        },
      },
      create: {
        name,
        organization: "",
      },
      update: {},
    });
  }

  private async createUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || "article";
    let slug = base;
    let suffix = 2;

    while (await this.db.article.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async logFailure(input: {
    sourceId?: string;
    url?: string;
    stage: string;
    error: unknown;
    payload?: Prisma.InputJsonValue;
  }): Promise<void> {
    const error = input.error instanceof Error ? input.error : new Error(String(input.error));
    await this.db.ingestionFailure.create({
      data: {
        sourceId: input.sourceId,
        url: input.url,
        stage: input.stage,
        errorMessage: error.message,
        errorCode: "code" in error && typeof error.code === "string" ? error.code : undefined,
        payload: input.payload,
      },
    });
  }
}

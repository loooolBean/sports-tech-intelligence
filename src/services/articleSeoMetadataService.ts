import { ArticleStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../lib/prisma";
import { slugify, truncate } from "../utils/content";
import { ArticleSummarizationService } from "./articleSummarizationService";

const defaultStatuses = [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED];

export interface GenerateSeoMetadataOptions {
  articleId: string;
  overwrite?: boolean;
}

export interface BackfillSeoMetadataOptions {
  batchSize?: number;
  overwrite?: boolean;
  statuses?: ArticleStatus[];
}

export interface SeoMetadataGenerationResult {
  articleId: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SeoMetadataBackfillResult {
  scanned: number;
  updated: number;
  failed: number;
}

export class ArticleSeoMetadataService {
  constructor(
    private readonly db: PrismaClient = defaultPrisma,
    private readonly summarizer = new ArticleSummarizationService(),
  ) {}

  async generateForArticle(
    options: GenerateSeoMetadataOptions,
  ): Promise<SeoMetadataGenerationResult | null> {
    const article = await this.db.article.findUnique({
      where: { id: options.articleId },
      include: {
        source: true,
        aiSummary: true,
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      throw new Error(`Article not found: ${options.articleId}`);
    }

    if (
      !options.overwrite &&
      article.aiSummary?.seoTitle &&
      article.aiSummary?.seoDescription
    ) {
      return null;
    }

    const content = article.body ?? article.excerpt ?? article.title;
    const summary = await this.summarizer.summarize({
      title: article.title,
      content,
      sourceName: article.source.name,
      publishedAt: article.publishedAt,
    });

    // Use sequential operations instead of interactive transaction
    // to avoid pgbouncer "Transaction not found" errors on Supabase
      await this.db.aiSummary.upsert({
        where: { articleId: article.id },
        create: {
          articleId: article.id,
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
          summary: article.aiSummary?.summary ?? summary.summary,
          keyTakeaways: article.aiSummary?.keyTakeaways ?? summary.keyTakeaways,
          categories: article.aiSummary?.categories ?? summary.categories,
          tags: article.aiSummary?.tags ?? summary.tags,
          seoTitle: summary.seoTitle,
          seoDescription: summary.seoDescription,
          confidenceScore: new Prisma.Decimal(summary.confidenceScore ?? 0.8),
          model: this.summarizer.modelName,
          generatedAt: new Date(),
        },
      });

      await this.db.article.update({
        where: { id: article.id },
        data: {
          excerpt: article.excerpt ?? truncate(summary.summary.replace(/\s+/g, " "), 280),
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
              articleId: article.id,
              tagId: tag.id,
            },
          },
          create: {
            articleId: article.id,
            tagId: tag.id,
          },
          update: {},
        });
      }

    return {
      articleId: article.id,
      seoTitle: summary.seoTitle,
      seoDescription: summary.seoDescription,
    };
  }

  async backfillMissing(
    options: BackfillSeoMetadataOptions = {},
  ): Promise<SeoMetadataBackfillResult> {
    const batchSize = options.batchSize ?? 25;
    const statuses = options.statuses ?? defaultStatuses;
    const articles = await this.db.article.findMany({
      where: {
        status: {
          in: statuses,
        },
        ...(options.overwrite
          ? {}
          : {
              OR: [
                {
                  aiSummary: {
                    is: null,
                  },
                },
                {
                  aiSummary: {
                    is: {
                      OR: [{ seoTitle: null }, { seoDescription: null }],
                    },
                  },
                },
              ],
            }),
      },
      select: {
        id: true,
        sourceId: true,
        originalUrl: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: batchSize,
    });

    const result: SeoMetadataBackfillResult = {
      scanned: articles.length,
      updated: 0,
      failed: 0,
    };

    for (const article of articles) {
      try {
        const generated = await this.generateForArticle({
          articleId: article.id,
          overwrite: options.overwrite,
        });

        if (generated) {
          result.updated += 1;
        }
      } catch (error) {
        result.failed += 1;
        await this.logFailure({
          sourceId: article.sourceId,
          url: article.originalUrl,
          error,
          payload: { articleId: article.id },
        });
      }
    }

    return result;
  }

  private async logFailure(input: {
    sourceId?: string | null;
    url?: string | null;
    error: unknown;
    payload?: Prisma.InputJsonValue;
  }): Promise<void> {
    const error = input.error instanceof Error ? input.error : new Error(String(input.error));

    await this.db.ingestionFailure.create({
      data: {
        sourceId: input.sourceId ?? undefined,
        url: input.url ?? undefined,
        stage: "seo_metadata_generation",
        errorMessage: error.message,
        errorCode: "code" in error && typeof error.code === "string" ? error.code : undefined,
        payload: input.payload,
      },
    });
  }
}

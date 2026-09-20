import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { INTELLIGENCE_CATEGORY_NAMES } from "../lib/intelligence-feed";

const truncSeoTitle = (v: string) => (v.length > 70 ? v.slice(0, 67) + "..." : v);
const truncSeoDesc = (v: string) => (v.length > 170 ? v.slice(0, 167) + "..." : v);

export const articleIntelligenceSchema = z.object({
  summary: z.string().min(1).max(1_200),
  primaryCategory: z.enum(INTELLIGENCE_CATEGORY_NAMES),
  tags: z.array(z.string().min(1).max(60)).min(1).max(10),
  whyItMatters: z.string().min(1).max(700),
  keyTakeaways: z.array(z.string().min(1).max(260)).max(3),
  importanceScore: z.number().int().min(0).max(100),
  seoTitle: z.string().min(1).transform(truncSeoTitle),
  seoDescription: z.string().min(1).transform(truncSeoDesc),
  confidenceScore: z.number().min(0).max(1).default(0.8),
});

export type ArticleSummaryResult = z.infer<typeof articleIntelligenceSchema>;

export interface SummarizeArticleInput {
  title: string;
  content: string;
  sourceName?: string;
  publishedAt?: Date;
  relatedCompanies?: string[];
  relatedProducts?: string[];
}

export class ArticleSummarizationService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string; baseURL?: string }) {
    const apiKey = options?.apiKey ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
    const baseURL = options?.baseURL ?? process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";

    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout: 30_000,
      maxRetries: 2,
    });
    this.model = options?.model ?? process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }

  get modelName(): string {
    return this.model;
  }

  async summarize(input: SummarizeArticleInput): Promise<ArticleSummaryResult> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content:
            "You are an editor for a daily sports technology intelligence service. Use only the supplied article, source and explicit entity relations. Never invent market share, customers, research findings, funding amounts or product capabilities. Distinguish what happened from why it matters.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Summarize and classify this article.",
            outputRequirements: {
              summary: "A concise factual account of what happened, not commentary",
              primaryCategory: INTELLIGENCE_CATEGORY_NAMES,
              tags: "3-10 specific searchable tags",
              whyItMatters: "30-70 words explaining why this matters to sports professionals without repeating the summary",
              keyTakeaways: "Up to 3 one-sentence factual takeaways",
              importanceScore: "Editorial priority from 0-100; promotions and minor PR should score low",
              seoTitle: "Search-optimized title under 70 characters",
              seoDescription: "Search-optimized meta description under 170 characters",
              confidenceScore: "0 to 1 confidence in classification and summary quality",
            },
            article: {
              title: input.title,
              sourceName: input.sourceName,
              publishedAt: input.publishedAt?.toISOString(),
              relatedCompanies: input.relatedCompanies ?? [],
              relatedProducts: input.relatedProducts ?? [],
              content: input.content,
            },
          }),
        },
      ],
      text: {
        format: zodTextFormat(articleIntelligenceSchema, "sports_technology_intelligence"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("AI response did not include parsed intelligence content.");
    }

    return articleIntelligenceSchema.parse(response.output_parsed);
  }
}

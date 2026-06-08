import OpenAI from "openai";
import { z } from "zod";

const truncSeoTitle = (v: string) => (v.length > 70 ? v.slice(0, 67) + "..." : v);
const truncSeoDesc = (v: string) => (v.length > 170 ? v.slice(0, 167) + "..." : v);

const summarizationSchema = z.object({
  summary: z.string().min(1),
  keyTakeaways: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().min(1).transform(truncSeoTitle),
  seoDescription: z.string().min(1).transform(truncSeoDesc),
  confidenceScore: z.number().min(0).max(1),
});

export type ArticleSummaryResult = z.infer<typeof summarizationSchema>;

export interface SummarizeArticleInput {
  title: string;
  content: string;
  sourceName?: string;
  publishedAt?: Date;
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
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You summarize sports technology news for strength coaches, sports scientists, and wearable technology professionals. Return only factual, source-grounded structured JSON.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Summarize and classify this article.",
            outputRequirements: {
              summary: "2-4 concise paragraphs",
              keyTakeaways: "3-6 practical insights",
              categories: "1-3 sports technology categories",
              tags: "5-10 searchable tags",
              seoTitle: "Search-optimized title under 70 characters",
              seoDescription: "Search-optimized meta description under 170 characters",
              confidenceScore: "0 to 1 confidence in classification and summary quality",
            },
            article: {
              title: input.title,
              sourceName: input.sourceName,
              publishedAt: input.publishedAt?.toISOString(),
              content: input.content,
            },
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response did not include summary content.");
    }

    return summarizationSchema.parse(JSON.parse(content));
  }
}

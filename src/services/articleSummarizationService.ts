import OpenAI from "openai";
import { z } from "zod";

const summarizationSchema = z.object({
  summary: z.string().min(1),
  keyTakeaways: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(1).max(170),
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

  constructor(options?: { apiKey?: string; model?: string }) {
    this.client = new OpenAI({ apiKey: options?.apiKey ?? process.env.OPENAI_API_KEY });
    this.model = options?.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }

  get modelName(): string {
    return this.model;
  }

  async summarize(input: SummarizeArticleInput): Promise<ArticleSummaryResult> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
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
      text: {
        format: {
          type: "json_schema",
          name: "article_summary",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "summary",
              "keyTakeaways",
              "categories",
              "tags",
              "seoTitle",
              "seoDescription",
              "confidenceScore",
            ],
            properties: {
              summary: { type: "string" },
              keyTakeaways: { type: "array", items: { type: "string" } },
              categories: { type: "array", items: { type: "string" } },
              tags: { type: "array", items: { type: "string" } },
              seoTitle: { type: "string" },
              seoDescription: { type: "string" },
              confidenceScore: { type: "number", minimum: 0, maximum: 1 },
            },
          },
        },
      },
    });

    const outputText = response.output_text;
    if (!outputText) {
      throw new Error("OpenAI response did not include summary output text.");
    }

    return summarizationSchema.parse(JSON.parse(outputText));
  }
}

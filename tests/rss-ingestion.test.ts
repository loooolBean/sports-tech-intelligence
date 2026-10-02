import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import type { ArticleSummarizationService } from "../src/services/articleSummarizationService";
import { RssIngestionService } from "../src/services/rssIngestionService";
import { RSS_SOURCE_ORDER } from "../src/lib/rss-policy";
import { createArticleDom } from "../src/utils/article-dom";

const input = { sourceId: "source-test", rssUrl: "https://example.com/feed", autoPublish: true };
const item = { title: "Sports sensor update", link: "https://example.com/article", content: "Athlete training sensors record performance data. ".repeat(25) };

test("article parsing ignores layout CSS while preserving content, metadata and hidden elements", () => {
  const dom = createArticleDom(`<html><head><style>.card { width: calc(100% / var(--columns)) }</style><link rel="canonical" href="https://example.com/story"><meta property="og:image" content="https://example.com/image.jpg"></head><body><article style="width: calc(100% / var(--columns)); display: block"><h1>Sports sensors</h1><p>Source-backed article text.</p><a href="/source">Original source</a></article><aside style="width: calc(100% / var(--columns)); display: none !important; visibility: hidden">Hidden navigation</aside></body></html>`, "https://example.com/story");
  const document = dom.window.document;
  assert.equal(document.querySelector('style'), null);
  assert.equal(document.querySelector('article')?.style.width, '');
  assert.equal(document.querySelector('article')?.style.display, 'block');
  assert.equal(document.querySelector('aside')?.style.display, 'none');
  assert.equal(document.querySelector('aside')?.style.visibility, 'hidden');
  assert.equal(document.querySelector('h1')?.textContent, 'Sports sensors');
  assert.equal(document.querySelector('a')?.href, 'https://example.com/source');
  assert.equal(document.querySelector('meta[property="og:image"]')?.getAttribute('content'), 'https://example.com/image.jpg');
  assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://example.com/story');
  dom.window.close();
});

function fixture(options: { aiFails?: boolean; duplicate?: boolean; feedFails?: boolean; alertFails?: boolean } = {}) {
  const failures: Array<{ stage: string; payload?: unknown }> = [];
  const updates: Array<{ status?: string }> = [];
  let lastFetchedAt: Date | undefined;
  const db = {
    source: {
      findUniqueOrThrow: async () => ({ name: "Test source" }),
      update: async ({ data }: { data: { lastFetchedAt: Date } }) => { lastFetchedAt = data.lastFetchedAt; },
    },
    article: {
      findFirst: async ({ where }: { where: { status?: string } }) => {
        if (where.status === "PUBLISHED" && options.alertFails) throw new Error("Alert lookup failed");
        return options.duplicate ? { id: "existing" } : null;
      },
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({ id: "article-test" }),
      update: async ({ data }: { data: { status?: string } }) => { updates.push(data); },
    },
    category: { upsert: async () => ({ id: "category-test" }) },
    aiSummary: { upsert: async () => ({}) },
    tag: { upsert: async () => ({ id: "tag-test" }) },
    articleTag: { upsert: async () => ({}) },
    ingestionFailure: { create: async ({ data }: { data: { stage: string } }) => { failures.push(data); } },
  } as unknown as PrismaClient;
  const summarizer = { modelName: "test", summarize: async () => {
    if (options.aiFails) throw new Error("Invalid AI output");
    return { summary: "A sensor update.", primaryCategory: "Products & Launches", tags: ["Sensors"], whyItMatters: "Helps performance staff.", keyTakeaways: [], importanceScore: options.alertFails ? 95 : 1, seoTitle: "Sensor update", seoDescription: "A sports sensor update.", confidenceScore: 0.8 };
  } } as unknown as ArticleSummarizationService;
  const service = new RssIngestionService(db, summarizer);
  // Feed transport is isolated; the real ingestion/AI/error-accounting code runs.
  Object.defineProperty(service, "parser", { value: { parseURL: async () => {
    if (options.feedFails) throw new Error("Feed timeout");
    return { items: [item] };
  } } });
  return { service, failures, updates, lastFetched: () => lastFetchedAt };
}

test("RSS rotation prioritizes never-fetched sources with stable tie breakers", () => {
  assert.deepEqual(RSS_SOURCE_ORDER, [
    { lastFetchedAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }, { id: "asc" },
  ]);
});

test("AI failure preserves the draft and contributes to the cron failure count", async () => {
  const f = fixture({ aiFails: true });
  const result = await f.service.ingestSource(input);
  assert.equal(result.created, 1);
  assert.equal(result.failed, 1);
  assert.deepEqual(f.failures, [{ sourceId: input.sourceId, url: item.link, stage: "ai_processing", errorMessage: "Invalid AI output", errorCode: undefined, payload: { articleId: "article-test" } }]);
  assert.equal(f.updates.some(x => x.status === "PUBLISHED"), false);
  assert.ok(f.lastFetched() instanceof Date);
});

test("successful AI processing does not fabricate a failure or publish low-priority drafts", async () => {
  const f = fixture();
  const result = await f.service.ingestSource(input);
  assert.equal(result.created, 1);
  assert.equal(result.failed, 0);
  assert.equal(f.failures.length, 0);
  assert.equal(f.updates.some(x => x.status === "PUBLISHED"), false);
});

test("duplicate items skip AI without creating a failure", async () => {
  const f = fixture({ duplicate: true, aiFails: true });
  const result = await f.service.ingestSource(input);
  assert.equal(result.created, 0);
  assert.equal(result.duplicates, 1);
  assert.equal(result.failed, 0);
});

test("feed failure is logged and advances its attempt time so other sources get a turn", async () => {
  const f = fixture({ feedFails: true });
  const result = await f.service.ingestSource(input);
  assert.equal(result.failed, 1);
  assert.equal(result.created, 0);
  assert.equal(f.failures[0]?.stage, "rss_fetch");
  assert.ok(f.lastFetched() instanceof Date);
});

test("alert generation failure remains visible after an article is published", async () => {
  const f = fixture({ alertFails: true });
  const result = await f.service.ingestSource(input);
  assert.equal(result.created, 1);
  assert.equal(result.failed, 1);
  assert.equal(f.failures[0]?.stage, "alert_generation");
  assert.equal(f.updates.some(x => x.status === "PUBLISHED"), true);
});

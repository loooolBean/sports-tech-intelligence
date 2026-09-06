import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { RssIngestionService } from "../../../../src/services/rssIngestionService";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  return ingestRss(request);
}

export async function POST(request: Request) {
  return ingestRss(request);
}

async function ingestRss(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sourceLimit = clampPositiveInteger(url.searchParams.get("sourceLimit"), 3, 10);
  const itemsPerSource = clampPositiveInteger(url.searchParams.get("itemsPerSource"), 2, 10);

  const sources = await prisma.source.findMany({
    where: {
      isActive: true,
      rssUrl: { not: null },
    },
    orderBy: { lastFetchedAt: "asc" },
    take: sourceLimit,
  });

  if (sources.length === 0) {
    return NextResponse.json({ message: "No active RSS sources found", results: [] });
  }

  const ingestion = new RssIngestionService();
  const results = [];

  for (const source of sources) {
    try {
      const result = await ingestion.ingestSource({
        sourceId: source.id,
        rssUrl: source.rssUrl!,
        defaultCategorySlug: "uncategorized",
        autoPublish: false,
        maxItems: itemsPerSource,
      });
      results.push({ source: source.name, ...result });
    } catch (error) {
      results.push({
        source: source.name,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    message: `Ingested ${sources.length} sources`,
    sourceLimit,
    itemsPerSource,
    results,
  });
}

function clampPositiveInteger(value: string | null, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, maximum);
}

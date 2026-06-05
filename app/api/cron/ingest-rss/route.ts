import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { RssIngestionService } from "../../../../src/services/rssIngestionService";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sources = await prisma.source.findMany({
    where: {
      isActive: true,
      rssUrl: { not: null },
    },
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
    results,
  });
}

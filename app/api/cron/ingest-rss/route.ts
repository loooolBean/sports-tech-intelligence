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

  const jobRun = await prisma.jobRun.create({
    data: { jobName: "rss-ingestion" },
  });

  try {
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
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });
      return NextResponse.json({ message: "No active RSS sources found", results: [] });
    }

    const ingestion = new RssIngestionService();
    const results: Array<{
      source: string;
      fetched?: number;
      created?: number;
      duplicates?: number;
      failed?: number;
      error?: string;
    }> = [];

    for (const source of sources) {
      try {
        const result = await ingestion.ingestSource({
          sourceId: source.id,
          rssUrl: source.rssUrl!,
          defaultCategorySlug: "uncategorized",
          autoPublish: true,
          maxItems: itemsPerSource,
        });
        results.push({ source: source.name, ...result });
      } catch (error) {
        results.push({
          source: source.name,
          error: safeErrorMessage(error),
        });
      }
    }

    const itemsProcessed = results.reduce((total, result) => total + (result.fetched ?? 0), 0);
    const failedItems = results.reduce(
      (total, result) => total + (result.failed ?? 0) + (result.error ? 1 : 0),
      0,
    );

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: failedItems > 0 ? "FAILED" : "SUCCEEDED",
        finishedAt: new Date(),
        itemsProcessed,
        errorMessage:
          failedItems > 0
            ? `${failedItems} RSS item or source operation(s) failed. Open Ingestion Failures for details.`
            : null,
      },
    });

    return NextResponse.json({
      message: `Ingested ${sources.length} sources`,
      sourceLimit,
      itemsPerSource,
      results,
    });
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: safeErrorMessage(error),
      },
    });
    return NextResponse.json({ error: "RSS ingestion failed. Check the operations dashboard and runtime logs." }, { status: 500 });
  }
}

function clampPositiveInteger(value: string | null, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, maximum);
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown ingestion error";
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[database connection hidden]").slice(0, 500);
}

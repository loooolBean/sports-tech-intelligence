import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { ArticleSeoMetadataService } from "../../../../src/services/articleSeoMetadataService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return generateSeoMetadata(request);
}

export async function POST(request: Request) {
  return generateSeoMetadata(request);
}

async function generateSeoMetadata(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobRun = await prisma.jobRun.create({
    data: { jobName: "seo-metadata" },
  });

  try {
    const url = new URL(request.url);
    const batchSize = parsePositiveInteger(url.searchParams.get("batchSize")) ?? 25;
    const overwrite = url.searchParams.get("overwrite") === "true";

    const service = new ArticleSeoMetadataService();
    const result = await service.backfillMissing({
      batchSize,
      overwrite,
    });

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: result.failed > 0 ? "FAILED" : "SUCCEEDED",
        finishedAt: new Date(),
        itemsProcessed: result.scanned,
        errorMessage:
          result.failed > 0
            ? `${result.failed} article(s) failed. Open Ingestion Failures for details.`
            : null,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI processing error";
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: message
          .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[database connection hidden]")
          .slice(0, 500),
      },
    });
    return NextResponse.json({ error: "AI metadata processing failed. Check the operations dashboard and runtime logs." }, { status: 500 });
  }
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

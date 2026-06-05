import { NextResponse } from "next/server";
import { ArticleSeoMetadataService } from "../../../../src/services/articleSeoMetadataService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const batchSize = parsePositiveInteger(url.searchParams.get("batchSize")) ?? 25;
  const overwrite = url.searchParams.get("overwrite") === "true";

  const service = new ArticleSeoMetadataService();
  const result = await service.backfillMissing({
    batchSize,
    overwrite,
  });

  return NextResponse.json(result);
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

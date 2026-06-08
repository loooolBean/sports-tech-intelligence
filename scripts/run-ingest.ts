import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/lib/prisma";
import { RssIngestionService } from "../src/services/rssIngestionService";

async function main() {
  const sources = await prisma.source.findMany({
    where: { isActive: true, rssUrl: { not: null } },
  });

  console.log(`[RSS Ingestion] Found ${sources.length} active sources with RSS URLs`);

  const service = new RssIngestionService();
  let totalCreated = 0;
  let totalFailed = 0;

  for (const source of sources) {
    try {
      const result = await service.ingestSource({
        sourceId: source.id,
        rssUrl: source.rssUrl!,
        defaultCategorySlug: "uncategorized",
        autoPublish: false,
      });
      console.log(`  ${result.created > 0 ? "+" : "·"} ${source.name}: fetched=${result.fetched} created=${result.created} dupes=${result.duplicates} failed=${result.failed}`);
      totalCreated += result.created;
      totalFailed += result.failed;
    } catch (e: any) {
      console.log(`  ! ${source.name}: ${e.message}`);
      totalFailed++;
    }
  }

  console.log(`\n[RSS Ingestion] Done: ${totalCreated} new articles, ${totalFailed} failures`);
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[RSS Ingestion] Fatal:", e);
    process.exit(1);
  });

import { Prisma, PrismaClient, SourceType } from "@prisma/client";
import { RssIngestionService } from "../src/services/rssIngestionService";

const prisma = new PrismaClient();

const RSS_SOURCES = [
  {
    name: "The Verge - Tech",
    rssUrl: "https://www.theverge.com/rss/index.xml",
    sourceType: SourceType.NEWS_WEBSITE,
    reputationScore: 9,
  },
  {
    name: "Wired",
    rssUrl: "https://www.wired.com/feed/rss",
    sourceType: SourceType.NEWS_WEBSITE,
    reputationScore: 8,
  },
  {
    name: "MIT Technology Review",
    rssUrl: "https://www.technologyreview.com/feed/",
    sourceType: SourceType.RESEARCH_WEBSITE,
    reputationScore: 9,
  },
  {
    name: "Ars Technica",
    rssUrl: "https://feeds.arstechnica.com/arstechnica/index",
    sourceType: SourceType.NEWS_WEBSITE,
    reputationScore: 8,
  },
  {
    name: "TechCrunch",
    rssUrl: "https://techcrunch.com/feed/",
    sourceType: SourceType.NEWS_WEBSITE,
    reputationScore: 8,
  },
] as const;

async function main() {
  const ingestion = new RssIngestionService(prisma);
  let created = 0;
  let duplicates = 0;
  let failed = 0;

  for (const item of RSS_SOURCES) {
    const hostname = new URL(item.rssUrl).hostname;
    const existing = await prisma.source.findFirst({ where: { name: item.name } });
    const source = existing
      ? await prisma.source.update({
          where: { id: existing.id },
          data: {
            rssUrl: item.rssUrl,
            websiteUrl: `https://${hostname}`,
            sourceType: item.sourceType,
            domain: hostname,
            reputationScore: new Prisma.Decimal(item.reputationScore),
            isActive: true,
          },
        })
      : await prisma.source.create({
          data: {
            name: item.name,
            rssUrl: item.rssUrl,
            websiteUrl: `https://${hostname}`,
            sourceType: item.sourceType,
            domain: hostname,
            reputationScore: new Prisma.Decimal(item.reputationScore),
            isActive: true,
          },
        });

    const result = await ingestion.ingestSource({
      sourceId: source.id,
      rssUrl: item.rssUrl,
      defaultCategorySlug: "other",
      autoPublish: true,
      maxItems: 2,
    });
    created += result.created;
    duplicates += result.duplicates;
    failed += result.failed;
    console.log(
      `${item.name}: fetched=${result.fetched} created=${result.created} duplicates=${result.duplicates} failed=${result.failed}`,
    );
  }

  console.log(
    `Seed and ingestion complete. Created: ${created}, duplicates: ${duplicates}, failed: ${failed}.`,
  );
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

import { ArticleStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { RssIngestionService } from "../src/services/rssIngestionService";

function getLimit(args: string[]): number {
  const inline = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
  const index = args.indexOf("--limit");
  const raw = inline ?? (index >= 0 ? args[index + 1] : undefined);
  const parsed = Number(raw ?? 25);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : 25;
}

async function main() {
  const limit = getLimit(process.argv.slice(2));
  const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: {
      status: { in: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED] },
      duplicateOfId: null,
      publishedAt: { gte: recentCutoff },
      OR: [
        { processedAt: null },
        { aiSummary: { is: null } },
        { aiSummary: { is: { whyItMatters: null } } },
      ],
    },
    include: {
      source: true,
      companies: { include: { company: true } },
      products: { include: { product: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  const processor = new RssIngestionService();
  let completed = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      await processor.processArticleWithAi({
        articleId: article.id,
        title: article.title,
        content: article.body ?? article.excerpt ?? article.title,
        sourceName: article.source.name,
        publishedAt: article.publishedAt,
        relatedCompanies: article.companies.map(({ company }) => company.name),
        relatedProducts: article.products.map(({ product }) => product.name),
      });
      completed += 1;
      console.log(`Processed ${completed}/${articles.length}: ${article.title}`);
    } catch (error) {
      failed += 1;
      console.error(
        `Failed: ${article.title}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(
    `Intelligence backfill complete. Selected: ${articles.length}, processed: ${completed}, failed: ${failed}.`,
  );
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

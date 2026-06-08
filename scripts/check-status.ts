import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/lib/prisma";

async function main() {
  const published = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const draft = await prisma.article.count({ where: { status: "DRAFT" } });
  const summaries = await prisma.aiSummary.count();
  const tags = await prisma.tag.count();
  const activeSources = await prisma.source.count({ where: { isActive: true, rssUrl: { not: null } } });

  console.log("=== Platform Status ===");
  console.log(`Published: ${published} | Draft: ${draft} | Summaries: ${summaries} | Tags: ${tags} | Active Sources: ${activeSources}`);

  const sourceStats = await prisma.source.findMany({
    where: { isActive: true },
    include: { _count: { select: { articles: true } } },
    orderBy: { articles: { _count: "desc" } },
  });
  console.log("\nSources with articles:");
  sourceStats.filter(s => s._count.articles > 0).forEach(s => console.log(`  ${s.name}: ${s._count.articles}`));
  console.log("\nSources without articles:");
  sourceStats.filter(s => s._count.articles === 0).forEach(s => console.log(`  ${s.name} [${s.rssUrl || 'no RSS'}]`));

  const failures = await prisma.ingestionFailure.findMany({
    where: { status: "OPEN" },
    select: { stage: true, errorMessage: true, source: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log(`\nOpen failures (${failures.length}):`);
  failures.forEach(f => console.log(`  [${f.source?.name || "unknown"}] ${f.stage}: ${f.errorMessage.substring(0, 100)}`));

  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/lib/prisma";

async function main() {
  // Find draft articles that have AI summaries with SEO metadata
  const drafts = await prisma.article.findMany({
    where: {
      status: "DRAFT",
      aiSummary: {
        is: {
          seoTitle: { not: null },
          seoDescription: { not: null },
        },
      },
    },
    include: {
      aiSummary: { select: { seoTitle: true, confidenceScore: true } },
      source: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Found ${drafts.length} draft articles with SEO metadata`);

  if (drafts.length === 0) {
    console.log("No drafts to publish");
    await prisma.$disconnect();
    return;
  }

  // Publish them
  let published = 0;
  for (const draft of drafts) {
    try {
      await prisma.article.update({
        where: { id: draft.id },
        data: { status: "PUBLISHED" },
      });
      published++;
      console.log(`  Published: [${draft.source.name}] ${draft.title.substring(0, 70)}`);
    } catch (e: any) {
      console.log(`  Failed: ${draft.title.substring(0, 50)} - ${e.message}`);
    }
  }

  console.log(`\nPublished ${published} of ${drafts.length} draft articles`);

  const totalPublished = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const totalDraft = await prisma.article.count({ where: { status: "DRAFT" } });
  console.log(`Total published: ${totalPublished} | Remaining drafts: ${totalDraft}`);

  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

import { PrismaClient } from "@prisma/client";
import { JSDOM } from "jsdom";

const prisma = new PrismaClient();

async function main() {
  console.log("Backfilling images for existing articles...\n");

  const articles = await prisma.article.findMany({
    where: { imageUrl: null },
    select: { id: true, title: true, originalUrl: true },
    take: 50,
  });

  console.log(`Found ${articles.length} articles without images\n`);

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      console.log(`Fetching: ${article.title.slice(0, 50)}...`);

      const response = await fetch(article.originalUrl, {
        headers: { "User-Agent": "SportsTechBot/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.log(`  Failed: HTTP ${response.status}`);
        failed++;
        continue;
      }

      const html = await response.text();
      const dom = new JSDOM(html);

      // Try og:image first
      const ogImage = dom.window.document.querySelector("meta[property='og:image']")?.getAttribute("content");

      // Try twitter:image
      const twitterImage = dom.window.document.querySelector("meta[name='twitter:image']")?.getAttribute("content");

      // Try first article image
      const firstImage = dom.window.document.querySelector("article img, .article-content img, main img, .post-content img")?.getAttribute("src");

      const imageUrl = ogImage || twitterImage || firstImage;

      if (imageUrl) {
        // Make relative URLs absolute
        let absoluteUrl = imageUrl;
        if (imageUrl.startsWith("//")) {
          absoluteUrl = `https:${imageUrl}`;
        } else if (imageUrl.startsWith("/")) {
          const urlObj = new URL(article.originalUrl);
          absoluteUrl = `${urlObj.origin}${imageUrl}`;
        }

        await prisma.article.update({
          where: { id: article.id },
          data: { imageUrl: absoluteUrl },
        });

        updated++;
        console.log(`  Updated: ${absoluteUrl.slice(0, 80)}`);
      } else {
        console.log("  No image found");
        failed++;
      }
    } catch (err: any) {
      console.log(`  Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

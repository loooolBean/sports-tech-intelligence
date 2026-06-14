import dotenv from "dotenv";
dotenv.config();

import { JSDOM } from "jsdom";
import { prisma } from "../src/lib/prisma";

/**
 * Backfill imageUrl for articles that don't have one.
 * Fetches each article's original URL and extracts og:image or first <img>.
 */
async function main() {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      duplicateOfId: null,
      imageUrl: null,
    },
    select: { id: true, title: true, originalUrl: true },
    take: 200,
    orderBy: { publishedAt: "desc" },
  });

  console.log(`[Image Backfill] Found ${articles.length} articles without images.`);

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const imageUrl = await fetchImage(article.originalUrl);
      if (imageUrl) {
        await prisma.article.update({
          where: { id: article.id },
          data: { imageUrl },
        });
        updated++;
        console.log(`  ✅ ${article.title.slice(0, 60)} → ${imageUrl.slice(0, 80)}`);
      } else {
        console.log(`  ⏭️  ${article.title.slice(0, 60)} → no image found`);
      }
    } catch (e) {
      failed++;
      console.log(`  ❌ ${article.title.slice(0, 60)} → ${e instanceof Error ? e.message : "unknown error"}`);
    }
    // Be polite to servers
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n[Image Backfill] Done: ${updated} updated, ${failed} failed, ${articles.length - updated - failed} no image`);
}

async function fetchImage(url: string): Promise<string | undefined> {
  const response = await fetch(url, {
    headers: { "User-Agent": "SportsTechIntelligenceBot/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return undefined;

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Priority: og:image
  const ogImage = doc.querySelector("meta[property='og:image']")?.getAttribute("content");
  if (ogImage && ogImage.startsWith("http")) return ogImage;

  // twitter:image
  const twitterImage = doc.querySelector("meta[name='twitter:image']")?.getAttribute("content")
    ?? doc.querySelector("meta[property='twitter:image']")?.getAttribute("content");
  if (twitterImage && twitterImage.startsWith("http")) return twitterImage;

  // First large image in article/main content
  const contentImg = doc.querySelector("article img[src], .article-content img[src], .post-content img[src], main img[src]");
  const src = contentImg?.getAttribute("src");
  if (src && src.startsWith("http")) return src;

  return undefined;
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[Image Backfill] Fatal:", e);
    process.exit(1);
  });

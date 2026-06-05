import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { hashContent, normalizeUrl, slugify, truncate } from "../src/utils/content";

const prisma = new PrismaClient();
const parser = new Parser();

const RSS_SOURCES = [
  { name: "The Verge - Tech", rssUrl: "https://www.theverge.com/rss/index.xml", sourceType: "NEWS_WEBSITE", reputationScore: 9 },
  { name: "Wired", rssUrl: "https://www.wired.com/feed/rss", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "MIT Technology Review", rssUrl: "https://www.technologyreview.com/feed/", sourceType: "RESEARCH_WEBSITE", reputationScore: 9 },
  { name: "Ars Technica", rssUrl: "https://feeds.arstechnica.com/arstechnica/index", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "TechCrunch", rssUrl: "https://techcrunch.com/feed/", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
];

function htmlToText(html: string): string {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

async function main() {
  console.log("Starting RSS ingestion with reliable sources...\n");

  let totalCreated = 0;
  const target = 10;

  for (const s of RSS_SOURCES) {
    if (totalCreated >= target) break;

    console.log(`\nFetching: ${s.name} (${s.rssUrl})`);

    // Find or create source
    let source = await prisma.source.findFirst({ where: { name: s.name } });
    if (!source) {
      const hostname = new URL(s.rssUrl).hostname;
      source = await prisma.source.create({
        data: {
          name: s.name,
          rssUrl: s.rssUrl,
          websiteUrl: `https://${hostname}`,
          sourceType: s.sourceType as any,
          domain: hostname,
          reputationScore: s.reputationScore,
          isActive: true,
        },
      });
    } else {
      await prisma.source.update({
        where: { id: source.id },
        data: { isActive: true, rssUrl: s.rssUrl },
      });
    }

    try {
      const feed = await parser.parseURL(s.rssUrl);
      console.log(`  Found ${feed.items.length} items`);

      for (const item of feed.items.slice(0, 5)) {
        if (totalCreated >= target) break;
        if (!item.link || !item.title) continue;

        const normalizedUrl = normalizeUrl(item.link);
        const existing = await prisma.article.findFirst({
          where: { OR: [{ originalUrl: item.link }, { normalizedUrl }] },
          select: { id: true },
        });
        if (existing) {
          console.log(`  Skip (exists): ${item.title.slice(0, 60)}`);
          continue;
        }

        // Extract content
        let content = "";
        try {
          const feedContent = (item as any)["content:encoded"] ?? item.content ?? item.contentSnippet;
          if (feedContent && feedContent.trim().length > 300) {
            content = htmlToText(feedContent);
          } else if (item.link) {
            const resp = await fetch(item.link, {
              headers: { "User-Agent": "SportsTechBot/1.0" },
              signal: AbortSignal.timeout(10000),
            });
            if (resp.ok) {
              const html = await resp.text();
              const dom = new JSDOM(html, { url: item.link });
              const article = new Readability(dom.window.document).parse();
              content = article?.textContent?.trim() ?? "";
            }
          }
        } catch (e: any) {
          console.log(`  Content extraction failed: ${e.message}`);
          continue;
        }

        if (content.length < 100) {
          console.log(`  Skip (too short): ${item.title.slice(0, 60)}`);
          continue;
        }

        // Find or create category
        const categorySlug = slugify("Sports Technology");
        const category = await prisma.category.upsert({
          where: { slug: categorySlug },
          create: { name: "Sports Technology", slug: categorySlug },
          update: {},
        });

        const contentHash = hashContent(`${item.title}\n${content}`);
        const slug = await createUniqueSlug(item.title);

        const article = await prisma.article.create({
          data: {
            sourceId: source.id,
            categoryId: category.id,
            title: item.title,
            slug,
            originalUrl: item.link,
            normalizedUrl,
            excerpt: truncate(content.replace(/\s+/g, " "), 280),
            body: content,
            contentHash,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            status: "PUBLISHED",
          },
        });

        totalCreated++;
        console.log(`  [${totalCreated}/${target}] Published: ${article.title.slice(0, 70)}`);
      }
    } catch (err: any) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  const finalCount = await prisma.article.count();
  console.log(`\nDone. Total articles in DB: ${finalCount}`);
  await prisma.$disconnect();
}

async function createUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "article";
  let slug = base;
  let suffix = 2;
  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

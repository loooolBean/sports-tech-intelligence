import { ArticleStatus } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_NAME = "Sports Technology Intelligence";
const SITE_URL = "https://sports-tech-intelligence.vercel.app";
const SITE_DESCRIPTION =
  "Daily sports technology news, research, and applied insight across wearables, athlete monitoring, performance analytics, and sports science.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null },
    include: { category: true, source: true, aiSummary: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
      <pubDate>${a.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(a.aiSummary?.summary ?? a.excerpt ?? a.title)}</description>
      <category>${escapeXml(a.category.name)}</category>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

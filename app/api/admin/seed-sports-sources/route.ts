import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { SourceType } from "@prisma/client";

export const dynamic = "force-dynamic";

const SOURCES = [
  { name: "The Verge", rssUrl: "https://www.theverge.com/rss/index.xml", websiteUrl: "https://www.theverge.com", sourceType: "NEWS_WEBSITE", reputationScore: 9 },
  { name: "Wired", rssUrl: "https://www.wired.com/feed/rss", websiteUrl: "https://www.wired.com", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "TechCrunch", rssUrl: "https://techcrunch.com/feed/", websiteUrl: "https://techcrunch.com", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "Ars Technica", rssUrl: "https://feeds.arstechnica.com/arstechnica/index", websiteUrl: "https://arstechnica.com", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "Front Office Sports", rssUrl: "https://frontofficesports.com/feed/", websiteUrl: "https://frontofficesports.com", sourceType: "NEWS_WEBSITE", reputationScore: 9 },
  { name: "SportsPro Media", rssUrl: "https://www.sportspro.com/feed/", websiteUrl: "https://www.sportspro.com", sourceType: "NEWS_WEBSITE", reputationScore: 9 },
  { name: "Sportico", rssUrl: "https://sportico.com/feed/", websiteUrl: "https://sportico.com", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "Wareable", rssUrl: "https://www.wareable.com/rss", websiteUrl: "https://www.wareable.com", sourceType: "BLOG", reputationScore: 8 },
  { name: "DC Rainmaker", rssUrl: "https://www.dcrainmaker.com/feed", websiteUrl: "https://www.dcrainmaker.com", sourceType: "BLOG", reputationScore: 9 },
  { name: "Gadgets and Wearables", rssUrl: "https://gadgetsandwearables.com/feed/", websiteUrl: "https://gadgetsandwearables.com", sourceType: "BLOG", reputationScore: 7 },
  { name: "ESPN", rssUrl: "https://www.espn.com/espn/rss/news", websiteUrl: "https://www.espn.com", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "BBC Sport", rssUrl: "http://feeds.bbci.co.uk/sport/rss.xml", websiteUrl: "https://www.bbc.com/sport", sourceType: "NEWS_WEBSITE", reputationScore: 8 },
  { name: "Sky Sports", rssUrl: "https://www.skysports.com/rss/12040", websiteUrl: "https://www.skysports.com", sourceType: "NEWS_WEBSITE", reputationScore: 7 },
  { name: "Sporting News", rssUrl: "https://www.sportingnews.com/us/rss", websiteUrl: "https://www.sportingnews.com", sourceType: "NEWS_WEBSITE", reputationScore: 7 },
  { name: "MIT Technology Review", rssUrl: "https://www.technologyreview.com/feed/", websiteUrl: "https://www.technologyreview.com", sourceType: "RESEARCH_WEBSITE", reputationScore: 9 },
];

export async function POST() {
  const created: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const s of SOURCES) {
    try {
      const existing = await prisma.source.findFirst({
        where: { OR: [{ name: s.name }, { rssUrl: s.rssUrl }] },
      });

      if (existing) {
        if (!existing.rssUrl) {
          await prisma.source.update({
            where: { id: existing.id },
            data: { rssUrl: s.rssUrl, isActive: true },
          });
          created.push("updated:" + s.name);
          continue;
        }
        skipped.push(s.name);
        continue;
      }

      const hostname = new URL(s.websiteUrl ?? s.rssUrl).hostname;
      await prisma.source.create({
        data: {
          name: s.name,
          rssUrl: s.rssUrl,
          websiteUrl: s.websiteUrl,
          sourceType: s.sourceType as SourceType,
          domain: hostname,
          reputationScore: s.reputationScore,
          isActive: true,
        },
      });
      created.push(s.name);
    } catch (e: unknown) {
      errors.push(s.name + ": " + (e instanceof Error ? e.message : "unknown"));
    }
  }

  return NextResponse.json({ created, skipped, errors });
}

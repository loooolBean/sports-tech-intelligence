import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/lib/prisma";

// Sources to disable (broken/dead RSS feeds)
const BROKEN_SOURCES = [
  "Wearable Technologies", // 404
  "SportsTechie",          // ECONNRESET
  "Catapult Sports",       // malformed XML
];

// New working RSS sources to add
const NEW_SOURCES = [
  { name: "SportTechie", url: "https://www.sporttechie.com/rss", websiteUrl: "https://www.sporttechie.com" },
  { name: "Wearable Technologies", url: "https://www.wearable-technologies.com/feed/", websiteUrl: "https://www.wearable-technologies.com" },
  { name: "DC Rainmaker", url: "https://www.dcrainmaker.com/feed", websiteUrl: "https://www.dcrainmaker.com" },
  { name: "SportsPro Media", url: "https://www.sportspro.com/feed/", websiteUrl: "https://www.sportspro.com" },
  { name: "Wareable", url: "https://www.wareable.com/rss", websiteUrl: "https://www.wareable.com" },
  { name: "Gadgets & Wearables", url: "https://gadgetsandwearables.com/feed/", websiteUrl: "https://gadgetsandwearables.com" },
  { name: "Garmin Blog", url: "https://www.garmin.com/en-US/blog/feed/", websiteUrl: "https://www.garmin.com/en-US/blog/" },
  { name: "StatsBomb", url: "https://statsbomb.com/feed/", websiteUrl: "https://statsbomb.com" },
  { name: "ESPN", url: "https://www.espn.com/espn/rss/news", websiteUrl: "https://www.espn.com" },
  { name: "BBC Sport", url: "http://feeds.bbci.co.uk/sport/rss.xml", websiteUrl: "https://www.bbc.com/sport" },
  { name: "Sky Sports", url: "https://www.skysports.com/rss/12040", websiteUrl: "https://www.skysports.com" },
  { name: "Sporting News", url: "https://www.sportingnews.com/us/rss", websiteUrl: "https://www.sportingnews.com" },
  { name: "British Journal of Sports Medicine", url: "https://bjsm.bmj.com/rss/recent.xml", websiteUrl: "https://bjsm.bmj.com" },
  { name: "PubMed Sports Medicine", url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/1ZOgM_K_Ih_JqL-iVxTzFmRnPrNnDmBdkgkFSd3nNWK4WEKkiL/?limit=20&utm_campaign=pubmed-2&fc=20220101000000", websiteUrl: "https://pubmed.ncbi.nlm.nih.gov" },
  { name: "Sportico", url: "https://sportico.com/feed/", websiteUrl: "https://sportico.com" },
  { name: "The Athletic", url: "https://theathletic.com/feed/", websiteUrl: "https://theathletic.com" },
  { name: "SportsTechie (alt)", url: "https://www.sportstechie.com/feed/", websiteUrl: "https://www.sportstechie.com" },
  { name: "MIT Sloan Sports", url: "https://www.sloansportsconference.com/feed/", websiteUrl: "https://www.sloansportsconference.com" },
  { name: "WHOOP Blog", url: "https://www.whoop.com/blog/feed/", websiteUrl: "https://www.whoop.com/blog/" },
  { name: "Catapult Sports", url: "https://www.catapultsports.com/blog/feed", websiteUrl: "https://www.catapultsports.com/blog" },
];

async function main() {
  // 1. Disable broken sources
  for (const name of BROKEN_SOURCES) {
    const result = await prisma.source.updateMany({
      where: { name, isActive: true },
      data: { isActive: false },
    });
    if (result.count > 0) {
      console.log(`  Disabled: ${name}`);
    }
  }

  // 2. Add new sources (skip if already exists)
  for (const src of NEW_SOURCES) {
    const existing = await prisma.source.findFirst({ where: { name: src.name } });
    if (!existing) {
      await prisma.source.create({
        data: {
          name: src.name,
          sourceType: "RSS",
          rssUrl: src.url,
          websiteUrl: src.websiteUrl,
          domain: new URL(src.websiteUrl).hostname,
          isActive: true,
        },
      });
      console.log(`  Added: ${src.name}`);
    } else {
      console.log(`  Exists: ${src.name}`);
    }
  }

  const activeSources = await prisma.source.count({ where: { isActive: true, rssUrl: { not: null } } });
  console.log(`\nActive sources with RSS URLs: ${activeSources}`);

  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

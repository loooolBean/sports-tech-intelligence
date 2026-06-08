import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 体育科技资讯平台 RSS 源清单
 *
 * 运行方式:
 *   npx tsx scripts/seed-sports-tech-sources.ts
 *
 * 运行后源会写入数据库，然后去后台 /admin/sources 确认，
 * 采集任务会自动抓取这些源的文章。
 */

interface SourceSeed {
  name: string;
  rssUrl: string;
  websiteUrl: string;
  sourceType: "RSS" | "NEWS_WEBSITE" | "BLOG" | "RESEARCH_WEBSITE";
  reputationScore: number;
  category: string;
}

const SOURCES: SourceSeed[] = [
  // ── 体育科技核心 ──────────────────────────────────
  {
    name: "Front Office Sports",
    rssUrl: "https://frontofficesports.com/feed/",
    websiteUrl: "https://frontofficesports.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 9,
    category: "Sports Business & Tech",
  },
  {
    name: "SportsPro Media",
    rssUrl: "https://www.sportspro.com/feed/",
    websiteUrl: "https://www.sportspro.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 9,
    category: "Sports Business & Tech",
  },
  {
    name: "SportTechie",
    rssUrl: "https://www.sporttechie.com/feed",
    websiteUrl: "https://www.sporttechie.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 9,
    category: "Sports Technology",
  },
  {
    name: "Sportico",
    rssUrl: "https://sportico.com/feed/",
    websiteUrl: "https://sportico.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "Sports Business & Tech",
  },

  // ── 可穿戴 / 健身科技 ─────────────────────────────
  {
    name: "Wareable",
    rssUrl: "https://www.wareable.com/rss",
    websiteUrl: "https://www.wareable.com",
    sourceType: "BLOG",
    reputationScore: 8,
    category: "Wearable Technology",
  },
  {
    name: "DC Rainmaker",
    rssUrl: "https://www.dcrainmaker.com/feed",
    websiteUrl: "https://www.dcrainmaker.com",
    sourceType: "BLOG",
    reputationScore: 9,
    category: "Wearable Technology",
  },
  {
    name: "Gadgets & Wearables",
    rssUrl: "https://gadgetsandwearables.com/feed/",
    websiteUrl: "https://gadgetsandwearables.com",
    sourceType: "BLOG",
    reputationScore: 7,
    category: "Wearable Technology",
  },
  {
    name: "Garmin Blog",
    rssUrl: "https://www.garmin.com/en-US/blog/feed/",
    websiteUrl: "https://www.garmin.com/en-US/blog/",
    sourceType: "BLOG",
    reputationScore: 8,
    category: "Wearable Technology",
  },

  // ── 体育数据分析 ──────────────────────────────────
  {
    name: "StatsBomb",
    rssUrl: "https://statsbomb.com/feed/",
    websiteUrl: "https://statsbomb.com",
    sourceType: "RESEARCH_WEBSITE",
    reputationScore: 9,
    category: "Sports Analytics",
  },
  {
    name: "FiveThirtyEight Sports",
    rssUrl: "https://fivethirtyeight.com/sports/feed/",
    websiteUrl: "https://fivethirtyeight.com/sports/",
    sourceType: "RESEARCH_WEBSITE",
    reputationScore: 9,
    category: "Sports Analytics",
  },
  {
    name: "The Athletic",
    rssUrl: "https://theathletic.com/feed/",
    websiteUrl: "https://theathletic.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "Sports Analysis",
  },

  // ── 体育科学 / 运动医学 ────────────────────────────
  {
    name: "British Journal of Sports Medicine",
    rssUrl: "https://bjsm.bmj.com/rss/recent.xml",
    websiteUrl: "https://bjsm.bmj.com",
    sourceType: "RESEARCH_WEBSITE",
    reputationScore: 10,
    category: "Sports Science",
  },
  {
    name: "PubMed Sports Medicine",
    rssUrl: "https://pubmed.ncbi.nlm.nih.gov/rss/search/1ZOgM_K_Ih_JqL-iVxTzFmRnPrNnDmBdkgkFSd3nNWK4WEKkiL/?limit=20&utm_campaign=pubmed-2&fc=20220101000000",
    websiteUrl: "https://pubmed.ncbi.nlm.nih.gov",
    sourceType: "RESEARCH_WEBSITE",
    reputationScore: 10,
    category: "Sports Science",
  },

  // ── 综合科技（体育相关覆盖广）────────────────────────
  {
    name: "The Verge",
    rssUrl: "https://www.theverge.com/rss/index.xml",
    websiteUrl: "https://www.theverge.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 9,
    category: "General Tech",
  },
  {
    name: "TechCrunch",
    rssUrl: "https://techcrunch.com/feed/",
    websiteUrl: "https://techcrunch.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "General Tech",
  },
  {
    name: "Wired",
    rssUrl: "https://www.wired.com/feed/rss",
    websiteUrl: "https://www.wired.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "General Tech",
  },
  {
    name: "Ars Technica",
    rssUrl: "https://feeds.arstechnica.com/arstechnica/index",
    websiteUrl: "https://arstechnica.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "General Tech",
  },
  {
    name: "MIT Technology Review",
    rssUrl: "https://www.technologyreview.com/feed/",
    websiteUrl: "https://www.technologyreview.com",
    sourceType: "RESEARCH_WEBSITE",
    reputationScore: 9,
    category: "General Tech",
  },

  // ── 体育新闻（大平台）─────────────────────────────
  {
    name: "ESPN",
    rssUrl: "https://www.espn.com/espn/rss/news",
    websiteUrl: "https://www.espn.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "Sports News",
  },
  {
    name: "BBC Sport",
    rssUrl: "http://feeds.bbci.co.uk/sport/rss.xml",
    websiteUrl: "https://www.bbc.com/sport",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 8,
    category: "Sports News",
  },
  {
    name: "Sky Sports",
    rssUrl: "https://www.skysports.com/rss/12040",
    websiteUrl: "https://www.skysports.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 7,
    category: "Sports News",
  },
  {
    name: "Sporting News",
    rssUrl: "https://www.sportingnews.com/us/rss",
    websiteUrl: "https://www.sportingnews.com",
    sourceType: "NEWS_WEBSITE",
    reputationScore: 7,
    category: "Sports News",
  },
];

async function main() {
  console.log("🏟️  Seeding sports tech RSS sources...\n");

  let created = 0;
  let skipped = 0;

  for (const s of SOURCES) {
    const existing = await prisma.source.findFirst({
      where: { OR: [{ name: s.name }, { rssUrl: s.rssUrl }] },
    });

    if (existing) {
      // 如果已存在但 rssUrl 为空，补上
      if (!existing.rssUrl) {
        await prisma.source.update({
          where: { id: existing.id },
          data: { rssUrl: s.rssUrl, isActive: true },
        });
        console.log(`  ✏️  Updated (added RSS): ${s.name}`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${s.name}`);
        skipped++;
      }
      continue;
    }

    // 确保分类存在
    const categorySlug = s.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.category.upsert({
      where: { slug: categorySlug },
      create: { name: s.category, slug: categorySlug },
      update: {},
    });

    const hostname = new URL(s.websiteUrl || s.rssUrl).hostname;

    await prisma.source.create({
      data: {
        name: s.name,
        rssUrl: s.rssUrl,
        websiteUrl: s.websiteUrl,
        sourceType: s.sourceType as any,
        domain: hostname,
        reputationScore: s.reputationScore,
        isActive: true,
      },
    });

    created++;
    console.log(`  ✅  Created: ${s.name} (${s.category})`);
  }

  const total = await prisma.source.count();
  const active = await prisma.source.count({ where: { isActive: true } });

  console.log(`\n📊  结果:`);
  console.log(`    新增: ${created}`);
  console.log(`    跳过: ${skipped}`);
  console.log(`    总源数: ${total} (活跃: ${active})`);
  console.log(`\n👉  下一步: 打开 /admin/sources 确认，然后触发 RSS 采集`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌  失败:", e);
  process.exit(1);
});

import type { MetadataRoute } from "next";
import { getSitemapData } from "../src/lib/sitemap";
import { getSiteUrl } from "../src/lib/seo";
import { INTELLIGENCE_CATEGORIES } from "../src/lib/intelligence-feed";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const data = await getSitemapData();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${siteUrl}/latest`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/topics`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...INTELLIGENCE_CATEGORIES.map((topic) => ({
      url: `${siteUrl}/topics/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/research`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...data.articles.map((article) => ({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...data.categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: category.lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...data.tags.map((tag) => ({
      url: `${siteUrl}/tag/${tag.slug}`,
      lastModified: tag.lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...data.companies.map((company) => ({
      url: `${siteUrl}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...data.products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...data.research.map((research) => ({
      url: `${siteUrl}/research/${research.slug}`,
      lastModified: research.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

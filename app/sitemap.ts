import type { MetadataRoute } from "next";
import { getSitemapData } from "../src/lib/sitemap";
import { getSiteUrl } from "../src/lib/seo";

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
  ];
}

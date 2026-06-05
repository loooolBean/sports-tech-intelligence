import type { MetadataRoute } from "next";
import { getSiteUrl } from "../src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/article/", "/category/", "/tag/", "/newsletter"],
      disallow: ["/api/", "/admin/", "/dashboard/", "/search"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}

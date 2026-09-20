import type { MetadataRoute } from "next";
import { getSiteUrl } from "../src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/latest", "/topics/", "/article/", "/category/", "/tag/", "/companies/", "/products/", "/research/", "/pricing", "/newsletter", "/privacy"],
      disallow: ["/api/", "/admin/", "/dashboard/", "/watchlist/", "/saved/", "/alerts/", "/settings/", "/billing/", "/vendor/", "/search", "/compare"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}

import type { Metadata } from "next";
import type { ArticlePageData } from "./articles";
import type { CategoryData, CategoryPageData } from "./categories";

const siteName = "Sports Technology Intelligence";
const defaultDescription =
  "Sports technology news and intelligence for coaches, sports scientists, and wearable technology professionals.";
const PRODUCTION_URL = "https://sports-tech-intelligence.vercel.app";
const defaultOgImagePath = "/og/sports-technology.jpg";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  // Fall back to production URL if env var is unset, empty, or a Vercel preview URL
  if (!raw || raw.includes("-") && raw.endsWith(".vercel.app") && raw !== PRODUCTION_URL) {
    return PRODUCTION_URL;
  }
  return raw.replace(/\/$/, "");
}

export function getArticleCanonicalUrl(article: Pick<ArticlePageData, "slug">): string {
  return `${getSiteUrl()}/article/${article.slug}`;
}

export function getCategoryCanonicalUrl(category: Pick<CategoryData, "slug">, page = 1): string {
  const baseUrl = `${getSiteUrl()}/category/${category.slug}`;
  return page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
}

export function buildArticleMetadata(article: ArticlePageData): Metadata {
  const title = article.aiSummary?.seoTitle ?? article.title;
  const description = article.aiSummary?.seoDescription ?? article.excerpt ?? defaultDescription;
  const canonicalUrl = getArticleCanonicalUrl(article);
  const tags = article.articleTags.map(({ tag }) => tag.name);
  const image = `${getSiteUrl()}${defaultOgImagePath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      siteName,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
      section: article.category.name,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildArticleJsonLd(article: ArticlePageData) {
  const canonicalUrl = getArticleCanonicalUrl(article);
  const title = article.aiSummary?.seoTitle ?? article.title;
  const description = article.aiSummary?.seoDescription ?? article.excerpt ?? defaultDescription;
  const keywords = article.articleTags.map(({ tag }) => tag.name);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${canonicalUrl}#article`,
        headline: title,
        description,
        datePublished: article.publishedAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        author: article.author?.name
          ? {
              "@type": "Person",
              name: article.author.name,
              url: article.author.profileUrl ?? undefined,
            }
          : {
              "@type": "Organization",
              name: article.source.name,
              url: article.source.websiteUrl ?? undefined,
            },
        publisher: {
          "@type": "Organization",
          name: siteName,
          logo: {
            "@type": "ImageObject",
            url: `${getSiteUrl()}/logo.png`,
          },
        },
        articleSection: article.category.name,
        keywords,
        isBasedOn: article.originalUrl,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getSiteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: article.category.name,
            item: `${getSiteUrl()}/category/${article.category.slug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

export function buildCategoryMetadata(data: CategoryPageData): Metadata {
  const { category, currentPage } = data;
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : "";
  const title = `${category.name} News, Research & Sports Technology Insights${pageSuffix}`;
  const description =
    category.description ??
    `Latest ${category.name} news, research, and technology insights for coaches, sports scientists, and performance teams.`;
  const canonicalUrl = getCategoryCanonicalUrl(category, currentPage);
  const image = `${getSiteUrl()}${defaultOgImagePath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildCategoryJsonLd(data: CategoryPageData) {
  const canonicalUrl = getCategoryCanonicalUrl(data.category, data.currentPage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        name: data.category.name,
        description:
          data.category.description ??
          `Latest ${data.category.name} sports technology articles and research insights.`,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: siteName,
          url: getSiteUrl(),
        },
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#itemlist`,
        itemListElement: data.articles.map((article, index) => ({
          "@type": "ListItem",
          position: (data.currentPage - 1) * data.pageSize + index + 1,
          url: getArticleCanonicalUrl(article),
          name: article.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getSiteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: data.category.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

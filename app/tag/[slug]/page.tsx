import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedTagPage, getStaticTagSlugs } from "../../../src/lib/admin";
import { getSiteUrl } from "../../../src/lib/seo";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedTagPage(slug);

  if (!data) {
    return {
      title: "Tag Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${data.tag.name} Articles, News & Sports Technology Insights`;
  const description = `Latest ${data.tag.name} articles, research, and sports technology updates for coaches and performance teams.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${getSiteUrl()}/tag/${data.tag.slug}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${getSiteUrl()}/tag/${data.tag.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const data = await getPublishedTagPage(slug);

  if (!data) notFound();

  return (
    <main className="min-h-screen bg-bg">
      {/* Tag Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-12 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-text-secondary">{data.tag.name}</span>
            </div>
          </nav>

          <span className="overline text-accent">Tag</span>
          <h1 className="mt-2 text-h1 text-text-primary">{data.tag.name}</h1>
          <p className="mt-3 text-body-lg text-text-secondary">
            Latest articles and sports technology intelligence tagged with{" "}
            {data.tag.name}.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        {data.articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group card-surface overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-bg-elevated">
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg" />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-caption text-text-tertiary">
                    <span>{article.category.name}</span>
                    <span>·</span>
                    <span>{article.source.name}</span>
                  </div>
                  <h2 className="mt-2 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 text-body text-text-secondary line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-3 text-caption text-text-tertiary">
                    <time dateTime={article.publishedAt.toISOString()}>
                      {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-body-lg text-text-tertiary">
              No articles with this tag yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

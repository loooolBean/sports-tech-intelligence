import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getRelatedArticles,
  type ArticlePageData,
} from "../../../src/lib/articles";
import {
  buildArticleJsonLd,
  buildArticleMetadata,
} from "../../../src/lib/seo";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);
  const jsonLd = buildArticleJsonLd(article);

  return (
    <main className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-8 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href={`/category/${article.category.slug}`}
                className="hover:text-text-secondary transition-colors"
              >
                {article.category.name}
              </Link>
            </div>
          </nav>

          {/* Category & Meta */}
          <div className="mb-4">
            <Link
              href={`/category/${article.category.slug}`}
              className="overline text-accent hover:text-accent-hover transition-colors"
            >
              {article.category.name}
            </Link>
          </div>

          {/* Title */}
          <h1 className="max-w-3xl text-display text-text-primary max-lg:text-[2.5rem]">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">
              {article.excerpt}
            </p>
          )}

          {/* Author & Date */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-bg-elevated" />
              <div>
                <p className="text-caption font-medium text-text-primary">
                  {article.author?.name ?? article.source.name}
                </p>
                <p className="text-caption text-text-tertiary">
                  {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <article className="mx-auto max-w-content px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-prose">
          {/* AI Summary Box */}
          {article.aiSummary && (
            <aside className="mb-12 rounded-lg border border-accent/20 bg-accent/5 p-6">
              <h2 className="text-h3 text-accent">Key Takeaways</h2>
              <p className="mt-3 text-body text-text-secondary">
                {article.aiSummary.summary}
              </p>
              {getStringArray(article.aiSummary.keyTakeaways).length > 0 && (
                <ul className="mt-4 space-y-2">
                  {getStringArray(article.aiSummary.keyTakeaways).map((takeaway) => (
                    <li
                      key={takeaway}
                      className="flex items-start gap-2 text-body text-text-secondary"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}

          {/* Article Content */}
          <div className="prose-article">
            {article.body ? (
              article.body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>{article.excerpt}</p>
            )}
          </div>

          {/* Tags */}
          {article.articleTags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {article.articleTags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full bg-bg-elevated px-3 py-1 text-caption text-text-secondary transition-colors hover:bg-bg-elevated/80 hover:text-text-primary"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Source Link */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-caption text-text-tertiary">
              Originally published by{" "}
              <a
                href={article.originalUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {article.source.name}
              </a>
            </p>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-content px-4 py-16 lg:px-8">
            <h2 className="text-h2 text-text-primary">Related Articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/article/${related.slug}`}
                  className="group card-surface overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-bg-elevated">
                    {related.imageUrl ? (
                      <Image
                        src={related.imageUrl}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg" />
                    )}
                  </div>

                  <div className="p-5">
                    <span className="overline text-accent">
                      {related.category.name}
                    </span>
                    <h3 className="mt-2 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="mt-2 text-body text-text-secondary line-clamp-2">
                        {related.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-caption text-text-tertiary">
                      <time dateTime={related.publishedAt.toISOString()}>
                        {formatDistanceToNow(related.publishedAt, { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

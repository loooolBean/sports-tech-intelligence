import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getArticleBySlug, getRelatedArticles, isArticleFromUserWatchlist } from "@/src/lib/articles";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { isOfficialIntelligenceSource } from "@/src/lib/feed";
import { getIntelligenceCategory } from "@/src/lib/intelligence-feed";
import { buildArticleJsonLd, buildArticleMetadata } from "@/src/lib/seo";
import { StoryImage } from "@/src/components/intelligence/story-image";
import { getEditorialImageUrl } from "@/src/utils/images";

export const dynamic = "force-dynamic";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found", robots: { index: false, follow: false } };
  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [relatedArticles, user] = await Promise.all([
    getRelatedArticles(article),
    getCurrentUserProfile(),
  ]);
  const fromWatchlist = user ? await isArticleFromUserWatchlist(user.id, article) : false;
  const officialSource = isOfficialIntelligenceSource(article);
  const topic = getIntelligenceCategory(article.category.slug);
  const takeaways = getStringArray(article.aiSummary?.keyTakeaways).slice(0, 3);
  const summary = toStandfirst(article.aiSummary?.summary ?? article.excerpt ?? "A short summary has not been added yet.");
  const imageUrl = getEditorialImageUrl(article.imageUrl);

  return (
    <main className="min-h-screen bg-bg">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(article)) }} />

      <article>
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 lg:px-8">
            <nav aria-label="Breadcrumb" className="text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-primary">Today</Link>
              <span className="px-2">/</span>
              <Link href={topic ? `/topics/${topic.slug}` : `/category/${article.category.slug}`} className="hover:text-text-primary">{article.category.name}</Link>
            </nav>

            <p className="mt-7 text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-accent">{article.category.name}</p>
            <h1 className="mt-3 max-w-4xl font-display text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.025em] text-text-primary sm:text-[3.4rem] lg:text-[3.8rem]">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-[1.1rem] leading-7 text-text-secondary sm:text-[1.35rem] sm:leading-8">{summary}</p>
            <p className="mt-5 text-caption text-text-tertiary">
              <span className="text-text-secondary">{article.source.name}</span>
              {officialSource ? " · Official source" : ""}
              {" · "}
              <time dateTime={article.publishedAt.toISOString()}>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</time>
              {fromWatchlist ? " · From your watchlist" : ""}
            </p>

            {imageUrl && (
              <div className="relative mt-8 aspect-[16/8] overflow-hidden bg-bg-elevated">
                <StoryImage src={imageUrl} priority sizes="(max-width: 1024px) 100vw, 960px" />
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-prose px-4 py-9 sm:py-12">
          {article.aiSummary?.whyItMatters && (
            <section aria-labelledby="context-heading">
              <h2 id="context-heading" className="font-display text-2xl font-semibold text-text-primary">Context</h2>
              <p className="mt-4 text-body-lg leading-8 text-text-secondary">{article.aiSummary.whyItMatters}</p>
            </section>
          )}

          {takeaways.length > 0 && (
            <section className="mt-10 border-t border-border pt-8" aria-labelledby="know-heading">
              <h2 id="know-heading" className="font-display text-2xl font-semibold text-text-primary">What to know</h2>
              <ul className="mt-4 space-y-3">
                {takeaways.map((takeaway) => <li key={takeaway} className="flex gap-3 text-body-lg leading-8 text-text-secondary"><span aria-hidden="true">—</span><span>{takeaway}</span></li>)}
              </ul>
            </section>
          )}

          {article.body && (
            <details className="mt-10 border-y border-border py-4">
              <summary className="cursor-pointer text-sm font-medium text-text-primary">Extracted source text</summary>
              <div className="prose-article mt-7">
                {article.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
            </details>
          )}

          <p className="mt-9">
            <a href={article.originalUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-sm font-medium text-text-primary underline decoration-border underline-offset-4 hover:decoration-accent">
              Read the original report at {article.source.name} →
            </a>
          </p>

          {(article.companies.length > 0 || article.products.length > 0) && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="font-display text-2xl font-semibold text-text-primary">Related</h2>
              <ul className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
                {article.companies.map(({ company }) => (
                  <li key={company.id} className="py-3"><Link href={`/companies/${company.slug}`} className="font-medium text-text-primary hover:underline">{company.name}</Link><span className="ml-2 text-caption text-text-tertiary">Company</span></li>
                ))}
                {article.products.map(({ product }) => (
                  <li key={product.id} className="py-3"><Link href={`/products/${product.slug}`} className="font-medium text-text-primary hover:underline">{product.name}</Link><span className="ml-2 text-caption text-text-tertiary">{product.company.name}</span></li>
                ))}
              </ul>
            </section>
          )}

          {article.articleTags.length > 0 && (
            <section className="mt-9 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-text-primary">Filed under</h2>
              <p className="mt-2 text-caption leading-6 text-text-secondary">
                {article.articleTags.slice(0, 5).map(({ tag }, index) => (
                  <span key={tag.id}>{index > 0 && <span className="text-text-tertiary"> · </span>}<Link href={`/tag/${tag.slug}`} className="hover:text-accent hover:underline">{tag.name}</Link></span>
                ))}
              </p>
            </section>
          )}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-text-primary">More on {article.category.name}</h2>
            <div className="mt-5 grid border-t border-border md:grid-cols-2">
              {relatedArticles.slice(0, 4).map((related) => (
                <article key={related.id} className="border-b border-border py-4 md:pr-8">
                  <h3 className="font-display text-xl font-semibold leading-snug text-text-primary"><Link href={`/article/${related.slug}`} className="hover:underline">{related.title}</Link></h3>
                  <p className="mt-2 text-caption text-text-tertiary">{related.source.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toStandfirst(value: string): string {
  if (value.length <= 300) return value;
  return `${value.slice(0, 297).trimEnd()}…`;
}

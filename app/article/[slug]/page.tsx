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
          <div className="mobile-safe-x mx-auto max-w-5xl pb-7 pt-6 sm:py-10 lg:px-8">
            <nav aria-label="Breadcrumb" className="scrollbar-none flex overflow-x-auto whitespace-nowrap text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-primary">Today</Link>
              <span className="px-2">/</span>
              <Link href={topic ? `/topics/${topic.slug}` : `/category/${article.category.slug}`} className="hover:text-text-primary">{article.category.name}</Link>
            </nav>

            <p className="editorial-kicker mt-7">{article.category.name}</p>
            <h1 className="mt-3 max-w-4xl text-balance font-display text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.035em] text-text-primary sm:text-[3.4rem] lg:text-[3.8rem]">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-[1.08rem] leading-7 text-text-secondary sm:text-[1.35rem] sm:leading-8">{summary}</p>
            <p className="mt-5 text-caption text-text-tertiary">
              <span className="text-text-secondary">{article.source.name}</span>
              {officialSource ? " · Official source" : ""}
              {" · "}
              <time dateTime={article.publishedAt.toISOString()}>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</time>
              {fromWatchlist ? " · From your watchlist" : ""}
            </p>

            {imageUrl && (
              <div className="relative mt-7 aspect-[4/3] overflow-hidden border border-border bg-bg-elevated sm:mt-9 sm:aspect-[16/8]">
                <StoryImage src={imageUrl} priority sizes="(max-width: 1024px) 100vw, 960px" />
              </div>
            )}
          </div>
        </header>

        <div className="mobile-safe-x mx-auto max-w-prose py-8 sm:py-12">
          {article.aiSummary?.whyItMatters && (
            <section className="border-l-4 border-accent bg-bg-elevated px-5 py-6 sm:px-7" aria-labelledby="context-heading">
              <p className="editorial-kicker">Why it matters</p>
              <h2 id="context-heading" className="mt-2 font-display text-[1.7rem] font-semibold leading-tight text-text-primary">Context</h2>
              <p className="mt-3 text-[1.02rem] leading-7 text-text-secondary sm:text-body-lg sm:leading-8">{article.aiSummary.whyItMatters}</p>
            </section>
          )}

          {takeaways.length > 0 && (
            <section className="mt-9 border-t-2 border-text-primary pt-5" aria-labelledby="know-heading">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="know-heading" className="font-display text-[1.7rem] font-semibold text-text-primary">What to know</h2>
                <span className="text-[0.68rem] uppercase tracking-[0.1em] text-text-tertiary">The essentials</span>
              </div>
              <ul className="mt-3">
                {takeaways.map((takeaway, index) => <li key={takeaway} className="grid grid-cols-[2rem_1fr] gap-2 border-t border-border py-4 first:border-t-0"><span className="pt-1 text-[0.68rem] font-bold tracking-[0.08em] text-accent" aria-hidden="true">0{index + 1}</span><span className="text-[1rem] leading-7 text-text-secondary sm:text-body-lg sm:leading-8">{takeaway}</span></li>)}
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
            <a data-analytics-event="original_source_clicked" href={article.originalUrl} target="_blank" rel="nofollow noopener noreferrer" className="tap-target flex items-center justify-between gap-4 bg-text-primary px-5 py-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90">
              <span>Read the original report</span><span className="text-right">{article.source.name} ↗</span>
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
          <div className="mobile-safe-x mx-auto max-w-5xl py-10 lg:px-8">
            <p className="editorial-kicker">Keep reading</p>
            <h2 className="mt-2 font-display text-[1.8rem] font-semibold text-text-primary">More on {article.category.name}</h2>
            <div className="mt-5 grid border-t border-border md:grid-cols-2">
              {relatedArticles.slice(0, 4).map((related, index) => (
                <article key={related.id} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-border py-5 md:pr-8">
                  <span className="pt-1 text-[0.68rem] font-bold tracking-[0.08em] text-accent">0{index + 1}</span>
                  <div><h3 className="font-display text-xl font-semibold leading-snug text-text-primary"><Link href={`/article/${related.slug}`} className="hover:underline">{related.title}</Link></h3>
                  <p className="mt-2 text-caption text-text-tertiary">{related.source.name}</p>
                  </div>
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

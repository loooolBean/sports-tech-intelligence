import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getTopicsOverview } from "@/src/lib/feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sports Technology Topics",
  description: "Sports technology coverage across AI, performance, wearables, sports science, products and business.",
};

export default async function TopicsPage() {
  const topics = await getTopicsOverview();

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-9 lg:px-8">
          <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.025em] text-text-primary sm:text-5xl">Topics</h1>
          <p className="mt-3 max-w-2xl text-body text-text-secondary">Coverage organized by the main areas of sports technology.</p>
        </div>
      </header>

      <section className="mx-auto max-w-wide px-4 py-6 lg:px-8">
        {topics.map((topic) => (
          <article key={topic.slug} className="grid gap-6 border-b border-border py-8 first:pt-2 md:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-text-primary">
                <Link href={`/topics/${topic.slug}`} className="hover:underline">{topic.name}</Link>
              </h2>
              <p className="mt-3 max-w-md text-body leading-7 text-text-secondary">{topic.description}</p>
            </div>
            <div>
              <p className="text-overline uppercase tracking-[0.09em] text-text-tertiary">Latest</p>
              {topic.articles.length > 0 ? (
                <ol className="mt-2">
                  {topic.articles.slice(0, 2).map((article) => (
                    <li key={article.id} className="border-t border-border-subtle py-3 first:border-t-0">
                      <Link href={`/article/${article.slug}`} className="font-display text-lg font-semibold leading-snug text-text-primary hover:underline">{article.title}</Link>
                      <p className="mt-1 text-caption text-text-tertiary">{article.source.name} · {formatDistanceToNow(article.publishedAt, { addSuffix: true })}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-body text-text-tertiary">Coverage is being expanded.</p>
              )}
              <Link href={`/topics/${topic.slug}`} className="mt-3 inline-block text-caption font-medium text-text-primary underline decoration-border underline-offset-4 hover:decoration-accent">All {topic.name} stories →</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

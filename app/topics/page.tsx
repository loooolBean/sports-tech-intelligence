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
        <div className="mobile-safe-x mx-auto max-w-wide pb-7 pt-8 sm:py-10 lg:px-8">
          <p className="editorial-kicker">Explore the field</p>
          <h1 className="mt-3 font-display text-[3.25rem] font-semibold leading-[0.92] tracking-[-0.04em] text-text-primary sm:text-6xl">Topics</h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-text-secondary sm:text-body-lg">Follow the technologies, research and businesses changing modern sport.</p>
        </div>
      </header>

      <section className="mobile-safe-x mx-auto max-w-wide py-4 sm:py-6 lg:px-8">
        {topics.map((topic, index) => (
          <article key={topic.slug} className="grid gap-5 border-b border-border py-7 md:grid-cols-[2.5rem_minmax(15rem,0.8fr)_minmax(0,1.2fr)] md:gap-8 md:py-9">
            <span className="text-[0.68rem] font-bold tracking-[0.1em] text-accent">0{index + 1}</span>
            <div className="-mt-1 md:mt-0">
              <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-text-primary">
                <Link href={`/topics/${topic.slug}`} className="hover:underline">{topic.name}</Link>
              </h2>
              <p className="mt-3 max-w-md text-body leading-7 text-text-secondary">{topic.description}</p>
            </div>
            <div className="md:col-start-3">
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

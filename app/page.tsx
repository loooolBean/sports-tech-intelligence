import type { Metadata } from "next";
import Link from "next/link";
import { FeedStory, LeadStory, SecondaryStory } from "@/src/components/intelligence/feed-card";
import { getHomepageFeed, getTopicsOverview, type FeedArticle } from "@/src/lib/feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sports Tech Intelligence | Daily Sports Technology News & Insights",
  description: "Daily coverage of sports technology, performance, wearables, sports science and the companies shaping the industry.",
};

export default async function HomePage() {
  const now = new Date();
  const [{ top, latest, updatesToday }, topics] = await Promise.all([
    getHomepageFeed(),
    getTopicsOverview(),
  ]);
  const stories = uniqueArticles([...top, ...latest]);
  const lead = stories[0];
  const secondaryCount = stories.length >= 8 ? 4 : Math.min(2, Math.max(stories.length - 1, 0));
  const secondary = stories.slice(1, 1 + secondaryCount);
  const feed = stories.slice(1 + secondaryCount, 16 + secondaryCount);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-wide px-4 lg:px-8">
        <header className="border-b border-border py-8 sm:py-10">
          <p className="text-caption text-text-tertiary">{dateLabel}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.025em] text-text-primary sm:text-5xl">Today</h1>
              <p className="mt-3 text-body text-text-secondary">The latest developments shaping sports technology.</p>
            </div>
            <p className="pb-1 text-caption text-text-tertiary">{updatesToday} {updatesToday === 1 ? "update" : "updates"} in the last 24 hours</p>
          </div>
        </header>

        {lead ? (
          <>
            <section className="border-b border-border py-8 sm:py-10">
              <LeadStory article={lead} />
            </section>

            {secondary.length > 0 && (
              <section className="border-b border-border py-7">
                <h2 className="sr-only">More stories</h2>
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  {secondary.map((article) => <SecondaryStory key={article.id} article={article} />)}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="border-b border-border py-10 text-body text-text-secondary">
            New coverage will appear here as sources are reviewed.
          </section>
        )}

        <section className="grid gap-8 border-b border-border py-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <header>
            <h2 className="font-display text-3xl font-semibold text-text-primary">Latest</h2>
            <p className="mt-2 text-caption leading-5 text-text-tertiary">Recent reporting, launches and research.</p>
          </header>
          <div>
            {feed.length > 0 ? (
              feed.map((article) => <FeedStory key={article.id} article={article} />)
            ) : (
              <p className="text-body text-text-tertiary">No additional stories are available yet.</p>
            )}
            <Link href="/latest" className="mt-6 inline-block text-sm font-medium text-text-primary underline decoration-border underline-offset-4 hover:decoration-accent">
              View all latest →
            </Link>
          </div>
        </section>

        <section className="py-10">
          <h2 className="font-display text-3xl font-semibold text-text-primary">Topics</h2>
          <div className="mt-5 grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="group border-b border-border py-4 sm:pr-6 lg:mr-8">
                <h3 className="font-display text-xl font-semibold text-text-primary group-hover:underline">{topic.name}</h3>
                <p className="mt-1 line-clamp-2 text-caption leading-5 text-text-secondary">{topic.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function uniqueArticles(articles: FeedArticle[]): FeedArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

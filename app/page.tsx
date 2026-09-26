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
      <div className="mobile-safe-x mx-auto max-w-wide lg:px-8">
        <header className="border-b border-border pb-6 pt-7 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <p className="editorial-kicker">Daily briefing</p>
            <p className="text-[0.72rem] font-medium text-text-tertiary">{dateLabel}</p>
          </div>
          <div className="mt-5 grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h1 className="font-display text-[3.35rem] font-semibold leading-[0.9] tracking-[-0.04em] text-text-primary sm:text-6xl">Today</h1>
              <p className="mt-4 max-w-xl text-[1.02rem] leading-7 text-text-secondary sm:text-body-lg">The developments changing how athletes train, compete and recover.</p>
            </div>
            <p className="flex items-center gap-2 pb-1 text-caption text-text-tertiary before:block before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
              {updatesToday} {updatesToday === 1 ? "update" : "updates"} in 24 hours
            </p>
          </div>
        </header>

        {lead ? (
          <>
            <section className="border-b border-border py-6 sm:py-10">
              <LeadStory article={lead} />
            </section>

            {secondary.length > 0 && (
              <section className="border-b border-border py-7 sm:py-9">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="editorial-kicker">Also on our radar</h2>
                  <span className="text-[0.68rem] uppercase tracking-[0.1em] text-text-tertiary">Selected stories</span>
                </div>
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

        <section className="grid gap-7 border-b border-border py-9 sm:py-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <header>
            <p className="editorial-kicker">The news desk</p>
            <h2 className="mt-2 font-display text-[2.35rem] font-semibold leading-none text-text-primary">Latest</h2>
            <p className="mt-3 max-w-xs text-caption leading-5 text-text-tertiary">Reporting, launches and research worth your attention.</p>
          </header>
          <div>
            {feed.length > 0 ? (
              feed.map((article) => <FeedStory key={article.id} article={article} />)
            ) : (
              <p className="text-body text-text-tertiary">No additional stories are available yet.</p>
            )}
            <Link href="/latest" className="tap-target mt-4 inline-flex items-center border-b border-text-primary text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent">
              View the full news feed →
            </Link>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="editorial-kicker">Browse the field</p>
              <h2 className="mt-2 font-display text-[2.35rem] font-semibold leading-none text-text-primary">Topics</h2>
            </div>
            <Link href="/topics" className="tap-target inline-flex items-center text-caption font-semibold text-text-primary hover:text-accent">All topics →</Link>
          </div>
          <div className="mt-6 grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="group grid min-h-36 grid-cols-[2rem_1fr] gap-3 border-b border-border py-5 sm:pr-6 lg:mr-8">
                <span className="pt-1 text-[0.68rem] font-semibold tracking-[0.08em] text-accent">0{index + 1}</span>
                <div>
                <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-text-primary group-hover:underline">{topic.name}</h3>
                <p className="mt-1 line-clamp-2 text-caption leading-5 text-text-secondary">{topic.description}</p>
                </div>
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

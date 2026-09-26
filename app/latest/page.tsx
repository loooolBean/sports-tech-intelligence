import type { Metadata } from "next";
import Link from "next/link";
import { FeedStory } from "@/src/components/intelligence/feed-card";
import { getLatestIntelligence, type FeedArticle } from "@/src/lib/feed";
import {
  getIntelligenceCategory,
  INTELLIGENCE_CATEGORIES,
  parseIntelligencePeriod,
  type IntelligencePeriod,
} from "@/src/lib/intelligence-feed";
import { cn } from "@/src/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Sports Technology News",
  description: "The latest sports technology coverage across AI, performance, wearables, sports science, products and business.",
};

type LatestPageProps = {
  searchParams: Promise<{ category?: string; period?: string }>;
};

export default async function LatestPage({ searchParams }: LatestPageProps) {
  const params = await searchParams;
  const category = params.category ? getIntelligenceCategory(params.category) : null;
  const activeCategory = category?.slug === "other" ? undefined : category?.slug;
  const period = parseIntelligencePeriod(params.period);
  const articles = await getLatestIntelligence({ category: activeCategory, period, take: 30 });
  const groups = groupByDate(articles);

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mobile-safe-x mx-auto max-w-wide pb-7 pt-8 sm:py-10 lg:px-8">
          <p className="editorial-kicker">Live news desk</p>
          <h1 className="mt-3 font-display text-[3.25rem] font-semibold leading-[0.92] tracking-[-0.04em] text-text-primary sm:text-6xl">Latest</h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-text-secondary sm:text-body-lg">Sports technology reporting, launches and research in publication order.</p>
        </div>
      </header>

      <div className="sticky top-16 z-30 border-b border-border bg-bg/95 backdrop-blur-md lg:top-[68px]">
        <div className="mobile-safe-x mx-auto max-w-wide lg:px-8">
          <nav aria-label="Topic filters" className="scrollbar-none -mx-4 flex gap-x-5 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0">
            <FilterLink active={!activeCategory} href={buildLatestHref(undefined, period)} label="All" />
            {INTELLIGENCE_CATEGORIES.map((item) => (
              <FilterLink key={item.slug} active={activeCategory === item.slug} href={buildLatestHref(item.slug, period)} label={shortTopicName(item.name)} />
            ))}
          </nav>
          <nav aria-label="Time filters" className="scrollbar-none flex gap-5 overflow-x-auto border-t border-border-subtle py-1.5">
            {([
              ["today", "Today"],
              ["week", "This week"],
              ["all", "All dates"],
            ] as const).map(([value, label]) => (
              <FilterLink key={value} active={period === value} href={buildLatestHref(activeCategory, value)} label={label} small />
            ))}
          </nav>
        </div>
      </div>

      <section className="mobile-safe-x mx-auto max-w-4xl py-8 sm:py-10 lg:px-8">
        <p className="mb-7 text-caption font-medium text-text-tertiary">Showing {articles.length} {articles.length === 1 ? "story" : "stories"}</p>
        {groups.length > 0 ? groups.map(([label, items]) => (
          <section key={label} className="mb-10 last:mb-0">
            <h2 className="mb-4 border-b-2 border-text-primary pb-2 text-overline uppercase tracking-[0.12em] text-text-primary">{label}</h2>
            {items.map((article) => <FeedStory key={article.id} article={article} />)}
          </section>
        )) : (
          <p className="border-t border-border py-8 text-body text-text-tertiary">No stories match this topic and period yet.</p>
        )}
      </section>
    </main>
  );
}

function FilterLink({ active, href, label, small = false }: { active: boolean; href: string; label: string; small?: boolean }) {
  return (
    <Link href={href} className={cn(
      "tap-target shrink-0 border-b-2 px-0.5 font-semibold transition-colors",
      small ? "text-caption" : "text-sm",
      active ? "border-accent text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary",
    )}>{label}</Link>
  );
}

function buildLatestHref(category: string | undefined, period: IntelligencePeriod): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (period !== "all") params.set("period", period);
  const query = params.toString();
  return query ? `/latest?${query}` : "/latest";
}

function shortTopicName(name: string): string {
  return name
    .replace("Performance Technology", "Performance")
    .replace("Wearables & Sensors", "Wearables")
    .replace("Products & Launches", "Products")
    .replace("Business & Investment", "Business");
}

function groupByDate(articles: FeedArticle[]): Array<[string, FeedArticle[]]> {
  const now = new Date();
  const today = dayKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);
  const groups = new Map<string, FeedArticle[]>();

  for (const article of articles) {
    const key = dayKey(article.publishedAt);
    const label = key === today
      ? "Today"
      : key === yesterday
        ? "Yesterday"
        : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(article.publishedAt);
    groups.set(label, [...(groups.get(label) ?? []), article]);
  }

  return [...groups.entries()];
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

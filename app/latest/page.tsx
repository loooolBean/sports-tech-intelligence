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
        <div className="mx-auto max-w-wide px-4 py-9 lg:px-8">
          <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.025em] text-text-primary sm:text-5xl">Latest</h1>
          <p className="mt-3 max-w-2xl text-body text-text-secondary">Sports technology reporting in publication order.</p>
        </div>
      </header>

      <div className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 lg:px-8">
          <nav aria-label="Topic filters" className="flex gap-x-5 overflow-x-auto py-4">
            <FilterLink active={!activeCategory} href={buildLatestHref(undefined, period)} label="All" />
            {INTELLIGENCE_CATEGORIES.map((item) => (
              <FilterLink key={item.slug} active={activeCategory === item.slug} href={buildLatestHref(item.slug, period)} label={shortTopicName(item.name)} />
            ))}
          </nav>
          <nav aria-label="Time filters" className="flex gap-5 border-t border-border-subtle py-3">
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

      <section className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <p className="mb-7 text-caption text-text-tertiary">{articles.length} {articles.length === 1 ? "story" : "stories"}</p>
        {groups.length > 0 ? groups.map(([label, items]) => (
          <section key={label} className="mb-10 last:mb-0">
            <h2 className="mb-4 border-b border-text-primary pb-2 text-overline uppercase tracking-[0.1em] text-text-primary">{label}</h2>
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
      "shrink-0 border-b py-1 font-medium transition-colors",
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

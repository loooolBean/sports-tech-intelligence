import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedStory } from "@/src/components/intelligence/feed-card";
import { getTopicIntelligence } from "@/src/lib/feed";
import { getIntelligenceCategory } from "@/src/lib/intelligence-feed";
import { getSiteUrl } from "@/src/lib/seo";

export const dynamic = "force-dynamic";

type TopicPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getIntelligenceCategory(slug);
  if (!topic || topic.slug === "other") return { title: "Topic Not Found", robots: { index: false, follow: false } };
  return {
    title: `${topic.name} | Sports Tech Intelligence`,
    description: topic.description,
    alternates: { canonical: `${getSiteUrl()}/topics/${topic.slug}` },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const data = await getTopicIntelligence(slug);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-9 lg:px-8">
          <nav className="text-caption text-text-tertiary" aria-label="Breadcrumb">
            <Link href="/topics" className="hover:text-text-primary">Topics</Link>
            <span className="px-2">/</span>
            <span>{data.topic.name}</span>
          </nav>
          <h1 className="mt-5 max-w-4xl font-display text-[2.6rem] font-semibold leading-none tracking-[-0.025em] text-text-primary sm:text-5xl">{data.topic.name}</h1>
          <p className="mt-4 max-w-2xl text-body-lg leading-7 text-text-secondary">{data.topic.description}</p>
        </div>
      </header>

      <section className="mx-auto grid max-w-wide gap-10 px-4 py-9 lg:grid-cols-[minmax(0,1fr)_14rem] lg:px-8">
        <div className="max-w-4xl">
          <h2 className="mb-5 border-b border-text-primary pb-2 font-display text-2xl font-semibold text-text-primary">Latest</h2>
          {data.articles.length > 0
            ? data.articles.map((article) => <FeedStory key={article.id} article={article} />)
            : <p className="border-t border-border py-8 text-body text-text-tertiary">Coverage for this topic is being expanded.</p>}
        </div>

        <aside className="border-t border-border pt-4 lg:border-t-0 lg:pt-0">
          <h2 className="text-sm font-semibold text-text-primary">Related terms</h2>
          {data.relatedTags.length > 0 ? (
            <p className="mt-3 text-caption leading-6 text-text-secondary">
              {data.relatedTags.map((tag, index) => (
                <span key={tag.slug}>
                  {index > 0 && <span className="text-text-tertiary"> · </span>}
                  <Link href={`/tag/${tag.slug}`} className="hover:text-accent hover:underline">{tag.name}</Link>
                </span>
              ))}
            </p>
          ) : (
            <p className="mt-3 text-caption text-text-tertiary">Terms will appear as coverage is indexed.</p>
          )}
        </aside>
      </section>
    </main>
  );
}

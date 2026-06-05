import Link from "next/link";
import Image from "next/image";
import { getSearchResults } from "../../src/lib/admin";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Search Sports Technology Intelligence",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = await getSearchResults(q);

  return (
    <main className="min-h-screen bg-bg">
      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-12 lg:px-8">
          <h1 className="text-h1 text-text-primary">Search</h1>
          <p className="mt-3 text-body-lg text-text-secondary">
            Find articles on wearables, athlete monitoring, performance analytics, and more.
          </p>

          {/* Search Form */}
          <form className="mt-8" method="get">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="q"
                  placeholder="Search HRV, GPS tracking, force plates..."
                  defaultValue={q}
                  className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-text-primary px-6 py-3 text-caption font-medium text-bg transition-colors hover:bg-text-secondary"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        {q && (
          <p className="mb-6 text-caption text-text-tertiary">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group card-surface overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-bg-elevated">
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg" />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-caption text-text-tertiary">
                    <span>{article.category.name}</span>
                    <span>·</span>
                    <span>{article.source.name}</span>
                  </div>
                  <h2 className="mt-2 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 text-body text-text-secondary line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-3 text-caption text-text-tertiary">
                    <time dateTime={article.publishedAt.toISOString()}>
                      {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : q ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-body-lg text-text-tertiary">
              No articles found. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-body-lg text-text-tertiary">
              Enter a search term to find articles.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

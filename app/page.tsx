import Link from "next/link";
import Image from "next/image";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, ...articles] = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      duplicateOfId: null,
    },
    include: {
      category: true,
      source: true,
      aiSummary: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 9,
  });

  const remaining = articles.slice(0, 8);

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="mx-auto max-w-content px-4 pt-8 lg:px-8">
        {featured && (
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Featured Article */}
            <Link
              href={`/article/${featured.slug}`}
              className="group lg:col-span-7"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-bg-elevated">
                {featured.imageUrl ? (
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <span className="overline text-accent-light">
                    {featured.category.name}
                  </span>
                  <h1 className="mt-2 text-display text-white max-lg:text-[2rem]">
                    {featured.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-body-lg text-white/80 line-clamp-2">
                    {featured.excerpt ?? featured.aiSummary?.summary?.slice(0, 160)}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-caption text-white/60">
                    <span>{featured.source.name}</span>
                    <span>·</span>
                    <time dateTime={featured.publishedAt.toISOString()}>
                      {formatDistanceToNow(featured.publishedAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>

            {/* Sidebar Articles */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              {remaining.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex gap-4 rounded-lg border border-border p-4 transition-colors hover:border-text-tertiary"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                    {article.imageUrl && (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="overline text-accent">
                      {article.category.name}
                    </span>
                    <h3 className="mt-1.5 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-caption text-text-tertiary">
                      <span>{article.source.name}</span>
                      <span>·</span>
                      <time dateTime={article.publishedAt.toISOString()}>
                        {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Latest Articles Grid */}
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-text-primary">Latest</h2>
          <Link
            href="/search"
            className="text-caption font-medium text-accent transition-colors hover:text-accent-hover"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {remaining.slice(3).map((article) => (
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg" />
                )}
              </div>

              <div className="p-4">
                <span className="overline text-accent">
                  {article.category.name}
                </span>
                <h3 className="mt-2 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-body text-text-secondary line-clamp-2">
                  {article.excerpt ?? article.aiSummary?.summary?.slice(0, 120)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-caption text-text-tertiary">
                  <span>{article.source.name}</span>
                  <span>·</span>
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {remaining.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-body-lg text-text-tertiary">
              No articles yet. Check back soon.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-content px-4 py-16 text-center lg:px-8">
          <h2 className="text-h2 text-text-primary">
            Stay ahead of the game
          </h2>
          <p className="mt-3 text-body-lg text-text-secondary">
            Get the latest sports technology insights delivered to your inbox.
          </p>
          <Link
            href="/newsletter"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-caption font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Subscribe to Newsletter
          </Link>
        </div>
      </section>
    </main>
  );
}

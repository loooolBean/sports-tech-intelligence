import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCategoryPage,
  getStaticCategorySlugs,
  type CategoryArticleData,
} from "../../../src/lib/categories";
import { buildCategoryJsonLd, buildCategoryMetadata } from "../../../src/lib/seo";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const data = await getCategoryPage(slug, parsePage(pageParam));

  if (!data) {
    return {
      title: "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildCategoryMetadata(data);
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const data = await getCategoryPage(slug, parsePage(pageParam));

  if (!data || data.currentPage > data.totalPages) {
    notFound();
  }

  const jsonLd = buildCategoryJsonLd(data);

  return (
    <main className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Category Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-12 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-text-secondary">{data.category.name}</span>
            </div>
          </nav>

          <span className="overline text-accent">Category</span>
          <h1 className="mt-2 text-h1 text-text-primary">
            {data.category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg text-text-secondary">
            {data.category.description ??
              `Latest ${data.category.name} news, research, and sports technology intelligence for coaches, sports scientists, and performance teams.`}
          </p>
          <p className="mt-4 text-caption text-text-tertiary">
            {data.totalArticles} published articles
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        {data.articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-body-lg text-text-tertiary">
              No published articles in this category yet.
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          categorySlug={data.category.slug}
        />
      </section>
    </main>
  );
}

function ArticleCard({ article }: { article: CategoryArticleData }) {
  return (
    <Link
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
          <span>{article.source.name}</span>
          <span>·</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
          </time>
        </div>
        <h3 className="mt-2 text-h3 text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 text-body text-text-secondary line-clamp-2">
            {article.excerpt}
          </p>
        )}
        {article.articleTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.articleTags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-bg-elevated px-2 py-0.5 text-caption text-text-tertiary"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  categorySlug,
}: {
  currentPage: number;
  totalPages: number;
  categorySlug: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
      {currentPage > 1 ? (
        <Link
          href={getCategoryPageHref(categorySlug, currentPage - 1)}
          className="rounded-md border border-border px-4 py-2 text-caption font-medium text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}

      <div className="flex gap-2">
        {getVisiblePages(currentPage, totalPages).map((page) => (
          <Link
            key={page}
            href={getCategoryPageHref(categorySlug, page)}
            className={
              page === currentPage
                ? "rounded-md bg-text-primary px-3 py-2 text-caption font-medium text-bg"
                : "rounded-md border border-border px-3 py-2 text-caption font-medium text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
            }
          >
            {page}
          </Link>
        ))}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={getCategoryPageHref(categorySlug, currentPage + 1)}
          className="rounded-md border border-border px-4 py-2 text-caption font-medium text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function getCategoryPageHref(categorySlug: string, page: number): string {
  return page === 1 ? `/category/${categorySlug}` : `/category/${categorySlug}?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function parsePage(page?: string): number {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

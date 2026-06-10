import Link from "next/link";
import { prisma } from "../../src/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories — Sports Technology Intelligence",
  description:
    "Browse sports technology articles by category: wearables, analytics, sports science, and more.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: { status: ArticleStatus.PUBLISHED, duplicateOfId: null },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        <h1 className="text-h1 text-text-primary">Categories</h1>
        <p className="mt-3 text-body-lg text-text-secondary">
          Explore sports technology intelligence by topic.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="card-surface group p-6 transition-all hover:border-accent"
            >
              <h2 className="text-h3 text-text-primary group-hover:text-accent transition-colors">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 text-body text-text-secondary line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="mt-4 text-caption text-text-tertiary">
                {category._count.articles} {category._count.articles === 1 ? "article" : "articles"}
              </p>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="mt-12 text-center text-body text-text-tertiary">
            No categories yet. Check back soon.
          </p>
        )}
      </section>
    </main>
  );
}

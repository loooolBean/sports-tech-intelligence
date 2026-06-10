import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { getAdminArticles, updateArticleStatus } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

type AdminArticlesPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const { status: statusParam } = await searchParams;
  const status = Object.values(ArticleStatus).includes(statusParam as ArticleStatus)
    ? (statusParam as ArticleStatus)
    : undefined;
  const articles = await getAdminArticles(status);

  return (
    <div>
      <h1 className="text-h1 text-text-primary">Articles</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink href="/admin/articles" label="All" />
        {Object.values(ArticleStatus).map((item) => (
          <FilterLink key={item} href={`/admin/articles?status=${item}`} label={item} />
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        {articles.map((article) => (
          <div key={article.id} className="border-b border-border p-5 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="overline text-accent">
                  {article.status} · {article.category.name} · {article.source.name}
                </p>
                <h2 className="mt-2 text-h3 text-text-primary">{article.title}</h2>
                <p className="mt-2 max-w-3xl text-body text-text-secondary">
                  {article.aiSummary?.seoDescription ?? article.excerpt ?? "No description yet."}
                </p>
                <div className="mt-3 flex gap-3">
                  <Link className="text-caption font-medium text-accent" href={`/admin/articles/${article.id}`}>
                    Edit
                  </Link>
                  <Link className="text-caption font-medium text-accent" href={`/article/${article.slug}`}>
                    View public page
                  </Link>
                </div>
              </div>
              <form action={updateArticleStatus} className="flex gap-2">
                <input name="articleId" type="hidden" value={article.id} />
                <select className="rounded-md border border-border px-3 py-2 text-sm" name="status" defaultValue={article.status}>
                  {Object.values(ArticleStatus).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button className="rounded-md bg-accent hover:bg-accent-hover px-3 py-2 text-caption font-medium text-white" type="submit">
                  Save
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="rounded-md border border-border px-3 py-2 text-body text-text-secondary hover:bg-bg-elevated" href={href}>
      {label}
    </Link>
  );
}

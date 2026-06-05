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
      <h1 className="text-3xl font-bold text-slate-950">Articles</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <FilterLink href="/admin/articles" label="All" />
        {Object.values(ArticleStatus).map((item) => (
          <FilterLink key={item} href={`/admin/articles?status=${item}`} label={item} />
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        {articles.map((article) => (
          <div key={article.id} className="border-b border-slate-200 p-5 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  {article.status} · {article.category.name} · {article.source.name}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">{article.title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  {article.aiSummary?.seoDescription ?? article.excerpt ?? "No description yet."}
                </p>
                <div className="mt-3 flex gap-3">
                  <Link className="text-sm font-medium text-sky-700" href={`/admin/articles/${article.id}`}>
                    Edit
                  </Link>
                  <Link className="text-sm font-medium text-sky-700" href={`/article/${article.slug}`}>
                    View public page
                  </Link>
                </div>
              </div>
              <form action={updateArticleStatus} className="flex gap-2">
                <input name="articleId" type="hidden" value={article.id} />
                <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" name="status" defaultValue={article.status}>
                  {Object.values(ArticleStatus).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white" type="submit">
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
    <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" href={href}>
      {label}
    </Link>
  );
}

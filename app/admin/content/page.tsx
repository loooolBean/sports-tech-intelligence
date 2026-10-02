import Link from "next/link";
import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { assertAdmin } from "@/src/lib/command-center";
import { getArticleViews } from "@/src/lib/posthog-reporting";
import { PageHeader, Panel, Unavailable, formatAdminDate, tableClass } from "@/src/components/admin/ui";
import { ArticleActions } from "@/src/components/admin/article-actions";

export const dynamic = "force-dynamic";
export default async function ContentPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string; pending?: string }> }) {
  await assertAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 200);
  const page = Math.min(10000, Math.max(1, Math.floor(Number(params.page) || 1)));
  const status = Object.values(ArticleStatus).includes(params.status as ArticleStatus) ? params.status as ArticleStatus : undefined;
  const where: Prisma.ArticleWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status } : params.status === "hidden" ? { isHiddenFromFeed: true } : {}),
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.pending === "1" ? { status: "DRAFT", duplicateOfId: null, aiSummary: { is: null } } : {}),
  };
  const result = await Promise.all([
    prisma.article.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 25, skip: (page - 1) * 25, select: { id: true, title: true, slug: true, status: true, publishedAt: true, isFeatured: true, isHiddenFromFeed: true, category: { select: { name: true } }, source: { select: { name: true } } } }),
    prisma.article.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]).catch(() => null);
  const views = result ? await getArticleViews(result[0].map(a => a.slug)) : null;
  const pageUrl = (next: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ q, status: params.status, category: params.category, pending: params.pending, page: String(next) })) if (value) query.set(key, value);
    return "/admin/content?" + query;
  };
  return <div className="space-y-6">
    <PageHeader title="Content" description="查找文章、检查状态，直接精选或隐藏。编辑页可修改分类、摘要和发布状态。" />
    <nav aria-label="Content tools" className="flex flex-wrap gap-3 text-sm text-accent">{[["research", "Research"], ["evidence", "Evidence"], ["categories", "Categories"], ["tags", "Tags"], ["failures", "Processing failures"]].map(([path, label]) => <Link key={path} href={`/admin/${path}`} className="inline-flex min-h-11 items-center rounded border border-border px-3">{label}</Link>)}</nav>
    {!result ? <Unavailable service="Database" status="Unavailable" /> : <Panel title="Article table" description={`${result[1]} matching articles · 25 per page · Published 为原文日期，Views 为过去 7 个自然日`}>
      <form className="mb-5 flex flex-wrap gap-3" action="/admin/content">
        <input aria-label="Search article titles" name="q" defaultValue={q} placeholder="Search titles…" className="min-h-11 min-w-0 flex-1 rounded border border-border bg-bg px-3 text-sm" />
        <select aria-label="Article status" name="status" defaultValue={params.status ?? ""} className="min-h-11 rounded border border-border bg-bg px-3 text-sm"><option value="">All statuses</option>{Object.values(ArticleStatus).map(s => <option key={s}>{s}</option>)}<option value="hidden">Hidden</option></select>
        <select aria-label="Category" name="category" defaultValue={params.category ?? ""} className="min-h-11 max-w-full rounded border border-border bg-bg px-3 text-sm"><option value="">All categories</option>{result[2].map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        {params.pending === "1" && <input type="hidden" name="pending" value="1" />}
        <button className="min-h-11 rounded bg-accent px-4 text-sm font-medium text-white">Apply</button><Link href="/admin/content" className="inline-flex min-h-11 items-center text-sm text-text-secondary">Clear</Link>
      </form>
      <div className="overflow-x-auto"><table className={tableClass}><thead><tr><th>Title</th><th>Category</th><th>Source</th><th>Published</th><th>Views · 7d</th><th>Status</th><th>Actions</th></tr></thead><tbody>{result[0].map(a => <tr key={a.id}><td className="min-w-64 max-w-sm"><Link className="font-medium hover:underline" href={`/admin/articles/${a.id}`}>{a.title}</Link></td><td>{a.category.name}</td><td>{a.source.name}</td><td className="whitespace-nowrap">{formatAdminDate(a.publishedAt)}</td><td>{views?.data ? views.data[a.slug] : views?.status}</td><td>{a.status}{a.isHiddenFromFeed && <span className="block text-xs text-text-tertiary">Hidden</span>}{a.isFeatured && <span className="block text-xs text-accent">Featured</span>}</td><td className="min-w-56"><ArticleActions id={a.id} featured={a.isFeatured} hidden={a.isHiddenFromFeed} /></td></tr>)}</tbody></table></div>
      {!result[0].length && <p className="py-8 text-sm text-text-secondary">No matching articles.</p>}
      <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-sm">{page > 1 ? <Link href={pageUrl(page - 1)} className="min-h-11 py-3 text-accent">← Previous</Link> : <span />}<span>Page {page} / {Math.max(1, Math.ceil(result[1] / 25))}</span>{page * 25 < result[1] ? <Link href={pageUrl(page + 1)} className="min-h-11 py-3 text-accent">Next →</Link> : <span />}</nav>
    </Panel>}
  </div>;
}

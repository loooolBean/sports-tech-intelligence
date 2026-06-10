import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminArticle,
  saveArticleEditorialFields,
  updateArticleStatus,
} from "../../../../src/lib/admin";
import { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type AdminArticleEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminArticleEditPage({ params }: AdminArticleEditPageProps) {
  const { id } = await params;
  const article = await getAdminArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Link className="text-sm font-medium text-accent" href="/admin/articles">
        Back to articles
      </Link>
      <h1 className="mt-4 text-h1 text-text-primary">Edit Article</h1>

      <form action={saveArticleEditorialFields} className="mt-6 grid gap-4 rounded-lg border border-border p-5">
        <input name="articleId" type="hidden" value={article.id} />
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Title
          <input className="rounded-md border border-border px-3 py-2" name="title" defaultValue={article.title} required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Excerpt
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2" name="excerpt" defaultValue={article.excerpt ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          SEO Title
          <input className="rounded-md border border-border px-3 py-2" name="seoTitle" defaultValue={article.aiSummary?.seoTitle ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Meta Description
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2" name="seoDescription" defaultValue={article.aiSummary?.seoDescription ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-text-secondary">
          Body
          <textarea className="min-h-80 rounded-md border border-border px-3 py-2" name="body" defaultValue={article.body ?? ""} />
        </label>
        <button className="w-fit rounded-md bg-accent hover:bg-accent-hover px-4 py-2 text-sm font-medium text-white" type="submit">
          Save Editorial Fields
        </button>
      </form>

      <form action={updateArticleStatus} className="mt-5 flex gap-3 rounded-lg border border-border p-5">
        <input name="articleId" type="hidden" value={article.id} />
        <select className="rounded-md border border-border px-3 py-2 text-sm" name="status" defaultValue={article.status}>
          {Object.values(ArticleStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary" type="submit">
          Update Status
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { SaveButton } from "./save-button";

export async function SavedList({ userId }: { userId: string }) {
  const items = await prisma.savedArticle.findMany({ where: { userId, article: { status: "PUBLISHED", isHiddenFromFeed: false } }, orderBy: { createdAt: "desc" }, take: 30, include: { article: { select: { id: true, slug: true, title: true } } } });
  return <section className="mt-12"><h2 className="text-h2">Saved for later</h2>{items.length ? <div className="mt-4 divide-y divide-border">{items.map(({ article }) => <div key={article.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><Link href={`/article/${article.slug}`} className="max-w-xl font-display text-xl hover:underline">{article.title}</Link><SaveButton articleId={article.id} saved /></div>)}</div> : <p className="mt-3 text-text-secondary">Save an article while reading to find it here later.</p>}</section>;
}

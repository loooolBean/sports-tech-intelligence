"use client";
import Link from "next/link";
import { useActionState } from "react";
import { quickEditArticle } from "@/src/actions/editorial";

export function ArticleActions({ id, featured, hidden }: { id: string; featured: boolean; hidden: boolean }) {
  const [state, action, pending] = useActionState(quickEditArticle, { message: "" });
  return <div><div className="flex flex-wrap items-center gap-2"><Link href={`/admin/articles/${id}`} className="inline-flex min-h-10 items-center px-2 text-xs font-semibold text-accent">Edit</Link>{([['feature', featured, featured ? 'Unfeature' : 'Feature'], ['hide', hidden, hidden ? 'Unhide' : 'Hide']] as const).map(([field, enabled, label]) => <form key={field} action={action}><input type="hidden" name="articleId" value={id} /><input type="hidden" name="field" value={field} /><input type="hidden" name="enabled" value={String(!enabled)} /><button disabled={pending} className="min-h-10 rounded border border-border px-3 text-xs font-medium disabled:opacity-50">{label}</button></form>)}</div><p role="status" className="mt-1 text-xs text-text-tertiary">{pending ? "Saving…" : state.message}</p></div>;
}

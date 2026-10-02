"use client";
import { useActionState } from "react";
import { setArticleSaved } from "@/src/actions/saved-articles";

export function SaveButton({ articleId, saved }: { articleId: string; saved: boolean }) {
  const [state, action, pending] = useActionState(setArticleSaved, { message: "" });
  return <form action={action}><input type="hidden" name="articleId" value={articleId} /><input type="hidden" name="saved" value={String(saved)} /><button disabled={pending} aria-pressed={saved} className="tap-target mt-4 border border-border px-4 text-caption font-semibold text-text-primary disabled:opacity-50">{pending ? "Updating…" : saved ? "Saved · Remove" : "Save for later"}</button><p role="status" className="mt-2 text-xs text-text-secondary">{state.message}</p></form>;
}

"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const staleAction = error.name === "UnrecognizedActionError" || error.message.includes("was not found on the server");

  useEffect(() => {
    if (!staleAction) return;
    const key = `stale-action-reload:${error.digest ?? error.message}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }, [error.digest, error.message, staleAction]);

  return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 lg:px-8"><div className="border-y border-border py-10"><h1 className="font-display text-h2 text-text-primary">This page is temporarily unavailable</h1><p className="mt-3 text-body text-text-secondary">{staleAction ? "The site was updated while this tab was open. Refresh once to load the current version." : "The request did not complete. Please try again in a moment."}</p><button type="button" onClick={staleAction ? () => window.location.reload() : reset} className="mt-6 border border-text-primary px-4 py-2 text-caption font-semibold text-text-primary hover:bg-text-primary hover:text-bg">{staleAction ? "Refresh page" : "Try again"}</button></div></main>;
}

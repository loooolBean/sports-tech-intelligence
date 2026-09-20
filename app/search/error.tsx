"use client";

export default function SearchError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto min-h-[60vh] max-w-content px-4 py-20 lg:px-8"><div className="rounded-lg border border-border bg-bg-card p-8 text-center"><h1 className="text-h2 text-text-primary">Search is temporarily unavailable</h1><p className="mt-3 text-body text-text-secondary">The intelligence database could not be reached. Your query is still in the URL, so it is safe to retry.</p><button type="button" onClick={reset} className="mt-6 rounded-lg bg-text-primary px-5 py-2.5 text-caption font-semibold text-bg">Try again</button></div></main>;
}

export default function AdminLoading() {
  return <div role="status" aria-live="polite" className="space-y-5"><p className="text-sm text-text-secondary">Loading your workspace…</p><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(n => <div key={n} className="h-28 animate-pulse rounded-lg bg-bg-elevated" />)}</div><div className="h-60 animate-pulse rounded-lg bg-bg-elevated" /></div>;
}

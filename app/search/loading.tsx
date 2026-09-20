export default function SearchLoading() {
  return <main className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading search results">
    <section className="border-b border-border"><div className="mx-auto max-w-content px-4 py-12 lg:px-8"><div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" /><div className="mt-4 h-10 w-full max-w-xl animate-pulse rounded bg-bg-elevated" /><div className="mt-7 h-12 w-full max-w-3xl animate-pulse rounded-lg bg-bg-elevated" /></div></section>
    <section className="mx-auto max-w-content px-4 py-10 lg:px-8"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-lg border border-border bg-bg-card"><div className="m-5 h-4 w-20 rounded bg-bg-elevated" /><div className="mx-5 mt-5 h-6 w-2/3 rounded bg-bg-elevated" /><div className="mx-5 mt-4 h-14 rounded bg-bg-elevated" /></div>)}</div></section>
  </main>;
}

import { Search } from "lucide-react";

export function SearchForm({ query = "", compact = false }: { query?: string; compact?: boolean }) {
  return <form method="get" action="/search" className={compact ? "w-full" : "w-full max-w-3xl"}>
    <label className="sr-only" htmlFor="intelligence-search">Search sports technology</label>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" /><input id="intelligence-search" name="q" defaultValue={query} placeholder="Search companies, products or technologies..." className="w-full rounded-lg border border-border bg-bg-card py-3.5 pl-12 pr-4 text-body text-text-primary shadow-sm placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" /></div><button type="submit" className="rounded-lg bg-text-primary px-6 py-3.5 text-caption font-semibold text-bg hover:bg-text-secondary">Search</button></div>
  </form>;
}

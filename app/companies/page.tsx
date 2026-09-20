import { CompanyCard } from "@/src/components/intelligence/cards";
import { SearchForm } from "@/src/components/intelligence/search-form";
import { getCompaniesDirectory, searchIntelligence } from "@/src/lib/intelligence";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sports Technology Companies | Sports Tech Intelligence", description: "Explore sports technology companies across performance, training and sports science." };
type Props = { searchParams: Promise<{ q?: string }> };

export default async function CompaniesPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const companies = q
    ? (await searchIntelligence({ query: q, type: "companies" })).companies
    : await getCompaniesDirectory();
  return <main className="min-h-screen bg-bg"><section className="border-b border-border"><div className="mx-auto max-w-content px-4 py-12 lg:px-8"><p className="overline">Discovery</p><h1 className="mt-2 text-h1 text-text-primary">Sports technology companies</h1><p className="mt-3 max-w-2xl text-body-lg text-text-secondary">Discover the companies shaping athlete performance, training and sports science.</p><div className="mt-7"><SearchForm query={q} /></div></div></section><section className="mx-auto max-w-content px-4 py-10 lg:px-8">{q && <p className="mb-5 text-caption text-text-tertiary">Company matches for &ldquo;{q}&rdquo;</p>}{companies.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{companies.map((company) => <CompanyCard key={company.id} company={company} />)}</div> : <div className="rounded-lg border border-dashed border-border p-8 text-body text-text-secondary">No companies match this search yet. Try a broader technology or return soon as profiles are added.</div>}</section></main>;
}

import { ProductCard } from "@/src/components/intelligence/cards";
import { SearchForm } from "@/src/components/intelligence/search-form";
import { getProductsDirectory, searchIntelligence } from "@/src/lib/intelligence";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sports Technology Products | Sports Tech Intelligence",
  description: "Explore sports technology products across performance, training and sports science.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = q
    ? (await searchIntelligence({ query: q, type: "products" })).products
    : await getProductsDirectory();

  return (
    <main className="min-h-screen bg-bg">
      <section className="border-b border-border">
        <div className="mobile-safe-x mx-auto max-w-content pb-8 pt-8 sm:py-12 lg:px-8">
          <p className="editorial-kicker">Technology directory</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.035em] text-text-primary sm:text-6xl">Sports technology products</h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-text-secondary sm:text-body-lg">Compare the tools teams, practitioners and researchers use to understand performance.</p>
          <div className="mt-7"><SearchForm query={q} action="/products" /></div>
        </div>
      </section>
      <section className="mobile-safe-x mx-auto max-w-content py-8 sm:py-10 lg:px-8">
        {q && <p className="mb-5 text-caption text-text-tertiary">Product matches for &ldquo;{q}&rdquo;</p>}
        {products.length ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 text-body text-text-secondary">No products match this search yet. Try a broader technology or return soon as profiles are added.</div>
        )}
      </section>
    </main>
  );
}

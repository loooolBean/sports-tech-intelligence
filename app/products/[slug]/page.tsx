import { EvidenceSourceType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoRequestForm } from "@/src/components/leads/demo-request-form";
import { ProductEvidence } from "@/src/components/evidence/product-evidence";
import { Badge, SectionHeader } from "@/src/components/intelligence/cards";
import { WatchButton } from "@/src/components/watchlist/watch-button";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { getEvidenceCounts, getProductEvidence } from "@/src/lib/evidence";
import { getUserEntitlements } from "@/src/lib/entitlements";
import { getProductBySlug } from "@/src/lib/intelligence";
import { prisma } from "@/src/lib/prisma";
import { isProductWatched } from "@/src/lib/watchlist";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ evidence?: string; demo?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const product = await getProductBySlug((await params).slug); return product ? { title: `${product.name} | Sports Tech Intelligence`, description: product.shortDescription ?? product.description ?? `Profile for ${product.name}.`, alternates: { canonical: `/products/${product.slug}` } } : { title: "Product Not Found", robots: { index: false, follow: false } }; }

export default async function ProductPage({ params, searchParams }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const user = await getCurrentUserProfile();
  const entitlements = await getUserEntitlements(user?.id);
  const query = await searchParams;
  const requestedSource = Object.values(EvidenceSourceType).includes(query.evidence as EvidenceSourceType) ? query.evidence as EvidenceSourceType : undefined;
  const activeSource = entitlements.advancedFilters ? requestedSource : undefined;
  const [watching, evidence, counts, managerCount] = await Promise.all([
    user ? isProductWatched(user.id, product.id) : false,
    getProductEvidence(product.id, activeSource),
    getEvidenceCounts(product.id),
    prisma.companyMember.count({ where: { companyId: product.companyId } }),
  ]);
  const leadEnabled = product.company.leadsEnabled && managerCount > 0;
  return <main className="min-h-screen bg-bg"><header className="border-b border-border"><div className="mx-auto max-w-content px-4 py-12 lg:px-8"><Link href="/products" className="text-caption font-medium text-accent">Products</Link><div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row"><div><p className="overline">{product.company.name}</p><h1 className="mt-2 text-h1 text-text-primary">{product.name}</h1><p className="mt-4 max-w-3xl text-body-lg text-text-secondary">{product.description ?? product.shortDescription ?? "A sports technology product."}</p></div><div className="flex h-fit flex-wrap gap-3"><WatchButton entityId={product.id} entityType="product" watching={watching} returnPath={`/products/${product.slug}`} /><Link href={`/compare?products=${product.slug}`} className="rounded-lg border border-border px-4 py-2 text-caption font-semibold text-text-primary hover:border-accent hover:text-accent">Compare</Link>{product.website && <a href={product.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-4 py-2 text-caption font-semibold text-text-primary hover:border-accent hover:text-accent">Visit website ↗</a>}</div></div><Link href={`/companies/${product.company.slug}`} className="mt-6 inline-block text-caption font-semibold text-accent">View {product.company.name} →</Link>{query.demo === "submitted" && <p className="mt-5 rounded-lg border border-border bg-bg-elevated p-3 text-body text-text-secondary">Your demo request was sent to the verified company team.</p>}{query.demo === "duplicate" && <p className="mt-5 rounded-lg border border-border bg-bg-elevated p-3 text-body text-text-secondary">Your recent request is already on file.</p>}</div></header><section className="mx-auto max-w-content px-4 py-12 lg:px-8"><div className="grid gap-10 md:grid-cols-3"><Detail title="Technology" values={product.technologies.map(({ technology }) => technology.name)} /><Detail title="Use cases" values={product.useCases.map(({ useCase }) => useCase.name)} /><Detail title="Sports" values={product.sports.map(({ sport }) => sport.name)} /></div>{product.vendorProvidedInfo && <aside className="mt-10 rounded-lg border border-border bg-bg-elevated p-5"><p className="text-caption font-semibold text-text-primary">Company-provided information</p><p className="mt-2 whitespace-pre-line text-body text-text-secondary">{product.vendorProvidedInfo}</p><p className="mt-3 text-caption text-text-tertiary">This content comes from the company and is separate from independent research and evidence.</p></aside>}{leadEnabled && <div className="mt-8 max-w-xl"><DemoRequestForm product={product} defaults={{ name: user?.name, email: user?.email, organization: user?.organization }} /></div>}</section><ProductEvidence productSlug={product.slug} evidence={evidence} counts={counts} entitlements={entitlements} activeSource={activeSource} /><section className="border-t border-border"><div className="mx-auto max-w-content px-4 py-14 lg:px-8"><SectionHeader title="Related intelligence" />{product.articles.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{product.articles.map(({ article }) => <Link key={article.id} href={`/article/${article.slug}`} className="card-surface p-5"><p className="text-caption text-text-tertiary">{article.source.name}</p><h3 className="mt-2 text-h3 text-text-primary">{article.title}</h3><p className="mt-2 line-clamp-2 text-body text-text-secondary">{article.excerpt ?? article.aiSummary?.summary}</p></Link>)}</div> : <p className="mt-4 text-body text-text-secondary">No related intelligence has been linked yet.</p>}</div></section></main>;
}
function Detail({ title, values }: { title: string; values: string[] }) { return <div><h2 className="text-h3 text-text-primary">{title}</h2><div className="mt-4 flex flex-wrap gap-2">{values.length ? values.map((value) => <Badge key={value}>{value}</Badge>) : <p className="text-body text-text-secondary">Information is being enriched.</p>}</div></div>; }

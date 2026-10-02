import Link from "next/link";
import { saveAffiliateOffer } from "@/src/actions/affiliate-offers";
import { PageHeader, Panel } from "@/src/components/admin/ui";
import { getAdSenseConfig } from "@/src/lib/monetization";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MonetizationPage() {
  const [products, offers] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, slug: true, company: { select: { name: true } } }, orderBy: { name: "asc" }, take: 500 }),
    prisma.affiliateOffer.findMany({ include: { product: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
  ]);
  const ads = getAdSenseConfig();
  const inputClass = "mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary";
  return <div className="space-y-6">
    <PageHeader title="Monetization" description="Display ads and manually approved affiliate links. Neither channel earns revenue until its external account is approved." />
    <Panel title="Google AdSense" description="Ads are limited to the homepage and article pages; account, admin, checkout and research pages stay ad-free.">
      <p className="text-sm text-text-secondary">Publisher: {ads.client ? "configured for verification" : "not configured"}. Homepage ad: {ads.homeSlot ? "on" : "off"}. Article ad: {ads.articleSlot ? "on" : "off"}.</p>
      <p className="mt-2 text-sm text-text-secondary">Apply at <a className="underline" href="https://www.google.com/adsense/start/" target="_blank" rel="noopener noreferrer">Google AdSense</a>. After approval, add the publisher ID and slot IDs in Vercel environment variables, then enable ads. Check <Link className="underline" href="/ads.txt">ads.txt</Link> after deployment. AdSense reports actual earnings.</p>
    </Panel>
    <Panel title="Add affiliate offer" description="Only add a tracking URL supplied by an approved affiliate program. Link it to the exact product; do not treat the ordinary product website as an affiliate link.">
      <form action={saveAffiliateOffer} className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">Product<select name="productId" required className={inputClass}><option value="">Select product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.company.name}</option>)}</select></label>
        <label className="text-sm">Partner / merchant name<input name="partnerName" required maxLength={120} className={inputClass} /></label>
        <label className="text-sm md:col-span-2">Approved HTTPS affiliate URL<input name="destinationUrl" type="url" required pattern="https://.*" className={inputClass} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" /> Publish after link and disclosure review</label>
        <button type="submit" className="rounded bg-text-primary px-4 py-2 text-sm font-semibold text-bg md:justify-self-end">Save offer</button>
      </form>
    </Panel>
    <Panel title="Affiliate offers" description="Only active offers appear on their product pages, with an explicit commission disclosure.">
      {offers.length ? <div className="space-y-5">{offers.map(offer => <form key={offer.id} action={saveAffiliateOffer} className="grid gap-3 border-t border-border py-4 md:grid-cols-2">
        <input type="hidden" name="id" value={offer.id} />
        <label className="text-sm">Product<select name="productId" defaultValue={offer.productId} required className={inputClass}>{products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.company.name}</option>)}</select></label>
        <label className="text-sm">Partner name<input name="partnerName" defaultValue={offer.partnerName} required maxLength={120} className={inputClass} /></label>
        <label className="text-sm md:col-span-2">Approved HTTPS affiliate URL<input name="destinationUrl" type="url" pattern="https://.*" defaultValue={offer.destinationUrl} required className={inputClass} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={offer.isActive} /> Active</label>
        <div className="flex items-center gap-4 md:justify-end"><Link href={`/products/${offer.product.slug}`} className="text-sm underline">View product</Link><button type="submit" className="rounded border border-border px-4 py-2 text-sm font-semibold">Update</button></div>
      </form>)}</div> : <p className="text-sm text-text-secondary">No affiliate offers yet.</p>}
    </Panel>
  </div>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Layers3, Search, ShieldCheck } from "lucide-react";
import { startProCheckout } from "@/src/actions/billing";
import { ProBadge } from "@/src/components/pro/pro-gate";
import { PRO_PLAN } from "@/src/lib/plans";
import { getStripe, isStripeConfigured } from "@/src/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pricing | Sports Tech Intelligence",
  description: "Choose Free or Pro access to sports technology research and evidence.",
  alternates: { canonical: "/pricing" },
};

type Props = { searchParams: Promise<{ checkout?: string; error?: string; reason?: string }> };

const freeFeatures = [
  "Unlimited search and discovery",
  "Company and product profiles",
  "Research abstracts and evidence previews",
  "Basic two-product comparison",
  "Watch up to 5 entities",
];

const proFeatures = [
  "Full evidence details and findings",
  "Complete research summaries",
  "Advanced evidence and research filters",
  "Compare up to 4 products",
  "Unlimited company and product watchlist",
];

export default async function PricingPage({ searchParams }: Props) {
  const params = await searchParams;
  const configured = isStripeConfigured();
  let displayPrice = `$${PRO_PLAN.fallbackMonthlyPrice}`;

  if (configured) {
    try {
      const price = await getStripe().prices.retrieve(process.env.STRIPE_PRO_PRICE_ID!);
      if (price.unit_amount !== null) {
        displayPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: price.currency.toUpperCase(),
          maximumFractionDigits: 0,
        }).format(price.unit_amount / 100);
      }
    } catch {
      displayPrice = `$${PRO_PLAN.fallbackMonthlyPrice}`;
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <header className="editorial-grid border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-14 text-center lg:px-8">
          <p className="mx-auto inline-flex rounded-full border border-border bg-bg-card px-3 py-1 text-overline uppercase text-accent">Simple pricing</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.045em] text-text-primary sm:text-6xl sm:leading-[1.02]">
            Read the signal for free.<br /><span className="text-accent">Pay for decision depth.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg text-text-secondary">
            Discover the market without a paywall. Upgrade when your work needs complete findings, deeper comparison and continuous tracking.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <PricingNotice params={params} />
        <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
          <article className="card-surface flex flex-col p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg-elevated text-text-secondary"><Search className="h-5 w-5" /></span>
                <h2 className="mt-5 text-h2 text-text-primary">Free</h2>
                <p className="mt-2 text-body text-text-secondary">For exploring the landscape and following the daily market.</p>
              </div>
              <p className="text-4xl font-extrabold tracking-tight text-text-primary">$0</p>
            </div>
            <PlanFeatures features={freeFeatures} />
            <Link href="/search" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-caption font-bold text-text-primary transition-colors hover:border-text-tertiary">
              Start exploring <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-caption text-text-tertiary">No payment details required</p>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-accent/40 bg-text-primary p-7 text-bg shadow-xl shadow-accent/5 sm:p-8">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-accent px-4 py-2 text-overline uppercase text-white">For active research</div>
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg/10 text-accent-light"><Layers3 className="h-5 w-5" /></span>
              <div className="mt-5 flex items-center gap-2"><h2 className="text-h2">Pro</h2><ProBadge /></div>
              <p className="mt-2 max-w-xs text-body text-bg/65">For evaluation, procurement, investing and evidence-led decisions.</p>
            </div>
            <p className="mt-6 text-5xl font-extrabold tracking-tight">{displayPrice}<span className="text-body font-normal text-bg/50"> / month</span></p>
            <PlanFeatures features={proFeatures} dark />
            <form action={startProCheckout} className="mt-auto">
              <button disabled={!configured} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bg px-5 py-3 text-caption font-bold text-text-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                {configured ? "Upgrade to Pro" : "Stripe setup required"}<ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-bg/50"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout powered by Stripe</p>
          </article>
        </div>

        <div className="mt-10 grid gap-5 border-t border-border pt-8 sm:grid-cols-3">
          {[
            ["Explore first", "Search, browse profiles and preview evidence before deciding to upgrade."],
            ["Upgrade with purpose", "Pro expands the same workflow when you need deeper answers."],
            ["No surprise tiers", "One free plan and one paid plan keep the path clear."],
          ].map(([title, copy]) => (
            <div key={title}><h3 className="font-bold text-text-primary">{title}</h3><p className="mt-2 text-caption text-text-secondary">{copy}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlanFeatures({ features, dark = false }: { features: string[]; dark?: boolean }) {
  return (
    <ul className={`my-8 grid gap-3 text-body ${dark ? "text-bg/75" : "text-text-secondary"}`}>
      {features.map((feature) => (
        <li key={feature} className="flex gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${dark ? "bg-accent text-white" : "bg-accent/10 text-accent"}`}><Check className="h-3 w-3" /></span>{feature}</li>
      ))}
    </ul>
  );
}

function PricingNotice({ params }: { params: { checkout?: string; error?: string; reason?: string } }) {
  const message = params.checkout === "cancelled"
    ? "Checkout was cancelled. Your current plan has not changed."
    : params.reason === "watch-limit"
      ? "Free accounts can watch up to 5 entities. Existing watches are preserved; Pro unlocks an unlimited watchlist."
      : params.error
        ? "Checkout is not available until Stripe environment variables are configured."
        : null;

  return message ? <p className="mb-8 rounded-xl border border-border bg-bg-card p-4 text-body text-text-secondary">{message}</p> : null;
}

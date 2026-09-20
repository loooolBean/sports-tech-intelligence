import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { getUserEntitlements } from "@/src/lib/entitlements";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout Complete", robots: { index: false, follow: false } };
export default async function BillingSuccessPage() { const user = await getCurrentUserProfile(); if (!user) redirect("/sign-in?redirect_url=%2Fbilling%2Fsuccess"); const entitlements = await getUserEntitlements(user.id); return <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-20"><p className="overline">Checkout complete</p><h1 className="mt-2 text-h1 text-text-primary">{entitlements.plan === "PRO" ? "You’re now Pro" : "Stripe is confirming your subscription"}</h1><p className="mt-4 text-body-lg text-text-secondary">{entitlements.plan === "PRO" ? "Full evidence, advanced comparison, unlimited watchlist and complete research context are now available." : "Your access will activate as soon as the signed Stripe webhook is processed. Refresh this page in a moment if needed."}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/research" className="rounded-md bg-text-primary px-4 py-2 text-caption font-semibold text-bg">Explore Evidence</Link><Link href="/settings/billing" className="rounded-md border border-border px-4 py-2 text-caption font-semibold text-text-primary">View billing</Link></div></main>; }

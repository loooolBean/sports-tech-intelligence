import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { openBillingPortal } from "@/src/actions/billing";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { getUserSubscription } from "@/src/lib/subscriptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Billing", robots: { index: false, follow: false } };
export default async function BillingPage() { const user = await getCurrentUserProfile(); if (!user) redirect("/sign-in?redirect_url=%2Fsettings%2Fbilling"); const subscription = await getUserSubscription(user.id); const isPro = subscription?.plan === "PRO" && ["active", "trialing"].includes(subscription.status); return <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-12"><p className="overline">Settings</p><h1 className="mt-2 text-h1 text-text-primary">Billing</h1><div className="mt-8 card-surface p-6"><div className="grid gap-5 sm:grid-cols-3"><Fact label="Current plan" value={isPro ? "Pro" : "Free"} /><Fact label="Status" value={subscription?.status ?? "No subscription"} /><Fact label={subscription?.cancelAtPeriodEnd ? "Access until" : "Renewal date"} value={subscription?.currentPeriodEnd ? subscription.currentPeriodEnd.toLocaleDateString() : "—"} /></div><div className="mt-6">{subscription?.stripeCustomerId ? <form action={openBillingPortal}><button className="rounded-md bg-text-primary px-4 py-2 text-caption font-semibold text-bg">Manage Subscription</button></form> : <Link href="/pricing" className="rounded-md bg-text-primary px-4 py-2 text-caption font-semibold text-bg">View Pro</Link>}</div></div></main>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><p className="text-caption text-text-tertiary">{label}</p><p className="mt-1 text-h3 text-text-primary">{value}</p></div>; }

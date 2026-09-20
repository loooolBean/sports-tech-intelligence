import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { markAllAlertsRead } from "@/src/actions/alerts";
import { AlertList } from "@/src/components/alerts/alert-list";
import { getUserAlerts, getUnreadAlertCount } from "@/src/lib/alerts";
import { getCurrentUserProfile } from "@/src/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Intelligence Alerts | Sports Tech Intelligence", robots: { index: false, follow: false } };
type Props = { searchParams: Promise<{ view?: string }> };

export default async function AlertsPage({ searchParams }: Props) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Falerts");
  const unreadOnly = (await searchParams).view === "unread";
  const [alerts, unreadCount] = await Promise.all([getUserAlerts(user.id, { unreadOnly, limit: 20 }), getUnreadAlertCount(user.id)]);
  return <main className="min-h-screen bg-bg"><header className="border-b border-border"><div className="mx-auto max-w-content px-4 py-12 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="overline">Monitoring</p><h1 className="mt-2 text-h1 text-text-primary">Intelligence Alerts</h1><p className="mt-3 text-body-lg text-text-secondary">Important changes from your watchlist, in one focused inbox.</p></div>{unreadCount > 0 && <form action={markAllAlertsRead}><button className="rounded-lg border border-border px-4 py-2 text-caption font-semibold text-text-primary hover:border-accent hover:text-accent">Mark all as read</button></form>}</div></div></header><section className="mx-auto max-w-content px-4 py-8 lg:px-8"><nav className="mb-6 flex gap-2" aria-label="Alert views"><Link href="/alerts" className={`rounded-full px-3 py-1.5 text-caption font-semibold ${!unreadOnly ? "bg-text-primary text-bg" : "bg-bg-elevated text-text-secondary"}`}>All</Link><Link href="/alerts?view=unread" className={`rounded-full px-3 py-1.5 text-caption font-semibold ${unreadOnly ? "bg-text-primary text-bg" : "bg-bg-elevated text-text-secondary"}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</Link></nav><AlertList alerts={alerts} /></section></main>;
}

import Link from "next/link";
import { getBusinessReport, getUsersReport, getRevenueReport } from "@/src/lib/command-center";
import { getGrowthReport } from "@/src/lib/posthog-reporting";
import { Metric, Panel, Status, Unavailable } from "@/src/components/admin/ui";
import { ArticleActions } from "@/src/components/admin/article-actions";
import { GrowthPanel } from "@/src/components/admin/growth-panel";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const [business, growth, users, revenue] = await Promise.all([getBusinessReport(), getGrowthReport(), getUsersReport(), getRevenueReport()]);
  const b = business.data;
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", hour: "2-digit", hour12: false }).format(new Date()));
  const attention: { title: string; href: string; action: string }[] = [];
  if (!b) attention.push({ title: `Operations data: ${business.status}`, href: "/admin/system", action: "Check" });
  if (b?.aiFailures) attention.push({ title: `${b.aiFailures} AI processing failures`, href: "/admin/failures?stage=ai_processing", action: "Review" });
  if (b?.pending) attention.push({ title: `${b.pending} articles awaiting AI processing`, href: "/admin/content?pending=1", action: "Review" });
  if (b?.aiHealth === "Not connected") attention.push({ title: "AI provider not configured", href: "/admin/settings", action: "Setup" });
  if (b && b.rssHealth !== "Healthy") attention.push({ title: `RSS: ${b.rssHealth}`, href: "/admin/automations", action: "Check" });
  if (b?.missingCategories) attention.push({ title: `${b.missingCategories} articles need a category`, href: "/admin/content?category=uncategorized", action: "Fix" });
  if (b?.failures.some(f => f.stage !== "ai_processing")) attention.push({ title: "Other processing failures need review", href: "/admin/failures", action: "Review" });
  if (!growth.data) attention.push({ title: `PostHog: ${growth.status}`, href: "/admin/settings#posthog", action: "Connect" });
  else if (!growth.data.latestEvent) attention.push({ title: "PostHog has no events in the past 7 days", href: "/admin/settings#posthog", action: "Check" });
  if (!users.data) attention.push({ title: `User accounts: ${users.status}`, href: "/admin/settings#clerk", action: "Check" });
  if (!revenue.data) attention.push({ title: `Payments: ${revenue.status}`, href: "/admin/settings#stripe", action: "Setup" });
  if (!process.env.STRIPE_WEBHOOK_SECRET) attention.push({ title: "Stripe webhook not configured", href: "/admin/settings#stripe", action: "Setup" });
  if (revenue.data?.pastDue || revenue.data?.invoices.length) attention.push({ title: "Subscriptions or payments need attention", href: "/admin/revenue", action: "Review" });
  const systems = [
    ["RSS", b?.rssHealth ?? business.status],
    ["AI", b?.aiHealth ?? business.status],
    ["Database", b ? "Healthy" : business.status],
    ["Analytics", growth.data ? (growth.data.latestEvent ? "Connected" : "No data yet") : growth.status],
    ["Payments", revenue.data ? (!process.env.STRIPE_WEBHOOK_SECRET || revenue.data.pastDue ? "Needs attention" : "Connected") : revenue.status],
  ];
  return <div className="space-y-6">
    <header><p className="text-sm text-text-secondary">Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Sports Tech Intelligence</h1><p className="mt-4 text-sm font-medium">Today <span className="font-normal text-text-tertiary">· 北京时间</span></p></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Visitors Today" value={growth.data?.visitorsToday ?? growth.status} href="/admin/growth" />
      <Metric label="Article Views Today" value={growth.data?.articleViewsToday ?? growth.status} href="/admin/growth" />
      <Metric label="New Users Today" value={users.data ? users.data.today ?? "Unavailable" : users.status} href="/admin/users" note={users.data?.development ? "Clerk development instance" : undefined} />
      <Metric label="Active Pro Subscribers" value={revenue.data ? revenue.data.testMode ? "Test mode" : revenue.data.active : revenue.status} href="/admin/revenue" note="Active subscriptions · excludes trials" />
    </div>
    <Panel title="Needs attention">{attention.length ? <ul className="divide-y divide-border-subtle">{attention.map((item, index) => <li key={index} className="flex items-center justify-between gap-4 py-3"><span className="text-sm">{item.title}</span><Link href={item.href} className="inline-flex min-h-11 shrink-0 items-center rounded border border-border px-3 text-xs font-semibold text-accent">{item.action} →</Link></li>)}</ul> : <p className="text-sm text-text-secondary">Everything looks good.</p>}</Panel>
    <Panel title="Content today" href="/admin/content" description="发布 / 隐藏时间从本次版本开始记录；不回填历史日期。Failed 为失败记录数。">
      {!b ? <Unavailable service="Database" status={business.status} /> : <>
        <dl className="grid grid-cols-2 gap-4 border-b border-border pb-5 sm:grid-cols-4">{[["Fetched today", b.fetched], ["Published today", b.published], ["Hidden today", b.hidden], ["Failed today", b.failed]].map(([label, count]) => <div key={label}><dt className="text-xs text-text-secondary">{label}</dt><dd className="mt-2 text-2xl font-semibold">{count}</dd></div>)}</dl>
        <ul className="divide-y divide-border-subtle">{b.latest.map(a => <li key={a.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><Link className="text-sm font-medium hover:underline" href={`/admin/articles/${a.id}`}>{a.title}</Link><p className="mt-1 text-xs text-text-tertiary">{a.status}{a.isHiddenFromFeed ? " · Hidden" : ""}</p></div><ArticleActions id={a.id} featured={a.isFeatured} hidden={a.isHiddenFromFeed} /></li>)}</ul>{!b.latest.length && <p className="mt-4 text-sm text-text-tertiary">No articles yet. Add an RSS source to get started.</p>}
      </>}
    </Panel>
    <GrowthPanel />
    <Panel title="System" href="/admin/system"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{systems.map(([label, value]) => <Link key={label} href="/admin/system" className="flex flex-col gap-2 rounded border border-border p-3"><span className="text-sm font-medium">{label}</span><Status value={value} /></Link>)}</div></Panel>
  </div>;
}

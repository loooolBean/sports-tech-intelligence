import { getRevenueReport, getBusinessReport } from "@/src/lib/command-center";
import { PageHeader, Panel, Metric, Status, Unavailable, formatAdminDate, tableClass } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function RevenuePage() {
  const [report, business] = await Promise.all([getRevenueReport(), getBusinessReport()]);
  const data = report.data;
  return <div className="space-y-6"><PageHeader title="Revenue" description="Stripe 实时订阅状态，限定当前 Pro 价格。Active 不等于已到账收入，也不包含试用。" />
    {data?.testMode && <p className="rounded border border-amber-500 p-4 text-sm">Test mode：以下是测试订阅，不是真实付费客户。</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Active", data?.active], ["Trialing", data?.trialing], ["Payment attention", data?.pastDue], ["Cancelled", data?.cancelled]].map(([label, count]) => <Metric key={label} label={String(label)} value={count ?? report.status} href="/admin/revenue" />)}</div>
    {!data && <Unavailable service="Stripe" status={report.status} />}
    <Panel title="Webhook & local access"><p className="text-sm">Webhook secret: <Status value={process.env.STRIPE_WEBHOOK_SECRET ? "Configured · unverified" : "Not connected"} /></p><p className="mt-3 text-sm text-text-secondary">Last processed Stripe event: {business.data ? formatAdminDate(business.data.lastWebhook?.processedAt) : business.status}</p><p className="mt-2 text-xs text-text-tertiary">有密钥不代表投递成功。付款成功但权限未更新时，检查 Stripe Webhooks 的 delivery。</p></Panel>
    {data && <Panel title="Payment failures" description="Stripe 最近 20 张 open invoices 中至少尝试扣款一次的记录；不代表全部历史失败。" href="https://dashboard.stripe.com/invoices" action="Inspect in Stripe">{data.invoices.length ? <ul className="divide-y divide-border-subtle">{data.invoices.map(i => <li key={i.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><span>{i.number ?? i.id}</span><span>{i.currency} {i.amount.toFixed(2)} · {i.attempted} attempts</span></li>)}</ul> : <p className="text-sm text-text-secondary">No attempted unpaid invoices in this sample.</p>}</Panel>}
    <Panel title="Recently synced subscriptions" description="应用本地权限记录，最近 30 条；与 Stripe 不一致时以 Stripe 为准。">{business.data ? <div className="overflow-x-auto"><table className={tableClass}><thead><tr><th>Account</th><th>Status</th><th>Plan</th><th>Period ends</th><th>Renewal</th></tr></thead><tbody>{business.data.subscribers.map(s => <tr key={s.id}><td>{s.user.name ?? s.user.email}</td><td>{s.status}</td><td>{s.plan}</td><td>{formatAdminDate(s.currentPeriodEnd)}</td><td>{s.cancelAtPeriodEnd ? "Cancels at period end" : "See Stripe"}</td></tr>)}</tbody></table></div> : <Unavailable service="Database" status={business.status} />}</Panel>
  </div>;
}

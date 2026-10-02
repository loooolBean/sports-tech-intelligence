import { getRevenueReport, getBusinessReport } from "@/src/lib/command-center";
import { billingProvider } from "@/src/lib/paddle";
import { PageHeader, Panel, Metric, Status, Unavailable, formatAdminDate, tableClass } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function RevenuePage() {
  const [report, business] = await Promise.all([getRevenueReport(), getBusinessReport()]);
  const data = report.data;
  const provider = billingProvider() === "paddle" ? "Paddle" : "Stripe";
  const secret = provider === "Paddle" ? process.env.PADDLE_WEBHOOK_SECRET : process.env.STRIPE_WEBHOOK_SECRET;
  return <div className="space-y-6"><PageHeader title="Revenue" description={`${provider} 实时订阅状态，限定当前 Pro 价格。Active 不等于已到账收入，也不包含试用。`} />
    {data?.testMode && <p className="rounded border border-amber-500 p-4 text-sm">Test mode：以下是测试订阅，不是真实付费客户。</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Active", data?.active], ["Trialing", data?.trialing], ["Payment attention", data?.pastDue], ["Cancelled", data?.cancelled]].map(([label, count]) => <Metric key={label} label={String(label)} value={count ?? report.status} href="/admin/revenue" />)}</div>
    {!data && <Unavailable service={provider} status={report.status} />}
    <Panel title="Webhook & local access"><p className="text-sm">Webhook secret: <Status value={secret ? "Configured · unverified" : "Not connected"} /></p><p className="mt-3 text-sm text-text-secondary">Last processed {provider} event: {business.data ? formatAdminDate(business.data.lastWebhook?.processedAt) : business.status}</p><p className="mt-2 text-xs text-text-tertiary">付款成功但权限未更新时，检查支付平台通知投递状态。</p></Panel>
    <Panel title="Payments & payouts" href={provider === "Paddle" ? "https://vendors.paddle.com/" : "https://dashboard.stripe.com/"} action={`Open ${provider}`}><p className="text-sm text-text-secondary">实际收入、税费、退款、失败扣款和结算金额请在 {provider} 查看。此页展示订阅数量，不将其推算为实际收入。</p></Panel>
    <Panel title="Recently synced subscriptions" description="应用本地权限记录，最近 30 条。"><div className="overflow-x-auto">{business.data ? <table className={tableClass}><thead><tr><th>Account</th><th>Provider</th><th>Status</th><th>Plan</th><th>Period ends</th><th>Renewal</th></tr></thead><tbody>{business.data.subscribers.map(s => <tr key={s.id}><td>{s.user.name ?? s.user.email}</td><td>{s.billingProvider}</td><td>{s.status}</td><td>{s.plan}</td><td>{formatAdminDate(s.currentPeriodEnd)}</td><td>{s.cancelAtPeriodEnd ? "Cancels at period end" : "See billing provider"}</td></tr>)}</tbody></table> : <Unavailable service="Database" status={business.status} />}</div></Panel>
  </div>;
}

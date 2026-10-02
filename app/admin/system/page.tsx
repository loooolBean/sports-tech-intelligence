import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { assertAdmin, getBusinessReport, getRevenueReport, getDeploymentReport, getUsersReport } from "@/src/lib/command-center";
import { getGrowthReport } from "@/src/lib/posthog-reporting";
import { PageHeader, Panel, Status, Unavailable, formatAdminDate } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function SystemPage() {
  await assertAdmin();
  const [business, growth, revenue, deployment, users, database] = await Promise.all([
    getBusinessReport(), getGrowthReport(), getRevenueReport(), getDeploymentReport(), getUsersReport(),
    process.env.DATABASE_URL ? prisma.$queryRaw`SELECT 1`.then(() => "Healthy").catch(() => "Unavailable") : Promise.resolve("Not connected"),
  ]);
  const rows = [
    ["Database connection", database, "/admin/settings#database"],
    ["Application data / schema", business.status, "/admin/settings#database"],
    ["RSS", business.data?.rssHealth ?? business.status, "/admin/automations"],
    ["AI processing", business.data?.aiHealth ?? business.status, "/admin/automations"],
    ["Analytics API", growth.status, "/admin/growth"],
    ["User accounts API", users.status, "/admin/users"],
    ["Payments API", revenue.status, "/admin/revenue"],
  ];
  return <div className="space-y-6"><PageHeader title="System" description="连接状态来自本次读取。Configured 只表示设置存在，不能证明服务可用。" />
    <Panel title="Service health"><ul className="divide-y divide-border-subtle">{rows.map(([label, status, href]) => <li key={label}><Link href={href} className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-3 text-sm"><span>{label}</span><Status value={status} /></Link></li>)}</ul><p className="mt-4 text-xs text-text-tertiary">AI 最近成功：{business.data ? formatAdminDate(business.data.lastAi?.generatedAt) : business.status} · PostHog 最近事件：{growth.data ? growth.data.latestEvent ?? "No data yet" : growth.status}</p></Panel>
    <Panel title="Latest production deployment">{deployment.data ? <div className="space-y-3 text-sm"><Status value={deployment.data.state} /><p>{formatAdminDate(deployment.data.created)}</p><a className="break-all text-accent" href={`https://${deployment.data.url}`} target="_blank" rel="noreferrer">{deployment.data.url} ↗</a></div> : <Unavailable service="Vercel deployment API" status={deployment.status} />}</Panel>
    <Panel title="Errors & diagnostics" description="站内保留抓取 / AI / 定时任务记录；完整 HTTP 错误与堆栈以 Vercel Runtime Logs 为准。">
      <div className="flex flex-wrap gap-4 text-sm text-accent"><Link href="/admin/failures">Processing failures →</Link><Link href="/admin/automations">Job history →</Link><a href="https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/logs" target="_blank" rel="noreferrer">Runtime Logs ↗</a><a href="https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/analytics" target="_blank" rel="noreferrer">Vercel Analytics ↗</a></div>
      <p className="mt-4 text-xs text-text-tertiary">没有集中接入全站异常数量，因此不显示“0 errors”或声称全站无错误。</p>
    </Panel>
  </div>;
}

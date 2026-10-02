import Link from "next/link";
import { getBusinessReport } from "@/src/lib/command-center";
import { PageHeader, Panel, Status, Unavailable, formatAdminDate, tableClass } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function AutomationsPage() {
  const report = await getBusinessReport();
  const data = report.data;
  return <div className="space-y-6"><PageHeader title="Automations" description="查看实际任务执行记录，失败时进入对应内容或来源处理。" />
    <Panel title="Daily schedule"><div className="grid gap-5 sm:grid-cols-2"><div><h3 className="text-sm font-semibold">RSS ingestion · 08:00 北京时间</h3><p className="my-2 text-xs text-text-secondary">抓取来源，并对新文章执行 AI 处理。</p><Status value={data?.rssHealth ?? report.status} /></div><div><h3 className="text-sm font-semibold">SEO metadata · 09:30 北京时间</h3><p className="my-2 text-xs text-text-secondary">补齐 SEO 元数据；不是文章 AI 摘要任务。</p><Status value={data?.seoHealth ?? report.status} /></div></div><p className="mt-5 text-xs text-text-tertiary">每天执行一次；超过 26 小时没有成功记录才判定过期。配置 schedule 不代表任务已经执行。</p></Panel>
    <Panel title="Open failures" href="/admin/failures" action="Review failures">{!data ? <Unavailable service="Database" status={report.status} /> : data.failures.length ? <ul className="divide-y divide-border-subtle">{data.failures.map(f => <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div>{f.source?.name ?? "Unknown source"}<p className="mt-1 text-xs text-text-tertiary">{f.stage} · {formatAdminDate(f.createdAt)}</p></div><Link href={`/admin/failures?stage=${encodeURIComponent(f.stage)}`} className="inline-flex min-h-11 items-center text-accent">Review →</Link></li>)}</ul> : <p className="text-sm text-text-secondary">No open processing failures.</p>}</Panel>
    <Panel title="Recent runs" description="最近 40 次任务；处理数来自任务日志。">{data ? <div className="overflow-x-auto"><table className={tableClass}><thead><tr><th>Job</th><th>Started</th><th>Finished</th><th>Status</th><th>Processed</th></tr></thead><tbody>{data.jobs.map(j => <tr key={j.id}><td>{j.jobName}</td><td>{formatAdminDate(j.startedAt)}</td><td>{formatAdminDate(j.finishedAt)}</td><td><Status value={j.status} /></td><td>{j.itemsProcessed}</td></tr>)}</tbody></table>{!data.jobs.length && <p className="py-5 text-sm text-text-tertiary">No runs recorded yet.</p>}</div> : <Unavailable service="Database" status={report.status} />}</Panel>
    <div className="flex flex-wrap gap-5 text-sm text-accent"><Link href="/admin/sources">Manage RSS sources →</Link><Link href="/admin/content?pending=1">Articles awaiting AI →</Link></div>
  </div>;
}

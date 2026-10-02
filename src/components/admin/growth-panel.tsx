import Link from "next/link";
import { getGrowthReport } from "@/src/lib/posthog-reporting";
import { prisma } from "@/src/lib/prisma";
import { Panel, Unavailable, tableClass } from "./ui";

export async function GrowthPanel() {
  const report = await getGrowthReport();
  if (!report.data) return <Panel title="Growth snapshot" href="/admin/growth"><Unavailable service="PostHog" status={report.status} /></Panel>;
  const data = report.data;
  const titles = await prisma.article.findMany({ where: { slug: { in: data.top.map(a => a.path.split('/')[2]) } }, select: { slug: true, title: true } }).catch(() => []);
  return <Panel title="Growth snapshot" description="过去 7 个自然日 · 北京时间 · PostHog 数据可能延迟几分钟" href="/admin/growth">
    <div className="grid grid-cols-3 gap-3 border-b border-border pb-5">{[["Visitors", data.visitors], ["Pageviews", data.pageviews], ["Signups", data.signups]].map(([label, value]) => <div key={label}><p className="text-xs text-text-secondary">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    <div className="mt-5 overflow-x-auto"><table className={tableClass}><caption className="sr-only">Daily growth trend</caption><thead><tr><th>Date</th><th>Visitors</th><th>Pageviews</th><th>Signups</th></tr></thead><tbody>{data.days.map(d => <tr key={d.day}><td>{d.day}</td><td>{d.visitors}</td><td>{d.pageviews}</td><td>{d.signups}</td></tr>)}</tbody></table></div>
    <h3 className="mb-2 mt-6 text-sm font-semibold">Top content</h3>{data.top.length ? <ol className="divide-y divide-border-subtle">{data.top.map(a => <li key={a.path} className="flex items-start justify-between gap-4 py-3 text-sm"><Link href={a.path} className="hover:underline">{titles.find(t => t.slug === a.path.split('/')[2])?.title ?? a.path.split('/')[2]}</Link><span className="shrink-0 text-text-secondary">{a.views} views</span></li>)}</ol> : <p className="text-sm text-text-tertiary">No article views recorded in this period.</p>}
  </Panel>;
}

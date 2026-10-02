import Link from "next/link";
import { getGrowthReport, posthogApiHost } from "@/src/lib/posthog-reporting";
import { GrowthPanel } from "@/src/components/admin/growth-panel";
import { PageHeader, Panel, Metric, Unavailable, tableClass } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function GrowthPage() {
  const report = await getGrowthReport();
  const data = report.data;
  const project = process.env.POSTHOG_PROJECT_ID;
  return <div className="space-y-6"><PageHeader title="Growth" description="公开页面流量与产品行为 · 最近 7 个自然日 · 北京时间。用户可能屏蔽分析脚本，因此不等于服务器请求总数。" />
    <GrowthPanel />
    {data ? <><div className="grid gap-3 sm:grid-cols-3"><Metric label="Searches · 7d" value={data.searches} href="/search" /><Metric label="People who watched · 7d" value={data.watchers} href="/admin/users" /><Metric label="People who saved · 7d" value={data.savers} href="/admin/users" /></div>
      <Panel title="Where readers come from"><div className="overflow-x-auto"><table className={tableClass}><thead><tr><th>Referring domain</th><th>Visitors · 7d</th></tr></thead><tbody>{data.referrers.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.visitors}</td></tr>)}</tbody></table></div>{!data.referrers.length && <p className="text-sm text-text-tertiary">No referrals recorded yet.</p>}</Panel>
    </> : <Unavailable service="PostHog product events" status={report.status} />}
    <Panel title="Three conversion funnels" description="在 PostHog 中保存这三个有序漏斗；没有远程配置时不显示虚构转化率。">
      <ol className="space-y-4 text-sm"><li><strong>Content → Signup</strong><p className="mt-1 text-text-secondary">$pageview → article_opened → signup_started → signup_completed</p></li><li><strong>Content → Engagement</strong><p className="mt-1 text-text-secondary">article_opened → company_opened OR product_opened → save_added OR watch_added</p></li><li><strong>Pricing → Subscription</strong><p className="mt-1 text-text-secondary">pricing_viewed → checkout_started → checkout_completed → subscription_activated</p></li></ol>
      <div className="mt-5 flex flex-wrap gap-5 text-sm text-accent"><Link href="/admin/settings#funnels">Setup funnels →</Link>{project && <a href={`${posthogApiHost()}/project/${encodeURIComponent(project)}/insights`} target="_blank" rel="noreferrer">Open PostHog insights ↗</a>}</div>
    </Panel>
    <Link href="/admin/newsletter" className="inline-flex min-h-11 items-center text-sm text-accent">Newsletter subscribers →</Link>
  </div>;
}

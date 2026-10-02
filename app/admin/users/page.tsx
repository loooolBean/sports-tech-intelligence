import Link from "next/link";
import { getUsersReport, getBusinessReport } from "@/src/lib/command-center";
import { PageHeader, Panel, Metric, Unavailable, formatAdminDate, tableClass } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const [report, business] = await Promise.all([getUsersReport(), getBusinessReport()]);
  const data = report.data;
  return <div className="space-y-6"><PageHeader title="Users" description="Clerk 账号是注册用户的权威来源；匿名访问者请看 Growth。账号数不代表经过验证的真人数。" />
    {data?.development && <p className="rounded border border-amber-500 p-4 text-sm">Development instance：以下为 Clerk 测试环境账号，不应作为正式业务注册量。</p>}
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Registered accounts" value={data?.total ?? report.status} href="/admin/users" /><Metric label="New today" value={data ? data.today ?? "Unavailable" : report.status} href="/admin/users" /><Metric label="Synced local profiles" value={business.data?.syncedUsers ?? business.status} href="/admin/system" note="本地应用资料；可能暂未同步全部 Clerk 账号" /></div>
    <Panel title="Latest accounts" description="最近 30 个账号；Last active 来自 Clerk。">{!data ? <Unavailable service="Clerk" status={report.status} /> : <><div className="overflow-x-auto"><table className={tableClass}><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Last active</th></tr></thead><tbody>{data.users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{formatAdminDate(u.createdAt)}</td><td>{formatAdminDate(u.lastActiveAt)}</td></tr>)}</tbody></table></div>{!data.users.length && <p className="text-sm text-text-tertiary">No registered accounts yet.</p>}</>}</Panel>
    <Panel title="Saved & watched" description="当前数据库中仍保留的收藏关系数，并非人数或历史累计点击。">{business.data ? <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">{["Company watches", "Product watches", "Technology watches", "Article saves"].map((label, i) => <div key={label}><dt className="text-xs text-text-secondary">{label}</dt><dd className="mt-2 text-2xl font-semibold">{business.data!.watches[i]}</dd></div>)}</dl> : <Unavailable service="Database" status={business.status} />}</Panel>
    <div className="flex flex-wrap gap-5 text-sm text-accent"><Link href="/admin/claims">Company claims →</Link><Link href="/admin/leads">Buyer enquiries →</Link></div>
  </div>;
}

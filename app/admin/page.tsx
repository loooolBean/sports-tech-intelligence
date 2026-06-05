import Link from "next/link";
import { getAdminDashboardStats } from "../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    ["Published Articles", stats.publishedArticles],
    ["Draft Articles", stats.draftArticles],
    ["Rejected Articles", stats.rejectedArticles],
    ["Articles Today", stats.articlesToday],
    ["Active Sources", stats.activeSources],
    ["Open Failures", stats.openFailures],
    ["Newsletter Subscribers", stats.newsletterSubscribers],
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Admin Overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/admin/articles">
          Review Articles
        </Link>
        <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" href="/admin/sources">
          Manage Sources
        </Link>
      </div>
    </div>
  );
}

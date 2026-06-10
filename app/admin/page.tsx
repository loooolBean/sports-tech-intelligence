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
      <h1 className="text-h1 text-text-primary">Admin Overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="card-surface p-5">
            <p className="text-caption text-text-tertiary">{label}</p>
            <p className="mt-2 text-h1 text-text-primary">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-md bg-accent px-4 py-2 text-caption font-medium text-white transition-colors hover:bg-accent-hover" href="/admin/articles">
          Review Articles
        </Link>
        <Link className="rounded-md border border-border px-4 py-2 text-caption font-medium text-text-secondary transition-colors hover:bg-bg-elevated" href="/admin/sources">
          Manage Sources
        </Link>
      </div>
    </div>
  );
}

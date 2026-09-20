import Link from "next/link";

export function ProBadge() {
  return <span className="inline-flex rounded border border-border bg-bg-elevated px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-text-secondary">PRO</span>;
}

export function UpgradeCard({ title = "Unlock full evidence", description = "Review complete findings, study context and advanced comparisons with Pro." }: { title?: string; description?: string }) {
  return <aside className="rounded-lg border border-border bg-bg-elevated p-5"><div className="flex items-center gap-2"><ProBadge /><h3 className="text-h3 text-text-primary">{title}</h3></div><p className="mt-2 text-body text-text-secondary">{description}</p><Link href="/pricing" className="mt-4 inline-flex rounded-md bg-text-primary px-4 py-2 text-caption font-semibold text-bg hover:bg-text-secondary">View Pro</Link></aside>;
}

export function ProGate({ allowed, children, title, description }: { allowed: boolean; children: React.ReactNode; title?: string; description?: string }) {
  if (allowed) return <>{children}</>;
  return <UpgradeCard title={title} description={description} />;
}

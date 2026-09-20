import { formatDistanceToNow } from "date-fns";
import { markAlertRead, openAlert } from "@/src/actions/alerts";

type AlertItem = {
  id: string; title: string; message: string; isRead: boolean; createdAt: Date;
  article: { slug: string } | null;
  company: { name: string } | null;
  product: { name: string } | null;
};

export function AlertList({ alerts, compact = false }: { alerts: AlertItem[]; compact?: boolean }) {
  if (!alerts.length) return <div className="rounded-lg border border-dashed border-border p-7 text-center"><p className="text-body font-medium text-text-primary">No alerts here yet.</p><p className="mt-2 text-body text-text-secondary">Watch companies and products to receive new intelligence updates.</p></div>;
  return <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg-card">{alerts.map((alert) => <article key={alert.id} className={`relative p-5 ${alert.isRead ? "" : "bg-accent/[0.035]"}`}>
    <div className="flex gap-4"><span className={`mt-2 h-2 w-2 flex-none rounded-full ${alert.isRead ? "bg-transparent ring-1 ring-border" : "bg-accent"}`}><span className="sr-only">{alert.isRead ? "Read" : "Unread"}</span></span><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start"><h3 className={`${alert.isRead ? "font-medium" : "font-semibold"} text-text-primary`}>{alert.title}</h3><time className="flex-none text-caption text-text-tertiary" dateTime={alert.createdAt.toISOString()}>{formatDistanceToNow(alert.createdAt, { addSuffix: true })}</time></div><p className={`mt-1 text-body text-text-secondary ${compact ? "line-clamp-1" : "line-clamp-2"}`}>{alert.message}</p><div className="mt-3 flex flex-wrap items-center gap-4"><form action={openAlert}><input type="hidden" name="alertId" value={alert.id} /><button className="text-caption font-semibold text-accent">View intelligence →</button></form>{!alert.isRead && <form action={markAlertRead}><input type="hidden" name="alertId" value={alert.id} /><button className="text-caption font-medium text-text-tertiary hover:text-text-primary">Mark as read</button></form>}</div></div></div>
  </article>)}</div>;
}

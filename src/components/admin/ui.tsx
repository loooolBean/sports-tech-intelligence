import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return <header className="mb-7"><p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Sports Tech Intelligence</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm text-text-secondary">{description}</p>}</header>;
}
export function Panel({ title, children, href, action = "View all", description }: { title: string; children: ReactNode; href?: string; action?: string; description?: string }) {
  return <section className="rounded-lg border border-border bg-bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="mt-1 text-xs text-text-tertiary">{description}</p>}</div>{href && <Link href={href} className="shrink-0 text-xs font-semibold text-accent hover:underline">{action} →</Link>}</div>{children}</section>;
}
export function Metric({ label, value, href, note }: { label: string; value: string | number; href: string; note?: string }) {
  return <Link href={href} className="rounded-lg border border-border bg-bg-card p-5 transition-colors hover:border-text-tertiary"><div className="flex items-center justify-between gap-2 text-xs font-medium text-text-secondary">{label}<span aria-hidden>↗</span></div><p className={`mt-4 font-semibold tracking-tight ${typeof value === "number" ? "text-3xl" : "text-lg"}`}>{typeof value === "number" ? value.toLocaleString() : value}</p>{note && <p className="mt-2 text-xs text-text-tertiary">{note}</p>}</Link>;
}
export function Status({ value }: { value: string }) {
  const color = ["Healthy", "Connected", "READY", "SUCCEEDED", "active"].includes(value) ? "text-emerald-700 dark:text-emerald-300" : ["Not connected", "No data yet"].includes(value) ? "text-text-tertiary" : "text-amber-700 dark:text-amber-300";
  return <span className={`inline-flex items-center gap-2 text-xs font-semibold ${color}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}
export function Unavailable({ status, service }: { status: string; service: string }) {
  return <div className="rounded border border-dashed border-border p-5"><p className="font-medium">{status}</p><p className="mt-2 text-sm text-text-secondary">{status === "Not connected" ? `${service} 尚未连接。完成设置后，这里会显示真实数据。` : `${service} 本次读取失败。请稍后刷新，或打开 System 检查连接。`}</p><Link href={status === "Not connected" ? "/admin/settings" : "/admin/system"} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent">{status === "Not connected" ? "Open settings" : "Check system"} →</Link></div>;
}
export function formatAdminDate(date: Date | string | number | null | undefined) {
  return date ? new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(date)) : "No data yet";
}
export const tableClass = "w-full min-w-[640px] text-left text-sm [&_th]:border-b [&_th]:border-border [&_th]:pb-3 [&_th]:pr-4 [&_th]:text-xs [&_th]:font-medium [&_th]:text-text-tertiary [&_td]:border-b [&_td]:border-border-subtle [&_td]:py-4 [&_td]:pr-4";

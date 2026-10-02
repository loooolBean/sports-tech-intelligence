"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Users, CreditCard, Rss, FileText, LayoutDashboard, Settings, Activity, Workflow, Menu, X, ArrowUpRight, BadgeDollarSign } from "lucide-react";

const items = [
  ["/admin", "Overview", LayoutDashboard], ["/admin/content", "Content", FileText],
  ["/admin/sources", "Sources", Rss], ["/admin/growth", "Growth", BarChart3],
  ["/admin/users", "Users", Users], ["/admin/revenue", "Revenue", CreditCard],
  ["/admin/monetization", "Monetization", BadgeDollarSign],
  ["/admin/automations", "Automations", Workflow], ["/admin/system", "System", Activity],
  ["/admin/settings", "Settings", Settings],
] as const;
export function AdminSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open]);
  return <>
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg-card px-5 lg:hidden"><Link href="/admin" className="font-semibold">STI / Admin</Link><button onClick={() => setOpen(!open)} aria-label={open ? "Close admin menu" : "Open admin menu"} aria-expanded={open} aria-controls="admin-sidebar" className="tap-target grid place-items-center">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
    <aside id="admin-sidebar" className={`${open ? "block" : "hidden"} fixed inset-y-16 left-0 z-30 w-full overflow-y-auto border-r border-border bg-bg-card p-5 lg:inset-y-0 lg:block lg:w-60`}>
      <Link href="/admin" className="mb-9 hidden border-l-4 border-accent pl-3 text-xs font-extrabold uppercase tracking-widest lg:block">Sports Tech<br />Intelligence</Link>
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-text-tertiary">Workspace</p>
      <nav aria-label="Admin navigation" className="space-y-1">{items.map(([href, name, Icon]) => {
        const active = path === href || (href !== "/admin" && path.startsWith(href + "/")) || (href === "/admin/content" && /^\/admin\/(articles|research|evidence|categories|tags)/.test(path));
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium ${active ? "bg-bg-elevated text-accent" : "text-text-secondary hover:bg-bg-elevated"}`}><Icon size={17} aria-hidden />{name}</Link>;
      })}</nav>
      <div className="mt-10 border-t border-border pt-5"><Link href="/" className="flex min-h-11 items-center justify-between text-sm text-text-secondary">Open website <ArrowUpRight size={16} /></Link><Link href="/dashboard" className="text-caption text-text-tertiary">Your account</Link></div>
    </aside>
  </>;
}

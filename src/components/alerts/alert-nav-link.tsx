"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AlertNavLink() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    const load = () => fetch("/api/alerts/unread-count", { cache: "no-store" }).then((response) => response.ok ? response.json() : { count: 0 }).then((data: { count?: number }) => { if (active) setCount(data.count ?? 0); }).catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [pathname]);
  return <Link href="/alerts" aria-label={count ? `Alerts, ${count} unread` : "Alerts"} className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary"><Bell className="h-4 w-4" />{count > 0 && <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-white">{count > 9 ? "9+" : count}</span>}</Link>;
}

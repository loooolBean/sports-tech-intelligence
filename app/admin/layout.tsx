import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdminUser } from "../../src/lib/auth";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/failures", label: "Failures" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser();

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[220px_1fr]">
      <aside>
        <p className="overline">Admin</p>
        <nav className="mt-4 grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-md px-3 py-2 text-caption font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </main>
  );
}

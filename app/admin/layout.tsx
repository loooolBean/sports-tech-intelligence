import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdminUser } from "@/src/lib/auth";
import { AdminSidebar } from "@/src/components/admin/sidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await requireAdminUser())) redirect("/dashboard");
  return <div data-private className="min-h-screen bg-bg">
    <AdminSidebar />
    <main className="min-w-0 p-4 sm:p-8 lg:ml-60 lg:p-10"><div className="mx-auto max-w-6xl">{children}</div></main>
  </div>;
}

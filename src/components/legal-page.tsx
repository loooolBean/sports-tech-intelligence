import type { ReactNode } from "react";
import Link from "next/link";
import { BUSINESS } from "@/src/lib/business";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-prose px-4 py-12 sm:py-16 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-caption text-text-tertiary">
          <Link href="/" className="underline">Home</Link><span className="mx-2">/</span>{title}
        </nav>
        <h1 className="text-display text-text-primary">{title}</h1>
        <p className="mt-4 text-caption text-text-tertiary">Last updated: {BUSINESS.policyUpdated}</p>
        <div className="prose-article mt-10 space-y-8 break-words">{children}</div>
        <nav aria-label="Legal and support" className="mt-10 flex flex-wrap gap-5 border-t border-border pt-6 text-caption underline">
          <Link href="/contact">Contact</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/privacy">Privacy</Link>
        </nav>
      </section>
    </main>
  );
}

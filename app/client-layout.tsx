"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../src/lib/utils";
import type { ReactNode } from "react";
import { AlertNavLink } from "../src/components/alerts/alert-nav-link";

const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_");

const ClerkProvider = hasClerkKey
  ? dynamic(() => import("@clerk/nextjs").then((mod) => mod.ClerkProvider), { ssr: false })
  : null;

const SignedIn = hasClerkKey
  ? dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignedIn), { ssr: false })
  : null;

const SignedOut = hasClerkKey
  ? dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignedOut), { ssr: false })
  : null;

const UserButton = hasClerkKey
  ? dynamic(() => import("@clerk/nextjs").then((mod) => mod.UserButton), { ssr: false })
  : null;

const NAV_LINKS = [
  { href: "/", label: "Today" },
  { href: "/latest", label: "Latest" },
  { href: "/topics", label: "Topics" },
  { href: "/companies", label: "Companies" },
  { href: "/products", label: "Products" },
];

function useDarkMode() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle, mounted };
}

function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle, mounted } = useDarkMode();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-wide items-center justify-between px-4 lg:px-8">
        <Link
          href="/"
          className="text-[0.78rem] font-bold uppercase leading-[1.05] tracking-[0.12em] text-text-primary"
        >
          <span className="block">Sports Tech</span>
          <span className="block">Intelligence</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b py-1 text-caption font-medium transition-colors",
                pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(`${link.href}/`))
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          {hasClerkKey && SignedIn && (
            <SignedIn>
              <Link
                href="/watchlist"
                className={cn(
                  "border-b border-transparent py-1 text-caption font-medium transition-colors",
                  pathname.startsWith("/watchlist")
                    ? "border-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Watchlist
              </Link>
            </SignedIn>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="inline-flex px-2 py-2 text-caption font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Search
          </Link>
          <button
            onClick={toggle}
            className="hidden px-2 py-2 text-caption font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline-flex"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted ? (dark ? "Light" : "Dark") : "Theme"}
          </button>
          {hasClerkKey && SignedIn && SignedOut && UserButton ? (
            <>
              <SignedIn>
                <AlertNavLink />
              </SignedIn>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="hidden border border-text-primary px-3 py-2 text-caption font-medium text-text-primary transition-colors hover:bg-text-primary hover:text-bg sm:inline-flex"
                >
                  Sign in
                </Link>
              </SignedOut>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="hidden border border-text-primary px-3 py-2 text-caption font-medium text-text-primary transition-colors hover:bg-text-primary hover:text-bg sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg lg:hidden">
            <nav className="flex flex-col px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "border-b border-border-subtle px-0 py-3 text-sm font-medium transition-colors",
                    pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(`${link.href}/`))
                      ? "text-accent"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                className="border-b border-border-subtle px-0 py-3 text-sm font-medium text-text-secondary"
              >
                Search
              </Link>
              <button onClick={toggle} className="border-b border-border-subtle px-0 py-3 text-left text-sm font-medium text-text-secondary">
                {mounted ? (dark ? "Light mode" : "Dark mode") : "Theme"}
              </button>
              {hasClerkKey && SignedOut ? (
                <SignedOut>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="border-b border-border-subtle px-0 py-3 text-sm font-medium text-text-secondary">Sign in</Link>
                </SignedOut>
              ) : !hasClerkKey ? (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="border-b border-border-subtle px-0 py-3 text-sm font-medium text-text-secondary">Sign in</Link>
              ) : null}
              {hasClerkKey && SignedIn && (
                <SignedIn>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Watchlist
                  </Link>
                  <Link
                    href="/alerts"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Alerts
                  </Link>
                  <Link
                    href="/vendor"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    href="/settings/billing"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Billing
                  </Link>
                </SignedIn>
              )}
            </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-wide px-4 py-10 lg:px-8">
        <div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-sm font-semibold text-text-primary">Sports Tech Intelligence</p>
            <p className="mt-2 max-w-md text-caption text-text-tertiary">Independent coverage of sports technology, companies, products and research.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[{ href: "/", label: "Today" }, { href: "/latest", label: "Latest" }, { href: "/topics", label: "Topics" }, { href: "/companies", label: "Companies" }, { href: "/products", label: "Products" }, { href: "/privacy", label: "Privacy" }].map((item) => (
              <Link key={item.href} href={item.href} className="text-caption text-text-secondary transition-colors hover:text-text-primary">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-5 text-[0.7rem] text-text-tertiary">&copy; {new Date().getFullYear()} Sports Technology Intelligence</p>
      </div>
    </footer>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  if (!hasClerkKey || !ClerkProvider) {
    return (
      <>
        <Navigation />
        {children}
        <Footer />
      </>
    );
  }

  return (
    <ClerkProvider>
      <Navigation />
      {children}
      <Footer />
    </ClerkProvider>
  );
}

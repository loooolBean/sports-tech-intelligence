"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { cn } from "../src/lib/utils";
import type { ReactNode } from "react";
import { AlertNavLink } from "../src/components/alerts/alert-nav-link";
import { PublicAnalytics } from "../src/components/analytics/public-analytics";

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="mobile-safe-x mx-auto flex h-16 max-w-wide items-center justify-between lg:h-[68px] lg:px-8">
        <Link
          href="/"
          className="tap-target inline-flex items-center gap-2 text-[0.72rem] font-extrabold uppercase leading-[1.05] tracking-[0.13em] text-text-primary sm:text-[0.78rem]"
          aria-label="Sports Tech Intelligence home"
        >
          <span className="h-7 w-1 bg-accent" aria-hidden="true" />
          <span>
          <span className="block">Sports Tech</span>
          <span className="block">Intelligence</span>
          </span>
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

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            className="tap-target inline-flex items-center justify-center gap-2 px-2 text-caption font-medium text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <button
            onClick={toggle}
            className="tap-target hidden items-center justify-center gap-2 px-2 text-caption font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline-flex"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted ? (dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />) : null}
            <span>{mounted ? (dark ? "Light" : "Dark") : "Theme"}</span>
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
            className="tap-target flex items-center justify-center text-text-secondary transition-colors hover:text-text-primary lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-bg lg:hidden">
          <nav className="mobile-safe-x mx-auto flex max-w-wide flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
              <p className="editorial-kicker mb-3">Explore the intelligence</p>
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex min-h-14 items-center justify-between border-b border-border py-3 font-display text-[1.65rem] font-semibold leading-none transition-colors",
                    pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(`${link.href}/`))
                      ? "text-accent"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  <span>{link.label}</span>
                  <span className="font-sans text-[0.65rem] font-semibold tracking-[0.12em] text-text-tertiary">0{index + 1}</span>
                </Link>
              ))}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href="/search" onClick={() => setMobileOpen(false)} className="tap-target flex items-center justify-center gap-2 border border-border bg-bg-card px-4 text-sm font-semibold text-text-primary">
                  <Search className="h-4 w-4" aria-hidden="true" /> Search
                </Link>
                <button onClick={toggle} className="tap-target flex items-center justify-center gap-2 border border-border bg-bg-card px-4 text-sm font-semibold text-text-primary">
                  {mounted && dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                  {mounted ? (dark ? "Light" : "Dark") : "Theme"}
                </button>
              </div>
              {hasClerkKey && SignedOut ? (
                <SignedOut>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="tap-target mt-3 flex items-center text-sm font-medium text-text-secondary">Sign in</Link>
                </SignedOut>
              ) : !hasClerkKey ? (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="tap-target mt-3 flex items-center text-sm font-medium text-text-secondary">Sign in</Link>
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
      <div className="mobile-safe-x mx-auto max-w-wide py-10 lg:px-8">
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
        <PublicAnalytics />
      </>
    );
  }

  return (
    <ClerkProvider>
      <Navigation />
      {children}
      <Footer />
      <PublicAnalytics />
    </ClerkProvider>
  );
}

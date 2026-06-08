"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { cn } from "../src/lib/utils";
import type { ReactNode } from "react";

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
  { href: "/search", label: "Search" },
  { href: "/newsletter", label: "Newsletter" },
];

function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          <span className="hidden sm:inline">Sports Tech Intelligence</span>
          <span className="sm:hidden">STI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-caption font-medium transition-colors",
                pathname === link.href
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
              )}
            >
              {link.label}
            </Link>
          ))}
          {hasClerkKey && SignedIn && (
            <SignedIn>
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-md px-3 py-1.5 text-caption font-medium transition-colors",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className={cn(
                  "rounded-md px-3 py-1.5 text-caption font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
                )}
              >
                Admin
              </Link>
            </SignedIn>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {hasClerkKey && SignedIn && SignedOut && UserButton ? (
            <>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="rounded-md bg-text-primary px-3 py-1.5 text-caption font-medium text-bg transition-colors hover:bg-text-secondary"
                >
                  Sign in
                </Link>
              </SignedOut>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-text-primary px-3 py-1.5 text-caption font-medium text-bg transition-colors hover:bg-text-secondary"
            >
              Sign in
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border bg-bg md:hidden"
          >
            <nav className="flex flex-col px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-caption font-medium transition-colors",
                    pathname === link.href
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-caption font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >
                    Admin
                  </Link>
                </SignedIn>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-content px-4 py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-caption text-text-tertiary">
            &copy; {new Date().getFullYear()} Sports Technology Intelligence
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="text-caption text-text-tertiary hover:text-text-secondary transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
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

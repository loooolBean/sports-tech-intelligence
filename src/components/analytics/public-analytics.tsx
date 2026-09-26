"use client";

import { Analytics, track, type BeforeSendEvent } from "@vercel/analytics/react";
import { useEffect } from "react";

const PRIVATE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/watchlist",
  "/alerts",
  "/vendor",
  "/settings",
  "/billing",
  "/sign-in",
  "/sign-up",
];

const EVENT_NAMES = new Set([
  "article_clicked",
  "original_source_clicked",
  "search_submitted",
  "topic_clicked",
  "company_clicked",
  "product_clicked",
  "signup_clicked",
]);

function isPrivatePath(pathname: string) {
  return (
    PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    /^\/companies\/[^/]+\/claim(?:\/|$)/.test(pathname)
  );
}

function filterPrivateEvents(event: BeforeSendEvent) {
  if (event.type === "event") return event;
  try {
    const pathname = new URL(event.url, window.location.origin).pathname;
    return isPrivatePath(pathname) ? null : event;
  } catch {
    return null;
  }
}

function eventForPath(pathname: string) {
  if (pathname.startsWith("/article/")) return "article_clicked";
  if (pathname.startsWith("/topics/")) return "topic_clicked";
  if (pathname.startsWith("/companies/")) return "company_clicked";
  if (pathname.startsWith("/products/")) return "product_clicked";
  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) return "signup_clicked";
  return null;
}

export function PublicAnalytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;

      const explicitEvent = anchor.dataset.analyticsEvent;
      if (explicitEvent && EVENT_NAMES.has(explicitEvent)) {
        track(explicitEvent);
        return;
      }

      try {
        const destination = new URL(anchor.href, window.location.origin);
        if (destination.origin !== window.location.origin) return;
        const eventName = eventForPath(destination.pathname);
        if (eventName === "signup_clicked") {
          track(eventName);
          return;
        }
        if (isPrivatePath(window.location.pathname) || isPrivatePath(destination.pathname)) return;
        if (eventName) track(eventName);
      } catch {
        // Ignore malformed or browser-managed links.
      }
    };

    const onSubmit = (event: SubmitEvent) => {
      if (isPrivatePath(window.location.pathname) || !(event.target instanceof HTMLFormElement)) return;
      const action = new URL(event.target.action || window.location.href, window.location.origin);
      if (action.pathname === "/search") track("search_submitted");
    };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  return <Analytics beforeSend={filterPrivateEvents} />;
}

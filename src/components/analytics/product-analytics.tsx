"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { privateAnalyticsPath, routeEvent } from "@/src/lib/analytics-policy";

export const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export function ProductAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!analyticsEnabled || lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (privateAnalyticsPath(pathname) || window.location.search) posthog.stopSessionRecording();
    else posthog.startSessionRecording();
    const event = routeEvent(pathname);
    if (event) posthog.capture(event, { path: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled) return;
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || privateAnalyticsPath(window.location.pathname)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (anchor.dataset.analyticsEvent === "original_source_clicked") {
        posthog.capture("original_source_clicked", { path: window.location.pathname });
      }
      const destination = new URL(anchor.href, window.location.origin);
      if (anchor.closest("[data-search-results]") && destination.origin === window.location.origin && /^\/(article|companies|products|research)\/[^/]+\/?$/.test(destination.pathname)) {
        posthog.capture("search_result_clicked", { path: destination.pathname });
      }
    };
    const submit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement) || privateAnalyticsPath(window.location.pathname)) return;
      const form = event.target;
      if (["/search", "/companies", "/products"].includes(new URL(form.action, window.location.origin).pathname) && form.querySelector('[name="q"]')) {
        // Count usage without sending the visitor's free-text search query.
        posthog.capture("search_submitted", { path: window.location.pathname });
      }
    };
    document.addEventListener("click", click);
    document.addEventListener("submit", submit);
    return () => { document.removeEventListener("click", click); document.removeEventListener("submit", submit); };
  }, []);
  return null;
}

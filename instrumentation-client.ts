import posthog from "posthog-js";
import { privateAnalyticsPath, scrubAnalyticsProperties } from "@/src/lib/analytics-policy";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
if (token && host) {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
    capture_pageview: "history_change",
    autocapture: false,
    capture_pageleave: false,
    person_profiles: "identified_only",
    disable_session_recording: privateAnalyticsPath(window.location.pathname) || Boolean(window.location.search),
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
      blockSelector: 'iframe, [data-private], .cl-rootBox',
      recordCrossOriginIframes: false,
    },
    before_send(event) {
      if (!event) return null;
      // Drop admin/account traffic and recordings, including during SPA transitions.
      if (privateAnalyticsPath(window.location.pathname) && !["$identify", "$create_alias", "signup_started"].includes(event.event)) return null;
      if (event.event === "$snapshot" && window.location.search) return null;
      scrubAnalyticsProperties(event.properties);
      return event;
    },
  });
}

// Stop before the next route's private UI can mount, not only after an effect.
export function onRouterTransitionStart() {
  if (token && host) posthog.stopSessionRecording();
}

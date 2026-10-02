export const PRODUCT_EVENTS = [
  "article_opened", "original_source_clicked", "topic_opened", "search_submitted",
  "search_result_clicked", "company_opened", "product_opened", "save_added",
  "watch_added", "signup_started", "signup_completed", "pricing_viewed",
  "checkout_started", "checkout_completed", "subscription_activated", "subscription_cancelled",
] as const;
export type ProductEvent = typeof PRODUCT_EVENTS[number];

export function privateAnalyticsPath(path: string) {
  return /^\/(admin|dashboard|watchlist|alerts|vendor|settings|billing|checkout|sign-in|sign-up)(\/|$)/.test(path)
    || /^\/companies\/[^/]+\/claim(?:\/|$)/.test(path);
}

export function routeEvent(path: string): ProductEvent | null {
  if (/^\/article\/[^/]+\/?$/.test(path)) return "article_opened";
  if (/^\/topics\/[^/]+\/?$/.test(path)) return "topic_opened";
  if (/^\/companies\/[^/]+\/?$/.test(path)) return "company_opened";
  if (/^\/products\/[^/]+\/?$/.test(path)) return "product_opened";
  if (path === "/pricing") return "pricing_viewed";
  if (/^\/sign-up\/?$/.test(path)) return "signup_started";
  return null;
}

export function cleanAnalyticsUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}

export function scrubAnalyticsProperties(properties: Record<string, unknown>) {
  for (const key of ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"]) {
    if (typeof properties[key] === "string") properties[key] = cleanAnalyticsUrl(properties[key] as string);
  }
  for (const key of ["$set", "$set_once"]) {
    const nested = properties[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) scrubAnalyticsProperties(nested as Record<string, unknown>);
  }
}

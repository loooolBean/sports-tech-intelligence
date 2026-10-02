import "server-only";
import { cache } from "react";
import { reportingWindow } from "./admin-health";
import { requireAdminUser } from "./auth";

export type Report<T> = { data: T; status: "Connected" } | { data: null; status: "Not connected" | "Unavailable" };
type Row = (string | number | null)[];
export type GrowthReport = {
  visitorsToday: number; articleViewsToday: number; searches: number; watchers: number; savers: number;
  visitors: number; pageviews: number; signups: number;
  days: { day: string; visitors: number; pageviews: number; signups: number }[];
  top: { path: string; views: number }[];
  referrers: { name: string; visitors: number }[];
  latestEvent: string | null;
};

export function posthogApiHost() {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  return host.replace("us.i.posthog.com", "us.posthog.com").replace("eu.i.posthog.com", "eu.posthog.com").replace(/\/$/, "");
}

export async function queryPosthog(query: string): Promise<Row[]> {
  const response = await fetch(`${posthogApiHost()}/api/projects/${encodeURIComponent(process.env.POSTHOG_PROJECT_ID!)}/query/`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("PostHog report unavailable");
  const result = await response.json();
  if (!Array.isArray(result.results)) throw new Error("PostHog query is not ready");
  return result.results;
}

export async function getArticleViews(slugs: string[]): Promise<Report<Record<string, number>>> {
  if (!(await requireAdminUser())) throw new Error("Administrator access required");
  if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return { data: null, status: "Not connected" };
  if (!slugs.length) return { data: {}, status: "Connected" };
  // Only database slugs enter this literal list; escape both backslashes and quotes.
  const paths = slugs.map(slug => "'" + ("/article/" + slug).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'").join(",");
  const start = reportingWindow().since.toISOString().slice(0, 19).replace("T", " ");
  try {
    const rows = await queryPosthog(`SELECT properties.path, count() FROM events WHERE event = 'article_opened' AND timestamp >= toDateTime('${start}', 'UTC') AND timestamp <= now() AND properties.path IN (${paths}) GROUP BY 1`);
    const views = Object.fromEntries(slugs.map(slug => [slug, 0]));
    for (const row of rows) views[String(row[0]).slice("/article/".length)] = Number(row[1]);
    return { data: views, status: "Connected" };
  } catch { return { data: null, status: "Unavailable" }; }
}

export const getGrowthReport = cache(async (): Promise<Report<GrowthReport>> => {
  if (!(await requireAdminUser())) throw new Error("Administrator access required");
  if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return { data: null, status: "Not connected" };
  const { today, since } = reportingWindow();
  const sqlDate = (date: Date) => `toDateTime('${date.toISOString().slice(0,19).replace("T", " ")}', 'UTC')`;
  const from = `FROM events WHERE timestamp >= ${sqlDate(since)} AND timestamp <= now()`;
  try {
    const [totals, days, top, referrers] = await Promise.all([
      queryPosthog(`SELECT uniqIf(distinct_id, event = '$pageview' AND timestamp >= ${sqlDate(today)}), countIf(event = 'article_opened' AND timestamp >= ${sqlDate(today)}), countIf(event = 'search_submitted'), uniqIf(distinct_id, event = 'watch_added'), uniqIf(distinct_id, event = 'save_added'), uniqIf(distinct_id, event = '$pageview'), countIf(event = '$pageview'), countIf(event = 'signup_completed'), max(timestamp) ${from}`),
      queryPosthog(`SELECT formatDateTime(timestamp, '%Y-%m-%d', 'Asia/Shanghai'), uniqIf(distinct_id, event = '$pageview'), countIf(event = '$pageview'), countIf(event = 'signup_completed') ${from} GROUP BY 1 ORDER BY 1`),
      queryPosthog(`SELECT properties.path, count() ${from} AND event = 'article_opened' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
      queryPosthog(`SELECT properties.$referring_domain, uniq(distinct_id) ${from} AND event = '$pageview' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
    ]);
    const t = totals[0];
    if (!t) throw new Error("Missing totals");
    return { status: "Connected", data: {
      visitorsToday: Number(t[0]), articleViewsToday: Number(t[1]), searches: Number(t[2]), watchers: Number(t[3]), savers: Number(t[4]),
      visitors: Number(t[5]), pageviews: Number(t[6]), signups: Number(t[7]), latestEvent: t[8] ? String(t[8]) : null,
      days: Array.from({ length: 7 }, (_, index) => {
        const day = new Date(since.getTime() + (index * 24 + 8) * 3600_000).toISOString().slice(0,10);
        const row = days.find(r => r[0] === day);
        return { day, visitors: Number(row?.[1] ?? 0), pageviews: Number(row?.[2] ?? 0), signups: Number(row?.[3] ?? 0) };
      }),
      top: top.filter(r => typeof r[0] === "string" && /^\/article\/[^/]+\/?$/.test(r[0])).map(r => ({ path: String(r[0]), views: Number(r[1]) })),
      referrers: referrers.map(r => ({ name: String(r[0] || "Direct / unknown"), visitors: Number(r[1]) })),
    } };
  } catch { return { data: null, status: "Unavailable" }; }
});

import assert from "node:assert/strict";
import test from "node:test";
import { aiHealth, jobHealth, reportingWindow } from "../src/lib/admin-health";
import { PRODUCT_EVENTS, privateAnalyticsPath, routeEvent, cleanAnalyticsUrl, scrubAnalyticsProperties } from "../src/lib/analytics-policy";

test("Beijing reporting rolls over at 16:00 UTC, not host midnight", () => {
  assert.equal(reportingWindow(new Date("2026-10-01T15:59:59Z")).today.toISOString(), "2026-09-30T16:00:00.000Z");
  const { today, since } = reportingWindow(new Date("2026-10-01T16:00:00Z"));
  assert.equal(today.toISOString(), "2026-10-01T16:00:00.000Z");
  assert.equal(since.toISOString(), "2026-09-25T16:00:00.000Z");
  assert.equal(reportingWindow(new Date("2027-01-01T00:00:00Z")).today.toISOString(), "2026-12-31T16:00:00.000Z");
});

test("daily job health distinguishes absent, running, failed, recent, and stale", () => {
  const now = new Date("2026-10-02T10:00:00Z");
  const job = { status: "SUCCEEDED", startedAt: new Date("2026-10-01T09:00:00Z"), finishedAt: new Date("2026-10-01T09:10:00Z") };
  assert.equal(jobHealth(null, now), "No data yet");
  assert.equal(jobHealth(job, now), "Healthy");
  assert.equal(jobHealth({ ...job, status: "FAILED" }, now), "Needs attention");
  assert.equal(jobHealth({ ...job, status: "RUNNING", finishedAt: null }, now), "Needs attention");
  assert.equal(jobHealth({ ...job, finishedAt: new Date("2026-10-01T07:59:59Z") }, now), "Needs attention");
});

test("AI configuration alone is not healthy", () => {
  assert.equal(aiHealth(false, 0, 0, null), "Not connected");
  assert.equal(aiHealth(true, 0, 0, null), "No data yet");
  assert.equal(aiHealth(true, 1, 0, new Date()), "Needs attention");
  assert.equal(aiHealth(true, 0, 5, new Date()), "Needs attention");
  assert.equal(aiHealth(true, 0, 0, new Date()), "Healthy");
});

test("exactly sixteen snake_case product events and route events", () => {
  assert.equal(PRODUCT_EVENTS.length, 16);
  assert.equal(new Set(PRODUCT_EVENTS).size, 16);
  for (const event of PRODUCT_EVENTS) assert.match(event, /^[a-z]+(?:_[a-z]+)+$/);
  const routes = { "/article/story": "article_opened", "/topics/wearables": "topic_opened", "/companies/company": "company_opened", "/products/product": "product_opened", "/pricing": "pricing_viewed", "/sign-up": "signup_started" };
  for (const [path, event] of Object.entries(routes)) assert.equal(routeEvent(path), event);
  for (const path of ["/admin", "/companies/company/claim", "/products", "/billing/success", "/sign-up/verify-email-address", "/sign-upper"]) assert.equal(routeEvent(path), null);
});

test("private pages are excluded without blocking similarly named public routes", () => {
  for (const path of ["/admin", "/admin/content", "/dashboard", "/watchlist", "/alerts", "/vendor", "/settings/billing", "/billing/success", "/sign-in", "/sign-up/verify", "/companies/a/claim"]) assert.equal(privateAnalyticsPath(path), true, path);
  for (const path of ["/", "/article/a", "/companies/a", "/products/a", "/topics/ai", "/pricing", "/administrator"]) assert.equal(privateAnalyticsPath(path), false, path);
});

test("URL query/hash are removed from event and initial person properties", () => {
  assert.equal(cleanAnalyticsUrl("https://example.com/search?q=private#secret"), "https://example.com/search");
  assert.equal(cleanAnalyticsUrl("invalid"), "");
  const properties = { $current_url: "https://example.com/search?q=private", $set: { $initial_current_url: "https://example.com/?token=secret" }, $set_once: { $initial_referrer: "https://example.org/?email=private" }, path: "/search" };
  scrubAnalyticsProperties(properties);
  assert.equal(properties.$current_url, "https://example.com/search");
  assert.equal(properties.$set.$initial_current_url, "https://example.com/");
  assert.equal(properties.$set_once.$initial_referrer, "https://example.org/");
  assert.equal(properties.path, "/search");
});

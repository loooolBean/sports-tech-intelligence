import "server-only";
import { cache } from "react";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { requireAdminUser } from "./auth";
import { getStripe } from "./stripe";
import { billingProvider, getPaddle, paddleSandbox } from "./paddle";
import { aiHealth, jobHealth, reportingWindow } from "./admin-health";
import type { Report } from "./posthog-reporting";

export const assertAdmin = cache(async () => {
  const user = await requireAdminUser();
  if (!user) throw new Error("Administrator access required");
  return user;
});

async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Report timed out")), 8000);
    })]);
  } finally { if (timer) clearTimeout(timer); }
}

async function loadOperations() {
  const { today } = reportingWindow();
  const [fetched, published, hidden, failed, aiFailures, pending, missingCategories, latest, jobs, failures, lastAi, watches, syncedUsers, subscribers, lastWebhook] = await Promise.all([
    prisma.article.count({ where: { createdAt: { gte: today } } }),
    prisma.article.count({ where: { firstPublishedAt: { gte: today } } }),
    prisma.article.count({ where: { hiddenAt: { gte: today }, isHiddenFromFeed: true } }),
    prisma.ingestionFailure.count({ where: { createdAt: { gte: today } } }),
    prisma.ingestionFailure.count({ where: { status: "OPEN", stage: "ai_processing" } }),
    prisma.article.count({ where: { status: "DRAFT", duplicateOfId: null, aiSummary: { is: null } } }),
    prisma.article.count({ where: { status: { in: ["DRAFT", "PUBLISHED"] }, isHiddenFromFeed: false, category: { slug: "uncategorized" } } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, isFeatured: true, isHiddenFromFeed: true, status: true } }),
    prisma.jobRun.findMany({ orderBy: { startedAt: "desc" }, take: 40 }),
    prisma.ingestionFailure.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, stage: true, createdAt: true, source: { select: { name: true } } } }),
    prisma.aiSummary.findFirst({ where: { model: { not: "manual" } }, orderBy: { generatedAt: "desc" }, select: { generatedAt: true } }),
    prisma.$transaction([prisma.watchedCompany.count(), prisma.watchedProduct.count(), prisma.watchedTechnology.count(), prisma.savedArticle.count()]),
    prisma.user.count(),
    prisma.subscription.findMany({ orderBy: { updatedAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } }),
    billingProvider() === "paddle" ? prisma.paddleEvent.findFirst({ orderBy: { processedAt: "desc" } }) : prisma.stripeEvent.findFirst({ orderBy: { processedAt: "desc" } }),
  ]);
  const rss = jobs.find(j => j.jobName === "rss-ingestion") ?? null;
  const seo = jobs.find(j => j.jobName === "seo-metadata") ?? null;
  return { fetched, published, hidden, failed, aiFailures, pending, missingCategories, latest, jobs, failures, lastAi,
    watches, syncedUsers, subscribers, lastWebhook, rss, seo,
    rssHealth: jobHealth(rss), seoHealth: jobHealth(seo),
    aiHealth: aiHealth(Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY), aiFailures, pending, lastAi?.generatedAt ?? null),
  };
}

export const getBusinessReport = cache(async (): Promise<Report<Awaited<ReturnType<typeof loadOperations>>>> => {
  await assertAdmin();
  if (!process.env.DATABASE_URL) return { status: "Not connected", data: null };
  try { return { status: "Connected", data: await loadOperations() }; }
  catch { return { status: "Unavailable", data: null }; }
});

async function loadUsers() {
  const client = await clerkClient();
  const { today } = reportingWindow();
  const first = await bounded(client.users.getUserList({ limit: 100, orderBy: "-created_at" }));
  let recent = first.data;
  let todayCount = recent.filter(u => u.createdAt >= today.getTime()).length;
  let offset = recent.length;
  while (recent.length === 100 && recent[99].createdAt >= today.getTime() && offset < first.totalCount && offset < 1000) {
    recent = (await bounded(client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" }))).data;
    todayCount += recent.filter(u => u.createdAt >= today.getTime()).length;
    offset += recent.length;
  }
  const complete = offset >= first.totalCount || recent.length < 100 || recent[recent.length-1]?.createdAt < today.getTime();
  return { total: first.totalCount, today: complete ? todayCount : null, development: process.env.CLERK_SECRET_KEY?.startsWith("sk_test_") ?? false,
    users: first.data.slice(0,30).map(u => ({ id: u.id, name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed account", email: u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress ?? "", createdAt: new Date(u.createdAt), lastActiveAt: u.lastActiveAt ? new Date(u.lastActiveAt) : null })) };
}

export const getUsersReport = cache(async (): Promise<Report<Awaited<ReturnType<typeof loadUsers>>>> => {
  await assertAdmin();
  if (!process.env.CLERK_SECRET_KEY) return { status: "Not connected", data: null };
  try { return { status: "Connected", data: await bounded(loadUsers()) }; }
  catch { return { status: "Unavailable", data: null }; }
});

async function loadRevenue() {
  if (billingProvider() === "paddle") {
    let active = 0, trialing = 0, pastDue = 0, cancelled = 0, scanned = 0;
    for await (const subscription of getPaddle().subscriptions.list({ priceId: [process.env.PADDLE_PRO_PRICE_ID!], perPage: 100 })) {
      if (++scanned > 2000) throw new Error("Subscription report exceeded limit");
      if (subscription.status === "active") active++;
      if (subscription.status === "trialing") trialing++;
      if (subscription.status === "past_due") pastDue++;
      if (subscription.status === "canceled") cancelled++;
    }
    return { active, trialing, pastDue, cancelled, testMode: paddleSandbox(), invoices: [] as { id: string; number: string | null; amount: number; currency: string; attempted: number }[] };
  }
  const stripe = getStripe();
  let active = 0, trialing = 0, pastDue = 0, cancelled = 0;
  let scanned = 0;
  // Stripe is authoritative; test and unrelated prices do not count as paying customers.
  for await (const s of stripe.subscriptions.list({ status: "all", price: process.env.STRIPE_PRO_PRICE_ID, limit: 100 }, { timeout: 6000, maxNetworkRetries: 0 })) {
    if (++scanned > 2000) throw new Error("Subscription report requires pagination beyond the small-site limit");
    if (s.status === "active") active++;
    if (s.status === "trialing") trialing++;
    if (["past_due", "unpaid", "incomplete"].includes(s.status)) pastDue++;
    if (s.status === "canceled") cancelled++;
  }
  const invoices = await stripe.invoices.list({ limit: 20, status: "open" }, { timeout: 6000, maxNetworkRetries: 0 });
  return { active, trialing, pastDue, cancelled, testMode: !process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"),
    invoices: invoices.data.filter(i => i.attempt_count > 0).map(i => ({ id: i.id, number: i.number, amount: i.amount_due / 100, currency: i.currency.toUpperCase(), attempted: i.attempt_count })) };
}

export const getRevenueReport = cache(async (): Promise<Report<Awaited<ReturnType<typeof loadRevenue>>>> => {
  await assertAdmin();
  if (billingProvider() === "paddle" ? (!process.env.PADDLE_API_KEY || !process.env.PADDLE_PRO_PRICE_ID) : (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRO_PRICE_ID)) return { status: "Not connected", data: null };
  try { return { status: "Connected", data: await bounded(loadRevenue()) }; }
  catch { return { status: "Unavailable", data: null }; }
});

export const getDeploymentReport = cache(async (): Promise<Report<{ state: string; url: string; created: number }>> => {
  await assertAdmin();
  if (!process.env.VERCEL_READ_TOKEN || !process.env.VERCEL_PROJECT_ID) return { status: "Not connected", data: null };
  try {
    const params = new URLSearchParams({ projectId: process.env.VERCEL_PROJECT_ID, target: "production", limit: "1" });
    if (process.env.VERCEL_TEAM_ID) params.set("teamId", process.env.VERCEL_TEAM_ID);
    const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_READ_TOKEN}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error("Deployment read failed");
    const deployment = (await response.json()).deployments?.[0];
    if (!deployment) throw new Error("No production deployment");
    return { status: "Connected", data: { state: deployment.readyState ?? deployment.state, url: deployment.url, created: deployment.created } };
  } catch { return { status: "Unavailable", data: null }; }
});

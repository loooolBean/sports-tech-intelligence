"use server";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getPaddle, isPaddleConfigured, isPaddleProPrice } from "@/src/lib/paddle";
import { absoluteUrl } from "@/src/lib/stripe";
import { captureProductEvent } from "@/src/lib/posthog-server";

export async function startPaddleCheckout() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fpricing");
  if (!isPaddleConfigured()) redirect("/pricing?error=checkout-unavailable");
  let transactionId: string;
  let destination: "checkout" | "billing" | "confirming" = "checkout";
  try {
    const paddle = getPaddle();
    const price = await paddle.prices.get(process.env.PADDLE_PRO_PRICE_ID!);
    if (!isPaddleProPrice(price)) throw new Error("Price differs from published offer");
    const outcome = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`checkout:${user.id}`}, 0))`;
      const existing = await tx.subscription.findUnique({ where: { userId: user.id } });
      if (existing && ["active", "trialing", "past_due", "paused"].includes(existing.status)) return { id: "", destination: "billing" as const };
      if (existing?.paddleCheckoutId) {
        const pending = await paddle.transactions.get(existing.paddleCheckoutId);
        if (["completed", "paid", "billed"].includes(pending.status) && existing.status !== "canceled") return { id: pending.id, destination: "confirming" as const };
        if (["draft", "ready"].includes(pending.status) && pending.customData?.userId === user.id && pending.items.length === 1 && pending.items[0].price?.id === price.id) return { id: pending.id, destination: "checkout" as const };
      }
      const transaction = await paddle.transactions.create({ items: [{ priceId: price.id, quantity: 1 }],
        ...(existing?.paddleCustomerId ? { customerId: existing.paddleCustomerId } : {}),
        customData: { userId: user.id }, checkout: { url: absoluteUrl("/checkout") } });
      await tx.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id, billingProvider: "paddle", paddleCheckoutId: transaction.id }, update: { paddleCheckoutId: transaction.id } });
      return { id: transaction.id, destination: "checkout" as const };
    }, { maxWait: 10000, timeout: 35000 });
    transactionId = outcome.id;
    destination = outcome.destination;
  } catch { redirect("/pricing?error=checkout-unavailable"); }
  if (destination === "billing") redirect("/settings/billing");
  if (destination === "confirming") redirect("/billing/success");
  await captureProductEvent(user.clerkUserId, "checkout_started", { checkout_id: transactionId, provider: "paddle" }, transactionId);
  redirect(`/checkout?transaction_id=${encodeURIComponent(transactionId)}`);
}

export async function openPaddlePortal() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in");
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!subscription?.paddleCustomerId) redirect("/pricing");
  let url: string;
  try {
    const portal = await getPaddle().customerPortalSessions.create(subscription.paddleCustomerId,
      subscription.paddleSubscriptionId ? [subscription.paddleSubscriptionId] : []);
    url = portal.urls.general.overview;
  } catch { redirect("/settings/billing?error=portal-unavailable"); }
  redirect(url);
}

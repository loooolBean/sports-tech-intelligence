import { Plan, type Prisma } from "@prisma/client";
import type { Subscription } from "@paddle/paddle-node-sdk";

export async function syncPaddleSubscription(subscription: Subscription, tx: Prisma.TransactionClient) {
  const existing = await tx.subscription.findFirst({ where: { OR: [
    { paddleSubscriptionId: subscription.id }, { paddleCustomerId: subscription.customerId },
  ] } });
  const hint = subscription.customData?.userId;
  const userId = existing?.userId ?? (typeof hint === "string" ? hint : null);
  if (!userId) throw new Error("Subscription has no associated account");
  if (existing?.paddleSubscriptionId && existing.paddleSubscriptionId !== subscription.id
    && !["active", "trialing"].includes(subscription.status)) return existing;
  const entitled = ["active", "trialing"].includes(subscription.status)
    && subscription.items.some(item => item.price.id === process.env.PADDLE_PRO_PRICE_ID);
  const data = { billingProvider: "paddle", paddleCustomerId: subscription.customerId,
    paddleSubscriptionId: subscription.id, status: subscription.status,
    plan: entitled ? Plan.PRO : Plan.FREE,
    currentPeriodEnd: subscription.currentBillingPeriod?.endsAt ? new Date(subscription.currentBillingPeriod.endsAt) : null,
    cancelAtPeriodEnd: subscription.scheduledChange?.action === "cancel",
  };
  return tx.subscription.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

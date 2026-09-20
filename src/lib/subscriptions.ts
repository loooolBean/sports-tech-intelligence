import { Plan, Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "./prisma";

function periodEnd(subscription: Stripe.Subscription) {
  const value = subscription.items.data[0]?.current_period_end;
  return value ? new Date(value * 1000) : null;
}

export function subscriptionPlan(status: string) {
  return status === "active" || status === "trialing" ? Plan.PRO : Plan.FREE;
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  userIdHint?: string | null,
  tx: Prisma.TransactionClient = prisma,
) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = userIdHint ?? subscription.metadata.userId ?? null;
  const existing = await tx.subscription.findFirst({
    where: { OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId: customerId }] },
    select: { userId: true },
  });
  const resolvedUserId = existing?.userId ?? userId;
  if (!resolvedUserId) throw new Error(`Unable to associate Stripe subscription ${subscription.id} with a user.`);
  return tx.subscription.upsert({
    where: { userId: resolvedUserId },
    create: {
      userId: resolvedUserId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan: subscriptionPlan(subscription.status),
      status: subscription.status,
      currentPeriodEnd: periodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan: subscriptionPlan(subscription.status),
      status: subscription.status,
      currentPeriodEnd: periodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

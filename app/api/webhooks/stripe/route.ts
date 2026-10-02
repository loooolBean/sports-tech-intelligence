import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getStripe } from "@/src/lib/stripe";
import { syncStripeSubscription } from "@/src/lib/subscriptions";
import { captureProductEvent } from "@/src/lib/posthog-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let subscription: Stripe.Subscription | null = null;
  let userId: string | null = null;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    userId = session.metadata?.userId ?? session.client_reference_id ?? null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (subscriptionId) subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    subscription = event.data.object;
    userId = subscription.metadata.userId ?? null;
  }

  const processed = await prisma.$transaction(async (tx) => {
    const inserted = await tx.stripeEvent.createMany({ data: [{ id: event.id, type: event.type }], skipDuplicates: true });
    if (!inserted.count) return null;
    if (!subscription) return { userId: null, activated: false, cancelled: false };
    const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const previous = await tx.subscription.findFirst({ where: { stripeCustomerId: customer } });
    const synced = await syncStripeSubscription(subscription, userId, tx);
    return { userId: synced.userId,
      activated: ["active", "trialing"].includes(synced.status) && !["active", "trialing"].includes(previous?.status ?? ""),
      cancelled: synced.status === "canceled" && previous?.status !== "canceled",
    };
  });
  if (!processed) return NextResponse.json({ received: true, duplicate: true });

  if (processed.userId) {
    const user = await prisma.user.findUnique({ where: { id: processed.userId }, select: { clerkUserId: true } });
    if (user) {
      if (event.type === "checkout.session.completed") await captureProductEvent(user.clerkUserId, "checkout_completed", {}, event.id);
      if (processed.activated) await captureProductEvent(user.clerkUserId, "subscription_activated", {}, event.id);
      if (processed.cancelled) await captureProductEvent(user.clerkUserId, "subscription_cancelled", {}, event.id);
    }
  }

  return NextResponse.json({ received: true });
}

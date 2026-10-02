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
  if (!webhookSecret) return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let subscriptionId: string | null = null;
  let customerId: string | null = null;
  let userId: string | null = null;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    userId = session.metadata?.userId ?? session.client_reference_id ?? null;
    subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
    customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    subscriptionId = subscription.id;
    customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    userId = subscription.metadata.userId ?? null;
  }

  const processed = await prisma.$transaction(async (tx) => {
    const inserted = await tx.stripeEvent.createMany({ data: [{ id: event.id, type: event.type }], skipDuplicates: true });
    if (!inserted.count) return null;
    if (!subscriptionId || !customerId) return { userId: null, activated: false, cancelled: false };
    // Serialize updates for a customer and fetch current state inside that lock.
    // Stripe may deliver events out of order, including an old "active" snapshot.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${customerId}, 0))`;
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const previous = await tx.subscription.findFirst({ where: { stripeCustomerId: customer } });
    const synced = await syncStripeSubscription(subscription, userId, tx);
    return { userId: synced.userId,
      activated: ["active", "trialing"].includes(synced.status) && !["active", "trialing"].includes(previous?.status ?? ""),
      cancelled: synced.status === "canceled" && previous?.status !== "canceled",
    };
  }, { maxWait: 10000, timeout: 35000 });
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

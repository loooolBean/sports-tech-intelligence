import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getStripe } from "@/src/lib/stripe";
import { syncStripeSubscription } from "@/src/lib/subscriptions";

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
    if (!inserted.count) return false;
    if (subscription) await syncStripeSubscription(subscription, userId, tx);
    return true;
  });
  if (!processed) return NextResponse.json({ received: true, duplicate: true });

  return NextResponse.json({ received: true });
}

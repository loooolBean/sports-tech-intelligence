import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getPaddle, paddleSandbox } from "@/src/lib/paddle";
import { syncPaddleSubscription } from "@/src/lib/paddle-subscriptions";
import { captureProductEvent } from "@/src/lib/posthog-server";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !process.env.PADDLE_API_KEY || !process.env.PADDLE_PRO_PRICE_ID) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  const signature = request.headers.get("paddle-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const paddle = getPaddle();
  let event;
  try { event = await paddle.webhooks.unmarshal(await request.text(), secret, signature); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }
  const data = event.data as { id?: string; customerId?: string; subscriptionId?: string };
  const isSubscription = event.eventType.startsWith("subscription.");
  const isCompleted = event.eventType === "transaction.completed";
  if ((!isSubscription && !isCompleted) || !data.id) return NextResponse.json({ received: true, ignored: true });
  // Current provider state is fetched only after serialization, so delayed events cannot roll access back.
  const processed = await prisma.$transaction(async tx => {
    const inserted = await tx.paddleEvent.createMany({ data: [{ id: event.eventId, type: event.eventType }], skipDuplicates: true });
    if (!inserted.count) return null;
    if (!data.customerId) throw new Error("Missing customer");
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`paddle:${data.customerId}`}, 0))`;
    const transaction = isCompleted ? await paddle.transactions.get(data.id!) : null;
    const subscriptionId = isSubscription ? data.id : transaction?.subscriptionId;
    if (!subscriptionId) return null;
    const subscription = await paddle.subscriptions.get(subscriptionId);
    const previous = await tx.subscription.findFirst({ where: { paddleCustomerId: subscription.customerId } });
    if (!subscription.items.some(item => item.price.id === process.env.PADDLE_PRO_PRICE_ID) && previous?.paddleSubscriptionId !== subscription.id) return null;
    const synced = await syncPaddleSubscription(subscription, tx);
    return { userId: synced.userId, subscriptionId: subscription.id, completed: transaction?.status === "completed",
      // Paddle can send subscription.created before transaction.completed. Record
      // initial activation after checkout completion so the ordered funnel is valid.
      activated: synced.plan === "PRO" && transaction?.status === "completed" && transaction.origin !== "subscription_recurring",
      cancelled: synced.status === "canceled" && previous?.status !== "canceled" };
  }, { maxWait: 10000, timeout: 35000 });
  if (processed) {
    const user = await prisma.user.findUnique({ where: { id: processed.userId }, select: { clerkUserId: true } });
    if (user) {
      const properties = { provider: "paddle", is_test: paddleSandbox() };
      if (processed.completed) await captureProductEvent(user.clerkUserId, "checkout_completed", properties, event.eventId);
      if (processed.activated) await captureProductEvent(user.clerkUserId, "subscription_activated", properties, processed.subscriptionId);
      if (processed.cancelled) await captureProductEvent(user.clerkUserId, "subscription_cancelled", properties, event.eventId);
    }
  }
  return NextResponse.json({ received: true });
}

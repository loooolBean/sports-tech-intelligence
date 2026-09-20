"use server";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { absoluteUrl, getStripe } from "@/src/lib/stripe";

export async function startProCheckout() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fpricing%3Fcheckout%3Dstart");
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) redirect("/pricing?error=stripe-not-configured");
  const stripe = getStripe();
  let localSubscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  let customerId = localSubscription?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined, metadata: { userId: user.id } });
    customerId = customer.id;
    localSubscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }
  if (localSubscription?.plan === "PRO" && ["active", "trialing"].includes(localSubscription.status)) redirect("/settings/billing");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
    success_url: absoluteUrl("/billing/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: absoluteUrl("/pricing?checkout=cancelled"),
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  redirect(session.url);
}

export async function openBillingPortal() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fsettings%2Fbilling");
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!subscription?.stripeCustomerId) redirect("/pricing");
  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: absoluteUrl("/settings/billing"),
  });
  redirect(session.url);
}

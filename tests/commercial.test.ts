import assert from "node:assert/strict";
import test from "node:test";
import { Plan, Prisma } from "@prisma/client";
import { isProSubscription, PLAN_LIMITS } from "../src/lib/entitlements";
import { subscriptionPlan, syncStripeSubscription } from "../src/lib/subscriptions";
import { formatPrice, isPurchasableProPrice } from "../src/lib/billing-policy";
import type Stripe from "stripe";

test("only active and trialing Pro subscriptions unlock Pro", () => {
  assert.equal(isProSubscription(Plan.PRO, "active"), true);
  assert.equal(isProSubscription(Plan.PRO, "trialing"), true);
  assert.equal(isProSubscription(Plan.PRO, "past_due"), false);
  assert.equal(isProSubscription(Plan.PRO, "canceled"), false);
  assert.equal(isProSubscription(Plan.FREE, "active"), false);
});

test("a delayed cancellation cannot overwrite a newer active subscription", async () => {
  let updated = false;
  const tx = { subscription: {
    findFirst: async () => ({ userId: "user-1", stripeSubscriptionId: "sub_new", status: "active" }),
    upsert: async () => { updated = true; throw new Error("Should not overwrite"); },
  } } as unknown as Prisma.TransactionClient;
  const old = { id: "sub_old", customer: "cus_1", status: "canceled", metadata: { userId: "user-1" } } as unknown as Stripe.Subscription;
  const result = await syncStripeSubscription(old, "user-1", tx);
  assert.equal(result.status, "active");
  assert.equal(updated, false);
});

test("Stripe lifecycle statuses map to the expected local plan", () => {
  assert.equal(subscriptionPlan("active"), Plan.PRO);
  assert.equal(subscriptionPlan("trialing"), Plan.PRO);
  assert.equal(subscriptionPlan("incomplete"), Plan.FREE);
  assert.equal(subscriptionPlan("past_due"), Plan.FREE);
  assert.equal(subscriptionPlan("canceled"), Plan.FREE);
});

test("commercial limits remain centralized", () => {
  assert.equal(PLAN_LIMITS.FREE.watchedEntities, 5);
  assert.equal(PLAN_LIMITS.FREE.compareProducts, 2);
  assert.equal(PLAN_LIMITS.PRO.compareProducts, 4);
  assert.equal(PLAN_LIMITS.PRO.watchedEntities, Number.POSITIVE_INFINITY);
});

test("checkout only offers an active fixed monthly price", () => {
  const price = { active: true, type: "recurring", recurring: { interval: "month", interval_count: 1 }, billing_scheme: "per_unit", unit_amount: 2950, currency: "usd" } as Stripe.Price;
  assert.equal(isPurchasableProPrice(price), true);
  assert.equal(isPurchasableProPrice({ ...price, active: false }), false);
  assert.equal(isPurchasableProPrice({ ...price, unit_amount: null }), false);
  assert.equal(isPurchasableProPrice({ ...price, recurring: { ...price.recurring!, interval: "year" } }), false);
  assert.equal(isPurchasableProPrice({ ...price, recurring: { ...price.recurring!, interval_count: 3 } }), false);
  assert.equal(formatPrice(price), "$29.50");
  assert.equal(formatPrice({ ...price, currency: "jpy", unit_amount: 3000 }), "¥3,000");
});

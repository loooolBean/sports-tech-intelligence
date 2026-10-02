import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Paddle, type Price, type Subscription } from "@paddle/paddle-node-sdk";
import type { Prisma } from "@prisma/client";
import { isPaddleProPrice } from "../src/lib/paddle";
import { syncPaddleSubscription } from "../src/lib/paddle-subscriptions";

test("Paddle checkout enforces the published $15 USD monthly offer", () => {
  const price = { status: "active", billingCycle: { interval: "month", frequency: 1 }, unitPrice: { currencyCode: "USD", amount: "1500" }, trialPeriod: null } as Price;
  assert.equal(isPaddleProPrice(price), true);
  assert.equal(isPaddleProPrice({ ...price, status: "archived" }), false);
  assert.equal(isPaddleProPrice({ ...price, unitPrice: { currencyCode: "USD", amount: "2900" } }), false);
  assert.equal(isPaddleProPrice({ ...price, billingCycle: { interval: "year", frequency: 1 } }), false);
});

test("Paddle signatures reject a changed payload or the wrong secret", async () => {
  const paddle = new Paddle("test-only-placeholder");
  const body = '{"event_type":"transaction.completed"}';
  const secret = "test-only-webhook-secret";
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = createHmac("sha256", secret).update(`${timestamp}:${body}`).digest("hex");
  const signature = `ts=${timestamp};h1=${hash}`;
  assert.equal(await paddle.webhooks.isSignatureValid(body, secret, signature), true);
  assert.equal(await paddle.webhooks.isSignatureValid(body + " ", secret, signature), false);
  assert.equal(await paddle.webhooks.isSignatureValid(body, "incorrect-secret", signature), false);
});

test("Paddle access follows subscription state and only the configured product", async () => {
  process.env.PADDLE_PRO_PRICE_ID = "pri_pro";
  let stored: Record<string, unknown> = {};
  const tx = { subscription: {
    findFirst: async () => null,
    upsert: async ({ create }: { create: Record<string, unknown> }) => { stored = create; return create; },
  } } as unknown as Prisma.TransactionClient;
  const subscription = { id: "sub_1", customerId: "ctm_1", customData: { userId: "user-1" }, status: "active", items: [{ price: { id: "pri_pro" } }], currentBillingPeriod: { endsAt: "2026-11-03T00:00:00Z" }, scheduledChange: null } as unknown as Subscription;
  await syncPaddleSubscription(subscription, tx);
  assert.equal(stored.plan, "PRO");
  await syncPaddleSubscription({ ...subscription, status: "past_due" }, tx);
  assert.equal(stored.plan, "FREE");
  await syncPaddleSubscription({ ...subscription, status: "canceled" }, tx);
  assert.equal(stored.plan, "FREE");
  await syncPaddleSubscription({ ...subscription, items: [] }, tx);
  assert.equal(stored.plan, "FREE");
  await assert.rejects(syncPaddleSubscription({ ...subscription, customData: null }, tx), /associated account/);
});

test("a canceled Paddle subscription cannot replace a newer subscription", async () => {
  const newer = { userId: "user-1", paddleSubscriptionId: "sub_new", status: "active", plan: "PRO" };
  const tx = { subscription: { findFirst: async () => newer, upsert: async () => { throw new Error("must not overwrite"); } } } as unknown as Prisma.TransactionClient;
  const old = { id: "sub_old", customerId: "ctm_1", status: "canceled", customData: null } as unknown as Subscription;
  assert.equal(await syncPaddleSubscription(old, tx), newer);
});

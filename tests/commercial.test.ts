import assert from "node:assert/strict";
import test from "node:test";
import { Plan } from "@prisma/client";
import { isProSubscription, PLAN_LIMITS } from "../src/lib/entitlements";
import { subscriptionPlan } from "../src/lib/subscriptions";

test("only active and trialing Pro subscriptions unlock Pro", () => {
  assert.equal(isProSubscription(Plan.PRO, "active"), true);
  assert.equal(isProSubscription(Plan.PRO, "trialing"), true);
  assert.equal(isProSubscription(Plan.PRO, "past_due"), false);
  assert.equal(isProSubscription(Plan.PRO, "canceled"), false);
  assert.equal(isProSubscription(Plan.FREE, "active"), false);
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

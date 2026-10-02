import { Environment, Paddle, type Price } from "@paddle/paddle-node-sdk";

export function billingProvider() { return process.env.BILLING_PROVIDER === "stripe" ? "stripe" : "paddle"; }
export function paddleSandbox() { return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT !== "production"; }
export function isPaddleConfigured() {
  // Never let public production visitors obtain Pro through test payments.
  if (process.env.VERCEL_ENV === "production" && paddleSandbox()) return false;
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  // Enable the public upgrade path only after a draft Sandbox transaction
  // confirms that Paddle's default payment link has been configured.
  return Boolean(process.env.PADDLE_CHECKOUT_ENABLED === "true"
    && process.env.PADDLE_API_KEY && process.env.PADDLE_PRO_PRICE_ID && process.env.PADDLE_WEBHOOK_SECRET
    && token?.startsWith(paddleSandbox() ? "test_" : "live_"));
}
export function getPaddle() {
  if (!process.env.PADDLE_API_KEY) throw new Error("Paddle is not configured");
  return new Paddle(process.env.PADDLE_API_KEY, { environment: paddleSandbox() ? Environment.sandbox : Environment.production });
}
export function isPaddleProPrice(price: Price) {
  return price.status === "active" && price.billingCycle?.interval === "month" && price.billingCycle.frequency === 1
    && price.unitPrice.currencyCode === "USD" && price.unitPrice.amount === "1500" && !price.trialPeriod;
}

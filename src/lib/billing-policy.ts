import type Stripe from "stripe";

// The published offer is one monthly, fixed-price subscription.
export function isPurchasableProPrice(price: Stripe.Price) {
  return price.active && price.type === "recurring" && price.recurring?.interval === "month"
    && price.recurring.interval_count === 1 && price.billing_scheme === "per_unit"
    && price.unit_amount !== null && price.unit_amount > 0;
}

export function formatPrice(price: Stripe.Price) {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency.toUpperCase() });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format((price.unit_amount ?? 0) / 10 ** digits);
}

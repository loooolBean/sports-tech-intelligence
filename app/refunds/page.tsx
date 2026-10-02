import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/src/components/legal-page";
import { BUSINESS } from "@/src/lib/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Sports Tech Intelligence",
  description: "First-subscription refund requests within seven days, renewal rules and how to cancel Sports Tech Intelligence Pro.",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return <LegalPage title="Refunds & cancellation">
    <section><h2>First subscription: 7-day refund window</h2><p>You may request a full refund of your first Pro subscription payment within 7 days of that payment. Email <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a> with your account email and receipt or transaction reference. The request must be sent within the window; it does not need to be processed within it.</p></section>
    <section><h2>Renewals</h2><p>Monthly renewal payments are non-refundable by default. Cancel before your next billing date to avoid another renewal. This rule does not override applicable consumer rights or the payment provider’s applicable refund policy.</p></section>
    <section><h2>Cancel future payments</h2><p>Sign in and open <Link href="/settings/billing">Billing</Link>, then use the billing portal to cancel your subscription. Check the cancellation confirmation for the effective end date. Cancellation normally stops future renewals while access continues until the end of the paid period; it does not itself request a refund.</p><p>If you cannot access Billing, contact us. For Paddle purchases, you can also use your receipt or <a href="https://paddle.net/">Paddle buyer support</a>.</p></section>
    <section><h2>Processing a refund</h2><p>For Paddle purchases, Paddle processes approved refunds as merchant of record. Refund timing depends on the payment method and provider; we do not promise an exact arrival date. Refunded access may end when the refund takes effect.</p><p>Contact us about duplicate or unauthorized charges and service delivery problems so they can be investigated. Do not send full payment-card details.</p></section>
    <section><h2>Your statutory rights</h2><p>Nothing in this policy limits mandatory rights under applicable law. Where applicable law or Paddle’s buyer terms provide greater protection, those rights take precedence over the 7-day window and renewal rule.</p></section>
    <section><h2>Operator</h2><p><span lang="zh-CN">{BUSINESS.legalName}</span> · <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a></p></section>
  </LegalPage>;
}

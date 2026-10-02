import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/src/components/legal-page";
import { BUSINESS } from "@/src/lib/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Terms of Service | Sports Tech Intelligence",
  description: "Terms for using Sports Tech Intelligence, Pro subscriptions, billing and content.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage title="Terms of service">
    <section><h2>1. Operator and service</h2><p>Sports Tech Intelligence is operated by <span lang="zh-CN">{BUSINESS.legalName}</span> in mainland China. Contact <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a> for support. These terms apply to use of our sports technology news, profiles, research and related account features.</p></section>
    <section><h2>2. Accounts and acceptable use</h2><p>Keep your account credentials secure and provide accurate account information. Do not attempt unauthorized access, disrupt the service, bypass access controls or redistribute paid content without permission. You must have the legal capacity to enter a paid subscription.</p></section>
    <section><h2>3. Pro subscriptions</h2><p>The Pro offer is USD 15 per month, billed monthly and renewed automatically until canceled. Applicable taxes and the final payable amount are shown at checkout. Review the current <Link href="/pricing">pricing page</Link> and available content before subscribing. Access requires a confirmed payment and subscription status.</p><p>If checkout is marked as sandbox or test mode, no real payment is collected; test access does not establish a paid subscription.</p></section>
    <section><h2>4. Payments, cancellation and refunds</h2><p>For purchases processed by Paddle, Paddle acts as merchant of record and its buyer terms presented at checkout also apply. Payment processing is handled by the payment provider; we do not store full card details.</p><p>Manage or cancel renewals through <Link href="/settings/billing">Billing</Link>. You may request a refund within 7 days of your first subscription payment. Renewals are non-refundable by default, subject to applicable law and provider policies. Read the <Link href="/refunds">refund and cancellation policy</Link> for the request process and exceptions.</p></section>
    <section><h2>5. Content and sources</h2><p>Content is for general information, not medical, investment or procurement advice. Some summaries are AI-assisted and may contain errors. Check original sources and seek qualified advice when appropriate. Availability of coverage varies; a subscription does not guarantee research on a particular company or product.</p><p>Original source material and third-party trademarks remain the property of their owners. Your access does not transfer ownership of our content or permit resale.</p></section>
    <section><h2>6. Availability and changes</h2><p>We may maintain or update the service and cannot guarantee uninterrupted availability. Material subscription or price changes will be communicated before they apply to your next purchase or renewal. Contact support about service failures; your mandatory consumer rights remain unaffected.</p></section>
    <section><h2>7. Privacy and your rights</h2><p>Our <Link href="/privacy">privacy policy</Link> explains data handling. Nothing in these terms excludes rights or remedies that cannot be excluded under applicable law. Updated terms will be published here with a revised date.</p></section>
  </LegalPage>;
}

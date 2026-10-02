import type { Metadata } from "next";
import { LegalPage } from "@/src/components/legal-page";
import { BUSINESS } from "@/src/lib/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact | Sports Tech Intelligence",
  description: "Contact the operator of Sports Tech Intelligence for support, billing, corrections and privacy requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <LegalPage title="Contact & support">
    <section><h2>Who operates this website?</h2><p>Sports Tech Intelligence is operated by <span lang="zh-CN">{BUSINESS.legalName}</span>, a business in mainland China. This is the operator’s Chinese legal name.</p></section>
    <section><h2>Get in touch</h2><p>For account help, billing, refunds, editorial corrections or privacy requests, email <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a>.</p><p>For a billing issue, include your account email and transaction or receipt reference. Do not send passwords, full card numbers, identity documents or bank details.</p></section>
    <section><h2>Paddle payment support</h2><p>For purchases processed by Paddle, Paddle is the merchant of record. You can also use the support link in your Paddle receipt or visit <a href="https://paddle.net/">Paddle buyer support</a>. Our team remains your contact for the website and its content.</p></section>
  </LegalPage>;
}

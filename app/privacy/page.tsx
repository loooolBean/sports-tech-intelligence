import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy — Sports Technology Intelligence",
  description:
    "How Sports Technology Intelligence collects, uses, and protects your personal information.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const lastUpdated = "June 9, 2026";

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-prose px-4 py-16 lg:px-8">
        <nav className="mb-8 text-caption text-text-tertiary">
          <Link href="/" className="hover:text-text-secondary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Privacy Policy</span>
        </nav>

        <h1 className="text-display text-text-primary">Privacy Policy</h1>
        <p className="mt-4 text-caption text-text-tertiary">
          Last updated: {lastUpdated}
        </p>

        <div className="prose-article mt-10 space-y-6">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              When you subscribe to our newsletter or create an account, we collect your
              email address. We also collect anonymous usage data such as page views,
              referral sources, and device type to improve our content and services.
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Deliver newsletter content you have subscribed to</li>
              <li>Improve our articles, site performance, and user experience</li>
              <li>Display relevant advertising and sponsored content</li>
              <li>Respond to inquiries and provide customer support</li>
            </ul>
          </section>

          <section>
            <h2>3. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to understand how visitors interact
              with our site. Third-party advertisers may also use cookies to serve ads
              based on your prior visits to this and other websites. You can control
              cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>
              We use the following third-party services that may collect information:
            </p>
            <ul>
              <li>
                <strong>Clerk</strong> — authentication and user management
              </li>
              <li>
                <strong>Google Analytics</strong> — site traffic analysis
              </li>
              <li>
                <strong>Google AdSense</strong> — advertising (when enabled)
              </li>
              <li>
                <strong>Vercel</strong> — hosting and server infrastructure
              </li>
              <li>
                <strong>Supabase</strong> — database hosting
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share anonymised,
              aggregated data with partners for industry research. We may disclose
              information when required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your email address for as long as your subscription or account
              is active. You may unsubscribe or request deletion at any time by
              contacting us.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct,
              or delete your personal data. To exercise these rights, email us at the
              address below.
            </p>
          </section>

          <section>
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our site is not directed at children under 13. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on
              this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              For questions about this policy, contact us at{" "}
              <a href="mailto:privacy@sportstechintelligence.com">
                privacy@sportstechintelligence.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}


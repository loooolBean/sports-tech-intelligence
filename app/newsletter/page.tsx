import { subscribeToNewsletter } from "../../src/lib/admin";

export const metadata = {
  title: "Daily Sports Technology Newsletter",
  description:
    "Subscribe to daily sports technology intelligence for coaches, sports scientists, and performance teams.",
};

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-content px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="overline text-accent">Newsletter</span>
          <h1 className="mt-4 text-display text-text-primary max-lg:text-[2.5rem]">
            Stay ahead of the game
          </h1>
          <p className="mt-6 text-body-lg text-text-secondary">
            Get concise updates on wearables, athlete monitoring, GPS tracking,
            recovery technology, performance analytics, and sports science
            research — delivered to your inbox daily.
          </p>

          {/* Subscribe Form */}
          <form action={subscribeToNewsletter} className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="flex-1 rounded-lg border border-border bg-bg-card px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-3 text-caption font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-caption text-text-tertiary">
              Free forever. No spam. Unsubscribe anytime.
            </p>
          </form>

          {/* Features */}
          <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <span className="text-lg">📊</span>
              </div>
              <h3 className="mt-4 text-h3 text-text-primary">Daily Digest</h3>
              <p className="mt-2 text-body text-text-secondary">
                Curated sports technology news and insights every morning.
              </p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <span className="text-lg">🔬</span>
              </div>
              <h3 className="mt-4 text-h3 text-text-primary">Research Updates</h3>
              <p className="mt-2 text-body text-text-secondary">
                Latest findings in sports science and performance technology.
              </p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <span className="text-lg">💡</span>
              </div>
              <h3 className="mt-4 text-h3 text-text-primary">Expert Insights</h3>
              <p className="mt-2 text-body text-text-secondary">
                Analysis from leading sports technology professionals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "../../src/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-content px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-h1 text-text-primary">Dashboard</h1>
          <p className="mt-3 text-body-lg text-text-secondary">
            Signed in as {user.email}. Your current role is {user.role}.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-6">
              <h2 className="text-h3 text-text-primary">Newsletter Preferences</h2>
              <p className="mt-2 text-body text-text-secondary">
                Subscribe to the daily sports technology briefing.
              </p>
              <Link
                className="mt-5 inline-flex rounded-md border border-border px-4 py-2 text-caption font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
                href="/newsletter"
              >
                Manage newsletter
              </Link>
            </div>

            {user.role === "ADMIN" && (
              <div className="card-surface p-6">
                <h2 className="text-h3 text-text-primary">Admin Console</h2>
                <p className="mt-2 text-body text-text-secondary">
                  Manage articles, sources, subscribers, and ingestion failures.
                </p>
                <Link
                  className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-caption font-medium text-white transition-colors hover:bg-accent-hover"
                  href="/admin"
                >
                  Open Admin Console
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

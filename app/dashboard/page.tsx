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
            <Link
              href="/newsletter"
              className="group card-surface p-6"
            >
              <h2 className="text-h3 text-text-primary group-hover:text-accent transition-colors">
                Newsletter Preferences
              </h2>
              <p className="mt-2 text-body text-text-secondary">
                Subscribe to the daily sports technology briefing.
              </p>
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="group card-surface p-6"
              >
                <h2 className="text-h3 text-text-primary group-hover:text-accent transition-colors">
                  Admin Console
                </h2>
                <p className="mt-2 text-body text-text-secondary">
                  Manage articles, sources, subscribers, and ingestion failures.
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

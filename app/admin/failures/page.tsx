import { getAdminFailures, resolveFailure } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminFailuresPage() {
  const failures = await getAdminFailures();

  return (
    <div>
      <h1 className="text-h1 text-text-primary">Failure Logs</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        {failures.map((failure) => (
          <div key={failure.id} className="border-b border-border p-5 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="overline text-accent">
                  {failure.status} · {failure.stage}
                </p>
                <h2 className="mt-2 font-semibold text-text-primary">{failure.errorMessage}</h2>
                <p className="mt-1 text-body text-text-secondary">
                  {failure.source?.name ?? "Unknown source"} · {failure.url ?? "No URL"}
                </p>
                <p className="mt-1 text-body text-text-tertiary">{failure.createdAt.toLocaleString()}</p>
              </div>
              {failure.status === "OPEN" ? (
                <form action={resolveFailure}>
                  <input name="failureId" type="hidden" value={failure.id} />
                  <button className="rounded-md border border-border bg-bg-card px-3 py-2 text-caption font-medium text-text-secondary" type="submit">
                    Mark Resolved
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getAdminFailures, resolveFailure } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminFailuresPage() {
  const failures = await getAdminFailures();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Failure Logs</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        {failures.map((failure) => (
          <div key={failure.id} className="border-b border-slate-200 p-5 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  {failure.status} · {failure.stage}
                </p>
                <h2 className="mt-2 font-semibold text-slate-950">{failure.errorMessage}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {failure.source?.name ?? "Unknown source"} · {failure.url ?? "No URL"}
                </p>
                <p className="mt-1 text-sm text-slate-500">{failure.createdAt.toLocaleString()}</p>
              </div>
              {failure.status === "OPEN" ? (
                <form action={resolveFailure}>
                  <input name="failureId" type="hidden" value={failure.id} />
                  <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" type="submit">
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

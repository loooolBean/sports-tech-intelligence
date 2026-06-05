import { SourceType } from "@prisma/client";
import { createSource, getAdminSources, toggleSourceStatus } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await getAdminSources();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Sources</h1>
      <form action={createSource} className="mt-6 grid gap-4 rounded-lg border border-slate-200 p-5 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" name="name" placeholder="Source name" required />
        <select className="rounded-md border border-slate-300 px-3 py-2" name="sourceType" defaultValue={SourceType.RSS}>
          {Object.values(SourceType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" name="rssUrl" placeholder="RSS URL" />
        <input className="rounded-md border border-slate-300 px-3 py-2" name="websiteUrl" placeholder="Website URL" />
        <input className="rounded-md border border-slate-300 px-3 py-2" max="10" min="0" name="reputationScore" placeholder="Reputation score 0-10" step="0.1" type="number" />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="submit">
          Add Source
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        {sources.map((source) => (
          <div key={source.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 last:border-b-0">
            <div>
              <h2 className="font-semibold text-slate-950">{source.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{source.sourceType} · score {String(source.reputationScore)}</p>
              <p className="mt-1 text-sm text-slate-500">{source.rssUrl ?? source.websiteUrl ?? "No URL"}</p>
            </div>
            <form action={toggleSourceStatus}>
              <input name="sourceId" type="hidden" value={source.id} />
              <input name="isActive" type="hidden" value={source.isActive ? "false" : "true"} />
              <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" type="submit">
                {source.isActive ? "Disable" : "Enable"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

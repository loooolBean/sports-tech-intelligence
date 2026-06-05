import Link from "next/link";
import { getAdminTags } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAdminTags();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Tags</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {tags.map((tag) => (
          <Link key={tag.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50" href={`/tag/${tag.slug}`}>
            <h2 className="font-semibold text-slate-950">{tag.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{tag._count.articleTags} articles · /tag/{tag.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getAdminTags } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAdminTags();

  return (
    <div>
      <h1 className="text-h1 text-text-primary">Tags</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {tags.map((tag) => (
          <Link key={tag.id} className="rounded-lg border border-border p-4 hover:bg-bg-elevated" href={`/tag/${tag.slug}`}>
            <h2 className="font-semibold text-text-primary">{tag.name}</h2>
            <p className="mt-1 text-body text-text-secondary">{tag._count.articleTags} articles · /tag/{tag.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

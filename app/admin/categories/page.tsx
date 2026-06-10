import { getAdminCategories, saveCategory } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-h1 text-text-primary">Categories</h1>
      <form action={saveCategory} className="mt-6 grid gap-4 rounded-lg border border-border p-5">
        <input className="rounded-md border border-border bg-bg-card px-3 py-2" name="name" placeholder="Category name" required />
        <textarea className="min-h-24 rounded-md border border-border bg-bg-card px-3 py-2" name="description" placeholder="SEO category description" />
        <button className="w-fit rounded-md bg-accent hover:bg-accent-hover px-4 py-2 text-caption font-medium text-white" type="submit">
          Add Category
        </button>
      </form>
      <div className="mt-6 grid gap-4">
        {categories.map((category) => (
          <form key={category.id} action={saveCategory} className="rounded-lg border border-border p-5">
            <input name="categoryId" type="hidden" value={category.id} />
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
              <input className="rounded-md border border-border bg-bg-card px-3 py-2" name="name" defaultValue={category.name} />
              <input className="rounded-md border border-border bg-bg-card px-3 py-2" name="description" defaultValue={category.description ?? ""} />
              <button className="rounded-md border border-border px-4 py-2 text-caption font-medium text-text-secondary" type="submit">
                Save
              </button>
            </div>
            <p className="mt-2 text-body text-text-tertiary">{category._count.articles} articles · /category/{category.slug}</p>
          </form>
        ))}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
export default async function LegacyArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  redirect("/admin/content" + (status ? "?status=" + encodeURIComponent(status) : ""));
}

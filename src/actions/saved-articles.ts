"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { captureProductEvent } from "@/src/lib/posthog-server";

export async function setArticleSaved(_previous: { message: string }, form: FormData) {
  const articleId = String(form.get("articleId") ?? "");
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fdashboard");
  if (!articleId || !["true", "false"].includes(String(form.get("saved")))) return { message: "Invalid request." };
  try {
    const article = await prisma.article.findFirst({ where: { id: articleId, status: "PUBLISHED", isHiddenFromFeed: false }, select: { slug: true } });
    if (!article) return { message: "This article is no longer available." };
    if (form.get("saved") === "true") {
      await prisma.savedArticle.deleteMany({ where: { userId: user.id, articleId } });
    } else {
      const result = await prisma.savedArticle.createMany({ data: [{ userId: user.id, articleId }], skipDuplicates: true });
      if (result.count) await captureProductEvent(user.clerkUserId, "save_added", { article_id: articleId });
    }
    revalidatePath(`/article/${article.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin/users");
    return { message: form.get("saved") === "true" ? "Removed from saved articles." : "Saved to your dashboard." };
  } catch {
    return { message: "Could not update your saved articles. Please try again." };
  }
}

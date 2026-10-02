"use server";
import { revalidatePath, updateTag } from "next/cache";
import { assertAdmin } from "@/src/lib/command-center";
import { prisma } from "@/src/lib/prisma";

export async function quickEditArticle(_previous: { message: string }, form: FormData) {
  await assertAdmin();
  const id = String(form.get("articleId") ?? "");
  const field = String(form.get("field") ?? "");
  const enabled = form.get("enabled") === "true";
  if (!id || !["feature", "hide"].includes(field) || !["true", "false"].includes(String(form.get("enabled")))) return { message: "Invalid action." };
  try {
    const article = await prisma.$transaction(async tx => {
      if (field === "feature") return tx.article.update({ where: { id }, data: { isFeatured: enabled }, select: { slug: true } });
      // Replaying the same request must not change the editorial action date.
      await tx.article.updateMany({ where: { id, isHiddenFromFeed: !enabled }, data: { isHiddenFromFeed: enabled, hiddenAt: enabled ? new Date() : null } });
      return tx.article.findUniqueOrThrow({ where: { id }, select: { slug: true } });
    });
    updateTag("intelligence-feed");
    revalidatePath(`/article/${article.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/articles");
    return { message: "Saved." };
  } catch { return { message: "Could not save. Please try again." }; }
}

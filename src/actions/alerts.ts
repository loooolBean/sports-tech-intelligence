"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { markAlertReadForUser, markAllAlertsReadForUser } from "@/src/lib/alerts";

export async function markAlertRead(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Falerts");
  const alertId = String(formData.get("alertId") ?? "");
  if (alertId) await markAlertReadForUser(user.id, alertId);
  revalidateAlertPaths();
}

export async function markAllAlertsRead() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Falerts");
  await markAllAlertsReadForUser(user.id);
  revalidateAlertPaths();
}

export async function openAlert(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Falerts");
  const alert = await prisma.alert.findFirst({ where: { id: String(formData.get("alertId") ?? ""), userId: user.id }, include: { article: { select: { slug: true } }, company: { select: { slug: true } }, product: { select: { slug: true } } } });
  if (!alert) redirect("/alerts");
  if (!alert.isRead) await markAlertReadForUser(user.id, alert.id);
  revalidateAlertPaths();
  redirect(alert.article ? `/article/${alert.article.slug}` : alert.product ? `/products/${alert.product.slug}` : alert.company ? `/companies/${alert.company.slug}` : "/alerts");
}

function revalidateAlertPaths() {
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}

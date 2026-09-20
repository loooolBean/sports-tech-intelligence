"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { canWatchMore } from "@/src/lib/entitlements";
import { prisma } from "@/src/lib/prisma";
import { unwatchCompanyForUser, unwatchProductForUser, watchCompany, watchProduct } from "@/src/lib/watchlist";

export async function toggleCompanyWatch(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("returnPath"));
  const user = await getCurrentUserProfile();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
  const companyId = String(formData.get("entityId") ?? "");
  const watching = formData.get("watching") === "true";
  if (!companyId || !(await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } }))) throw new Error("Company not found.");
  if (watching) await unwatchCompanyForUser(user.id, companyId);
  else {
    const capacity = await canWatchMore(user.id);
    if (!capacity.allowed) redirect("/pricing?reason=watch-limit");
    await watchCompany(user.id, companyId);
  }
  revalidateWatchPaths(returnPath);
}

export async function toggleProductWatch(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("returnPath"));
  const user = await getCurrentUserProfile();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
  const productId = String(formData.get("entityId") ?? "");
  const watching = formData.get("watching") === "true";
  if (!productId || !(await prisma.product.findUnique({ where: { id: productId }, select: { id: true } }))) throw new Error("Product not found.");
  if (watching) await unwatchProductForUser(user.id, productId);
  else {
    const capacity = await canWatchMore(user.id);
    if (!capacity.allowed) redirect("/pricing?reason=watch-limit");
    await watchProduct(user.id, productId);
  }
  revalidateWatchPaths(returnPath);
}

export async function unwatchCompany(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fwatchlist");
  await unwatchCompanyForUser(user.id, String(formData.get("entityId") ?? ""));
  revalidateWatchPaths("/watchlist");
}

export async function unwatchProduct(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fwatchlist");
  await unwatchProductForUser(user.id, String(formData.get("entityId") ?? ""));
  revalidateWatchPaths("/watchlist");
}

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = String(value ?? "/dashboard");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

function revalidateWatchPaths(returnPath: string) {
  revalidatePath(returnPath);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
}

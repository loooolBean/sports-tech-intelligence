"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/src/lib/auth";
import { validateAffiliateUrl } from "@/src/lib/monetization";
import { prisma } from "@/src/lib/prisma";

export async function saveAffiliateOffer(formData: FormData) {
  if (!(await requireAdminUser())) throw new Error("Administrator access is required.");
  const id = String(formData.get("id") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const partnerName = String(formData.get("partnerName") ?? "").trim();
  const destinationUrl = validateAffiliateUrl(String(formData.get("destinationUrl") ?? "").trim());
  const isActive = formData.get("isActive") === "on";
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !partnerName || partnerName.length > 120) {
    throw new Error("Select a product and enter a partner name (up to 120 characters).");
  }
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!product) throw new Error("Product not found.");
  if (id) {
    const previous = await prisma.affiliateOffer.findUnique({ where: { id }, select: { product: { select: { slug: true } } } });
    if (!previous) throw new Error("Offer not found.");
    await prisma.affiliateOffer.update({ where: { id }, data: { productId, partnerName, destinationUrl, isActive } });
    revalidatePath(`/products/${previous.product.slug}`);
  } else {
    await prisma.affiliateOffer.create({ data: { productId, partnerName, destinationUrl, isActive } });
  }
  revalidatePath("/admin/monetization");
  revalidatePath(`/products/${product.slug}`);
}

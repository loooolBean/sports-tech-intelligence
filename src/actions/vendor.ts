"use server";

import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { requireCompanyManager } from "@/src/lib/vendor";

const claimSchema = z.object({ companyId: z.string().uuid(), workEmail: z.string().trim().email().max(200), jobTitle: z.string().trim().min(2).max(120), message: z.string().trim().min(20).max(2000) });
const companySchema = z.object({ companyId: z.string().uuid(), description: z.string().trim().min(20).max(5000), shortDescription: z.string().trim().min(10).max(300), website: z.union([z.string().url(), z.literal("")]), logoUrl: z.union([z.string().url(), z.literal("")]), country: z.string().trim().max(100), city: z.string().trim().max(100), leadsEnabled: z.boolean() });
const productSchema = z.object({ productId: z.string().uuid(), description: z.string().trim().min(20).max(5000), shortDescription: z.string().trim().min(10).max(300), website: z.union([z.string().url(), z.literal("")]), imageUrl: z.union([z.string().url(), z.literal("")]), vendorProvidedInfo: z.string().trim().max(5000) });
const leadSchema = z.object({ productId: z.string().uuid(), name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(200), organization: z.string().trim().min(2).max(200), jobTitle: z.string().trim().min(2).max(120), message: z.string().trim().min(10).max(2000) });

export async function submitCompanyClaim(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const user = await getCurrentUserProfile();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/companies/${String(formData.get("companySlug") ?? "")}/claim`)}`);
  const parsed = claimSchema.parse({ companyId, workEmail: formData.get("workEmail"), jobTitle: formData.get("jobTitle"), message: formData.get("message") });
  const member = await prisma.companyMember.findFirst({ where: { companyId: parsed.companyId } });
  if (member) throw new Error("This company profile has already been claimed. Contact support if ownership has changed.");
  const existing = await prisma.companyClaim.findUnique({ where: { companyId_userId: { companyId: parsed.companyId, userId: user.id } } });
  if (existing?.status === "PENDING") throw new Error("Your claim is already pending review.");
  if (existing?.status === "APPROVED") redirect("/vendor");
  await prisma.companyClaim.upsert({
    where: { companyId_userId: { companyId: parsed.companyId, userId: user.id } },
    create: { ...parsed, userId: user.id },
    update: { workEmail: parsed.workEmail, jobTitle: parsed.jobTitle, message: parsed.message, status: "PENDING", reviewedAt: null, reviewedById: null },
  });
  revalidatePath("/admin/claims");
  redirect(`/companies/${String(formData.get("companySlug") ?? "")}/claim?submitted=true`);
}

export async function updateVendorCompany(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fvendor");
  const parsed = companySchema.parse({ companyId: formData.get("companyId"), description: formData.get("description"), shortDescription: formData.get("shortDescription"), website: formData.get("website"), logoUrl: formData.get("logoUrl"), country: formData.get("country"), city: formData.get("city"), leadsEnabled: formData.get("leadsEnabled") === "on" });
  const membership = await requireCompanyManager(user.id, parsed.companyId);
  if (!membership) throw new Error("You are not authorized to edit this company.");
  await prisma.company.update({ where: { id: parsed.companyId }, data: { description: parsed.description, shortDescription: parsed.shortDescription, website: parsed.website || null, logoUrl: parsed.logoUrl || null, country: parsed.country || null, city: parsed.city || null, leadsEnabled: parsed.leadsEnabled } });
  revalidatePath(`/companies/${membership.company.slug}`); revalidatePath(`/vendor/companies/${membership.company.slug}`); revalidatePath("/vendor");
  redirect(`/vendor/companies/${membership.company.slug}?saved=true`);
}

export async function updateVendorProduct(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fvendor");
  const parsed = productSchema.parse({ productId: formData.get("productId"), description: formData.get("description"), shortDescription: formData.get("shortDescription"), website: formData.get("website"), imageUrl: formData.get("imageUrl"), vendorProvidedInfo: formData.get("vendorProvidedInfo") });
  const product = await prisma.product.findUnique({ where: { id: parsed.productId }, include: { company: true } });
  if (!product || !(await requireCompanyManager(user.id, product.companyId))) throw new Error("You are not authorized to edit this product.");
  await prisma.product.update({ where: { id: parsed.productId }, data: { description: parsed.description, shortDescription: parsed.shortDescription, website: parsed.website || null, imageUrl: parsed.imageUrl || null, vendorProvidedInfo: parsed.vendorProvidedInfo || null } });
  revalidatePath(`/products/${product.slug}`); revalidatePath(`/vendor/products/${product.slug}`); revalidatePath(`/companies/${product.company.slug}`);
  redirect(`/vendor/products/${product.slug}?saved=true`);
}

export async function submitDemoRequest(formData: FormData) {
  const productSlug = String(formData.get("productSlug") ?? "");
  const user = await getCurrentUserProfile();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/products/${productSlug}?demo=open`)}`);
  const parsed = leadSchema.parse({ productId: formData.get("productId"), name: formData.get("name"), email: formData.get("email"), organization: formData.get("organization"), jobTitle: formData.get("jobTitle"), message: formData.get("message") });
  const product = await prisma.product.findUnique({ where: { id: parsed.productId }, include: { company: { include: { _count: { select: { members: true } } } } } });
  if (!product || !product.company.leadsEnabled || product.company._count.members === 0) throw new Error("Demo requests are not available for this product.");
  const duplicate = await prisma.lead.findFirst({ where: { userId: user.id, productId: product.id, email: parsed.email, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } } });
  if (!duplicate) await prisma.lead.create({ data: { ...parsed, userId: user.id, companyId: product.companyId } });
  revalidatePath("/vendor/leads"); revalidatePath("/admin/leads");
  redirect(`/products/${product.slug}?demo=${duplicate ? "duplicate" : "submitted"}`);
}

export async function updateLeadStatus(formData: FormData) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fvendor%2Fleads");
  const leadId = z.string().uuid().parse(String(formData.get("leadId") ?? ""));
  const status = z.nativeEnum(LeadStatus).parse(String(formData.get("status") ?? ""));
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { companyId: true } });
  if (!lead || !(await requireCompanyManager(user.id, lead.companyId))) throw new Error("You are not authorized to update this lead.");
  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/vendor/leads");
}

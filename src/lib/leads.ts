import { LeadStatus } from "@prisma/client";
import { prisma } from "./prisma";

export async function getVendorLeads(userId: string, page = 1, status?: LeadStatus) {
  const take = 20;
  const safePage = Math.max(1, page);
  const where = { company: { members: { some: { userId } } }, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, include: { company: true, product: true }, orderBy: { createdAt: "desc" }, skip: (safePage - 1) * take, take }),
    prisma.lead.count({ where }),
  ]);
  return { items, total, page: safePage, pages: Math.max(1, Math.ceil(total / take)) };
}

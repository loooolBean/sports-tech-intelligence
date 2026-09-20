import { prisma } from "./prisma";

export async function getManagedCompanies(userId: string) {
  return prisma.companyMember.findMany({ where: { userId }, include: { company: { include: { products: true, _count: { select: { leads: true } } } } }, orderBy: { createdAt: "asc" } });
}

export async function requireCompanyManager(userId: string, companyId: string) {
  return prisma.companyMember.findUnique({ where: { companyId_userId: { companyId, userId } }, include: { company: true } });
}

export async function getCompanyClaimState(companyId: string, userId?: string) {
  const [memberCount, claim] = await Promise.all([
    prisma.companyMember.count({ where: { companyId } }),
    userId ? prisma.companyClaim.findUnique({ where: { companyId_userId: { companyId, userId } } }) : null,
  ]);
  return { isClaimed: memberCount > 0, claim };
}

import { Plan } from "@prisma/client";
import { prisma } from "./prisma";

export const PLAN_LIMITS = {
  FREE: { watchedEntities: 5, compareProducts: 2, evidencePreview: 2 },
  PRO: { watchedEntities: Number.POSITIVE_INFINITY, compareProducts: 4, evidencePreview: Number.POSITIVE_INFINITY },
} as const;

export type UserEntitlements = {
  plan: Plan;
  fullEvidence: boolean;
  fullResearch: boolean;
  advancedCompare: boolean;
  unlimitedWatchlist: boolean;
  advancedFilters: boolean;
  exportData: boolean;
  proReports: boolean;
  watchLimit: number;
  compareLimit: number;
  evidencePreviewLimit: number;
};

const PRO_STATUSES = new Set(["active", "trialing"]);

export async function getUserEntitlements(userId?: string | null): Promise<UserEntitlements> {
  const subscription = userId
    ? await prisma.subscription.findUnique({ where: { userId }, select: { plan: true, status: true } })
    : null;
  const isPro = subscription?.plan === Plan.PRO && PRO_STATUSES.has(subscription.status);
  const plan = isPro ? Plan.PRO : Plan.FREE;
  const limits = PLAN_LIMITS[plan];
  return {
    plan,
    fullEvidence: isPro,
    fullResearch: isPro,
    advancedCompare: isPro,
    unlimitedWatchlist: isPro,
    advancedFilters: isPro,
    exportData: isPro,
    proReports: isPro,
    watchLimit: limits.watchedEntities,
    compareLimit: limits.compareProducts,
    evidencePreviewLimit: limits.evidencePreview,
  };
}

export async function canWatchMore(userId: string) {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.unlimitedWatchlist) return { allowed: true, current: 0, limit: entitlements.watchLimit };
  const [companies, products, technologies] = await Promise.all([
    prisma.watchedCompany.count({ where: { userId } }),
    prisma.watchedProduct.count({ where: { userId } }),
    prisma.watchedTechnology.count({ where: { userId } }),
  ]);
  const current = companies + products + technologies;
  return { allowed: current < entitlements.watchLimit, current, limit: entitlements.watchLimit };
}

export function isProSubscription(plan: Plan, status: string) {
  return plan === Plan.PRO && PRO_STATUSES.has(status);
}

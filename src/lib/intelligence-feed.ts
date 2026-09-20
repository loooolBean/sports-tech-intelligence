export const INTELLIGENCE_CATEGORIES = [
  {
    name: "AI & Sports",
    slug: "ai-sports",
    description: "AI coaching, computer vision, analytics, machine learning and AI products in sport.",
  },
  {
    name: "Performance Technology",
    slug: "performance-technology",
    description: "Athlete monitoring, training systems, GPS, force plates, biomechanics and performance analysis.",
  },
  {
    name: "Wearables & Sensors",
    slug: "wearables-sensors",
    description: "Wearables, sensors, smart clothing, heart-rate technology and recovery devices.",
  },
  {
    name: "Sports Science",
    slug: "sports-science",
    description: "Research, validation studies, sports medicine technology and applied scientific findings.",
  },
  {
    name: "Products & Launches",
    slug: "products-launches",
    description: "New products, product features, hardware releases, software launches and platform updates.",
  },
  {
    name: "Business & Investment",
    slug: "business-investment",
    description: "Funding, acquisitions, partnerships, company strategy and market expansion.",
  },
] as const;

export const FALLBACK_INTELLIGENCE_CATEGORY = {
  name: "Other",
  slug: "other",
  description: "Sports technology intelligence that does not fit one of the six primary topics.",
} as const;

export const INTELLIGENCE_CATEGORY_NAMES = [
  "AI & Sports",
  "Performance Technology",
  "Wearables & Sensors",
  "Sports Science",
  "Products & Launches",
  "Business & Investment",
  "Other",
] as const;

export type IntelligenceCategoryName = (typeof INTELLIGENCE_CATEGORY_NAMES)[number];
export type IntelligencePeriod = "today" | "week" | "all";
export const AUTO_PUBLISH_MINIMUM_SCORE = 35;

export function getIntelligenceCategory(slug: string) {
  return (
    INTELLIGENCE_CATEGORIES.find((category) => category.slug === slug) ??
    (slug === FALLBACK_INTELLIGENCE_CATEGORY.slug ? FALLBACK_INTELLIGENCE_CATEGORY : null)
  );
}

export function parseIntelligencePeriod(value?: string): IntelligencePeriod {
  return value === "today" || value === "week" ? value : "all";
}

export function getFeedPeriodStart(period: IntelligencePeriod, now = new Date()): Date | undefined {
  if (period === "all") return undefined;
  const duration = period === "today" ? 24 : 7 * 24;
  return new Date(now.getTime() - duration * 60 * 60 * 1000);
}

export function normalizeTitleForDuplicate(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|and|or|to|of|for|in|on|with|new|announces?|launches?|introduces?)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleSimilarity(left: string, right: string): number {
  const normalizedLeft = normalizeTitleForDuplicate(left);
  const normalizedRight = normalizeTitleForDuplicate(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;

  const leftTokens = new Set(normalizedLeft.split(" "));
  const rightTokens = new Set(normalizedRight.split(" "));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

export function areIntelligenceTitlesSimilar(left: string, right: string): boolean {
  return titleSimilarity(left, right) >= 0.68;
}

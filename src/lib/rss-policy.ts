import type { Prisma } from "@prisma/client";

// PostgreSQL sorts NULL last for ASC by default. Unfetched sources must get
// their first attempt before repeatedly rotating already-fetched sources.
export const RSS_SOURCE_ORDER: Prisma.SourceOrderByWithRelationInput[] = [
  { lastFetchedAt: { sort: "asc", nulls: "first" } },
  { createdAt: "asc" },
  { id: "asc" },
];

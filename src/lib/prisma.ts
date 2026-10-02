import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function pooledDatabaseUrl() {
  if (!process.env.DATABASE_URL) return undefined;
  const url = new URL(process.env.DATABASE_URL);
  // Serverless instances must not each open a CPU-sized connection pool.
  // Preserve an operator's explicit tuning.
  if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "3");
  if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "10");
  if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "15");
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    ...(process.env.DATABASE_URL ? { datasources: { db: { url: pooledDatabaseUrl() } } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const RETRYABLE_DATABASE_CODES = new Set(["P1001", "P1002", "P2024"]);

function isRetryableDatabaseError(error: unknown): boolean {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      RETRYABLE_DATABASE_CODES.has(error.code)) ||
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error && error.message.includes("Can't reach database server"))
  );
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isRetryableDatabaseError(error)) throw error;

    // The shared pool recovers connections itself. Disconnecting here also
    // tears down other in-flight requests in the same server process.
    console.warn("Transient database connection failure; retrying once.");
    await new Promise((resolve) => setTimeout(resolve, 250));
    return operation();
  }
}

import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const RETRYABLE_DATABASE_CODES = new Set(["P1001", "P1002", "P2024"]);
let reconnecting: Promise<void> | null = null;

function isRetryableDatabaseError(error: unknown): boolean {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      RETRYABLE_DATABASE_CODES.has(error.code)) ||
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error && error.message.includes("Can't reach database server"))
  );
}

async function reconnectPrisma(): Promise<void> {
  if (!reconnecting) {
    reconnecting = prisma
      .$disconnect()
      .catch(() => undefined)
      .finally(() => {
        reconnecting = null;
      });
  }

  await reconnecting;
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isRetryableDatabaseError(error)) throw error;

    console.warn("Transient database connection failure; reconnecting and retrying once.");
    await reconnectPrisma();
    await new Promise((resolve) => setTimeout(resolve, 250));
    return operation();
  }
}

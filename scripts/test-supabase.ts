import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

try {
  const result = await p.$queryRaw`SELECT 1 as test`;
  console.log("Supabase OK:", result);
} catch (e: any) {
  console.error("Supabase ERROR:", e.message);
} finally {
  await p.$disconnect();
}

import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const failures = await p.ingestionFailure.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
for (const f of failures) {
  console.log(`[${f.stage}] ${f.url ?? "no-url"} => ${f.errorMessage.slice(0, 200)}`);
}
await p.$disconnect();

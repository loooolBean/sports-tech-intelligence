import dotenv from "dotenv";
dotenv.config();

import { ArticleSeoMetadataService } from "../src/services/articleSeoMetadataService";

async function main() {
  const service = new ArticleSeoMetadataService();
  console.log("[SEO Backfill] Starting...");
  const result = await service.backfillMissing({ batchSize: 25, overwrite: false });
  console.log("[SEO Backfill] Done:", JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[SEO Backfill] Fatal:", e);
    process.exit(1);
  });

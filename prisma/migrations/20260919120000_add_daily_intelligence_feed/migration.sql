ALTER TABLE "articles"
ADD COLUMN "importance_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_hidden_from_feed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "processed_at" TIMESTAMPTZ(6);

ALTER TABLE "ai_summaries"
ADD COLUMN "why_it_matters" TEXT;

ALTER TABLE "articles"
ADD CONSTRAINT "articles_importance_score_range"
CHECK ("importance_score" >= 0 AND "importance_score" <= 100);

CREATE INDEX "articles_status_is_hidden_from_feed_published_at_idx"
ON "articles"("status", "is_hidden_from_feed", "published_at" DESC);

CREATE INDEX "articles_is_featured_importance_score_published_at_idx"
ON "articles"("is_featured" DESC, "importance_score" DESC, "published_at" DESC);

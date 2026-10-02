BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE "articles" ADD COLUMN "hidden_at" TIMESTAMPTZ(6), ADD COLUMN "first_published_at" TIMESTAMPTZ(6);
-- Historical action times are unknown and intentionally remain NULL.
CREATE TABLE "saved_articles" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "article_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "saved_articles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "saved_articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saved_articles_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "saved_articles_user_id_article_id_key" ON "saved_articles"("user_id", "article_id");
CREATE INDEX "saved_articles_user_id_created_at_idx" ON "saved_articles"("user_id", "created_at" DESC);
-- Saved articles are private. Prisma's trusted server connection owns the table;
-- Supabase's public anon/authenticated REST roles must not read these rows.
ALTER TABLE "saved_articles" ENABLE ROW LEVEL SECURITY;
COMMIT;

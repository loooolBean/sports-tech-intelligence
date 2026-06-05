-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('RSS', 'NEWS_WEBSITE', 'BLOG', 'RESEARCH_WEBSITE');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IngestionFailureStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "organization" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'RSS',
    "website_url" TEXT,
    "rss_url" TEXT,
    "domain" TEXT,
    "reputation_score" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_fetched_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "profile_url" TEXT,
    "organization" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "author_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "normalized_url" TEXT NOT NULL,
    "canonical_url" TEXT,
    "excerpt" TEXT,
    "body" TEXT,
    "content_hash" TEXT,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "duplicate_of_article_id" UUID,
    "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_summaries" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "key_takeaways" JSONB NOT NULL DEFAULT '[]',
    "categories" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "confidence_score" DECIMAL(4,2),
    "model" TEXT NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "article_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "subscribed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMPTZ(6),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_analytics" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "event_date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "newsletter_clicks" INTEGER NOT NULL DEFAULT 0,
    "search_impressions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_failures" (
    "id" UUID NOT NULL,
    "source_id" UUID,
    "url" TEXT,
    "stage" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "error_code" TEXT,
    "payload" JSONB,
    "status" "IngestionFailureStatus" NOT NULL DEFAULT 'OPEN',
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ingestion_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "sources_is_active_sourceType_idx" ON "sources"("is_active", "sourceType");

-- CreateIndex
CREATE INDEX "sources_reputation_score_idx" ON "sources"("reputation_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "authors_name_organization_key" ON "authors"("name", "organization");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_original_url_key" ON "articles"("original_url");

-- CreateIndex
CREATE UNIQUE INDEX "articles_normalized_url_key" ON "articles"("normalized_url");

-- CreateIndex
CREATE UNIQUE INDEX "articles_content_hash_key" ON "articles"("content_hash");

-- CreateIndex
CREATE INDEX "articles_source_id_idx" ON "articles"("source_id");

-- CreateIndex
CREATE INDEX "articles_category_id_published_at_idx" ON "articles"("category_id", "published_at" DESC);

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_status_published_at_idx" ON "articles"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ai_summaries_article_id_key" ON "ai_summaries"("article_id");

-- CreateIndex
CREATE INDEX "ai_summaries_article_id_idx" ON "ai_summaries"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_is_active_idx" ON "newsletter_subscribers"("is_active");

-- CreateIndex
CREATE INDEX "article_analytics_event_date_idx" ON "article_analytics"("event_date");

-- CreateIndex
CREATE UNIQUE INDEX "article_analytics_article_id_event_date_key" ON "article_analytics"("article_id", "event_date");

-- CreateIndex
CREATE INDEX "ingestion_failures_source_id_status_idx" ON "ingestion_failures"("source_id", "status");

-- CreateIndex
CREATE INDEX "ingestion_failures_stage_created_at_idx" ON "ingestion_failures"("stage", "created_at");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_duplicate_of_article_id_fkey" FOREIGN KEY ("duplicate_of_article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_analytics" ADD CONSTRAINT "article_analytics_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_failures" ADD CONSTRAINT "ingestion_failures_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

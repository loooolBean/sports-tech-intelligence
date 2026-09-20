-- Watchlist and in-app alerts are additive and preserve all existing content and users.
CREATE TYPE "AlertType" AS ENUM ('NEW_INTELLIGENCE');

CREATE TABLE "watched_companies" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "watched_companies_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "watched_products" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "watched_products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "watched_technologies" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "technology_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "watched_technologies_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "alerts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "AlertType" NOT NULL DEFAULT 'NEW_INTELLIGENCE',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "company_id" UUID,
  "product_id" UUID,
  "technology_id" UUID,
  "article_id" UUID,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMPTZ(6),
  CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "watched_companies_user_id_created_at_idx" ON "watched_companies"("user_id", "created_at" DESC);
CREATE INDEX "watched_companies_company_id_idx" ON "watched_companies"("company_id");
CREATE UNIQUE INDEX "watched_companies_user_id_company_id_key" ON "watched_companies"("user_id", "company_id");
CREATE INDEX "watched_products_user_id_created_at_idx" ON "watched_products"("user_id", "created_at" DESC);
CREATE INDEX "watched_products_product_id_idx" ON "watched_products"("product_id");
CREATE UNIQUE INDEX "watched_products_user_id_product_id_key" ON "watched_products"("user_id", "product_id");
CREATE INDEX "watched_technologies_user_id_created_at_idx" ON "watched_technologies"("user_id", "created_at" DESC);
CREATE INDEX "watched_technologies_technology_id_idx" ON "watched_technologies"("technology_id");
CREATE UNIQUE INDEX "watched_technologies_user_id_technology_id_key" ON "watched_technologies"("user_id", "technology_id");
CREATE INDEX "alerts_user_id_is_read_created_at_idx" ON "alerts"("user_id", "is_read", "created_at" DESC);
CREATE INDEX "alerts_user_id_created_at_idx" ON "alerts"("user_id", "created_at" DESC);
CREATE INDEX "alerts_company_id_idx" ON "alerts"("company_id");
CREATE INDEX "alerts_product_id_idx" ON "alerts"("product_id");
CREATE INDEX "alerts_technology_id_idx" ON "alerts"("technology_id");
CREATE INDEX "alerts_article_id_idx" ON "alerts"("article_id");
CREATE UNIQUE INDEX "alerts_user_id_article_id_type_key" ON "alerts"("user_id", "article_id", "type");

ALTER TABLE "watched_companies" ADD CONSTRAINT "watched_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_companies" ADD CONSTRAINT "watched_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_products" ADD CONSTRAINT "watched_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_products" ADD CONSTRAINT "watched_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_technologies" ADD CONSTRAINT "watched_technologies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_technologies" ADD CONSTRAINT "watched_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

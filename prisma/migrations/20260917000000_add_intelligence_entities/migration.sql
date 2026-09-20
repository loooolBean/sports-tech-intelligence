-- Add entity-centric intelligence data without altering existing article, user, or ingestion data.
CREATE TABLE "companies" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "short_description" TEXT,
  "website" TEXT,
  "logo_url" TEXT,
  "country" TEXT,
  "city" TEXT,
  "founded_year" INTEGER,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "products" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "short_description" TEXT,
  "website" TEXT,
  "image_url" TEXT,
  "company_id" UUID NOT NULL,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "technologies" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "use_cases" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "use_cases_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "sports" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "product_technologies" ("product_id" UUID NOT NULL, "technology_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "product_technologies_pkey" PRIMARY KEY ("product_id", "technology_id"));
CREATE TABLE "product_use_cases" ("product_id" UUID NOT NULL, "use_case_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "product_use_cases_pkey" PRIMARY KEY ("product_id", "use_case_id"));
CREATE TABLE "product_sports" ("product_id" UUID NOT NULL, "sport_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "product_sports_pkey" PRIMARY KEY ("product_id", "sport_id"));
CREATE TABLE "article_companies" ("article_id" UUID NOT NULL, "company_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "article_companies_pkey" PRIMARY KEY ("article_id", "company_id"));
CREATE TABLE "article_products" ("article_id" UUID NOT NULL, "product_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "article_products_pkey" PRIMARY KEY ("article_id", "product_id"));
CREATE TABLE "article_technologies" ("article_id" UUID NOT NULL, "technology_id" UUID NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "article_technologies_pkey" PRIMARY KEY ("article_id", "technology_id"));

CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug"); CREATE INDEX "companies_name_idx" ON "companies"("name"); CREATE INDEX "companies_is_featured_idx" ON "companies"("is_featured");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug"); CREATE INDEX "products_name_idx" ON "products"("name"); CREATE INDEX "products_company_id_idx" ON "products"("company_id"); CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug"); CREATE INDEX "technologies_name_idx" ON "technologies"("name");
CREATE UNIQUE INDEX "use_cases_slug_key" ON "use_cases"("slug"); CREATE INDEX "use_cases_name_idx" ON "use_cases"("name");
CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug"); CREATE INDEX "sports_name_idx" ON "sports"("name");
CREATE INDEX "product_technologies_technology_id_idx" ON "product_technologies"("technology_id"); CREATE INDEX "product_use_cases_use_case_id_idx" ON "product_use_cases"("use_case_id"); CREATE INDEX "product_sports_sport_id_idx" ON "product_sports"("sport_id"); CREATE INDEX "article_companies_company_id_idx" ON "article_companies"("company_id"); CREATE INDEX "article_products_product_id_idx" ON "article_products"("product_id"); CREATE INDEX "article_technologies_technology_id_idx" ON "article_technologies"("technology_id");

ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_technologies" ADD CONSTRAINT "product_technologies_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "product_technologies" ADD CONSTRAINT "product_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_use_cases" ADD CONSTRAINT "product_use_cases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "product_use_cases" ADD CONSTRAINT "product_use_cases_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "use_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_sports" ADD CONSTRAINT "product_sports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "product_sports" ADD CONSTRAINT "product_sports_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_companies" ADD CONSTRAINT "article_companies_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "article_companies" ADD CONSTRAINT "article_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_products" ADD CONSTRAINT "article_products_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "article_products" ADD CONSTRAINT "article_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- V0.8 commercial intelligence is additive. Existing users, content, watchlists and alerts are preserved.
CREATE TYPE "ResearchStudyType" AS ENUM ('VALIDATION', 'RELIABILITY', 'VALIDITY', 'INTERVENTION', 'OBSERVATIONAL', 'SYSTEMATIC_REVIEW', 'META_ANALYSIS', 'CASE_STUDY', 'OTHER');
CREATE TYPE "EvidenceType" AS ENUM ('RESEARCH_FINDING', 'VALIDATION', 'PROFESSIONAL_ADOPTION', 'PRODUCT_CLAIM', 'OTHER');
CREATE TYPE "EvidenceSourceType" AS ENUM ('PEER_REVIEWED', 'INDEPENDENT', 'PROFESSIONAL_ADOPTION', 'VENDOR_REPORTED');
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "CompanyClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "CompanyMemberRole" AS ENUM ('MANAGER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

ALTER TABLE "companies" ADD COLUMN "leads_enabled" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "research" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "abstract" TEXT,
  "summary" TEXT,
  "authors" TEXT,
  "journal" TEXT,
  "publication_year" INTEGER,
  "publication_date" DATE,
  "doi" TEXT,
  "url" TEXT,
  "study_type" "ResearchStudyType" NOT NULL DEFAULT 'OTHER',
  "population" TEXT,
  "sample_size" INTEGER,
  "is_peer_reviewed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "research_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "research_products" (
  "research_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_products_pkey" PRIMARY KEY ("research_id", "product_id")
);

CREATE TABLE "research_companies" (
  "research_id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_companies_pkey" PRIMARY KEY ("research_id", "company_id")
);

CREATE TABLE "research_technologies" (
  "research_id" UUID NOT NULL,
  "technology_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_technologies_pkey" PRIMARY KEY ("research_id", "technology_id")
);

CREATE TABLE "research_use_cases" (
  "research_id" UUID NOT NULL,
  "use_case_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_use_cases_pkey" PRIMARY KEY ("research_id", "use_case_id")
);

CREATE TABLE "research_sports" (
  "research_id" UUID NOT NULL,
  "sport_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "research_sports_pkey" PRIMARY KEY ("research_id", "sport_id")
);

CREATE TABLE "evidence" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "finding" TEXT,
  "evidence_type" "EvidenceType" NOT NULL,
  "source_type" "EvidenceSourceType" NOT NULL,
  "research_id" UUID,
  "product_id" UUID,
  "company_id" UUID,
  "technology_id" UUID,
  "use_case_id" UUID,
  "sport_id" UUID,
  "metric" TEXT,
  "population" TEXT,
  "sample_size" INTEGER,
  "source_url" TEXT,
  "publication_year" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "plan" "Plan" NOT NULL DEFAULT 'FREE',
  "status" TEXT NOT NULL DEFAULT 'inactive',
  "current_period_end" TIMESTAMPTZ(6),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stripe_events" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "company_claims" (
  "id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "work_email" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "CompanyClaimStatus" NOT NULL DEFAULT 'PENDING',
  "reviewed_at" TIMESTAMPTZ(6),
  "reviewed_by_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "company_claims_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "company_members" (
  "id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "CompanyMemberRole" NOT NULL DEFAULT 'MANAGER',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leads" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "company_id" UUID NOT NULL,
  "product_id" UUID,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organization" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "research_slug_key" ON "research"("slug");
CREATE UNIQUE INDEX "research_doi_key" ON "research"("doi");
CREATE INDEX "research_publication_year_idx" ON "research"("publication_year" DESC);
CREATE INDEX "research_study_type_idx" ON "research"("study_type");
CREATE INDEX "research_is_peer_reviewed_idx" ON "research"("is_peer_reviewed");
CREATE INDEX "research_products_product_id_idx" ON "research_products"("product_id");
CREATE INDEX "research_companies_company_id_idx" ON "research_companies"("company_id");
CREATE INDEX "research_technologies_technology_id_idx" ON "research_technologies"("technology_id");
CREATE INDEX "research_use_cases_use_case_id_idx" ON "research_use_cases"("use_case_id");
CREATE INDEX "research_sports_sport_id_idx" ON "research_sports"("sport_id");
CREATE INDEX "evidence_product_id_source_type_idx" ON "evidence"("product_id", "source_type");
CREATE INDEX "evidence_company_id_idx" ON "evidence"("company_id");
CREATE INDEX "evidence_technology_id_idx" ON "evidence"("technology_id");
CREATE INDEX "evidence_use_case_id_idx" ON "evidence"("use_case_id");
CREATE INDEX "evidence_research_id_idx" ON "evidence"("research_id");
CREATE INDEX "evidence_publication_year_idx" ON "evidence"("publication_year" DESC);
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE UNIQUE INDEX "company_claims_company_id_user_id_key" ON "company_claims"("company_id", "user_id");
CREATE INDEX "company_claims_status_created_at_idx" ON "company_claims"("status", "created_at" DESC);
CREATE INDEX "company_claims_user_id_idx" ON "company_claims"("user_id");
CREATE UNIQUE INDEX "company_members_company_id_user_id_key" ON "company_members"("company_id", "user_id");
CREATE INDEX "company_members_user_id_idx" ON "company_members"("user_id");
CREATE INDEX "leads_company_id_status_created_at_idx" ON "leads"("company_id", "status", "created_at" DESC);
CREATE INDEX "leads_user_id_idx" ON "leads"("user_id");
CREATE INDEX "leads_product_id_idx" ON "leads"("product_id");

ALTER TABLE "research_products" ADD CONSTRAINT "research_products_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_products" ADD CONSTRAINT "research_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_companies" ADD CONSTRAINT "research_companies_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_companies" ADD CONSTRAINT "research_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_technologies" ADD CONSTRAINT "research_technologies_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_technologies" ADD CONSTRAINT "research_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_use_cases" ADD CONSTRAINT "research_use_cases_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_use_cases" ADD CONSTRAINT "research_use_cases_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "use_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_sports" ADD CONSTRAINT "research_sports_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_sports" ADD CONSTRAINT "research_sports_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "use_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_claims" ADD CONSTRAINT "company_claims_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_claims" ADD CONSTRAINT "company_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_claims" ADD CONSTRAINT "company_claims_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

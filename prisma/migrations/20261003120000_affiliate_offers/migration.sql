CREATE TABLE "affiliate_offers" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "partner_name" TEXT NOT NULL,
    "destination_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "affiliate_offers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "affiliate_offers_product_id_is_active_idx" ON "affiliate_offers"("product_id", "is_active");

ALTER TABLE "affiliate_offers" ADD CONSTRAINT "affiliate_offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

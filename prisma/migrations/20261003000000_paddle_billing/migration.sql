BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE "subscriptions" ADD COLUMN "billing_provider" TEXT NOT NULL DEFAULT 'stripe',
  ADD COLUMN "paddle_customer_id" TEXT, ADD COLUMN "paddle_subscription_id" TEXT,
  ADD COLUMN "paddle_checkout_id" TEXT;
CREATE UNIQUE INDEX "subscriptions_paddle_customer_id_key" ON "subscriptions"("paddle_customer_id");
CREATE UNIQUE INDEX "subscriptions_paddle_subscription_id_key" ON "subscriptions"("paddle_subscription_id");
CREATE TABLE "paddle_events" (
  "id" TEXT NOT NULL PRIMARY KEY, "type" TEXT NOT NULL,
  "processed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "paddle_events" ENABLE ROW LEVEL SECURITY;
COMMIT;

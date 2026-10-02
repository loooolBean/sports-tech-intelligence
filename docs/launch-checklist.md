# Product release acceptance — 2026-10-03

Offer: Sports Tech Intelligence Pro, USD 15/month. Owner has a mainland China business and selected Paddle. Do not activate live billing until Paddle has approved the actual business and product.

| Requirement | Evidence / remaining gate |
| --- | --- |
| GitHub write access | Device authorization verified repo push permission; main pushed through 4b55586. Repository-local credential.username selects loooolBean. |
| Database protection | Verified consistent export of 41 public application tables before Paddle migration; ignored outputs/backups file. Not a full Supabase Auth/Storage backup. |
| Paddle schema | Migration 20261003000000_paddle_billing applied successfully; original subscription columns preserved. |
| Checkout implementation | Server validates USD 15/month price, associates account through server-owned custom data, persists/reuses checkout, excludes checkout from recordings. |
| Payment lifecycle | Signature validation, notification deduplication, customer serialization, current subscription retrieval, cancellation and portal implemented. Unit tests passed; real sandbox end-to-end verification pending. |
| Paddle Sandbox | API key and client token not yet supplied. Price, notification destination, signing secret and default payment link still to configure. |
| Paddle live | Business/product/domain approval, banking setup and live credentials pending owner action. |
| Legal and support pages | Need actual legal business name, support contact, approved terms/refund policy before live payment. Do not invent business details. |
| Authentication | Clerk development instance remains configured. Production instance/domain setup and production admin login verification pending. |
| Product analytics | PostHog project 642621 connected, three ordered 14-day funnels created and queried. Only two integration_verification events seen; genuine pageview/article/search/save events still unverified. |
| Paid content value | Last database export shows 0 research and 0 evidence records. Need real curated research/evidence before promoting paid access to these features. Do not fabricate content. |
| Editorial operations | Existing ingestion/AI failures require review; failures must not be silently cleared to make health green. |
| Security dependencies | Next patched to 16.3.6. Prisma config's deepmerge-ts pinned to 8.0.2 via a scoped override; npm audit reports 0 vulnerabilities. Prisma schema validation and client generation pass. |
| Acceptance UI | Mobile layout and authenticated live admin/payment routes require browser verification; browser control was failing to connect. |

Completion requires verified sandbox checkout, entitlement activation, billing portal cancellation, invalid/duplicate/late webhook tests, live-account readiness, and deployed-page checks. Code presence or a green build alone does not close these gates.

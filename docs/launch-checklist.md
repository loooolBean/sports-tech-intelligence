# Product release acceptance — 2026-10-03

Offer: Sports Tech Intelligence Pro, USD 15/month. Owner has a mainland China business and selected Paddle. Do not activate live billing until Paddle has approved the actual business and product.

| Requirement | Evidence / remaining gate |
| --- | --- |
| GitHub write access | Device authorization verified repo push permission; main pushed through 878a5de. Repository-local credential.username selects loooolBean. Git pushes trigger Vercel production deployments. |
| Database protection | Verified consistent export of 41 public application tables before Paddle migration; ignored outputs/backups file. Not a full Supabase Auth/Storage backup. |
| Paddle schema | Migration 20261003000000_paddle_billing applied successfully; original subscription columns preserved. |
| Checkout implementation | Server validates USD 15/month price, associates account through server-owned custom data, persists/reuses checkout, excludes checkout from recordings. |
| Payment lifecycle | Signature validation, notification deduplication, customer serialization, current subscription retrieval, cancellation and portal implemented. Unit tests passed; real sandbox end-to-end verification pending. |
| Paddle Sandbox | API key and sandbox client token supplied. Sandbox API authentication and read-only catalog/notification queries succeeded; catalog was empty. Product creation rejected with forbidden (missing create/read product permission). Owner must update API key scopes before price, notification destination, signing secret and default payment link setup. |
| Paddle live | Business/product/domain approval, banking setup and live credentials pending owner action. |
| Legal and support pages | Owner supplied 东莞市中堂天姆德电商店 and beanliao00@163.com, and approved first-payment refund requests within 7 days; renewals non-refundable by default. Contact, terms and refunds pages added; privacy contact corrected; pricing/checkout/footer link to policies. All 5 public-page HTML smoke checks passed on the production alias after deployment 878a5de. Mandatory legal rights and Paddle policy take precedence. Provider review is still required; this is not a legal compliance certification. |
| Authentication | Clerk development instance remains configured. Production instance/domain setup and production admin login verification pending. |
| Product analytics | PostHog project 642621 connected, three ordered 14-day funnels created and queried. Remote query on 2026-10-03 returned 1 $pageview, 2 $web_vitals and 2 explicitly labeled integration_verification events. Article/search/save and payment event flows still unverified. |
| Paid content value | Last database export shows 0 research and 0 evidence records. Need real curated research/evidence before promoting paid access to these features. Do not fabricate content. |
| Editorial operations | Read-only database audit found 198 OPEN failures and latest RSS job FAILED (2026-10-02). Fixed NULL-last source starvation and AI/alert failure accounting with regression tests; the real DB read-only ordering check prioritized never-fetched sources. Reproduced Sky Sports failure in JSDOM inline CSS parsing; content-only CSS sanitization restored extraction of 5,360 characters from the same real source without DB writes or AI calls. 28 unit tests pass. Historical failures remain unchanged and require retry/review. |
| Public HTML rendering | Removed the site-wide client-only Clerk provider boundary; Clerk now wraps the layout through the SSR-capable server entry point. Local and deployed production HTTP smoke checks verify headings, operator/support, refund copy and footer links in HTML, excluding script payloads. Anonymous document requests to /admin, /settings/billing and /checkout redirect to Clerk handshake. Browser/mobile and authenticated checks are still separate gates. |
| Security dependencies | Next patched to 16.3.6. Prisma config's deepmerge-ts pinned to 8.0.2 via a scoped override; npm audit reports 0 vulnerabilities. Prisma schema validation and client generation pass. |
| Acceptance UI | Mobile layout and authenticated live admin/payment routes require browser verification; browser control was failing to connect. |

Completion requires verified sandbox checkout, entitlement activation, billing portal cancellation, invalid/duplicate/late webhook tests, live-account readiness, and deployed-page checks. Code presence or a green build alone does not close these gates.

# Sports Tech Intelligence Platform

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run prisma:generate` — generate Prisma client after schema changes
- `npm run prisma:migrate` — apply DB migrations

No lint, test, format, or CI scripts exist.

## Key gotchas

- **No `.js` extensions in imports** — Next.js bundler requires imports without `.js` extensions. Use `from "./prisma"` not `from "./prisma.js"`.
- **Path alias `@/*`** — maps to project root. Use `@/src/lib/prisma` instead of `../src/lib/prisma`.
- **Prisma `@map("snake_case")`** — DB columns are snake_case, JS properties are camelCase.
- **OpenAI uses `/v1/responses`** endpoint with `json_schema` structured output, not chat completions.
- **All pages are dynamic** — no static generation due to database dependency. Uses `dynamic = "force-dynamic"`.
- **Proxy** (`proxy.ts`) is Clerk — broad matcher covers all dynamic routes.
- **No `.env` checked in** — copy `.env.example` and fill in secrets before running.
- **Clerk is optional** — if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not set or doesn't start with `pk_`, Clerk is disabled and auth features won't work.

## Architecture
- **`src/lib/`** — data access layer (Prisma queries, auth, SEO builders, sitemap fetcher)
- **`src/services/`** — business logic (RSS ingestion, AI summarization, SEO backfill)
- **`src/utils/content.ts`** — pure helpers (`slugify`, `normalizeUrl`, `hashContent`, `truncate`)
- **`app/`** — Next.js App Router pages + API routes
- **`prisma/schema.prisma`** — single schema (User, Source, Article, AiSummary, Tag, etc.)

Single package, not a monorepo.

## Environment Variables

See `.env.example` for required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — for AI summarization
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — for authentication (optional)
- `ADMIN_EMAILS` — comma-separated admin email addresses
- `CRON_SECRET` — protects cron endpoints

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

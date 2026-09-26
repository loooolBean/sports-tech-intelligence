import type { JobRun } from "@prisma/client";
import Link from "next/link";
import { getOperationsSnapshot, operationsLinks } from "@/src/lib/operations";

export const dynamic = "force-dynamic";

type HealthStatus = "OK" | "WARNING" | "ERROR" | "NOT CONFIGURED";

export default async function OperationsPage() {
  const snapshot = await getOperationsSnapshot();
  const rssStatus = jobStatus(snapshot.automations.rss);
  const seoStatus = jobStatus(snapshot.automations.seo);
  const aiStatus: HealthStatus = !snapshot.configuration.ai
    ? "NOT CONFIGURED"
    : snapshot.automations.ai.status === "FAILED"
      ? "ERROR"
      : snapshot.content.unprocessedArticles > 0
        ? "WARNING"
        : "OK";

  return (
    <div>
      <header className="border-b border-border pb-7">
        <p className="overline">Operations</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-h1 text-text-primary">Sports Tech Intelligence</h1>
            <p className="mt-3 text-body text-text-secondary">
              网站运营、内容、用户、流量和基础设施入口。
            </p>
          </div>
          <div className="text-right">
            <span className="rounded border border-border bg-bg-elevated px-2 py-1 text-[0.65rem] font-bold tracking-wide text-text-secondary">Production</span>
            <a
              className="mt-2 block text-caption text-accent hover:underline"
              href={operationsLinks.production}
              target="_blank"
              rel="noreferrer"
            >
              {operationsLinks.production} ↗
            </a>
          </div>
        </div>
      </header>

      <Section title="Today" description="UTC 00:00 起的数据库真实数据。">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Articles today" value={snapshot.today.articles} />
          <Metric label="Published today" value={snapshot.today.published} />
          <Metric label="Hidden / rejected" value={snapshot.today.hiddenOrRejected} />
          <Metric label="Processed by AI" value={snapshot.today.processedByAi} />
          <Metric label="Latest article time" value={formatDate(snapshot.today.latestArticleAt)} compact />
        </div>
        <p className="mt-4 text-caption text-text-tertiary">
          Last ingestion: {formatDate(snapshot.today.lastIngestionAt)}
        </p>
      </Section>

      <Section title="Content Health" description="10 秒内判断今天的内容链路是否正常。">
        <div className="divide-y divide-border rounded-lg border border-border">
          <HealthRow
            label="Latest article"
            value={snapshot.content.latestArticle?.title ?? "No article found"}
            detail={formatDate(snapshot.content.latestArticle?.createdAt)}
          />
          <HealthRow
            label="Latest published article"
            value={snapshot.content.latestPublishedArticle?.title ?? "No published article found"}
            detail={formatDate(snapshot.content.latestPublishedArticle?.createdAt)}
          />
          <HealthRow label="Articles today" value={String(snapshot.content.articlesToday)} />
          <HealthRow
            label="Unprocessed articles"
            value={String(snapshot.content.unprocessedArticles)}
            status={snapshot.content.unprocessedArticles > 0 ? "WARNING" : "OK"}
          />
          <HealthRow label="Hidden articles" value={String(snapshot.content.hiddenArticles)} />
          <HealthRow label="Duplicates" value={String(snapshot.content.duplicateArticles)} />
          <HealthRow
            label="Open ingestion failures"
            value={String(snapshot.content.openFailures)}
            status={snapshot.content.openFailures > 0 ? "ERROR" : "OK"}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-caption font-semibold">
          <Link className="text-accent hover:underline" href="/admin/articles">Manage articles →</Link>
          <Link className="text-accent hover:underline" href="/admin/failures">Review failures →</Link>
        </div>
      </Section>

      <Section title="Automations" description="刷新页面即可获取最新状态，不使用实时监控。">
        <div className="grid gap-4 lg:grid-cols-3">
          <AutomationCard
            title="RSS ingestion"
            status={rssStatus}
            lastRun={snapshot.automations.rss?.finishedAt ?? snapshot.automations.rss?.startedAt}
            items={snapshot.automations.rss?.itemsProcessed}
            error={snapshot.automations.rss?.errorMessage}
          />
          <AutomationCard
            title="AI processing"
            status={aiStatus}
            lastRun={snapshot.automations.ai.lastProcessedAt}
            detail={snapshot.automations.ai.latestTitle ?? undefined}
            error={snapshot.automations.latestFailure?.stage === "seo_metadata_generation" ? snapshot.automations.latestFailure.errorMessage : null}
          />
          <AutomationCard
            title="SEO metadata"
            status={seoStatus}
            lastRun={snapshot.automations.seo?.finishedAt ?? snapshot.automations.seo?.startedAt}
            items={snapshot.automations.seo?.itemsProcessed}
            error={snapshot.automations.seo?.errorMessage}
          />
        </div>
        <a
          className="mt-4 inline-block text-caption font-semibold text-accent hover:underline"
          href={`${operationsLinks.vercel}/logs`}
          target="_blank"
          rel="noreferrer"
        >
          View deployment logs →
        </a>
      </Section>

      <Section title="External Dashboards" description="一个问题只保留一个主要后台。">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ExternalCard name="Vercel" purpose="流量、部署、性能、Runtime Logs、Cron 和用量。" href={operationsLinks.vercel} status="OK" />
          <ExternalCard name="Clerk" purpose="注册用户、登录、活跃用户、留存和账号。" href={operationsLinks.clerk} status={snapshot.configuration.clerk ? "OK" : "NOT CONFIGURED"} />
          <ExternalCard name="Supabase" purpose="数据库、文章、公司、产品、SQL、日志和备份。" href={operationsLinks.supabase} status={snapshot.configuration.database ? "OK" : "NOT CONFIGURED"} />
          <ExternalCard name="GitHub" purpose="代码、修改历史、版本和回退。" href={operationsLinks.github} status="OK" />
          <ExternalCard name={snapshot.configuration.aiProvider.name} purpose="文章摘要、分类、SEO 处理；用量和余额以当前 API Key 服务商后台为准。" href={snapshot.configuration.aiProvider.dashboardUrl} status={snapshot.configuration.ai ? "OK" : "NOT CONFIGURED"} />
          <ExternalCard name="Stripe" purpose="付款、订阅、客户、退款和发票。" href={operationsLinks.stripe} status={snapshot.configuration.stripe ? "OK" : "NOT CONFIGURED"} />
        </div>
      </Section>

      <Section title="System Links" description="网站内部最常用的运营入口。">
        <div className="flex flex-wrap gap-3">
          <SystemLink href="/admin">Admin overview</SystemLink>
          <SystemLink href="/admin/articles">Articles</SystemLink>
          <SystemLink href="/admin/sources">RSS sources</SystemLink>
          <SystemLink href="/admin/failures">Ingestion failures</SystemLink>
          <SystemLink href="/admin/claims">Company claims</SystemLink>
          <SystemLink href="/admin/leads">Leads</SystemLink>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="border-b border-border py-8 last:border-0"><h2 className="text-h2 text-text-primary">{title}</h2><p className="mt-2 text-body text-text-secondary">{description}</p><div className="mt-5">{children}</div></section>;
}

function Metric({ label, value, compact = false }: { label: string; value: string | number; compact?: boolean }) {
  return <div className="rounded-lg border border-border bg-bg-card p-4"><p className="text-caption text-text-tertiary">{label}</p><p className={`mt-2 text-text-primary ${compact ? "text-sm font-semibold" : "text-h1"}`}>{value}</p></div>;
}

function HealthRow({ label, value, detail, status }: { label: string; value: string; detail?: string; status?: HealthStatus }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="text-caption font-semibold text-text-primary">{label}</p>{detail && <p className="mt-1 text-caption text-text-tertiary">{detail}</p>}</div><div className="flex items-center gap-3"><span className="max-w-md text-right text-body text-text-secondary">{value}</span>{status && <StatusBadge status={status} />}</div></div>;
}

function AutomationCard({ title, status, lastRun, items, detail, error }: { title: string; status: HealthStatus; lastRun?: Date | null; items?: number; detail?: string; error?: string | null }) {
  return <article className="rounded-lg border border-border bg-bg-card p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-h3 text-text-primary">{title}</h3><StatusBadge status={status} /></div><p className="mt-4 text-caption text-text-tertiary">Last run: {formatDate(lastRun)}</p>{typeof items === "number" && <p className="mt-1 text-caption text-text-tertiary">Items processed: {items}</p>}{detail && <p className="mt-3 line-clamp-2 text-body text-text-secondary">{detail}</p>}{error && <p className="mt-3 line-clamp-3 text-caption text-red-700 dark:text-red-300">Last error: {error}</p>}</article>;
}

function ExternalCard({ name, purpose, href, status }: { name: string; purpose: string; href: string; status: HealthStatus }) {
  return <article className="rounded-lg border border-border bg-bg-card p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-h3 text-text-primary">{name}</h3><StatusBadge status={status} /></div><p className="mt-3 min-h-12 text-body text-text-secondary">{purpose}</p><a className="mt-5 inline-block text-caption font-semibold text-accent hover:underline" href={href} target="_blank" rel="noreferrer">Open →</a></article>;
}

function StatusBadge({ status, label }: { status: HealthStatus; label?: string }) {
  const colors: Record<HealthStatus, string> = {
    OK: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    WARNING: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ERROR: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-300",
    "NOT CONFIGURED": "border-border bg-bg-elevated text-text-tertiary",
  };
  return <span className={`rounded border px-2 py-1 text-[0.65rem] font-bold tracking-wide ${colors[status]}`}>{label ?? status}</span>;
}

function SystemLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded-md border border-border px-3 py-2 text-caption font-semibold text-text-secondary hover:border-accent hover:text-accent">{children}</Link>;
}

function jobStatus(job?: JobRun | null): HealthStatus {
  if (!job) return "WARNING";
  if (job.status === "FAILED") return "ERROR";
  if (job.status === "RUNNING") return "WARNING";
  return "OK";
}

function formatDate(value?: Date | null) {
  if (!value) return "No data yet";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value) + " UTC";
}

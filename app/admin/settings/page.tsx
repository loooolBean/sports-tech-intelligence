import { assertAdmin } from "@/src/lib/command-center";
import { PageHeader, Panel, Status } from "@/src/components/admin/ui";

export const dynamic = "force-dynamic";
function Config({ names }: { names: string[] }) {
  return <ul className="my-4 space-y-2">{names.map(name => <li key={name} className="flex flex-wrap items-center justify-between gap-3 text-xs"><code className="break-all">{name}</code><Status value={process.env[name] ? "Configured · unverified" : "Not connected"} /></li>)}</ul>;
}
export default async function SettingsPage() {
  await assertAdmin();
  return <div className="space-y-6"><PageHeader title="Settings" description="只显示配置是否存在，不显示任何密钥。环境变量在 Vercel Settings → Environment Variables 设置；修改后需要重新部署。"/>
    <section id="posthog"><Panel title="PostHog · product analytics">
      <p className="text-sm text-text-secondary">创建项目后，复制 Project token 与对应区域的 ingestion host（US: https://us.i.posthog.com，EU: https://eu.i.posthog.com）。两项 NEXT_PUBLIC 变量只用于浏览器事件采集。</p>
      <Config names={["NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "NEXT_PUBLIC_POSTHOG_HOST", "POSTHOG_PROJECT_ID", "POSTHOG_PERSONAL_API_KEY"]} />
      <p className="text-sm text-text-secondary">后台报表需要项目 ID 和仅授予该项目 query:read 的 Personal API key。Personal API key 只能放服务端，绝不能加 NEXT_PUBLIC 前缀。Self-hosted 使用自己的 host。</p>
      <ol className="mt-4 list-inside list-decimal space-y-2 text-sm"><li>开启项目 Session Replay；代码屏蔽输入、页面文字、嵌入框架与私有页面。</li><li>部署后访问一篇公开文章，再到 Activity 确认 article_opened。</li><li>登录后 distinct ID 应为 Clerk user ID；退出后应回到匿名 ID。</li><li>在 /admin/growth 检查数据。API Connected 不代表浏览器事件已收到。</li></ol>
      <p className="mt-4 text-xs text-text-tertiary">生产项目和本地测试应使用不同 PostHog 项目，以免测试访问污染经营数据。上线前按目标市场配置必要的用户同意与数据保留策略。</p>
    </Panel></section>
    <section id="funnels"><Panel title="Only three funnels">
      <p className="text-sm text-text-secondary">PostHog → Product analytics → New insight → Funnel。保存为下列名称，使用有序漏斗，转化窗口设为 14 天，项目时区设为 Asia/Shanghai。</p>
      <ol className="mt-4 list-inside list-decimal space-y-3 text-sm"><li>Content → Signup：$pageview → article_opened → signup_started → signup_completed。</li><li>Content → Engagement：article_opened →（company_opened 或 product_opened）→（save_added 或 watch_added）。后两个步骤各建立一个 Action，分别包含两种事件，作为 OR。</li><li>Pricing → Subscription：pricing_viewed → checkout_started → checkout_completed → subscription_activated。</li></ol>
      <p className="mt-4 text-xs text-text-tertiary">这是首次连接时的一次性设置；本站不自动创建远程 Insight。日常流量与事件总数直接在 Growth 查看，深度漏斗与回放在 PostHog 查看。</p>
    </Panel></section>
    <section id="clerk"><Panel title="Clerk · accounts"><Config names={["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SECRET", "ADMIN_EMAILS"]} /><p className="text-sm text-text-secondary">上线使用 production instance。Webhook 指向本站 /api/webhooks/clerk，订阅 user.created、user.updated、user.deleted。ADMIN_EMAILS 填你的登录邮箱；普通用户无法读取后台报表。Users 直接读取 Clerk，不把本地资料数当作全部用户。</p></Panel></section>
    <section id="stripe"><Panel title="Stripe · payments"><Config names={["STRIPE_SECRET_KEY", "STRIPE_PRO_PRICE_ID", "STRIPE_WEBHOOK_SECRET"]} /><p className="text-sm text-text-secondary">建立 Pro recurring price，配置 Hosted Checkout 与 Customer Portal。Webhook 指向 /api/webhooks/stripe，订阅 checkout.session.completed 和 customer.subscription.created / updated / deleted。先在测试模式完成付款、取消与 webhook 重试测试，再切换 live key、live price 和 live webhook secret。</p><p className="mt-3 text-xs text-text-tertiary">仅收到已验证的 Stripe webhook 才记录成功事件；浏览器返回 success 页面不代表付款成功。trialing 单列，不计入 Active Pro。</p></Panel></section>
    <section id="database"><Panel title="Supabase · database"><Config names={["DATABASE_URL", "DIRECT_URL"]} /><p className="text-sm text-text-secondary">数据库连接成功但 Application data 不可用时，检查迁移。本版本新增 saved_articles、first_published_at、hidden_at；先备份，再在目标环境运行 npx prisma migrate deploy。不要 reset 数据库。历史时间保持空值，不制造历史发布数据。</p></Panel></section>
    <Panel title="AI & scheduled jobs"><Config names={["AI_API_KEY", "OPENAI_API_KEY", "AI_API_BASE_URL", "AI_MODEL", "CRON_SECRET"]} /><p className="text-sm text-text-secondary">AI_API_KEY / OPENAI_API_KEY 二选一，按现有供应商配置。Vercel 的 cron 配置每天北京时间 08:00 抓取 RSS，09:30 补齐 SEO；Automations 查看真实执行结果。</p></Panel>
    <Panel title="Vercel · deployment reporting (optional)"><Config names={["VERCEL_READ_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_TEAM_ID"]} /><p className="text-sm text-text-secondary">使用仅限本项目或团队的访问凭据，读取最新 production deployment。Team ID 仅团队项目需要。不配置时，托管与部署仍正常，只是后台部署报表显示 Not connected。</p></Panel>
  </div>;
}

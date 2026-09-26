# Sports Tech Intelligence

Sports Tech Intelligence 是一个体育科技每日情报网站。它自动从 RSS 获取新闻，用 AI 生成摘要、分类和编辑信息，并提供公司、产品、Research、Evidence、搜索、Watchlist 与 Alerts。

这份 README 首先写给负责运营网站的人。即使你不懂编程，也可以从这里找到每天要看的页面、出问题时的检查顺序，以及每个外部后台负责什么。

> 当前正式域名仍是 Vercel 域名，还没有确认独立域名。

## 🌐 怎么打开网页

### 日常使用：打开已经上线的网站

这是你平时应该使用的方式，不需要运行任何命令：

1. 打开 Chrome、Edge 或其他浏览器。
2. 点击或复制这个地址：
   [https://sports-tech-intelligence.vercel.app](https://sports-tech-intelligence.vercel.app)
3. 看到首页的 `Today's Top Intelligence` 和 `Latest Intelligence`，就代表网站已经打开。

常用页面可以直接点击：

- [网站首页](https://sports-tech-intelligence.vercel.app)
- [最新文章](https://sports-tech-intelligence.vercel.app/latest)
- [管理员首页](https://sports-tech-intelligence.vercel.app/admin)
- [运营状态页](https://sports-tech-intelligence.vercel.app/admin/ops)
- [文章管理](https://sports-tech-intelligence.vercel.app/admin/articles)

打开 Admin 页面时，如果系统要求登录：

1. 使用 Clerk 中已经注册的账号登录。
2. 该账号的邮箱必须已经写入 Vercel 的 `ADMIN_EMAILS`。
3. 登录后重新打开 `/admin`。

### 本地开发：在自己电脑上打开

只有修改网站、测试新代码时才需要本地启动。关闭运行窗口后，本地网页也会关闭。

1. 在 Codex 或 PowerShell 中打开项目目录：

   ```powershell
   cd E:\you-are-a-senior-saas-architect
   ```

2. 第一次运行，先安装依赖：

   ```powershell
   npm ci
   ```

3. 确认项目根目录已有 `.env`。如果没有，先复制模板，再填写真实配置：

   ```powershell
   Copy-Item .env.example .env
   ```

   不要把 `.env` 发给别人或提交到 GitHub。

4. 启动网站：

   ```powershell
   npm run dev
   ```

5. 等终端出现 `Ready`，然后在浏览器打开：
   [http://localhost:3000](http://localhost:3000)

6. 使用期间不要关闭正在运行 `npm run dev` 的终端。完成后按 `Ctrl+C` 停止。

### 两个地址有什么区别

| 地址 | 用途 | 是否需要运行 `npm run dev` |
| --- | --- | --- |
| `https://sports-tech-intelligence.vercel.app` | 已上线的网站，日常运营和真实用户使用 | 不需要 |
| `http://localhost:3000` | 仅自己电脑上的开发版本 | 需要 |

如果 `localhost` 显示“拒绝连接”，通常只是 `npm run dev` 没有运行；这不代表线上网站坏了。如果正式网址打不开，再去 Vercel Deployments 检查。

## 🚨 网站出问题先看这里

| 问题 | 第一步 | 第二步 |
| --- | --- | --- |
| 网站打不开 | [Vercel Deployments](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/deployments) 看最新部署是否 `Ready` | [Vercel Logs](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/logs) 看运行错误 |
| 登录或注册不了 | [Clerk Dashboard](https://dashboard.clerk.com) → Logs | 再看 Vercel Logs |
| 今天文章没更新 | [/admin/ops](https://sports-tech-intelligence.vercel.app/admin/ops) → RSS ingestion | [/admin/failures](https://sports-tech-intelligence.vercel.app/admin/failures) |
| 有文章但没有摘要或分类 | `/admin/ops` → AI processing | Vercel Logs，再看当前 AI Provider 的余额、用量与限额 |
| 数据库报错 | [Supabase Dashboard](https://supabase.com/dashboard) → Logs | Vercel Logs |
| 刚更新代码后网站坏了 | Vercel Deployments → Build Logs | GitHub 找最后一次正常 commit，revert 或重新部署上一版本 |
| 出现垃圾新闻 | [/admin/articles](https://sports-tech-intelligence.vercel.app/admin/articles) | 编辑文章并勾选 `Hide from public feeds` |

不要在不清楚原因时连续修改很多文件。先确定是部署、数据库、登录、RSS 还是 AI 的问题。

## 🔗 常用入口

| 我要做什么 | 去哪里 |
| --- | --- |
| 看正式网站 | [Production](https://sports-tech-intelligence.vercel.app) |
| 看管理员首页 | [/admin](https://sports-tech-intelligence.vercel.app/admin) |
| 看今天是否正常 | [/admin/ops](https://sports-tech-intelligence.vercel.app/admin/ops) |
| 管理文章 | [/admin/articles](https://sports-tech-intelligence.vercel.app/admin/articles) |
| 管理 RSS 来源 | [/admin/sources](https://sports-tech-intelligence.vercel.app/admin/sources) |
| 看 RSS / AI 失败 | [/admin/failures](https://sports-tech-intelligence.vercel.app/admin/failures) |
| 看流量和热门页面 | [Vercel Analytics](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/analytics) |
| 看部署 | [Vercel Deployments](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/deployments) |
| 看网站报错 | [Vercel Logs](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/logs) |
| 看注册用户 | [Clerk Dashboard](https://dashboard.clerk.com) |
| 看数据库和备份 | [Supabase Dashboard](https://supabase.com/dashboard) |
| 看代码和修改历史 | [GitHub Repository](https://github.com/loooolBean/sports-tech-intelligence) |
| 看 AI 用量 | 当前 `AI_API_BASE_URL` 所属服务商的 Usage / Billing 页面 |
| 看付款 | [Stripe Dashboard](https://dashboard.stripe.com)（线上尚未配置） |

## 1. 这个项目是什么

网站最重要的公开入口是 Daily Intelligence Feed：

- `/`：今天的 Top Intelligence 和最新资讯。
- `/latest`：按主题和时间查看资讯。
- `/topics`：按 AI、穿戴设备、体育科学等主题浏览。
- `/article/[slug]`：摘要、Why It Matters、Key Takeaways 和原始来源。
- `/companies`、`/products`：公司和产品资料。
- `/research`、`/compare`：Research、Evidence 和产品比较。
- 登录后：`/dashboard`、`/watchlist`、`/alerts`。

公开 Feed 只显示 `Published`、非重复且没有隐藏的文章。管理员可以人工改标题、分类、摘要、Featured、状态和是否隐藏。

## 2. Production 地址

正式网站：[https://sports-tech-intelligence.vercel.app](https://sports-tech-intelligence.vercel.app)

三个环境不要混淆：

| 环境 | 是什么 | 谁会看到 |
| --- | --- | --- |
| Local | 自己电脑上的 `http://localhost:3000` | 只有本机开发时使用 |
| Preview | Git 分支或 Pull Request 产生的 Vercel 测试地址 | 发布前检查 |
| Production | 上面的正式地址 | 真实用户 |

## 3. 我平时最常用的入口

日常只需要记住这些：

1. 网站首页：看今天有没有新内容。
2. `/admin/ops`：看 RSS、AI、内容和外部服务状态。
3. `/admin/articles`：修改或隐藏文章。
4. Vercel：流量、部署、报错、Cron。
5. Clerk：用户。
6. Supabase：数据库和备份。

进入 Admin 前，必须使用 Clerk 登录，并且登录邮箱在 `ADMIN_EMAILS` 中。页面菜单不是安全边界，Admin 服务端仍会再次验证权限。

## 4. 一人公司后台地图

```text
Sports Tech Intelligence
│
├── /admin
│   └── 内容、来源、Research、Evidence、Claims、Leads
│
├── /admin/ops
│   └── Today、Content Health、Automations、外部后台入口
│
└── External Services
    ├── Vercel：流量、部署、日志、Cron
    ├── Clerk：注册、登录、用户
    ├── Supabase：数据库、日志、备份
    ├── GitHub：代码、版本、恢复
    ├── AI Provider：摘要、分类、用量
    └── Stripe：付款与订阅（代码已有，线上未配置）
```

`/admin/ops` 不是复杂 BI。它只使用 `OK`、`WARNING`、`ERROR`、`NOT CONFIGURED` 四种状态，刷新页面即可获得最新信息。

## 5. 每天怎么运营

### 每天 5 分钟

1. 打开首页，看 Feed 是否有当天内容。
2. 打开 `/admin/ops`，看 RSS、AI 和 open failures。
3. 打开 `/admin/articles`，隐藏明显垃圾，修正错误标题或分类。
4. 打开 Vercel Analytics，看 Visitors、Top Pages 和 Referrers 是否异常。
5. 如果刚发布过代码，确认 Vercel 最新 Deployment 是 `Ready`。

### 今天是否正常的简单标准

- 首页能打开。
- `/admin/ops` 有最新文章时间。
- RSS ingestion 没有 `ERROR`。
- AI processing 有近期处理时间。
- Open ingestion failures 没有突然增加。

## 6. 每周怎么检查

### 每周 20 分钟

1. Vercel Analytics：本周访问量、热门文章、流量来源。
2. Clerk：新增用户、活跃用户、登录失败。
3. `/admin/articles`：检查内容质量和分类。
4. Vercel：看 Runtime Errors、Cron 和性能。
5. Supabase：看数据库状态并确认 Backup 是否存在。
6. AI Provider：看一周 API Usage、Billing 和 Rate Limits。

## 7. 每月怎么检查

### 每月 30 分钟

1. 检查 Vercel、Supabase、Clerk、AI Provider 和域名账单。
2. 看一个月 Visitors、Page Views 和来源趋势。
3. 看 New Users、Active Users 和 Retention。
4. 看热门文章和搜索使用情况。
5. 检查数据库备份能否找到。
6. 如果开始收费，再检查 Stripe Payments 和 Subscriptions。
7. 删除明显没有价值的开发计划，不要盲目增加工具。

## 8. 内容怎么管理

进入 [/admin/articles](https://sports-tech-intelligence.vercel.app/admin/articles)：

- 查看文章、来源、分类、状态和重要度。
- 修改标题、摘要、正文、分类、SEO 信息和 Why It Matters。
- 设置 `Featured`，让重要内容优先进入 Top Intelligence。
- 勾选 `Hide from public feeds`，隐藏垃圾内容但保留数据库记录。
- 将状态改为 `DRAFT`、`PUBLISHED` 或 `REJECTED`。
- 查看是否为重复内容，再打开公开页面抽查。

推荐处理顺序：

```text
/admin/ops
→ /admin/failures
→ Draft / Rejected / Duplicate Articles
→ 公开首页抽查
→ Claims / Leads
```

不要直接删除有问题的文章。优先使用 Hidden 或 Rejected，方便以后查原因和恢复。

## 9. 去哪里看流量

项目使用 **Vercel Web Analytics** 作为唯一主要流量工具，不同时安装 GA、PostHog、Plausible 或 Umami。

进入：Vercel → Project → Analytics，重点看：

| 指标 | 简单解释 | 当前来源 |
| --- | --- | --- |
| Visitors | 大概有多少不同访客来看网站 | Vercel Analytics |
| Page Views | 所有页面一共被打开多少次 | Vercel Analytics |
| Top Pages | 哪些页面、文章最受欢迎 | Vercel Analytics |
| Referrers | 用户从搜索、社交或其他网站哪里来 | Vercel Analytics |
| Countries / regions | 访问者大概来自哪些地区 | Vercel Analytics |
| Devices | 用户主要使用手机还是电脑 | Vercel Analytics |
| Article CTR | 文章点击事件；是否能在后台查看取决于 Vercel 当前套餐 | `article_clicked` |
| Search usage | 搜索提交次数；不记录搜索词 | `search_submitted` |

代码只追踪七个非敏感事件：

```text
article_clicked
original_source_clicked
search_submitted
topic_clicked
company_clicked
product_clicked
signup_clicked
```

不会把邮箱、用户 ID、搜索词、Claim 内容或 Lead 内容发给 Analytics。`/admin`、`/dashboard`、`/watchlist`、`/alerts`、`/vendor`、Billing 和登录页面被排除，不污染公开内容数据。

部署本次代码后，如果 Analytics 页面提示尚未启用，需要在 Vercel Project → Analytics 手工点击 Enable。事件报表是否可见以当前 Vercel 套餐为准。

## 10. 去哪里看用户

进入 [Clerk Dashboard](https://dashboard.clerk.com)：

- **Overview**：看注册、登录、活跃和留存概况。
- **Users**：查看具体注册用户和账号状态。
- **Logs**：用户为什么登录失败、注册请求是否出错。

产品目前真正需要关注：

| 指标 | 解释 |
| --- | --- |
| New Users | 新注册人数 |
| Active Users | 真正回来登录或使用的人 |
| Retention | 注册以后过一段时间还会回来的人 |

`/admin/ops` 不额外调用 Clerk API 计算总用户数，避免为了一个数字增加复杂度。用户数据以 Clerk 为准，本地 Supabase `users` 表只保存业务所需的同步资料。

## 11. 去哪里看数据库

进入 [Supabase Dashboard](https://supabase.com/dashboard)：

- **Table Editor**：像 Excel 一样查看 `articles`、`companies`、`products`、`users` 等表。
- **SQL Editor**：只有确实需要查询数据时才用；不懂 SQL 时不要执行修改语句。
- **Logs**：数据库连接或查询报错时查看。
- **Database → Backups**：确认备份是否存在、日期是否正常。

### ⚠️ 生产数据库安全

不要随便执行：

```text
DELETE
DROP
TRUNCATE
prisma migrate reset
```

尤其不要在 Production 运行 `prisma migrate reset`。它可能清空全部数据。正式环境只使用已经审核并提交到 GitHub 的迁移，命令为 `npx prisma migrate deploy`。

## 12. 去哪里看部署和报错

Vercel 负责网站托管、部署、Runtime Logs、Cron 和基础性能信息。

每次更新后进入 Vercel → Deployments：

- `Ready`：部署成功，可以继续打开 Production 抽查。
- `Building`：仍在构建，先等待。
- `Error`：点击该 Deployment，先看 Build Logs 最后一个错误。

网站已经 `Ready` 但页面仍报错时，进入 Vercel → Logs，按时间和 URL 找错误。不要只看浏览器里的红色页面，因为根因常在服务端日志。

当前阶段 Vercel Logs 已足够，不安装 Sentry、Datadog 或 New Relic。

## 13. AI 内容系统怎么运行

代码使用 OpenAI 官方 SDK 的 Responses API，但 `AI_API_BASE_URL` 可以指向兼容服务。当前配置是 **OpenAI-compatible Provider**，因此真实 Usage、Billing、余额和 Rate Limits 以购买当前 API Key 的服务商后台为准，不要默认去 OpenAI 官方后台找账单。

AI 每篇文章生成：

- Summary
- Primary Category
- Tags
- Why It Matters
- 最多 3 条 Key Takeaways
- Importance Score
- SEO Title / Description

如果 RSS 有新文章但没有摘要：

```text
/admin/ops → AI processing
→ /admin/failures
→ Vercel Logs
→ 当前 AI Provider 的 Usage / Billing / Rate Limits
```

人工回填只处理最近 30 天中缺少 AI 内容的文章：

```powershell
npm run backfill:intelligence -- --limit=5
```

先用 5 条验证，不要一次对整库调用 AI。

## 14. RSS 抓取怎么运行

Vercel Cron 当前配置：

- `00:00 UTC`：`/api/cron/ingest-rss`
- `01:30 UTC`：`/api/cron/generate-seo-metadata`

内容流程：

```text
RSS Source
→ 获取文章
→ URL / 内容 Hash / 相似标题去重
→ 保存 Draft
→ AI 摘要、分类、标签和质量处理
→ 达到安全发布条件后 Published
→ 否则留给管理员检查
```

每次 Cron 会在 `job_runs` 表记录：任务名、开始/结束时间、状态、处理数量和简短错误。单篇失败仍保存在 `ingestion_failures`，不会在运营页显示完整敏感堆栈。

判断 RSS 是否正常：

1. `/admin/ops` → RSS ingestion 应为 `OK`。
2. Last run 应接近当天计划时间。
3. Items processed 不应长期为 0。
4. `/admin/failures` 不应连续出现同一来源错误。
5. `/admin/sources` 的 Last fetched 时间应持续更新。

手工命令：

```powershell
npm run seed:sources
npm run ingest
npm run seo
```

Cron 接口受 `CRON_SECRET` 保护，不要把 Secret 写进 README、聊天截图或浏览器地址。

## 15. 网站更新和发布流程

最简单发布流程：

```text
Codex 修改
↓
typecheck / test / build 通过
↓
git commit
↓
push GitHub main
↓
Vercel 自动部署
↓
Deployment 显示 Ready
↓
打开 Production 检查首页、文章、搜索和 /admin/ops
```

推荐命令：

```powershell
npm run typecheck
npm test
npm run build
git status
git add <本次修改的文件>
git commit -m "简短说明"
git push origin main
```

代码每一次正式修改都应该进入 GitHub。不要只在服务器或本地保留唯一版本。

## 16. 网站坏了怎么排查

按顺序检查，不要跳着猜：

1. **Vercel Deployments**：最近一次是不是 `Ready`？如果 `Error`，看 Build Logs。
2. **Vercel Logs**：页面或 API 是否出现运行错误？
3. **Supabase Logs**：如果错误提到 Prisma、database、timeout 或 connection，查数据库。
4. **Clerk Logs**：只有登录、注册或权限失败时查 Clerk。
5. **AI Provider**：只有摘要、分类或 AI 任务失败时查用量、余额和限额。
6. **`/admin/failures`**：查看具体 RSS 来源和处理阶段。

### Codex 修改坏了怎么恢复

1. 先停止继续乱改，保存错误截图和 Vercel 日志。
2. 在 GitHub Commits 找到最后一次正常版本。
3. 优先使用 `git revert <坏的commit>` 创建可追踪的反向提交。
4. Push 后等待 Vercel 新部署变为 `Ready`。
5. 紧急情况下，可在 Vercel 对上一次正常 Deployment 执行 Redeploy / Promote。

不要使用 `git reset --hard` 或删除整个目录来“恢复”，这样容易丢失尚未保存的工作。

## 17. 数据备份

进入 Supabase → Database → Backups，先确认当前项目计划是否真的提供自动备份。README 无法从代码判断 Supabase 套餐，不要假设免费或付费计划一定有备份。

最低建议：

- 每周检查一次最近备份日期。
- 每次重要数据库迁移前检查或导出一次。
- 如果当前计划没有符合需要的自动备份，每周做一次手工 dump/export，并把文件保存到安全位置。
- 每月确认备份不是空文件，并记录恢复方式。

备份不是“看见按钮就完成”。至少需要知道备份日期、存放位置和谁能恢复。

## 18. 以后怎么收费

Stripe 代码已经存在，包括 Checkout、Webhook、Subscription 同步和 Customer Portal；但 Production 尚未配置 Stripe 环境变量，所以当前不能真实收费。

最简单付款路径：

```text
用户选择 Pro
→ Stripe Checkout
→ 用户在 Stripe 付款
→ Stripe Webhook 通知网站
→ subscriptions 表更新
→ 用户获得 Pro 权限
```

Stripe 负责：付款、订阅、退款、收据/发票、取消、付款失败和 Customer Portal。网站不保存银行卡信息。

开始收费前必须亲自完成：

1. Stripe 创建 recurring Product / Price。
2. 配置 `STRIPE_SECRET_KEY` 和 `STRIPE_PRO_PRICE_ID`。
3. 建立指向 `/api/webhooks/stripe` 的 Webhook。
4. 配置 `STRIPE_WEBHOOK_SECRET`。
5. 启用 Customer Portal，并用测试卡走完整流程。

付款后主要在 Stripe Dashboard 看 `Payments`、`Customers`、`Subscriptions` 和 `Revenue`。网站数据库的 `subscriptions` 保存权限状态，`stripe_events` 用于防止同一 Webhook 重复处理。

当前阶段只需要 Free / Pro，不要先设计复杂定价。还没有真实付费时，优先关注内容质量、访问、回访和注册，暂时不要过度关注 MRR、LTV、CAC。

## 19. 每月可能产生的成本

| 服务 | 负责什么 | 去哪里看 |
| --- | --- | --- |
| Vercel | 托管、Functions、带宽、Analytics | Project → Usage / Billing |
| Supabase | PostgreSQL、存储、备份 | Organization → Usage / Billing |
| Clerk | 注册、登录、用户 | Dashboard → Billing / Usage |
| AI Provider | 摘要、分类和 SEO 调用 | 当前 API Key 服务商 → Usage / Billing |
| Domain | 独立域名（当前尚未确认） | 域名注册商后台 |
| Stripe | 以后收费的交易手续费 | Stripe → Balance / Reports |

当前没有接入邮件服务、Sentry 或其他付费分析平台，不要为“看起来专业”而增加后台。

## 20. 常用后台链接

| 后台 | 状态 | 用途 |
| --- | --- | --- |
| [Vercel Project](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence) | ACTIVE | 流量、部署、日志、Cron、Usage |
| [Clerk](https://dashboard.clerk.com) | ACTIVE | 注册、登录、用户和认证日志 |
| [Supabase](https://supabase.com/dashboard) | ACTIVE | PostgreSQL、表、SQL、日志、备份 |
| [GitHub](https://github.com/loooolBean/sports-tech-intelligence) | ACTIVE | 代码、commit、版本恢复 |
| 当前 OpenAI-compatible Provider | ACTIVE | AI Usage、Billing、Rate Limits |
| [Stripe](https://dashboard.stripe.com) | NOT CONFIGURED IN PRODUCTION | 以后付款和订阅 |
| Vercel Web Analytics | CODE ADDED; VERIFY AFTER DEPLOY | Visitors、Page Views、Top Pages、Referrers |

未接入：Google Analytics、PostHog、Plausible、Umami、Sentry、Datadog、New Relic、Resend。当前阶段不需要重复安装。

## 21. Environment Variables

Secret 只配置在本地 `.env` 或 Vercel Environment Variables。README 只记录变量名和用途。

| 变量名 | 用途 | 必需范围 |
| --- | --- | --- |
| `DATABASE_URL` | 应用访问 Supabase PostgreSQL | 应用必需 |
| `DIRECT_URL` | Prisma migration 直接连接 | 数据库迁移 |
| `NEXT_PUBLIC_SITE_URL` | 当前站点地址 | 应用必需 |
| `AI_API_KEY` | AI Provider 密钥 | RSS / AI |
| `AI_API_BASE_URL` | OpenAI-compatible API 地址 | RSS / AI |
| `AI_MODEL` | 当前 Provider 支持的模型 | RSS / AI |
| `OPENAI_API_KEY` | 旧兼容变量，优先使用 `AI_API_KEY` | 可选 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 前端认证 | 登录功能 |
| `CLERK_SECRET_KEY` | Clerk 服务端认证 | 登录功能 |
| `CLERK_WEBHOOK_SECRET` | 验证 Clerk Webhook | 用户同步 |
| `ADMIN_EMAILS` | 逗号分隔的管理员邮箱 | Admin |
| `CRON_SECRET` | 保护 Cron API | Cron |
| `STRIPE_SECRET_KEY` | Stripe 服务端请求 | 真实收费 |
| `STRIPE_WEBHOOK_SECRET` | 验证 Stripe Webhook | 真实收费 |
| `STRIPE_PRO_PRICE_ID` | Pro recurring Price ID | 真实收费 |

### 永远不要把以下内容贴进 README

```text
API Secret
Database password / connection string
Supabase service role key
Webhook secret
Private key
用户个人数据
```

如果 Secret 曾经公开，单纯删除文本不够，必须去对应服务后台撤销并重新生成。

## 22. 开发命令

安装并启动：

```powershell
npm ci
npm run prisma:generate
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，停止使用 `Ctrl+C`。

验证：

```powershell
npm run typecheck
npm test
npm run build
```

项目当前没有 `lint` script，不要假装执行过 lint。

数据库：

```powershell
npx prisma migrate status
npm run prisma:migrate      # 只用于开发数据库创建迁移
npx prisma migrate deploy   # Production 只应用已提交迁移
```

内容任务：

```powershell
npm run seed:sources
npm run ingest
npm run seo
npm run backfill:intelligence -- --limit=5
```

## 23. 项目技术架构

真实技术栈：

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 3、Framer Motion、Lucide React
- Supabase PostgreSQL、Prisma 6
- Clerk Authentication
- OpenAI SDK + OpenAI-compatible AI Provider
- Stripe Node SDK
- Vercel Hosting、Cron、Web Analytics

这是单 package 项目，不是 monorepo：

```text
app/                 页面、Admin 和 API Route Handlers
src/actions/         Server Actions
src/components/      UI 组件和公开 Analytics
src/lib/             数据访问、权限、运营状态、Stripe
src/services/        RSS、AI 摘要、SEO 处理
src/utils/           纯工具函数
prisma/              Schema、迁移和 seed
tests/               Node tests
scripts/             采集、回填和维护脚本
```

重要后台路由：

| 路径 | 用途 |
| --- | --- |
| `/admin` | Admin 概览 |
| `/admin/ops` | 一人公司运营总控制台 |
| `/admin/articles` | 文章审核和编辑 |
| `/admin/sources` | RSS 来源 |
| `/admin/failures` | RSS / AI 失败记录 |
| `/admin/research` | Research 管理 |
| `/admin/evidence` | Evidence 管理 |
| `/admin/claims` | Company Claim 审核 |
| `/admin/leads` | Demo Leads |

重要原则：

- 所有页面依赖数据库，因此使用动态渲染。
- Admin 写入必须经过服务端管理员检查。
- Stripe Webhook 是订阅状态的事实来源。
- Vendor 内容不能改写独立 Research / Evidence。
- Importance Score 只是内部编辑排序，不是科学评分。
- 未收录 Evidence 不等于 Evidence 不存在。

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
- [运营状态页](https://sports-tech-intelligence.vercel.app/admin)
- [文章管理](https://sports-tech-intelligence.vercel.app/admin/content)

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
| 今天文章没更新 | [/admin](https://sports-tech-intelligence.vercel.app/admin) → RSS ingestion | [/admin/failures](https://sports-tech-intelligence.vercel.app/admin/failures) |
| 有文章但没有摘要或分类 | `/admin` → AI processing | Vercel Logs，再看当前 AI Provider 的余额、用量与限额 |
| 数据库报错 | [Supabase Dashboard](https://supabase.com/dashboard) → Logs | Vercel Logs |
| 刚更新代码后网站坏了 | Vercel Deployments → Build Logs | GitHub 找最后一次正常 commit，revert 或重新部署上一版本 |
| 出现垃圾新闻 | [/admin/content](https://sports-tech-intelligence.vercel.app/admin/content) | 编辑文章并勾选 `Hide from public feeds` |

不要在不清楚原因时连续修改很多文件。先确定是部署、数据库、登录、RSS 还是 AI 的问题。

## 🔗 常用入口

| 我要做什么 | 去哪里 |
| --- | --- |
| 看正式网站 | [Production](https://sports-tech-intelligence.vercel.app) |
| 看管理员首页 | [/admin](https://sports-tech-intelligence.vercel.app/admin) |
| 看今天是否正常 | [/admin](https://sports-tech-intelligence.vercel.app/admin) |
| 管理文章 | [/admin/content](https://sports-tech-intelligence.vercel.app/admin/content) |
| 管理 RSS 来源 | [/admin/sources](https://sports-tech-intelligence.vercel.app/admin/sources) |
| 看 RSS / AI 失败 | [/admin/failures](https://sports-tech-intelligence.vercel.app/admin/failures) |
| 看流量和热门页面 | [/admin/growth](https://sports-tech-intelligence.vercel.app/admin/growth) |
| 看部署 | [Vercel Deployments](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/deployments) |
| 看网站报错 | [Vercel Logs](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence/logs) |
| 看注册用户 | [/admin/users](https://sports-tech-intelligence.vercel.app/admin/users) |
| 看数据库和备份 | [Supabase Dashboard](https://supabase.com/dashboard) |
| 看代码和修改历史 | [GitHub Repository](https://github.com/loooolBean/sports-tech-intelligence) |
| 看 AI 用量 | 当前 `AI_API_BASE_URL` 所属服务商的 Usage / Billing 页面 |
| 看付款 | [/admin/revenue](https://sports-tech-intelligence.vercel.app/admin/revenue)（需连接 Paddle） |

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

## 3. 读者日常怎么用

1. 打开首页或 Latest，读标题、摘要和 Why It Matters；想核对信息，点击原始来源。
2. 在 Topics 选关心的领域；Search 可找文章、公司、产品和研究。
3. 登录后在文章页点击 **Save for later**；收藏保存在 Dashboard 的 Saved for later。
4. 在公司或产品页点击 Watch，之后到 Watchlist 和 Alerts 看关联资讯。
5. Pro 为 15 美元/月，在 Pricing 查看；只有 Paddle 正式审核、配置和支付验收通过后才能真实收费。

## 4. 管理员的唯一日常入口

打开 [/admin](https://sports-tech-intelligence.vercel.app/admin)，使用管理员邮箱登录。新后台上线后旧 `/admin/ops` 自动跳转到这里。

| 一级菜单 | 每天可以做什么 |
| --- | --- |
| Overview | 四个经营数字、待处理事项、今天内容、7 天趋势、系统状态 |
| Content | 搜索 / 分类 / 状态筛选，25 条分页，Edit / Feature / Hide |
| Sources | 管理 RSS 来源，启用或停用 |
| Growth | 访客、文章阅读、来源、搜索、Save / Watch 人数、热门文章 |
| Users | Clerk 注册数、今日新增、最近账号、本地收藏 / 关注关系数 |
| Revenue | Paddle Active / Trial / 异常订阅、Webhook 同步及支付控制台入口 |
| Automations | RSS / SEO 日程、任务记录、RSS / AI 失败 |
| System | 数据库、服务连接、最近部署及错误排查入口 |
| Settings | 首次配置指导和配置是否存在；不显示密钥 |

Research / Evidence / Categories / Tags 在 Content 内；Claims / Leads 在 Users 内；Newsletter 在 Growth 内。没有增加一级菜单。

## 5. 管理员每天 5 分钟

1. 打开 **Overview → Needs attention**，按 Review / Fix / Check 处理。
2. 看四张数字卡：今天多少访客、文章阅读、新用户、Active Pro。点击数字可进详情。
3. 在 Content today 查看最新 5 篇，直接精选或隐藏；正文和分类问题点 Edit。
4. Growth 看读者从哪里来、最常读哪篇、有没有人搜索 / 收藏 / Watch。
5. 只有出现异常才去 System / Automations 排查；第三方后台用于首次配置和深入诊断。

数字说明：

- `Not connected`：必要配置缺失，**不是 0**。
- `Unavailable`：本次读取失败，**不是 0**。
- `No data yet`：已能读取，但没有执行 / 事件记录。
- `Configured · unverified`：仅表示变量存在，不证明服务健康。
- `0`：查询成功后的真实零值（浏览器分析仍可能被广告拦截器阻止）。
- 所有日统计以北京时间为准；趋势是包含今天的 7 个自然日。
- Published today / Hidden today 从新版本记录实际操作时间，历史未知值不回填。Hidden today 只含目前仍隐藏且今天被隐藏的文章；Failed today 为失败记录数，不是去重文章数。
- Content 表的 Published 是原文发布日期，Views 是最近 7 天 PostHog 阅读事件数。
- Active Pro 是当前 Pro price 的 active 订阅数，不包含 trialing；测试环境明确标记，不当成真实付费人数，也不是到账收入。
- RSS / SEO 每天执行一次；超过 26 小时未成功才提示过期。

## 6. 每周 20 分钟

1. Growth 看热门文章、来源和行为趋势；PostHog 看 3 个漏斗、留存和经过遮罩的回放。
2. Users 看注册与最近活跃记录。Clerk 账号数量不等于经过人工核验的真人数量。
3. Revenue 看付款异常；Paddle 深查账单和投递失败。
4. Content 检查内容质量，Automations 检查重复失败来源。
5. Supabase 确认备份；Vercel 检查性能和运行错误；AI Provider 检查用量。

## 7. 每月怎么检查

### 每月 30 分钟

1. 检查 Vercel、Supabase、Clerk、AI Provider 和域名账单。
2. 看一个月 Visitors、Page Views 和来源趋势。
3. 看 New Users、Active Users 和 Retention。
4. 看热门文章和搜索使用情况。
5. 检查数据库备份能否找到。
6. 如果开始收费，再检查 Paddle Transactions 和 Subscriptions。
7. 删除明显没有价值的开发计划，不要盲目增加工具。

## 8. 内容怎么管理

进入 [/admin/content](https://sports-tech-intelligence.vercel.app/admin/content)：

- 查看文章、来源、分类、状态和重要度。
- 修改标题、摘要、正文、分类、SEO 信息和 Why It Matters。
- 设置 `Featured`，让重要内容优先进入 Top Intelligence。
- 勾选 `Hide from public feeds`，隐藏垃圾内容但保留数据库记录。
- 将状态改为 `DRAFT`、`PUBLISHED` 或 `REJECTED`。
- 查看是否为重复内容，再打开公开页面抽查。

推荐处理顺序：

```text
/admin
→ /admin/failures
→ Draft / Rejected / Duplicate Articles
→ 公开首页抽查
→ Claims / Leads
```

不要直接删除有问题的文章。优先使用 Hidden 或 Rejected，方便以后查原因和恢复。

## 9. PostHog：主要产品分析

日常使用 **/admin/growth**。保留现有 Vercel Web Analytics 作为辅助，不新增 GA、Mixpanel 或自建分析存储。

首次连接在 **/admin/settings** 完成。配置：

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`：项目 token。
- `NEXT_PUBLIC_POSTHOG_HOST`：US 为 `https://us.i.posthog.com`，EU 为 `https://eu.i.posthog.com`。
- `POSTHOG_PROJECT_ID`：后台报表查询项目。
- `POSTHOG_PERSONAL_API_KEY`：仅服务端，限制到指定项目并授予 `query:read`。绝不能使用 NEXT_PUBLIC 前缀。

本地与生产应使用不同项目。环境变量修改后需要重新构建部署。配置完成后打开公开文章，在 PostHog Activity 确認收到事件，再检查 Growth。

固定 16 个产品事件：

```text
article_opened              original_source_clicked
topic_opened                search_submitted
search_result_clicked       company_opened
product_opened              save_added
watch_added                 signup_started
signup_completed            pricing_viewed
checkout_started            checkout_completed
subscription_activated      subscription_cancelled
```

浏览器自动 pageview 使用 PostHog 默认能力；登录用 Clerk ID identify，不使用邮箱。退出 reset。Save / Watch 在持久化成功后记录；注册和支付成功由经过签名验证的 webhook 记录，不根据按钮点击或 success URL 推测。

只建立 3 个有序漏斗（PostHog → Product analytics → New insight → Funnel；14 天窗口；Asia/Shanghai 时区）：

1. Content → Signup：`$pageview → article_opened → signup_started → signup_completed`。
2. Content → Engagement：`article_opened → company_opened OR product_opened → save_added OR watch_added`。后两个步骤分别用包含两个事件的 Action 表达 OR。
3. Pricing → Subscription：`pricing_viewed → checkout_started → checkout_completed → subscription_activated`。

2026-10-03 已在 PostHog 项目 642621 创建并读回验证三个漏斗，项目时区为 Asia/Shanghai，转化窗口为 14 天：

- [Content → Signup](https://us.posthog.com/project/642621/insights/GPXy1rvk)
- [Content → Engagement](https://us.posthog.com/project/642621/insights/P4Gft71r)
- [Pricing → Subscription](https://us.posthog.com/project/642621/insights/dm2g7JR2)

四项 PostHog 环境配置已同步至 Vercel Production；个人密钥仅用于服务端。API 查询已通过，采集接口已收到两条 `integration_verification` 测试事件。截至此次检查尚无真实浏览事件，真实用户转化与 Stripe 支付链路仍待验收。应用不会重复自动创建这些远程 Insight。

隐私：

- 不上传邮箱、搜索词、Claim / Lead 表单文本；事件 URL 去掉 query / hash。
- 私有账号、后台、Billing 和认领页不记录 pageview 或 replay；注册页仅允许 signup_started / identify。
- Replay 遮罩所有输入与文字，阻止 iframe、Clerk 组件、data-private；带查询参数页面也不录制。
- Stripe Hosted Checkout 不在本站，不录制银行卡页面。
- 尊重浏览器 Do Not Track。上线前按目标地区要求配置同意机制、保留期限并审核隐私政策。
- 服务端事件为 best effort；分析服务故障不阻断收藏、注册或付款。Webhook 重试使用稳定事件 UUID 去重；极端故障时仍可能少记分析事件，不能把它当账本。
- Stripe 通知可能乱序；付费漏斗用于行为分析，收入及权限以 Stripe / 本地订阅同步为准。

## 10. 去哪里看用户

**/admin/users** 直接读取 Clerk 的注册数和最近 30 个账号；今日新增统计最多扫描最近 1000 个账号，超过上限显示 Unavailable 而不展示低估数字。development instance 显式标识。

本地 profiles 仅作为同步资料显示，不冒充全部账号。当前 Save / Watch 为仍存在的关系数；最近 7 天发生这些行为的人数在 Growth 查看。认证故障再去 Clerk Logs，留存去 PostHog。

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
/admin → AI processing
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

1. `/admin` → RSS 应为 `Healthy`。
2. Last run 应接近当天计划时间。
3. Items processed 为 0 可能只是没有新文章；结合来源时间与失败记录判断。
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
打开 Production 检查首页、文章、搜索和 /admin
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

## 18. Paddle 收费设置：15 美元/月

用户已选择 Paddle，套餐为 USD 15/月，服务于海外用户。中国内地公司／个体工商户需使用真实主体向 Paddle 申请，产品和账户是否获批以 Paddle 审核为准。Sandbox 测试通过不等于真实收款已开通。旧 Stripe 接口仅用于兼容历史订阅。

最简单付款路径：

```text
用户选择 Pro
→ 网站 /checkout 打开 Paddle Checkout
→ 用户在 Paddle 付款
→ Paddle 签名通知 /api/webhooks/paddle
→ subscriptions 表更新
→ 用户获得 Pro 权限
```

Paddle 负责付款、订阅、收据、销售税处理和 Customer Portal。网站不保存银行卡信息。用户在 Settings → Billing 管理付款方式、账单及取消续费。最终税费和订单金额在结账时显示。

### 先配置 Sandbox

1. 注册 [Paddle Sandbox](https://sandbox-vendors.paddle.com/signup)。正式账号为 [Paddle](https://vendors.paddle.com/signup)，需另外审核。
2. Developer tools → Authentication：创建服务端 API key 和 Client-side token。API key 需要读取 Products、Prices、Subscriptions，创建／读取 Transactions，创建 Customer Portal sessions；如委托自动创建商品和通知，则另外授予对应写权限。
3. 填入本地 `.env.local`：`BILLING_PROVIDER=paddle`、`NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox`、`PADDLE_API_KEY`、`NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`。API key 不得加 NEXT_PUBLIC 前缀。
4. Catalog 创建 Pro 商品及月付价格：USD 15.00，每月一次，不启用试用；将 `pri_...` 填入 `PADDLE_PRO_PRICE_ID`。
5. Checkout 设置 Default payment link 为 `https://sports-tech-intelligence.vercel.app/checkout`；正式环境需要域名审核。
6. Developer tools → Notifications：Destination 为 `https://sports-tech-intelligence.vercel.app/api/webhooks/paddle`，启用 `transaction.completed`、`subscription.created`、`subscription.activated`、`subscription.updated`、`subscription.canceled`、`subscription.paused`、`subscription.resumed`、`subscription.past_due`、`subscription.trialing`。将签名密钥填入 `PADDLE_WEBHOOK_SECRET`。
7. 将配置同步到 Vercel 后重新部署。在明确显示 Test checkout 的页面完成 Sandbox 付款、取消、失败扣款、重复通知和乱序通知测试。

### 启用真实收费前

完成 Paddle 主体、域名和产品审核，确认网站有准确的经营主体信息、客服联系方式、服务条款和退款政策。替换全部 Sandbox 凭据与价格 ID，把 `NEXT_PUBLIC_PADDLE_ENVIRONMENT` 改为 `production`，再重新部署。正式账号开户、提交证件、同意服务协议和真实付款均由经营者本人完成。

### 经营主体、客服和退款处理

- 经营主体：东莞市中堂天姆德电商店；对外客服邮箱：beanliao00@163.com。统一信息位于 `src/lib/business.ts`，不要使用未经确认的英文主体名或虚构邮箱。
- 公开页面：`/contact`（联系）、`/terms`（条款）、`/refunds`（退款）、`/privacy`（隐私）。本地运行 `npm run dev` 后，例如打开 http://localhost:3000/contact；线上使用同一路径。
- 已确认规则：首次订阅付款后 7 天内可申请全额退款；续费默认不退。适用法律或 Paddle 政策提供更高保护时优先适用。取消续费不等于申请退款。
- 日常处理：收到客服邮件后核对账户邮箱、收据/交易编号和付款时间，在支付服务商后台处理退款并确认订阅取消状态；不要索取完整卡号，不要仅修改本地 Pro 标记代替服务商退款或取消。通知处理完成后核对网站权限。
- 收费前仍需通过 Paddle 主体、产品和域名审核，并验证支付与退款闭环；添加政策页面不等于审核通过或法律合规认证。

付款后日常在 /admin/revenue 查看；深度排查在 Paddle Dashboard 看 Transactions、Subscriptions 和 Notifications。`subscriptions` 保存权限，`paddle_events` 对通知去重。接收到通知后读取 Paddle 当前订阅状态，同一客户的写入串行执行，避免延迟通知撤销新权限。浏览器访问 success URL 不会授予 Pro。

2026-10-03：Paddle 数据库迁移已执行，执行前备份并校验 41 张应用表；完整 Sandbox 支付及正式收款仍待账号配置验收。

当前阶段只需要 Free / Pro，不要先设计复杂定价。还没有真实付费时，优先关注内容质量、访问、回访和注册，暂时不要过度关注 MRR、LTV、CAC。

## 19. 每月可能产生的成本

| 服务 | 负责什么 | 去哪里看 |
| --- | --- | --- |
| Vercel | 托管、Functions、带宽、Analytics | Project → Usage / Billing |
| Supabase | PostgreSQL、存储、备份 | Organization → Usage / Billing |
| Clerk | 注册、登录、用户 | Dashboard → Billing / Usage |
| AI Provider | 摘要、分类和 SEO 调用 | 当前 API Key 服务商 → Usage / Billing |
| Domain | 独立域名（当前尚未确认） | 域名注册商后台 |
| Paddle | 官方标准费率 5% + $0.50/笔；以账户实际条款为准 | Paddle → Reports / Payouts |

当前不额外接入邮件服务或 Sentry。PostHog 的事件与 Replay 可能产生用量费用，请在 PostHog 设置用量上限。

## 20. 常用后台链接

| 后台 | 状态 | 用途 |
| --- | --- | --- |
| [Vercel Project](https://vercel.com/douzi-sport-projects1/sports-tech-intelligence) | ACTIVE | 流量、部署、日志、Cron、Usage |
| [Clerk](https://dashboard.clerk.com) | ACTIVE | 注册、登录、用户和认证日志 |
| [Supabase](https://supabase.com/dashboard) | ACTIVE | PostgreSQL、表、SQL、日志、备份 |
| [GitHub](https://github.com/loooolBean/sports-tech-intelligence) | ACTIVE | 代码、commit、版本恢复 |
| 当前 OpenAI-compatible Provider | ACTIVE | AI Usage、Billing、Rate Limits |
| [Paddle](https://vendors.paddle.com/) | INTEGRATION ADDED; ACCOUNT AND PAYMENT VALIDATION PENDING | 15 美元/月订阅、通知、账单管理 |
| [PostHog](https://us.posthog.com/project/642621/home) | CONFIGURED; 3 FUNNELS CREATED; LIVE TRAFFIC VERIFICATION PENDING | 主要产品分析、漏斗、回放 |
| Vercel Web Analytics | RETAINED | 辅助流量观察 |

未接入：Google Analytics、Plausible、Umami、Sentry、Datadog、New Relic、Resend。当前阶段不需要重复安装。

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
| `BILLING_PROVIDER` | 当前为 paddle，历史 Stripe 兼容值为 stripe | 支付 |
| `PADDLE_API_KEY` | Paddle 服务端请求 | 支付 |
| `PADDLE_PRO_PRICE_ID` | USD 15/月价格 ID | 支付 |
| `PADDLE_WEBHOOK_SECRET` | 验证 Paddle 通知 | 支付 |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | 公开的客户端 checkout token | 支付 |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | sandbox 或 production，缺省 sandbox | 支付 |
| `STRIPE_SECRET_KEY` | 历史 Stripe 服务端请求 | 旧订阅兼容 |
| `STRIPE_WEBHOOK_SECRET` | 验证历史 Stripe Webhook | 旧订阅兼容 |
| `STRIPE_PRO_PRICE_ID` | Pro recurring Price ID | 真实收费 |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `NEXT_PUBLIC_POSTHOG_HOST` | 浏览器与服务端事件采集 | 产品分析 |
| `POSTHOG_PROJECT_ID` / `POSTHOG_PERSONAL_API_KEY` | 服务端只读报表 | Admin Growth |
| `VERCEL_READ_TOKEN` / `VERCEL_PROJECT_ID` / `VERCEL_TEAM_ID` | 最新生产部署状态（团队项目需要 Team ID） | 可选 |

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
- PostHog 浏览器 / 服务端 SDK

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

后台一级路由见第 4 节。旧 `/admin/articles/[id]` 编辑路由保留，`/admin/articles` 跳转 Content，`/admin/ops` 跳转 Overview。

### 本版本发布前检查

发布前先确认目标环境、备份和迁移，再部署。生产版本以 Vercel 的最新 Ready 部署为准：

```powershell
npm ci
npm run prisma:generate
npx prisma migrate status
# 确认 DATABASE_URL / DIRECT_URL 指向预期环境并完成备份后：
npx prisma migrate deploy
npm run typecheck
npm test
npm run build
```

新增迁移 `20261002000000_solo_founder_operations` 只增加文章时间字段和收藏表，不删除旧数据。未迁移就运行新版本会出现字段 / 表不存在；不要用 reset 修复。

2026-10-03（北京时间）已在当前 Supabase 数据库应用本次迁移，核对原有 318 篇文章和 1 个本地用户仍在，新收藏表启用了 RLS。迁移前已导出、回读校验 40 张 public 应用表，备份保存在本机被 Git 忽略的 `outputs/backups/`，没有上传 GitHub 或 Vercel。这是应用表快照，不包含 Supabase Auth / Storage，也不替代平台备份。此记录不代表未来的新环境已迁移，仍需运行 migrate status 检查。

真实连接验收（需要配置凭据和管理员账号）：

- 匿名进入 /admin 被送去登录 / Dashboard，普通账号无法访问后台或调用管理写入。
- 管理员 Overview 能读取数据；断开报表密钥时显示 Not connected；无效密钥时显示 Unavailable。
- 文章 Feature / Hide 后公开 Feed 更新；收藏后 Dashboard 可见，再取消。
- PostHog 收到 16 种事件的对应真实操作；登录前后关联，退出 reset；私有页没有 replay。
- Paddle Sandbox 付款、取消、失败与重复 webhook：权限正确，成功事件不因刷新 success 页重复产生。
- 在手机检查菜单与文章表横向滚动，再验证 Production。

重要原则：

- 所有页面依赖数据库，因此使用动态渲染。
- Admin 写入必须经过服务端管理员检查。
- 经签名验证的支付通知触发服务端查询支付平台当前订阅状态；浏览器回跳不能授予权限。
- Vendor 内容不能改写独立 Research / Evidence。
- Importance Score 只是内部编辑排序，不是科学评分。
- 未收录 Evidence 不等于 Evidence 不存在。

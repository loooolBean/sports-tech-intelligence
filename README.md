# Sports Tech Intelligence

Sports Tech Intelligence 是一个面向体育从业者的每日体育科技情报产品，同时保留公司、产品、Research、Evidence、比较和商业验证能力。

当前产品入口已重构为 **V0.7 Daily Intelligence Feed**：用户无需登录，打开首页就能看到当天最值得关注的体育科技动态。仓库中已有的 V0.8 Research、Pro、Stripe、Vendor 和 Lead 功能仍然可用，但不再占据首页和主导航的第一优先级。

## 产品能力

### Daily Intelligence Feed

- `/` 直接展示日期、过去 24 小时更新数、最多 5 条 Top Intelligence 和 15 条 Latest Intelligence
- Top Intelligence 只选择过去 24 小时、必要时扩大到 48 小时的高质量内容，不用旧文或低分内容凑数
- `/latest` 支持 6 个固定主题和 Today / This Week / All 时间筛选，筛选状态保留在可分享 URL 中
- `/topics` 和 `/topics/[slug]` 提供稳定的主题入口、最新内容和相关 Tags
- Article Detail 按 Summary、Why It Matters、最多 3 条 Key Takeaways、Original Source、Tags、关联 Company/Product 和 Related Intelligence 展示
- Public Feed、Topic 和 Article 页面无需登录；主导航聚焦 Today、Latest、Topics、Companies、Products、Search

### Intelligence 与内容

- 公司、产品、技术、使用场景和运动项目目录
- 公开搜索、产品比较、Watchlist、Alerts 和个性化 Dashboard
- RSS 采集、重复检测、正文提取、一次结构化 AI 处理、质量分级和安全发布
- Article/Intelligence 与科学 Research 分离建模

### Research 与 Evidence

- `/research` 公开研究库及 Study Type、Technology、Use Case、Sport、Year、Peer-reviewed 筛选
- `/research/[slug]` 展示作者、期刊、研究设计、样本、关联实体、结构化发现和 DOI
- Evidence 明确区分 Independent、Peer-reviewed、Professional Adoption 和 Vendor-reported 来源
- Product 页面展示真实 Evidence 计数、可追溯来源、筛选和 Free Preview
- Company 页面聚合关联 Research、Evidence 和拥有证据的产品
- Research 与 Evidence 均提供分页 Admin CRUD

平台只呈现证据、来源和研究背景，不生成 Evidence Score、产品排名或“最佳产品”结论。未收录证据不等于证据不存在。

### Free 与 Pro

权益由统一 entitlement layer 管理，不在页面中散落套餐判断。

| 能力 | Free | Pro |
| --- | --- | --- |
| 基础搜索及公开公司/产品页面 | 完整 | 完整 |
| Evidence | 计数和前 2 条预览 | 完整详情与高级筛选 |
| Research | 标题、摘要、来源与 DOI | 完整结构化发现与提取证据 |
| Compare | 最多 2 个产品、基础对比 | 最多 4 个产品、Research/Evidence 对比 |
| Watchlist | 最多 5 个实体 | 无限 |
| Dashboard | 基础 Intelligence | Research Updates |

### Stripe Subscription

- `/pricing` 提供 Free 和 Pro 套餐
- 服务端创建 Stripe Checkout Session，并复用已有 Customer
- Stripe Webhook 是订阅状态的唯一事实来源
- Webhook 验证签名并使用 `StripeEvent` 实现幂等处理
- 支持 `checkout.session.completed`、`customer.subscription.created`、`customer.subscription.updated` 和 `customer.subscription.deleted`
- `/settings/billing` 展示当前方案并进入 Stripe Billing Portal
- `/billing/success` 提供付款后的产品引导

### Vendor Claim 与 Lead Generation

- Company 页面提供 Claim Profile 入口
- Claim 必须经管理员 Approve/Reject，不能自动获得公司控制权
- 审核通过后建立 `CompanyMember`，Vendor 可维护公司和产品的官方信息
- Vendor-provided content 与平台独立 Research/Evidence 明确分区
- 只有已认领且启用 Leads 的公司产品才显示 Request Demo
- Leads 去重、分页，并通过服务端公司归属校验隔离

完整商业路径：

```text
User:   Discover → Search → Evidence → Research → Compare → Watch → Pro → Stripe
Vendor: Company → Claim → Admin Review → Showcase → Demo Request → Lead
```

## 日常使用指南

### 普通用户

普通用户最常用的方式不是先搜索，而是每天快速回答“今天体育科技发生了什么”。

#### 1. 每天先看 Today

打开 `/`，无需登录即可看到：

- 当天日期和过去 24 小时更新数
- `Today's Top Intelligence`：过去 24–48 小时内最多 5 条高优先级情报
- `Latest Intelligence`：按发布时间倒序的最新内容
- 6 个固定 Topic 入口

Top 区为空表示最近 48 小时没有达到质量门槛的内容，不代表页面故障；继续向下即可查看 Latest。首页不会为了凑数混入过时或低价值信息。

#### 2. 用 Intelligence Detail 快速判断是否值得跟进

点击任意情报后，建议按以下顺序阅读：

1. `Summary`：发生了什么。
2. `Why It Matters`：为什么体育从业者值得关注。
3. `Key Takeaways`：最多 3 个可扫读重点。
4. `Original Source`：回到原始报道核对上下文；官方公司来源会明确标记。
5. `Tags`、Related Company/Product 和 Related Intelligence：继续追踪相关主题与实体。

旧文章尚未完成 Why It Matters 回填时会显示明确的占位说明，不会生成假洞察或伪造完整正文。

#### 3. 在 Latest 中筛选完整情报流

进入 `/latest`，只使用两组简单筛选：

- Topic：All 或 6 个固定主分类
- Period：Today、This Week、All

筛选会写入 URL，例如：

```text
/latest?category=ai-sports
/latest?period=today
/latest?category=performance-technology&period=week
```

因此页面可以刷新、收藏或直接分享给同事。

#### 4. 按 Topic 持续浏览

`/topics` 展示 6 个主分类及各自最近 3 条内容；进入 `/topics/[slug]` 可查看该 Topic 的最新情报和常见相关 Tags。

固定 Topic 为：

- AI & Sports
- Performance Technology
- Wearables & Sensors
- Sports Science
- Products & Launches
- Business & Investment

`Other` 只作为无法归类内容的后备分类，不作为首页主 Topic。

#### 5. 需要深度调查时再使用第二层工具

- `/search`：搜索 Company、Product、Research 和 Intelligence。
- `/companies`、`/products`：查看实体资料、关联情报和 Evidence。
- `/research`：核对作者、期刊、样本、研究设计、Findings、DOI 和原始来源。
- `/compare`：Free 最多比较 2 个产品，Pro 最多 4 个。
- 登录后使用 `/watchlist`、`/alerts` 和 `/dashboard` 持续跟踪；相关情报会显示 Watchlist 标识。

Free 用户最多关注 5 个实体；达到限制不会删除已有数据。Article Save 本轮没有扩展，因为当前数据模型没有既有 SavedArticle 路由，避免扩大 Daily Feed 范围。

需要完整 Evidence、结构化 Research 或高级比较时，可通过 `/pricing` 升级 Pro，并在 `/settings/billing` 管理订阅。如果产品所属公司已经完成 Claim 且启用 Leads，Product Detail 会显示 Request Demo。

推荐的日常路径：

```text
Today → Top / Latest → Intelligence Detail → Original Source
      → Topic → Company / Product → Watchlist / Alerts
```

### 后台管理员

管理员的首要任务是保证公开 Feed 新、准、可读，同时继续维护 Research/Evidence 边界、Company Claim 和 Lead 运营。使用 Admin 前必须：

1. 配置一组匹配的 Clerk publishable/secret keys。
2. 使用 Clerk 登录。
3. 确保登录账号的主邮箱已列入 `ADMIN_EMAILS`。
4. 进入 `/admin`，确认能够看到 Admin Console。

不要只依赖前端菜单判断权限；所有管理操作仍会执行服务端管理员校验。

#### 1. 每日先看 Admin Dashboard

进入 `/admin`，优先检查：

- Draft Articles
- Ingestion Failures
- Pending Company Claims
- New Leads
- Research 和 Evidence 数量

优先处理采集/AI 失败、待审 Draft 和错误分类，再处理 Claim、Lead 与一般资料维护。

#### 2. 检查 Daily Feed 采集链路

标准内容流程：

```text
Source
→ RSS Ingestion
→ URL / Hash / 48h Similar-title Duplicate Check
→ Draft Article
→ One Structured AI Response
→ Summary + Category + Tags + Why It Matters
→ Key Takeaways + Importance Score + SEO
→ Safe Auto-publish or Admin Review
```

日常操作：

1. 在 `/admin/sources` 启用、停用或维护 RSS 来源。
2. 运行定时任务或手工触发 RSS ingestion。
3. 在 `/admin/failures` 检查抓取、解析、AI 或数据库失败。
4. 在 `/admin/articles` 检查 Category、Importance Score、Published、Duplicate、Featured 和 Hidden 状态。
5. 打开文章编辑页，修正 Category、Importance Score、Why It Matters、Featured、Hide from feed 和发布状态。
6. 在公开首页、Latest、Topic 与 Article Detail 抽查结果。

新文章始终先写为 Draft。只有 AI 结构化处理成功且 `importanceScore >= 35` 时，自动采集流程才允许发布；AI 失败、低分内容和重复内容保持 Draft 或从 Feed 排除。不要再按“所有 RSS 永远停留在 Draft”理解当前流程。

#### 3. 管理 Top Intelligence

Top 5 只从 Published、非重复、未隐藏的内容中选择：

```text
24 小时窗口
→ 不足 5 条时扩大到 48 小时
→ isFeatured DESC
→ importanceScore DESC
→ publishedAt DESC
```

普通内容需 `importanceScore >= 45`；Admin 可通过 `isFeatured` 人工置顶修正 AI 判断。Score 是 0–100 的内部编辑排序值，绝不在公开 Feed 展示，也不应被描述为科学评分。

`Hide from feed` 用于从公开 Feed、Latest 和 Topic 中移除内容而不删除数据库记录。重复新闻应保留最早或信息最完整的来源，其余文章通过 `duplicateOfId` 标记并从主 Feed 排除。

#### 4. 控制旧文回填

仅回填最近 30 天、尚未处理或缺少 Why It Matters 的非重复文章：

```powershell
npm run backfill:intelligence -- --limit=5
```

默认 25 条，`--limit` 最大 100。先用小批量验证有效的 `AI_API_KEY`、模型输出和数据库连接，再逐步扩大；不要对整库无控制调用 AI。回填失败不会覆盖已有字段。

#### 5. 管理 Research 与 Evidence

在 `/admin/research` 和 `/admin/evidence`：

- 创建、编辑和删除 Research/Evidence
- 填写作者、期刊、年份、Study Type、Population、Sample Size、摘要和 Findings
- 关联 Product、Company、Technology、Use Case 和 Sport
- 确保每条 Evidence 可跳转到 Research、DOI 或 Original Source
- 核对 Independent、Peer-reviewed、Professional Adoption 与 Vendor-reported 分类

保留研究限制和人群背景，不得把相关性夸大为因果关系。Vendor Claim 不能表现为独立科学证据，管理员不得创建 Evidence Score、产品排名或 Winner 结论。

#### 6. 审核 Company Claims 与 Vendor 内容

进入 `/admin/claims`，检查 Company、申请用户、工作邮箱、职位、说明和提交时间。

审核流程：

```text
Pending Claim
→ Verify Company Identity and Work Email
→ Approve or Reject
→ Approved Claim Creates CompanyMember
```

- Approve 会建立 CompanyMember，Reject 不授予公司控制权。
- 公司已经被认领或存在重复申请时，先核对现有成员和 Claim 状态。
- Vendor 可维护公司/产品官方资料，但不能修改独立 Evidence、Research 结论或证据分类。

Approved/Verified 只表示企业身份通过验证，不代表其产品获得科学有效性认证。

#### 7. 查看 Leads 与订阅状态

在 `/admin/leads` 查看全平台 Demo Requests，用于运营监督和异常排查。Vendor 只能在 `/vendor/leads` 查看其所属公司的 Leads。

不要公开联系人信息或把 Message 写入 Analytics。管理员还应定期检查：

- Stripe Webhook 是否成功，是否出现重复或签名失败事件
- Subscription status 是否与 Stripe 一致
- Clerk Webhook 和登录是否正常
- Supabase 是否在线、迁移是否全部应用
- Cron、RSS ingestion 和 SEO backfill 是否成功
- Public、Protected、Vendor 和 Admin 路由是否符合预期

推荐的管理员日常顺序：

```text
Admin Dashboard
→ Ingestion Failures
→ Draft / Low-score / Duplicate Articles
→ Public Feed Spot Check
→ Research/Evidence Quality
→ Pending Claims
→ New Leads
→ Subscription/Webhook Health
```

## 技术栈

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 3、Framer Motion、Lucide React
- PostgreSQL/Supabase、Prisma 6
- Clerk Authentication
- Stripe 官方 Node SDK
- OpenAI-compatible AI service、Zod
- Vercel

本项目为单 package，不是 monorepo。主要目录：

```text
app/                 App Router 页面与 Route Handlers
src/actions/         Server Actions
src/components/      Research、Evidence、Pro、Vendor、Lead 等 UI
src/lib/             数据访问、认证、权益、Stripe 与业务查询
src/services/        RSS、AI 摘要与 SEO 服务
src/utils/           纯内容处理工具
prisma/              Schema、迁移与 seed
tests/               Node 测试
scripts/             采集、回填和诊断脚本
```

## 本地启动

### 1. 安装依赖

```powershell
npm ci
```

### 2. 配置环境变量

仅在 `.env` 不存在时复制模板：

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

不要提交 `.env` 或任何真实密钥。

| 变量 | 必需范围 | 用途 |
| --- | --- | --- |
| `DATABASE_URL` | 应用必需 | PostgreSQL 应用连接；Supabase 可使用连接池地址 |
| `DIRECT_URL` | 迁移必需 | Prisma migration 的直接或 session 连接 |
| `NEXT_PUBLIC_SITE_URL` | 应用必需 | 本地通常为 `http://localhost:3000` |
| `AI_API_KEY` | AI/RSS 功能 | AI 服务密钥 |
| `AI_API_BASE_URL` | AI/RSS 功能 | OpenAI-compatible API 地址 |
| `AI_MODEL` | AI/RSS 功能 | 服务支持的模型名 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | 登录功能 | Clerk publishable key |
| `CLERK_SECRET_KEY` | 登录功能 | 必须与 publishable key 属于同一 Clerk instance |
| `CLERK_WEBHOOK_SECRET` | Clerk 同步 | 验证 Clerk Webhook |
| `ADMIN_EMAILS` | Admin | 逗号分隔的管理员主邮箱 |
| `CRON_SECRET` | Cron | 保护采集与 SEO Route Handlers |
| `STRIPE_SECRET_KEY` | Pro 付款 | Stripe 服务端密钥 |
| `STRIPE_WEBHOOK_SECRET` | Pro 付款 | 验证 Stripe Webhook 签名 |
| `STRIPE_PRO_PRICE_ID` | Pro 付款 | Stripe recurring Price ID |

Stripe Checkout 全部在服务端执行，因此不需要 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`。

Clerk 是可选模块：未提供有效 key 时公开页面仍可运行，但登录、Admin、Watchlist、Billing 和 Vendor 功能不可用。若启用 Clerk，publishable key 与 secret key 必须来自同一应用，否则可能出现认证重定向循环。

### 3. 准备 Prisma

```powershell
npm run prisma:generate
npx prisma migrate status
```

新建的开发数据库可运行：

```powershell
npm run prisma:migrate
```

生产环境只应用已提交迁移：

```powershell
npx prisma migrate deploy
```

不要对已有数据的数据库运行 `prisma migrate reset`。

### 4. 启动项目

```powershell
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。停止服务器使用 `Ctrl+C`。

若本地 Clerk key 尚未配置或不匹配，可在不修改 `.env` 的情况下启动只包含公开功能的会话：

```powershell
$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = ''
$env:CLERK_SECRET_KEY = ''
npm run dev
```

## Stripe Dashboard 配置

代码完成后仍需在 Stripe Dashboard 手工完成：

1. 创建 Pro recurring Product/Price，将 ID 写入 `STRIPE_PRO_PRICE_ID`。
2. 创建指向 `https://<domain>/api/webhooks/stripe` 的 Webhook endpoint。
3. 订阅上文列出的一个 Checkout 和三个 Subscription 生命周期事件。
4. 将 signing secret 写入 `STRIPE_WEBHOOK_SECRET`。
5. 启用并配置 Billing Portal。

缺少这些配置时，公开产品功能仍可运行，但真实 Checkout、订阅同步和 Billing Portal 不可用。

## 主要路由

### Public

| 路径 | 用途 |
| --- | --- |
| `/` | Today、Top 5、Latest 15 与 Topic 入口 |
| `/latest` | 可按 Topic 和 Today / This Week / All 筛选的完整情报流 |
| `/topics`、`/topics/[slug]` | 6 个主分类及各自的最新情报与相关 Tags |
| `/search` | Company、Product、Research、Intelligence 搜索 |
| `/companies`、`/companies/[slug]` | 公司目录与详情 |
| `/products`、`/products/[slug]` | 产品目录、Evidence 与 Demo Request |
| `/research`、`/research/[slug]` | Research 搜索、筛选和详情 |
| `/compare` | Free/Pro 产品比较 |
| `/pricing` | Free 与 Pro 定价 |
| `/article/[slug]` | Intelligence 文章详情 |

### User

| 路径 | 用途 |
| --- | --- |
| `/dashboard` | 个性化 Dashboard 和方案状态 |
| `/watchlist` | 已关注公司和产品 |
| `/alerts` | Watchlist 变化通知 |
| `/settings/billing` | Subscription 与 Billing Portal |
| `/billing/success` | Checkout 完成页 |

### Vendor

| 路径 | 用途 |
| --- | --- |
| `/companies/[slug]/claim` | 提交 Company Claim |
| `/vendor` | Vendor Dashboard |
| `/vendor/companies/[slug]` | 编辑公司资料 |
| `/vendor/products/[slug]` | 编辑产品官方信息 |
| `/vendor/leads` | 查看所属公司的 Leads |

### Admin

Admin 包含 Articles、Sources、Categories、Tags、Failures、Newsletter，以及：

- `/admin/research`
- `/admin/evidence`
- `/admin/claims`
- `/admin/leads`

所有 Admin 写入、Claim 审核、Vendor 编辑和 Lead 查询均执行服务端授权。

## RSS 与 Intelligence 运维

RSS 先把新内容保存为 Draft，再执行重复检测和一次严格校验的 structured AI 处理。处理成功且 `importanceScore >= 35` 的自动采集内容可以安全发布；AI 失败、低分或重复内容不会进入公开 Feed。只有 Published、非重复且未隐藏的 Article 会被公开查询读取。

```powershell
npm run seed:sources
npm run ingest
npm run seo
npm run backfill:intelligence -- --limit=5
```

`backfill:intelligence` 只选择最近 30 天中未处理、缺少 AI Summary 或缺少 Why It Matters 的文章，单次最多 100 条。

也可以直接调用受 `CRON_SECRET` 保护的接口：

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `/api/cron/ingest-rss` | GET/POST | RSS 采集、重复检测、AI 处理与安全发布 |
| `/api/cron/generate-seo-metadata` | GET/POST | SEO metadata 回填 |
| `/api/webhooks/clerk` | POST | Clerk 用户同步 |
| `/api/webhooks/stripe` | POST | Stripe subscription 同步 |

连接 Supabase 失败时，先确认项目没有因闲置暂停，再执行：

```powershell
npx tsx scripts/test-supabase.ts
```

## 开发与发布检查

```powershell
npm run typecheck
npm test
npm run build
npx prisma validate
npx prisma migrate status
```

仓库目前没有 lint、format 或 CI script。`npm test` 使用 Node Test Runner，覆盖 Pro entitlement、套餐限制、Stripe subscription lifecycle，以及 Daily Feed 分类、标题相似度、时间窗口和阈值规则。

当前已验证：

- TypeScript typecheck 通过
- Commercial 与 Daily Feed tests 7/7 通过
- Next.js production build 通过
- Prisma schema、已提交迁移及数据库结构一致
- Public、Protected、Stripe webhook、Vendor/Lead 数据隔离流程通过
- Daily Feed 首页、Latest 和 Article Detail 的 375/390px 单栏与 desktop 响应式检查通过

## 数据模型与迁移

V0.7 Daily Feed 在现有 Article/AiSummary 结构上增加：

- `Article.importanceScore`、`isFeatured`、`isHiddenFromFeed`、`processedAt`
- `AiSummary.whyItMatters`
- 复用现有 `Category` 作为单一 Primary Category，复用 `AiSummary.keyTakeaways`、`Article.duplicateOfId` 和 Tags

对应非破坏性迁移：

```text
20260919120000_add_daily_intelligence_feed
```

V0.8 主要新增：

- `Research`、`ResearchProduct`、`ResearchCompany`、`ResearchTechnology`、`ResearchUseCase`、`ResearchSport`
- `Evidence`
- `Subscription`、`StripeEvent`
- `CompanyClaim`、`CompanyMember`
- `Lead`

对应非破坏性迁移：

```text
20260919000000_add_commercial_intelligence
20260919010000_add_vendor_product_info
```

## 已知外部依赖

- Daily Feed AI 处理与 backfill 需要有效的 `AI_API_KEY`；无效或缺失时文章保持 Draft，管理员需从 Failures/命令输出排查。
- Stripe 真实付款依赖 Dashboard 中的 Product/Price、Webhook 和 Billing Portal 配置。
- Clerk key 必须来自同一 instance；不匹配会导致认证握手失败。
- Supabase 免费项目可能因闲置暂停，需要在 Dashboard 恢复。
- `npm audit` 当前剩余 Next.js 内部 PostCSS 与 Prisma config 的传递依赖告警；彻底消除需要评估 Next.js/Prisma major upgrade，不应直接运行 `npm audit fix --force`。

## 部署

1. 在 Vercel 配置生产环境变量。
2. 对目标数据库运行 `npx prisma migrate deploy`。
3. 配置 Clerk 和 Stripe 的生产 Webhook。
4. 启用 Stripe Billing Portal。
5. 运行 `npm run typecheck`、`npm test` 和 `npm run build`。
6. 验证 public、auth、checkout、billing、claim、vendor 和 lead 流程。

项目地址：

- Website: [sports-tech-intelligence.vercel.app](https://sports-tech-intelligence.vercel.app)
- Repository: [loooolBean/sports-tech-intelligence](https://github.com/loooolBean/sports-tech-intelligence)

## License

Private — All Rights Reserved

# Sports Technology Intelligence Platform

体育科技资讯平台：从 RSS 获取文章，提取正文和图片，生成 AI 摘要、要点、分类、标签及 SEO 元数据，再由管理员审核发布。

## 项目地址

- 网站：[Sports Technology Intelligence](https://sports-tech-intelligence.vercel.app)
- 登录：[账号登录](https://sports-tech-intelligence.vercel.app/sign-in)
- 后台：[管理后台](https://sports-tech-intelligence.vercel.app/admin)
- GitHub：[loooolBean/sports-tech-intelligence](https://github.com/loooolBean/sports-tech-intelligence)
- 当前本地目录：`E:\you-are-a-senior-saas-architect`

### 最近验证状态

截至 2026-09-05：

- Vercel 线上首页和登录页返回 HTTP 200，首页能够读取文章，没有 Prisma 或数据库连接错误。
- Supabase 免费项目曾因闲置暂停，现已恢复并通过 `SELECT 1` 连接测试。免费项目以后仍可能再次暂停。
- 本地开发服务器在 `http://localhost:3000` 正常运行，首页返回 HTTP 200。
- 未登录直接访问 `/dashboard` 或 `/admin` 目前可能返回 404；请先打开 `/sign-in` 登录。
- Git 远程仓库与上面的 GitHub 地址一致。仓库同时存在不同提交的 `main` 与 `master` 分支，发布前需要确认 Vercel 绑定的生产分支。

## 当前能做什么

| 模块 | 当前实现 |
| --- | --- |
| 内容采集 | 遍历启用且有 RSS URL 的来源，提取正文和图片，关键词相关性筛选、去重、记录失败 |
| AI 处理 | 生成摘要、关键要点、分类、标签、SEO 标题和描述 |
| 阅读与发现 | 首页、文章详情、分类、标签、关键词搜索、深浅色主题 |
| 后台运营 | 文章编辑与发布、来源启停、分类管理、标签查看、失败日志、订阅者管理 |
| SEO 与订阅源 | Sitemap、Robots、结构化数据、Open Graph、`/feed.xml` |
| Newsletter | 保存订阅邮箱、查看订阅者；尚未实现邮件投递、每日摘要发送和退订流程 |

标准采集接口将新文章保存为 **DRAFT**，不会自动发布。只有 **PUBLISHED** 文章才进入公开文章列表。来源类型可选新闻网站、博客等，但标准采集入口仍要求提供 RSS URL，并非输入任意网站就能全站爬取。

## 技术栈

Next.js 15 App Router、React 19、TypeScript、Tailwind CSS 3、Framer Motion；PostgreSQL + Prisma 6；Clerk 登录；OpenAI SDK 对接可配置的 AI 服务；Vercel 部署。

AI 服务由 `AI_API_KEY`、`AI_API_BASE_URL`、`AI_MODEL` 决定，并非固定使用某一家供应商。当前源码调用 `chat.completions.create`，使用 JSON object 输出并经 Zod 校验；`AGENTS.md` 中的 Responses API 描述与当前实现不一致，后续应统一。

## 本地启动

以下以 Windows PowerShell 为例。准备 Node.js、npm、可连接的 PostgreSQL、AI 服务凭据及 Clerk 应用。下列命令使用 Node 的 `--env-file`，需要 Node.js 20.6 或更高版本；本次检查机器上的 Node 为 v24.16.0。

### 已配置项目的最快启动

如果依赖、`.env` 和数据库都已配置，在普通 Windows PowerShell 中运行：

```powershell
Set-Location 'E:\you-are-a-senior-saas-architect'
npm run prisma:generate
npm run dev
```

看到 `Ready` 后打开 [http://localhost:3000](http://localhost:3000)。开发服务器需要保持运行；关闭该 PowerShell 窗口或按 `Ctrl + C` 会停止网站。

如果出现 `Error opening a TLS connection: 安全包中没有可用的凭证`，请从普通 Windows PowerShell 启动服务，不要从受限的自动化沙箱进程启动。

### 1. 进入项目并安装依赖

已有本地项目：

```powershell
Set-Location 'E:\you-are-a-senior-saas-architect'
npm ci
```

新机器：

```powershell
git clone https://github.com/loooolBean/sports-tech-intelligence.git
Set-Location sports-tech-intelligence
npm ci
```

### 2. 配置环境变量

仅在没有 `.env` 时复制，保留已有配置：

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

编辑 `.env`：

| 变量 | 用途与要求 |
| --- | --- |
| `DATABASE_URL` | 应用数据库连接，必填；可使用 Supabase 提供的连接池地址 |
| `DIRECT_URL` | Prisma 迁移连接，必填；本地 PostgreSQL 可与 `DATABASE_URL` 相同 |
| `AI_API_KEY` | 采集时生成摘要、SEO 回填需要；兼容读取 `OPENAI_API_KEY` |
| `AI_API_BASE_URL` | AI 服务地址；默认值见 `.env.example`，应与所选供应商匹配 |
| `AI_MODEL` | 该服务实际支持的模型名；兼容读取 `OPENAI_MODEL` |
| `NEXT_PUBLIC_SITE_URL` | 本地填写 `http://localhost:3000`，部署时填写正式网站地址 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | 真实 Clerk 公钥，不能直接保留 `pk_test_...` 占位符 |
| `CLERK_SECRET_KEY` | 与公钥对应的 Clerk 服务端密钥 |
| `CLERK_WEBHOOK_SECRET` | 配置 Clerk Webhook 同步时使用 |
| `ADMIN_EMAILS` | 管理员邮箱，多个用逗号分隔；需与登录账号主邮箱一致 |
| `CRON_SECRET` | 采集与 SEO 接口的共享密钥，本地调用与服务端保持一致 |

不要提交 `.env` 或真实密钥。Cron 接口在未设置 `CRON_SECRET` 时返回 503；部署前必须配置该变量。

**Clerk 的现有限制：** 前端会根据公钥决定是否显示认证组件，但 `middleware.ts` 仍无条件启用 Clerk，服务端认证也没有完整禁用分支。因此不要把“不配置 Clerk”当作已验证可用的运行模式；要使用后台，请配置有效的 Clerk 密钥和管理员邮箱。

### 3. 初始化数据库

对全新的本地开发数据库执行：

```powershell
npm run prisma:generate
npm run prisma:migrate
```

迁移命令实际是 `prisma migrate dev`，用于开发。生产环境应用已有迁移使用 `npx prisma migrate deploy`，不要对生产库运行开发迁移或重置操作。

### 4. 启动网站

```powershell
npm run dev
```

打开 [本地首页](http://localhost:3000)。通过 `/sign-up` 注册或 `/sign-in` 登录，再进入 `/admin`。当主邮箱包含在 `ADMIN_EMAILS` 中时，读取用户资料会将其设为 ADMIN。

如果数据库尚无已发布文章，首页为空是正常现象。接着完成下面的首次内容导入。

### 完全停止并重新启动

在运行 `npm run dev` 的 PowerShell 窗口按 `Ctrl + C`。然后确认 3000 端口是否仍被占用：

```powershell
netstat -ano | Select-String ':3000'
```

没有输出表示服务已经停止。如果仍看到 `LISTENING`，记录该行最后一列的 PID，并停止该进程：

```powershell
Stop-Process -Id <PID> -Force
```

重新生成 Prisma Client 并启动：

```powershell
Set-Location 'E:\you-are-a-senior-saas-architect'
npm run prisma:generate
npm run dev
```

最后验证首页：

```powershell
$response = Invoke-WebRequest -UseBasicParsing http://localhost:3000/ -TimeoutSec 30
$response.StatusCode
```

输出 `200` 表示网站能够响应。

### 常见启动错误

| 错误 | 原因 | 处理 |
| --- | --- | --- |
| `@prisma/client did not initialize yet` | Prisma Client 尚未生成，或服务仍缓存旧客户端 | 停止开发服务器，执行 `npm run prisma:generate`，再执行 `npm run dev` |
| `EPERM ... query_engine-windows.dll.node` | 开发服务器占用 Prisma 引擎文件 | 先用 `Ctrl + C` 或 `Stop-Process` 完全停止占用 3000 端口的进程，再生成客户端 |
| `Can't reach database server ...:6543` | Supabase 项目暂停、连接串失效或数据库仍在恢复 | 按下一节恢复 Supabase，运行连接测试后重启网站 |
| `安全包中没有可用的凭证` | Windows 受限进程无法取得 TLS 凭据 | 在普通 Windows PowerShell 中启动网站 |

## Supabase 暂停与数据库连接故障

出现下面任一错误时，Prisma Client 通常已经生成，但应用连不上 Supabase：

```text
Can't reach database server at aws-1-ap-southeast-2.pooler.supabase.com:6543
Invalid prisma.article.findMany() invocation
```

按以下顺序处理：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)，进入当前项目。
2. 如果页面显示 `Project is paused`，点击 `Resume project` 并确认恢复。
3. 等待状态从 `Restoration in progress` 或 `Coming up...` 变为正常运行。恢复通常需要几分钟。
4. 从项目的 `Connect` 页面重新复制连接串，不要手写主机名、用户名或端口。
5. 将 Transaction Pooler（端口 6543）填写到 `DATABASE_URL`，并保留 `pgbouncer=true`。
6. 将 Session Pooler（端口 5432）填写到 `DIRECT_URL`。
7. 保存 `.env`，运行连接测试：

```powershell
npx tsx scripts/test-supabase.ts
```

看到 `Supabase OK: [ { test: 1 } ]` 表示数据库可用。随后按上面的“完全停止并重新启动”流程重启网站。

若端口能够连接但测试仍失败，回到 Supabase 的 `Connect` 页面核对项目地址和密码。密码含有 `@`、`#`、`%` 等字符时必须正确进行 URL 编码。不要把完整连接串或数据库密码提交到 Git、截图或聊天中。

## 登录后台

线上登录流程：

1. 打开 [https://sports-tech-intelligence.vercel.app/sign-in](https://sports-tech-intelligence.vercel.app/sign-in)。
2. 使用其主邮箱已列入生产环境 `ADMIN_EMAILS` 的 Clerk 账号登录；多个管理员邮箱用逗号分隔。
3. 登录成功后进入 `/dashboard`，确认页面显示角色为 `ADMIN`。
4. 点击 `Admin Console`，或再打开 `/admin`。

本地登录使用 [http://localhost:3000/sign-in](http://localhost:3000/sign-in)，规则相同。没有 ADMIN 权限的已登录用户会留在 `/dashboard`，无法进入后台。当前实现会给白名单邮箱授予 ADMIN，但从 `ADMIN_EMAILS` 移除邮箱后不会自动撤销数据库中已有的 ADMIN 角色，这是待修复项。

## 后台运行与发布流程

1. **添加来源**：进入 `/admin/sources`，填写名称、RSS URL 等并启用。首次建议只启用少量来源，方便核对采集结果。
2. **采集内容**：保持开发服务器运行，在另一个 PowerShell 窗口进入项目目录并执行下面的采集命令。
3. **检查结果**：查看终端中的新增、重复、失败计数，以及 `/admin/failures`。标记日志已解决只是更新状态，不会自动重试。
4. **人工审核**：在 `/admin/articles` 筛选 DRAFT，检查原文、标题、正文、图片与摘要；编辑后将状态改为 PUBLISHED。
5. **确认展示**：打开首页、文章页、分类和搜索，确认刚发布的文章可被找到。
6. **日常维护**：定期处理草稿和失败日志，停用失效来源，需要时补充 SEO 元数据。

### 后台操作对应的前端反馈

| 后台操作 | 前端预期结果 |
| --- | --- |
| 将文章改为 `PUBLISHED` | 文章可出现在首页、文章详情、分类、标签和搜索结果中 |
| 将文章改为 `DRAFT`、`REJECTED` 或 `ARCHIVED` | 文章不再进入公开文章列表 |
| 编辑标题、摘要、正文或 SEO 字段 | 文章详情页及相应搜索引擎元数据更新 |
| 新增并启用 RSS 来源 | 下次采集时读取该来源；不会立即自动出现公开文章 |
| 停用来源 | 后续批次不再从该来源采集，已有文章不受影响 |
| 标记失败记录为已解决 | 只更新失败日志状态，不会自动重试采集 |
| 新增 Newsletter 订阅者 | 后台订阅者列表更新；当前版本不会自动发送邮件 |

每次发布后至少检查首页、对应文章页、分类页和搜索结果。若后台保存成功但前端未显示，先确认文章状态为 `PUBLISHED`，再检查数据库连接和服务器日志。

加载 `.env` 并触发采集：

```powershell
node --env-file=.env scripts/ingest-rss.cjs
```

为缺少元数据的文章执行 SEO 回填，每次 25 篇：

```powershell
node --env-file=.env scripts/generate-seo.cjs 25
```

这些脚本通过 HTTP POST 调用 `NEXT_PUBLIC_SITE_URL`，所以目标网站必须已启动。它们会修改目标网站所连接的数据库；首次本地试用应将地址设为 `http://localhost:3000` 并使用开发数据库。采集和 SEO 回填会调用 AI 服务。

可选：批量导入仓库内预设来源与分类：

```powershell
node --env-file=.env --import tsx scripts/seed-sports-tech-sources.ts
```

预设脚本会启用新增来源，跳过已有且具备 RSS URL 的来源；列表中的 Feed 地址未在此次逐一验证。导入后应在后台筛选需要启用的来源。

`npm run ingest`、`npm run seo`、`npm run seed:sources` 也有对应脚本，但没有显式的 `.env` 加载参数。为避免独立脚本漏读网站地址或密钥，首次使用优先采用上面的显式加载命令。

## 页面与接口

| 路径 | 用途 |
| --- | --- |
| `/` | 最新已发布文章 |
| `/article/[slug]` | 文章详情与 AI 摘要 |
| `/category`、`/category/[slug]` | 分类目录、分类文章 |
| `/tag/[slug]` | 标签文章 |
| `/search?q=关键词` | 关键词搜索 |
| `/newsletter` | 登记订阅邮箱，暂不自动发送邮件 |
| `/privacy` | 隐私说明 |
| `/sign-in`、`/sign-up`、`/dashboard` | 登录、注册、账号面板 |
| `/admin` | 管理总览 |
| `/admin/articles`、`/admin/articles/[id]` | 文章列表与编辑 |
| `/admin/sources`、`/admin/categories`、`/admin/tags` | 来源、分类、标签管理 |
| `/admin/newsletter`、`/admin/failures` | 订阅者、失败记录 |
| `/sitemap.xml`、`/robots.txt`、`/feed.xml` | 搜索引擎与 RSS 阅读器入口 |

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/cron/ingest-rss` | GET / POST | 采集启用来源，生成草稿 |
| `/api/cron/generate-seo-metadata?batchSize=25` | GET / POST | SEO 回填，可传 `overwrite=true` 覆盖已有数据 |
| `/api/webhooks/clerk` | POST | Clerk 用户事件同步，校验 Webhook 签名 |

Cron 请求必须携带 `Authorization: Bearer <CRON_SECRET>`。未配置 `CRON_SECRET` 时接口返回 503，密钥不匹配时返回 401。Vercel Cron 和上面的 Node 脚本都会使用环境变量构造该请求头。

## 定时运行与部署

`vercel.json` 当前按 Vercel Hobby 套餐限制安排为每天执行一次：RSS 在 UTC 00:00（北京时间 08:00）执行，SEO 在 UTC 01:30（北京时间 09:30）执行。

两个 Cron 路由同时支持 GET 和 POST。Vercel Cron 使用 GET，手动脚本使用 POST，二者共用相同的 `CRON_SECRET` 校验和任务逻辑。[Vercel Cron 官方说明](https://vercel.com/docs/cron-jobs)

部署后仍需在 Vercel 的 Settings → Cron Jobs 和 Logs 中确认任务实际触发成功。若升级到付费计划并需要更及时的内容，可以再提高执行频率。

需要立即采集时也可手动运行上述脚本。若用 Windows 任务计划程序，填写 Node 可执行文件完整路径、参数 `--env-file=.env scripts/ingest-rss.cjs`，起始目录填写项目绝对路径；目标网站必须可访问。机器上的 Node 路径可用 `(Get-Command node).Source` 查看。

部署准备流程：

1. 在 Vercel 导入 GitHub 仓库，填写生产环境变量和正式网站地址。
2. 通过受控发布流程对目标数据库执行 `npx prisma migrate deploy`。
3. 构建时运行 `npm run prisma:generate` 和 `npm run build`。
4. 配置生产 Clerk 应用；如需 Webhook，同步地址为正式域名下的 `/api/webhooks/clerk`。
5. 完成下面 P0 项目后，验证登录、来源管理、采集、审核发布及定时任务日志。

### 线上运行检查

Vercel 页面正常但 Supabase 暂停时，网站仍可能返回页面外壳，同时数据库查询报错。因此需要分别检查应用和数据库：

```powershell
Invoke-WebRequest -UseBasicParsing https://sports-tech-intelligence.vercel.app/ -TimeoutSec 30 | Select-Object StatusCode

npx tsx scripts/test-supabase.ts
```

第一条应返回 `200`，第二条应显示 `Supabase OK`。线上登录页为 `/sign-in`；未登录访问受保护路由目前可能看到 404。

## 常用开发命令

```powershell
npm run dev
npm run typecheck
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
```

`npm run start` 需要先成功构建。仓库当前没有专门的 lint、test、format 或 CI 脚本。

## 目录结构

```text
app/                 页面、管理后台、API 路由
src/lib/             Prisma、认证、数据查询、后台操作、SEO
src/services/        RSS 采集、AI 摘要、SEO 回填
src/utils/content.ts 内容清洗、URL 处理、slug 与哈希工具
prisma/              数据模型及迁移
scripts/             采集入口、来源初始化、诊断与回填工具
.env.example         环境变量模板
vercel.json          定时任务配置
DESIGN_SYSTEM.md     设计规范
```

## 已知限制与下一步计划

以下为基于本地源码的建议计划，尚未实施，不代表线上已完成验证。

| 优先级 | 工作 | 验收标准 |
| --- | --- | --- |
| P0：运行可靠性 | 确认每日 Cron 有成功记录；让脚本在失败时返回非零退出码；增加并发保护与 Supabase 暂停告警 | 调度器能识别失败；重复触发不会重复处理；数据库离线时收到告警 |
| P0：后台权限与登录 | 在每个后台写入 Server Action 内校验管理员；补齐 Clerk 缺配置行为、管理员撤权和未登录跳转逻辑 | 普通用户直接调用写入操作被拒绝；撤权后不再保留 ADMIN；未登录访问后台跳转到 `/sign-in` |
| P0：发布分支 | 确认 Vercel 生产分支并统一 `main`、`master` | GitHub 默认分支、Vercel Production Branch 和实际发布提交一致 |
| P1：采集质量 | 核验预设来源、收紧体育科技相关性筛选、拆分批次与重试；修复 AI 失败后的重处理路径 | 同一文章不重复入库；摘要失败可恢复；每批耗时、失败原因可追踪 |
| P1：发布闭环 | 增加后台采集/重试入口、预览、批量审核及分页；覆盖关键路径的自动检查 | 管理员能从添加来源到文章发布完成整套操作，且发布后能搜索到文章 |
| P2：Newsletter | 实现订阅确认、退订、摘要邮件、投递日志及失败处理 | 测试邮箱收到一期摘要，退订后不再收到邮件 |
| P2：维护与度量 | 增加 CI、任务健康指标、AI 用量统计；统一认证和 AI 接口文档 | 类型检查与构建进入发布检查；可查看任务成功率和调用量；文档与实现一致 |

已识别的源码依据：`src/lib/admin.ts` 的后台写入函数缺少函数内管理员校验；`src/lib/auth.ts` 目前会授予 ADMIN，但移除白名单邮箱时不会主动降权；Newsletter 订阅操作目前只写数据库；RSS 来源及条目顺序处理，失败重试和批次恢复仍需完善。

建议执行顺序：**先完成 P0，再用少量来源跑通采集 → 审核 → 发布，之后扩大来源并实现邮件发送。**

## 许可证

Private - All Rights Reserved

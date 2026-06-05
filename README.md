# Sports Technology Intelligence Platform

体育科技智能资讯平台 — 自动采集 RSS / 新闻网站内容，AI 生成摘要和 SEO 元数据，支持后台审核、Newsletter 订阅、全文搜索。

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **数据库**: PostgreSQL (Supabase) + Prisma ORM
- **认证**: Clerk（可选，未配置时自动禁用）
- **AI**: OpenAI API（文章摘要、SEO 元数据生成）
- **样式**: Tailwind CSS 3

## 快速开始

### 1. 安装依赖

```bash
cd E:\you-are-a-senior-saas-architect
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库（Supabase）
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-xxx.pooler.supabase.com:5432/postgres"

# OpenAI（用于 AI 摘要）
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4.1-mini"

# 网站地址
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Clerk 认证（可选）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# 管理员邮箱（登录后自动获得 ADMIN 权限）
ADMIN_EMAILS="your@email.com"

# Cron 接口密钥
CRON_SECRET="your-secret"
```

### 3. 初始化数据库

```bash
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 创建数据库表
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

---

## 前台页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 最新文章列表 |
| `/article/[slug]` | 文章详情 | 正文 + AI 摘要 + Key Takeaways + 相关文章 |
| `/category/[slug]` | 分类页 | 按分类筛选文章，支持分页 |
| `/tag/[slug]` | 标签页 | 按标签筛选文章 |
| `/search` | 搜索 | 全文搜索（标题、摘要、正文、标签） |
| `/newsletter` | Newsletter | 订阅页面 |
| `/sign-in` | 登录 | Clerk 登录组件 |
| `/sign-up` | 注册 | Clerk 注册组件 |
| `/dashboard` | 用户面板 | 显示当前用户信息和角色 |
| `/sitemap.xml` | Sitemap | 动态生成，包含所有已发布文章、分类、标签 |
| `/robots.txt` | Robots | 搜索引擎爬虫规则 |

---

## 后台管理 (`/admin`)

需要用 `ADMIN_EMAILS` 中的邮箱登录才能访问。

| 路径 | 功能 |
|------|------|
| `/admin` | 总览仪表盘（已发布/草稿/拒绝文章数、来源数、失败数、订阅数） |
| `/admin/articles` | 文章管理（按状态筛选、修改状态、编辑 SEO 字段） |
| `/admin/articles/[id]` | 文章编辑（标题、摘要、SEO Title、Meta Description、正文） |
| `/admin/sources` | 来源管理（添加 RSS / 新闻网站、启用/禁用） |
| `/admin/categories` | 分类管理（添加/编辑分类名和描述） |
| `/admin/tags` | 标签管理（查看所有标签及文章数） |
| `/admin/newsletter` | Newsletter 管理（查看订阅者、手动添加） |
| `/admin/failures` | 失败日志（查看采集/AI处理失败记录、标记已解决） |

---

## 后端 API

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/webhooks/clerk` | POST | Clerk 用户同步 Webhook（自动创建/更新用户） |
| `/api/cron/ingest-rss` | POST | 采集所有活跃 RSS 源（需 `Authorization: Bearer CRON_SECRET`） |
| `/api/cron/generate-seo-metadata` | POST | 批量生成 SEO 元数据（需 `Authorization: Bearer CRON_SECRET`） |

---

## 定时任务

### 手动触发

```bash
# 采集所有 RSS 源
npm run ingest

# 生成 SEO 元数据
npm run seo
```

### Windows 定时任务

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天每 30 分钟
4. 操作：启动程序
   - 程序：`node`
   - 参数：`E:\you-are-a-senior-saas-architect\scripts\ingest-rss.cjs`
   - 起始于：`E:\you-are-a-senior-saas-architect`

### Linux/Mac cron

```bash
# 每 30 分钟采集一次
*/30 * * * * cd /path/to/project && node scripts/ingest-rss.cjs

# 每天凌晨 2 点生成 SEO 元数据
0 2 * * * cd /path/to/project && node scripts/generate-seo.cjs
```

---

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户（Clerk 同步，角色：USER / EDITOR / ADMIN） |
| `sources` | 内容来源（RSS / 新闻网站 / 博客 / 研究网站） |
| `categories` | 文章分类 |
| `authors` | 文章作者 |
| `articles` | 文章（状态：DRAFT / PUBLISHED / ARCHIVED / REJECTED） |
| `ai_summaries` | AI 摘要（摘要、Key Takeaways、SEO Title、Meta Description） |
| `tags` | 标签 |
| `article_tags` | 文章-标签关联 |
| `newsletter_subscribers` | Newsletter 订阅者 |
| `article_analytics` | 文章统计（浏览、点击、分享） |
| `ingestion_failures` | 采集失败日志 |

---

## 常用命令

```bash
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run start            # 启动生产服务器
npm run typecheck        # TypeScript 类型检查
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:migrate   # 运行数据库迁移
npm run ingest           # 手动采集 RSS
npm run seo              # 手动生成 SEO 元数据
```

---

## 项目结构

```
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页
│   ├── layout.tsx                # 根布局
│   ├── client-layout.tsx         # Clerk 客户端布局
│   ├── sitemap.ts                # 动态 Sitemap
│   ├── robots.ts                 # Robots.txt
│   ├── article/[slug]/           # 文章详情
│   ├── category/[slug]/          # 分类页
│   ├── tag/[slug]/               # 标签页
│   ├── search/                   # 搜索页
│   ├── newsletter/               # Newsletter 订阅
│   ├── sign-in/                  # 登录
│   ├── sign-up/                  # 注册
│   ├── dashboard/                # 用户面板
│   ├── admin/                    # 后台管理
│   │   ├── articles/             # 文章管理
│   │   ├── sources/              # 来源管理
│   │   ├── categories/           # 分类管理
│   │   ├── tags/                 # 标签管理
│   │   ├── newsletter/           # Newsletter 管理
│   │   └── failures/             # 失败日志
│   └── api/
│       ├── webhooks/clerk/       # Clerk Webhook
│       └── cron/                 # 定时任务
├── src/
│   ├── lib/                      # 数据访问层
│   │   ├── prisma.ts             # Prisma Client 单例
│   │   ├── auth.ts               # 认证工具（Clerk + 角色判断）
│   │   ├── admin.ts              # 后台数据查询和操作
│   │   ├── articles.ts           # 文章查询
│   │   ├── categories.ts         # 分类查询
│   │   ├── seo.ts                # SEO 元数据构建
│   │   └── sitemap.ts            # Sitemap 数据查询
│   ├── services/                 # 业务逻辑层
│   │   ├── rssIngestionService.ts      # RSS 采集服务
│   │   ├── articleSummarizationService.ts  # AI 摘要服务
│   │   └── articleSeoMetadataService.ts    # SEO 元数据回填
│   └── utils/
│       └── content.ts            # 工具函数（slugify、hash、truncate）
├── prisma/
│   └── schema.prisma             # 数据库 Schema
├── .env                          # 环境变量（不提交到 Git）
├── .env.example                  # 环境变量示例
├── middleware.ts                  # Clerk 认证中间件
├── next.config.ts                # Next.js 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json
```

---

## 工作流程

1. **内容采集**: `RssIngestionService` 解析 RSS Feed，提取文章内容，去重后存入数据库
2. **AI 处理**: `ArticleSummarizationService` 调用 OpenAI 生成摘要、Key Takeaways、分类、标签、SEO 元数据
3. **人工审核**: 管理员在 `/admin/articles` 审核文章，可修改状态（发布/拒绝/归档）
4. **SEO 优化**: 动态 Sitemap、JSON-LD 结构化数据、Open Graph 标签
5. **Newsletter**: 用户订阅后可接收每日资讯推送

---

## 注意事项

- Clerk 认证是可选的，未配置时自动禁用登录功能
- 所有页面都是动态渲染（`force-dynamic`），不使用静态生成
- `.env` 文件不要提交到 Git
- Supabase 的 `DIRECT_URL` 用于数据库迁移，`DATABASE_URL` 用于应用连接

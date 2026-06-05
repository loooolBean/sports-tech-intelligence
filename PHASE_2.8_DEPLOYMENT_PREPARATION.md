# Phase 2.8: 部署准备报告

**项目**: Sports Technology Intelligence Platform  
**审查日期**: 2026-06-05  
**审查人员**: Principal Architect & Deployment Specialist

---

## 1. 环境变量审计

### 生产环境变量清单

#### 必需变量 (Required)

| 变量 | 用途 | 示例格式 | 生产来源 |
|------|------|----------|----------|
| `DATABASE_URL` | 数据库连接 (连接池) | `postgresql://user:pass@host:6543/db?pgbouncer=true` | Supabase Dashboard |
| `DIRECT_URL` | 数据库直连 (迁移) | `postgresql://user:pass@host:5432/db` | Supabase Dashboard |
| `OPENAI_API_KEY` | AI 摘要功能 | `sk-proj-...` | OpenAI Platform |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | `https://yourdomain.com` | 域名配置 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 认证 | `pk_live_...` | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk 密钥 | `sk_live_...` | Clerk Dashboard |
| `CLERK_WEBHOOK_SECRET` | Webhook 签名 | `whsec_...` | Clerk Dashboard |

#### 可选变量 (Optional)

| 变量 | 用途 | 示例格式 | 生产来源 |
|------|------|----------|----------|
| `OPENAI_MODEL` | OpenAI 模型 | `gpt-4.1-mini` | 默认值 |
| `ADMIN_EMAILS` | 管理员邮箱 | `admin@example.com` | 手动配置 |
| `CRON_SECRET` | Cron 认证 | `随机字符串` | 生成 |

#### 推荐变量 (Recommended)

| 变量 | 用途 | 示例格式 | 生产来源 |
|------|------|----------|----------|
| `SENTRY_DSN` | 错误监控 | `https://...@sentry.io/...` | Sentry Dashboard |
| `UPSTASH_REDIS_REST_URL` | 缓存 | `https://...upstash.io` | Upstash Dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | 缓存令牌 | `AYxx...` | Upstash Dashboard |

### 环境变量配置示例

```env
# 数据库 (Supabase)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-xxx.supabase.com:5432/postgres"

# OpenAI
OPENAI_API_KEY="sk-proj-..."
OPENAI_MODEL="gpt-4.1-mini"

# 网站
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Clerk (生产环境)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# 管理员
ADMIN_EMAILS="admin@yourdomain.com"

# Cron
CRON_SECRET="生成的强随机字符串"

# 可选: 监控
SENTRY_DSN="https://...@sentry.io/..."
```

---

## 2. 域名策略审查

### 项目品牌分析

**核心定位**: 体育科技智能资讯平台  
**目标用户**: 教练、运动科学家、可穿戴设备专业人士  
**价值主张**: AI 驱动的体育科技新闻聚合和分析

### 域名推荐

#### 第一梯队 (强烈推荐)

| 排名 | 域名 | 优势 | SEO 考量 | 价格 |
|------|------|------|----------|------|
| 1 | `sportstechintel.com` | 简洁、专业、易记 | 高 (包含关键词) | $12/年 |
| 2 | `sportstechintelligence.com` | 完整描述、权威 | 高 (长尾关键词) | $12/年 |
| 3 | `stintel.com` | 极简、易记、品牌化 | 中 (需要品牌建设) | $12/年 |

#### 第二梯队 (推荐)

| 排名 | 域名 | 优势 | SEO 考量 | 价格 |
|------|------|------|----------|------|
| 4 | `sportstech.news` | 新闻定位、现代 | 高 (新闻类 TLD) | $25/年 |
| 5 | `sportstech.ai` | AI 定位、科技感 | 中 (需要解释) | $70/年 |
| 6 | `athletetech.io` | 科技感、开发者友好 | 中 (.io 受众有限) | $35/年 |
| 7 | `performancetech.io` | 性能定位、专业 | 中 (需要解释) | $35/年 |

#### 第三梯队 (备选)

| 排名 | 域名 | 优势 | SEO 考量 | 价格 |
|------|------|------|----------|------|
| 8 | `sportstechdaily.com` | 日报定位、内容导向 | 高 (包含关键词) | $12/年 |
| 9 | `wearableintel.com` | 可穿戴定位、细分 | 中 (范围较窄) | $12/年 |
| 10 | `coachtelligence.com` | 教练定位、用户导向 | 中 (范围较窄) | $12/年 |

### SEO 考量

#### 关键词分析

| 关键词 | 搜索量 | 竞争度 | 建议 |
|--------|--------|--------|------|
| sports technology | 高 | 中 | 包含在域名中 |
| athlete monitoring | 中 | 低 | 可作为页面标题 |
| wearable tech | 高 | 高 | 竞争激烈 |
| sports analytics | 中 | 中 | 可作为分类 |

#### TLD 选择

| TLD | 优势 | 劣势 | 建议 |
|-----|------|------|------|
| `.com` | 权威、信任度高 | 竞争激烈 | ✅ 首选 |
| `.ai` | 科技感、现代 | 价格高、需要解释 | 🟡 备选 |
| `.io` | 开发者友好 | 受众有限 | 🟡 备选 |
| `.news` | 新闻定位 | 较新、信任度待建立 | 🟡 备选 |

### 最终推荐

```
首选: sportstechintel.com
理由:
- 简洁易记
- 包含核心关键词
- .com 权威性高
- 价格合理 ($12/年)
- SEO 友好
```

---

## 3. OpenAI 生产就绪审查

### 当前实现分析

```typescript
// 使用模型
OPENAI_MODEL="gpt-4.1-mini"

// API 调用方式
this.client.responses.create({
  model: this.model,
  input: [...],
  text: { format: { type: "json_schema", ... } }
})

// 每次调用处理
- 1篇文章摘要
- 生成结构化 JSON
- 包含: summary, keyTakeaways, categories, tags, seoTitle, seoDescription
```

### API 权限要求

| 权限 | 用途 | 必需性 |
|------|------|--------|
| `responses.create` | 生成摘要 | ✅ 必需 |
| `models.list` | 列出模型 | ❌ 可选 |
| `files.create` | 上传文件 | ❌ 不需要 |
| `fine-tuning` | 微调模型 | ❌ 不需要 |

### 成本估算

#### gpt-4.1-mini 定价

| 项目 | 价格 |
|------|------|
| 输入 | $0.40 / 1M tokens |
| 输出 | $1.60 / 1M tokens |

#### 每篇文章成本估算

```
输入 tokens:
- 系统提示: ~100 tokens
- 用户提示: ~200 tokens
- 文章内容: ~2000 tokens (平均)
- 总计: ~2300 tokens

输出 tokens:
- JSON 响应: ~500 tokens

成本计算:
- 输入: 2300 * $0.40 / 1M = $0.00092
- 输出: 500 * $1.60 / 1M = $0.0008
- 总计: $0.00172 / 篇

≈ $0.002 / 篇 (约 ¥0.014 / 篇)
```

### 流量预测

#### 低流量 (启动期)

```
场景:
- 每天 10 篇新文章
- 每月 300 篇文章
- 每月 300 次 AI 调用

成本:
- 300 * $0.002 = $0.60 / 月
- $7.20 / 年

评估: ✅ 成本极低
```

#### 中流量 (增长期)

```
场景:
- 每天 50 篇新文章
- 每月 1500 篇文章
- 每月 1500 次 AI 调用

成本:
- 1500 * $0.002 = $3.00 / 月
- $36.00 / 年

评估: ✅ 成本可控
```

#### 高流量 (成熟期)

```
场景:
- 每天 200 篇新文章
- 每月 6000 篇文章
- 每月 6000 次 AI 调用

成本:
- 6000 * $0.002 = $12.00 / 月
- $144.00 / 年

评估: ✅ 成本合理
```

### 成本优化建议

1. **批量处理**: 合并多篇文章减少 API 调用
2. **缓存结果**: 避免重复处理相同文章
3. **选择性处理**: 只处理高质量文章
4. **模型降级**: 对于简单任务使用更便宜的模型

### OpenAI 生产就绪报告

```
状态: ✅ 就绪

优势:
- 使用 gpt-4.1-mini (性价比高)
- 结构化输出 (JSON Schema)
- 成本可控

风险:
- API Key 未配置 (必须修复)
- 无重试机制 (建议添加)
- 无超时配置 (建议添加)

建议:
1. 配置真实 API Key
2. 添加重试逻辑
3. 添加超时配置
4. 监控 API 使用量
```

---

## 4. Git 就绪审查

### 敏感文件检查

| 文件 | 风险 | 处理方式 |
|------|------|----------|
| `.env` | 🔴 高 | 必须排除 |
| `.env.local` | 🔴 高 | 必须排除 |
| `.env.production` | 🔴 高 | 必须排除 |
| `node_modules/` | 🟡 中 | 必须排除 |
| `.next/` | 🟡 中 | 必须排除 |
| `server.log` | 🟢 低 | 建议排除 |
| `tsconfig.tsbuildinfo` | 🟢 低 | 建议排除 |

### 构建产物检查

| 文件/目录 | 风险 | 处理方式 |
|-----------|------|----------|
| `.next/` | 🟡 中 | 必须排除 |
| `dist/` | 🟡 中 | 必须排除 |
| `*.tsbuildinfo` | 🟢 低 | 建议排除 |

### 生成文件检查

| 文件 | 风险 | 处理方式 |
|------|------|----------|
| `prisma/migrations/` | 🟢 低 | 应该包含 |
| `prisma/schema.prisma` | 🟢 低 | 应该包含 |
| `package-lock.json` | 🟢 低 | 应该包含 |

### 推荐 .gitignore

```gitignore
# 依赖
node_modules/
.pnp
.pnp.js

# 构建产物
.next/
out/
build/
dist/

# 环境变量 (敏感)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 调试日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
server.log

# TypeScript 缓存
*.tsbuildinfo
tsconfig.tsbuildinfo

# IDE
.idea/
.vscode/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 测试覆盖率
coverage/
.nyc_output/

# 临时文件
tmp/
temp/

# Vercel
.vercel

# 本地脚本输出
outputs/
work/
```

### Git 就绪报告

```
状态: ✅ 就绪

需要排除:
- .env (敏感)
- node_modules/ (依赖)
- .next/ (构建产物)
- server.log (日志)

应该包含:
- prisma/ (数据库)
- src/ (源代码)
- app/ (页面)
- scripts/ (脚本)
- package.json (依赖)
- package-lock.json (锁定版本)
- tsconfig.json (TypeScript)
- next.config.ts (配置)
- tailwind.config.ts (样式)
- postcss.config.js (CSS)

建议:
1. 创建 .gitignore 文件
2. 初始化 Git 仓库
3. 首次提交
```

---

## 5. 部署执行计划

### 部署序列

```
┌─────────────────────────────────────────────────────────────┐
│                    部署执行计划                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Git 初始化                                         │
│  ├─ 创建 .gitignore                                         │
│  ├─ git init                                                │
│  ├─ git add .                                               │
│  └─ git commit -m "Initial commit"                         │
│  时间: 5分钟 | 风险: 低 | 回滚: 无                          │
│                                                             │
│  Step 2: GitHub 仓库                                        │
│  ├─ 创建私有仓库                                            │
│  ├─ 添加远程仓库                                            │
│  └─ git push -u origin main                                │
│  时间: 5分钟 | 风险: 低 | 回滚: 删除仓库                    │
│                                                             │
│  Step 3: Vercel 配置                                        │
│  ├─ 连接 GitHub 仓库                                        │
│  ├─ 配置环境变量                                            │
│  ├─ 配置构建设置                                            │
│  └─ 触发首次部署                                            │
│  时间: 15分钟 | 风险: 中 | 回滚: 断开连接                   │
│                                                             │
│  Step 4: 域名配置                                           │
│  ├─ 购买域名                                                │
│  ├─ 配置 DNS                                                │
│  └─ 验证域名                                                │
│  时间: 15分钟 | 风险: 低 | 回滚: 删除 DNS                   │
│                                                             │
│  Step 5: Cloudflare 配置                                    │
│  ├─ 添加域名到 Cloudflare                                   │
│  ├─ 更新 Nameservers                                        │
│  ├─ 配置 SSL                                                │
│  └─ 配置缓存                                                │
│  时间: 15分钟 | 风险: 中 | 回滚: 恢复 Nameservers          │
│                                                             │
│  Step 6: Search Console                                     │
│  ├─ 验证域名                                                │
│  ├─ 提交 Sitemap                                            │
│  └─ 监控索引状态                                            │
│  时间: 10分钟 | 风险: 低 | 回滚: 删除属性                   │
│                                                             │
│  总计: 65分钟 (约1小时)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 详细步骤

#### Step 1: Git 初始化

**操作**:
```bash
cd E:\you-are-a-senior-saas-architect

# 创建 .gitignore (见上文)

# 初始化 Git
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: Sports Technology Intelligence Platform"
```

**风险**: 低  
**回滚**: 删除 `.git` 目录  
**验证**: `git status` 和 `git log`

#### Step 2: GitHub 仓库

**操作**:
1. 登录 GitHub
2. 创建新仓库: `sports-tech-intelligence`
3. 设置为私有
4. 不要初始化 README

```bash
# 添加远程仓库
git remote add origin https://github.com/yourusername/sports-tech-intelligence.git

# 推送代码
git push -u origin main
```

**风险**: 低  
**回滚**: 删除 GitHub 仓库  
**验证**: 访问仓库 URL

#### Step 3: Vercel 配置

**操作**:
1. 登录 Vercel
2. 导入 GitHub 仓库
3. 配置环境变量 (见环境变量清单)
4. 配置构建设置:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 触发部署

**风险**: 中  
**回滚**: 断开 GitHub 连接  
**验证**: 访问 Vercel 分配的域名

#### Step 4: 域名配置

**操作**:
1. 购买域名 (推荐: Namecheap, Cloudflare)
2. 配置 DNS:
   - A 记录: `76.76.21.21`
   - CNAME 记录: `cname.vercel-dns.com`
3. 在 Vercel 添加域名
4. 验证域名

**风险**: 低  
**回滚**: 删除 DNS 记录  
**验证**: 访问自定义域名

#### Step 5: Cloudflare 配置

**操作**:
1. 添加域名到 Cloudflare
2. 更新 Nameservers:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
3. 配置 SSL:
   - 模式: Full (Strict)
   - 启用 HSTS
4. 配置缓存:
   - Browser Cache TTL: 4 hours
   - Cache Level: Standard

**风险**: 中  
**回滚**: 恢复原始 Nameservers  
**验证**: 检查 SSL 证书

#### Step 6: Search Console

**操作**:
1. 登录 Google Search Console
2. 添加域名属性
3. 验证域名 (DNS 记录)
4. 提交 Sitemap: `https://yourdomain.com/sitemap.xml`
5. 监控索引状态

**风险**: 低  
**回滚**: 删除属性  
**验证**: 检查 Sitemap 状态

### 风险评估

| 步骤 | 风险等级 | 主要风险 | 缓解措施 |
|------|----------|----------|----------|
| Git 初始化 | 🟢 低 | 敏感文件提交 | 检查 .gitignore |
| GitHub 仓库 | 🟢 低 | 代码泄露 | 使用私有仓库 |
| Vercel 配置 | 🟡 中 | 环境变量错误 | 仔细检查 |
| 域名配置 | 🟢 低 | DNS 配置错误 | 验证记录 |
| Cloudflare | 🟡 中 | SSL 问题 | 使用 Full 模式 |
| Search Console | 🟢 低 | 验证失败 | 使用 DNS 验证 |

### 回滚计划

```
紧急回滚:
1. Vercel: 断开 GitHub 连接
2. Cloudflare: 恢复原始 Nameservers
3. DNS: 删除自定义记录
4. 域名: 暂停解析

数据回滚:
- Supabase: 使用时间点恢复
- Git: git revert 或 git reset
```

---

## 6. 进度仪表盘

### 当前进度

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           当前进度: 75%                                      │
│                                                             │
│           [██████████████████████░░░░░░░░░]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 详细状态

| 项目 | 状态 | 说明 |
|------|------|------|
| [x] 产品架构 | ✅ 完成 | Next.js App Router |
| [x] 数据库 | ✅ 完成 | Supabase PostgreSQL |
| [x] RSS 聚合 | ✅ 完成 | 自动采集 |
| [x] AI 摘要 | ✅ 完成 | OpenAI 集成 |
| [x] 认证系统 | ✅ 完成 | Clerk |
| [x] UI 设计 | ✅ 完成 | Tailwind + shadcn |
| [x] SEO 优化 | ✅ 完成 | Sitemap, JSON-LD |
| [x] Build 验证 | ✅ 完成 | 构建通过 |
| [x] 环境变量审计 | ✅ 完成 | 清单生成 |
| [x] 域名策略 | ✅ 完成 | 推荐生成 |
| [x] OpenAI 审查 | ✅ 完成 | 成本估算 |
| [x] Git 就绪 | ✅ 完成 | .gitignore 生成 |
| [ ] Git 初始化 | ⏳ 待执行 | 等待批准 |
| [ ] GitHub 仓库 | ⏳ 待执行 | 等待批准 |
| [ ] Vercel 部署 | ⏳ 待执行 | 等待批准 |
| [ ] 域名配置 | ⏳ 待执行 | 等待批准 |
| [ ] Cloudflare | ⏳ 待执行 | 等待批准 |
| [ ] Search Console | ⏳ 待执行 | 等待批准 |

### 下一步关键行动

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  下一步关键行动:                                             │
│                                                             │
│  1. 审查并批准部署计划                                       │
│  2. 提供生产环境变量                                         │
│  3. 选择域名                                                │
│  4. 执行部署                                                │
│                                                             │
│  等待您的批准...                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 总结

### 准备完成情况

| 项目 | 状态 | 说明 |
|------|------|------|
| 环境变量 | ✅ 完成 | 清单已生成 |
| 域名策略 | ✅ 完成 | 推荐已生成 |
| OpenAI 审查 | ✅ 完成 | 成本已估算 |
| Git 就绪 | ✅ 完成 | .gitignore 已生成 |
| 部署计划 | ✅ 完成 | 步骤已详细 |

### 关键决策点

1. **域名选择**: 推荐 `sportstechintel.com`
2. **OpenAI 模型**: 推荐 `gpt-4.1-mini` (性价比高)
3. **部署平台**: Vercel (推荐)
4. **CDN**: Cloudflare (推荐)

### 预计成本

| 项目 | 月成本 | 年成本 |
|------|--------|--------|
| Vercel (Hobby) | $0 | $0 |
| Supabase (Free) | $0 | $0 |
| OpenAI (低流量) | $0.60 | $7.20 |
| 域名 | $1 | $12 |
| Cloudflare | $0 | $0 |
| **总计** | **$1.60** | **$19.20** |

### 预计时间

```
部署准备: 1 小时
域名配置: 30 分钟
验证测试: 30 分钟
总计: 2 小时
```

---

**Phase 2.8 完成。等待您的批准，我将继续 Phase 3: 实际部署。**

**需要您提供:**
1. 批准部署计划
2. 选择域名
3. 提供生产环境变量 (OpenAI API Key, Clerk 生产密钥)

# YourCompany B2B Website

[中文](#中文) | [English](#english)

---

<a id="中文"></a>

## 概述

基于 **Astro 6**、**React 19** 构建的现代化 B2B 企业官网，部署在 **Cloudflare Workers** 边缘网络上，使用 **D1** 数据库、**R2** 对象存储和 **KV** 会话存储。采用 **CSS 自定义属性** 主题系统，支持品牌色/字体定制和暗色模式（管理员可控）。功能涵盖产品展示、新闻/博客（富文本编辑）、行业解决方案页面、询价管理，以及功能完整的管理后台 — 内置多渠道通知系统。

## 架构

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare 边缘网络                  │
│                                                      │
│  ┌──────────┐  ┌──────┐  ┌────┐  ┌────┐  ┌───────┐ │
│  │ Workers  │  │  D1  │  │ R2 │  │ KV │  │ Queue │ │
│  │ (Astro)  │──│(SQLite)│  │(资源)│ │(会话)│  │(队列)│ │
│  └────┬─────┘  └──────┘  └────┘  └────┘  └───┬───┘ │
│       │                                       │     │
│       │  ┌────────────────────────────────────┘     │
│       │  ▼                                          │
│       │  Queue Consumer ──→ 邮件 (Resend)           │
│       │                ──→ Webhook (Slack/Discord/   │
│       │                     企业微信/通用)            │
│       │                ──→ SSE 推送 → 管理后台 Toast  │
└───────┼──────────────────────────────────────────────┘
        │
   公开网站 (SSG/SSR)          管理后台 (SSR)
   ─ 首页                       ─ 仪表盘
   ─ 关于我们                   ─ 产品增删改查
   ─ 服务                       ─ 新闻富文本编辑
   ─ 产品                       ─ 评论审核
   ─ 新闻                       ─ 询价管理
   ─ 解决方案（6 个行业）        ─ 设置面板
   ─ 询价表单                   ─ 通知管理
```

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Astro | 6.x |
| UI 组件 | React | 19.x |
| 样式 | CSS 自定义属性（Design Tokens） | — |
| 数据库 | Cloudflare D1 (SQLite) | — |
| ORM | Drizzle ORM | 0.45.x |
| 认证 | Better Auth | 1.6.x |
| 富文本 | Tiptap | 3.22.x |
| 表单 | React Hook Form + Zod | 7.x / 4.x |
| 邮件 | Resend SDK | 6.x |
| 消息队列 | Cloudflare Queues | — |
| 实时推送 | Server-Sent Events (SSE) | — |
| 对象存储 | Cloudflare R2 | — |
| 会话存储 | Cloudflare KV | — |
| 图片处理 | Cloudflare Images | — |
| 部署 | Cloudflare Workers | — |
| 开发工具 | Wrangler, Vite | 4.x / 7.x |

## 功能特性

### 公开网站

- **首页** — Hero 区域、服务亮点、产品展示、CTA
- **关于我们** — 公司简介、团队、价值观
- **服务** — 服务目录与描述
- **产品** — 产品列表与详情页（slug 路由）
- **新闻** — 博客/新闻，富文本内容，评论系统
- **解决方案** — 6 个行业专属解决方案页面（动态路由）
- **询价** — 联系表单，提交产品询价

### 管理后台 (`/admin`)

- **仪表盘** — 关键指标概览
- **产品管理** — 完整 CRUD，图片上传（R2）
- **新闻管理** — Tiptap 富文本编辑器，支持图片/链接
- **评论管理** — 审核工作流（通过/回复/删除）
- **询价管理** — 状态跟踪（新建 → 已联系 → 已报价 → 已关闭）
- **设置面板** — 集中配置：
  - 页面可见性开关（12 个页面）
  - 通知渠道管理（邮件 + Webhook CRUD）
  - 通知模板自定义（每事件 `{{variable}}` 模板）
  - 通知仪表盘（统计、图表、趋势）
  - Toast 偏好设置（按事件类型）
  - SSE 实时推送开关（默认关闭）

### 通知系统

- **7 种事件类型** — 询价创建/更新、评论创建/待审/回复、新闻/产品发布
- **多渠道** — 邮件（Resend）+ Webhook（Slack、Discord、企业微信、通用）
- **异步投递** — Cloudflare Queue 消费者，本地开发自动同步降级
- **自定义模板** — `{{variable}}` 语法，HTML 自动转义，按事件自定义
- **频率限制** — 可配置时间窗口去重（默认 5 分钟）
- **实时 Toast** — 事件驱动 SSE 推送（无轮询），双层偏好过滤
- **统计仪表盘** — 发送/失败/跳过统计，每日趋势，按事件分布

> 完整通知系统文档请参阅 [`docs/NOTIFICATION.md`](docs/NOTIFICATION.md)。

### 主题系统

- **品牌色定制** — 单色输入自动生成 10 级色阶（50-900），构建时 CSS 注入
- **字体定制** — 自定义 CSS font-family 字符串
- **暗色模式** — 支持 `prefers-color-scheme` 系统跟随 + 手动切换（`localStorage` 持久化）
- **管理员可控** — 后台开关控制前台是否启用暗色模式（默认关闭）
- **Design Tokens** — 统一的 radius/shadow/颜色 token，`src/` 零硬编码颜色值
- **语义化颜色** — danger/info/success/warning 四组语义 token，自动适配暗色模式

### 基础设施

- **边缘部署** — 运行在 Cloudflare 全球边缘网络
- **零冷启动** — Workers + Vite 打包
- **图片处理** — Cloudflare Images 响应式图片交付
- **资源存储** — R2 存储上传的图片和文件
- **数据库迁移** — 版本化 SQL 迁移（14 个迁移文件）

## 项目结构

```
src/
├── components/              # React 组件（表单、编辑器、共享 UI）
│   └── admin/settings/      # 管理后台设置组件（主题、域名隔离、品牌）
├── layouts/
│   ├── BaseLayout.astro     # 公开页面布局（头部、底部、导航、暗色切换）
│   └── AdminLayout.astro    # 管理后台布局（侧边栏、Toast、SSE 客户端）
├── lib/
│   ├── auth.ts              # Better Auth 服务端配置
│   ├── auth-client.ts       # Better Auth React 客户端
│   ├── db/
│   │   ├── schema/          # Drizzle ORM Schema 定义
│   │   └── index.ts         # D1 连接 + 查询工具
│   ├── notification/        # 通知系统（8 个模块）
│   │   ├── index.ts                  # 统一导出
│   │   ├── notification.schema.ts    # 事件类型、Zod Schema
│   │   ├── notification.publisher.ts # 事件入队
│   │   ├── queue-consumer.ts         # 队列消费者 + SSE 广播
│   │   ├── email.service.ts          # Resend 集成 + 邮件模板
│   │   ├── webhook.service.ts        # 多平台 Webhook
│   │   ├── template-engine.ts        # {{variable}} 模板渲染
│   │   └── rate-limiter.ts           # 去重限流
│   └── page-visibility.ts  # 页面可见性共享工具
├── middleware.ts             # 认证中间件（Session + /admin 保护）
├── pages/
│   ├── index.astro          # 首页
│   ├── about.astro          # 关于我们
│   ├── services.astro       # 服务页面
│   ├── products/            # 产品列表 + [slug] 详情
│   ├── news/                # 新闻列表 + [slug] 详情
│   ├── solutions/           # [industry] 解决方案页面
│   ├── login.astro          # 登录页面
│   ├── admin/               # 管理后台
│   │   ├── index.astro      # 仪表盘
│   │   ├── products/        # 产品 CRUD（列表、新建、[id]/编辑）
│   │   ├── news/            # 新闻 CRUD + 评论
│   │   ├── quotes/          # 询价管理
│   │   └── settings/        # 设置（可见性、通知、模板、主题、品牌）
│   └── api/                 # REST API 路由
│       ├── auth/            # Better Auth 端点
│       ├── products/        # 产品 API
│       ├── news/            # 新闻 API
│       ├── comments/        # 评论 API
│       ├── quote-requests/  # 询价 API
│       ├── notifications/   # 通知 API（8 个端点）
│       ├── settings.ts      # 可见性设置 API
│       └── health.ts        # 健康检查端点
└── styles/
    ├── global.css           # 全局样式 + Design Tokens（亮色）
    ├── dark-mode.css        # 暗色模式变量（条件注入）
    └── theme-overrides.css  # 品牌色/字体覆盖（构建时生成）

scripts/
├── generate-mock-data.mjs   # 生成模拟数据（本地开发）
├── export-build-data.mjs    # 从 D1 导出构建数据
├── inject-theme.mjs         # 注入品牌色/字体 CSS
└── seed-admin.mjs           # 初始化管理员账号

migrations/                  # 14 个版本化 SQL 迁移
├── 0000_initial_schema.sql          # 核心表
├── 0001_notification_system.sql     # 通知表
├── 0002_notification_rate_limit.sql # 限流索引
├── 0003_site_settings.sql           # 站点设置
├── ...
├── 0010_site_branding.sql           # 品牌设置
├── 0011_domain_isolation.sql        # 域名隔离
├── 0012_theme_settings.sql          # 主题设置
└── 0013_dark_mode_setting.sql       # 暗色模式开关

docs/
└── NOTIFICATION.md                  # 通知系统完整文档
```

## 快速开始

### 一键部署

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/<your-github-repo-url>)

点击上方按钮，即可将项目直接部署到 Cloudflare。D1、R2、KV 和 Queue 会自动创建。

> **注意**：将项目推送到 GitHub 后，请将 `<your-github-repo-url>` 替换为你的实际 GitHub 仓库地址。

### 环境要求

- Node.js 22+
- npm

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

打开 [http://localhost:4321](http://localhost:4321)。

### 初始化管理员账号

```bash
node scripts/seed-admin.mjs
```

默认账号：`admin@yourcompany.com` / `admin123`

### 构建

```bash
npm run build
```

### 部署

```bash
# 应用数据库迁移到远程 D1
npx wrangler d1 migrations apply DB --remote

# 部署 Worker
npx wrangler deploy
```

### 生产环境密钥

```bash
# 必需：认证密钥（至少 32 字符）
npx auth secret
npx wrangler secret put BETTER_AUTH_SECRET

# 必需：Resend API 密钥（邮件通知）
npx wrangler secret put RESEND_API_KEY

# 可选：自定义发件人地址
npx wrangler secret put EMAIL_FROM
# 输入：公司名 <noreply@yourcompany.com>

# 可选：管理员邮箱（接收通知）
npx wrangler secret put ADMIN_EMAIL
```

### 速率限制（Cloudflare WAF）

公开 API 端点（`POST /api/comments`、`POST /api/quote-requests`）应通过 Cloudflare WAF 速率限制规则进行保护。之前的内存速率限制器已移除，因为它在 Cloudflare Workers 上无效（每个请求运行在独立的 V8 Isolate 中，没有共享内存）。

#### 通过 Cloudflare 控制台配置

1. 进入 **Cloudflare 控制台** → 你的域名 → **安全性** → **WAF** → **速率限制规则**
2. 点击 **创建规则**
3. 配置：
   - **规则名称**: `API Rate Limit`
   - **表达式**: `URI Path contains "/api/" and not starts_with(cf.bot_management.verified_bot, "true")`
   - **周期**: `10 秒`（免费计划）或 `1 分钟`（Pro 计划）
   - **每周期请求数**: `10`（根据需要调整）
   - **持续时间**: `10 秒`（免费计划）或 `1 分钟`（Pro 计划）
   - **操作**: `阻止`（状态码 429）
4. 点击 **部署**

#### 各计划限制

| 功能 | 免费版 | Pro ($20/月) | Business ($200/月) |
|------|--------|-------------|-------------------|
| 规则数量 | 1 条 | 2 条 | 5 条 |
| 计数维度 | IP | IP | IP、URI 路径、请求方法 |
| 周期选项 | 10s | 10s、1min | 10s、1min、10min |
| 惩罚时长 | 10s | 10s、1min、1h | 10s、1min、1h、1天 |

> **提示**: 免费计划提供 1 条规则、10s 周期 — 足以应对基本爬虫防护。如需更精细控制，可升级到 Pro。

### Cloudflare 资源

| 资源 | 绑定名 | 用途 |
|------|--------|------|
| D1 数据库 | `DB` | SQLite 数据库（产品、新闻、用户、通知） |
| R2 存储桶 | `R2` | 图片和文件上传 |
| KV 命名空间 | `SESSION` | Better Auth 会话存储 |
| Cloudflare Images | `IMAGES` | 图片处理和优化 |
| 队列 | `NOTIFICATION_QUEUE` | 异步通知投递 |

## API 参考

### 核心 CRUD

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET/POST` | `/api/products` | 产品列表 / 创建 |
| `GET/PUT/DELETE` | `/api/products/[id]` | 产品增删改查 |
| `GET/POST` | `/api/news` | 新闻列表 / 创建 |
| `GET/PUT/DELETE` | `/api/news/[id]` | 新闻增删改查 |
| `GET/POST` | `/api/comments` | 评论列表 / 创建 |
| `GET/PUT/DELETE` | `/api/comments/[id]` | 评论管理（通过、回复、删除） |
| `GET/POST` | `/api/quote-requests` | 询价列表 / 提交 |
| `GET/PUT` | `/api/quote-requests/[id]` | 询价状态管理 |
| `GET/PUT` | `/api/settings` | 页面可见性设置 |

### 通知 API

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET/POST` | `/api/notifications/channels` | 渠道列表 / 创建 |
| `GET/PUT/DELETE` | `/api/notifications/channels/[id]` | 渠道 CRUD |
| `GET/PUT` | `/api/notifications/subscriptions` | 渠道事件订阅 |
| `GET/PUT` | `/api/notifications/settings` | 通知设置 |
| `GET/PUT/DELETE` | `/api/notifications/templates` | 自定义模板 |
| `GET` | `/api/notifications/stats?period=7d` | 统计数据 |
| `GET/POST` | `/api/notifications/stream` | SSE 流（客户端 / 广播） |
| `GET` | `/api/notifications/logs` | 通知投递日志 |

### 认证

| 方法 | 端点 | 说明 |
|------|------|------|
| `*` | `/api/auth/*` | Better Auth 端点（登录、登出、会话） |

## 脚本命令

| 脚本 | 命令 | 说明 |
|------|------|------|
| `dev` | `npm run dev` | 启动开发服务器 |
| `build` | `npm run build` | 生产构建 |
| `build:mock` | `npm run build:mock` | 生成模拟数据 + 注入主题 CSS |
| `build:theme` | `npm run build:theme` | 单独注入主题 CSS |
| `build:export` | `npm run build:export` | 从远程 D1 导出构建数据 |
| `build:full` | `npm run build:full` | 导出数据 + 生产构建 |
| `preview` | `npm run preview` | 本地预览生产构建 |
| `deploy` | `npm run deploy` | 构建 + 迁移 + 部署（一键命令） |
| `test` | `npm run test` | 运行测试 |
| `check` | `npm run check` | Astro 类型检查 |
| `lint` | `npm run lint` | ESLint 检查 |

## CI/CD

GitHub Actions 工作流位于 `.github/workflows/`：

| 工作流 | 触发条件 | 说明 |
|--------|---------|------|
| `ci.yml` | 推送到 `master`、PR | 安装依赖 + 构建验证 |
| `deploy.yml` | 推送到 `master`、手动触发 | 构建 + D1 迁移 + 部署到 Cloudflare Workers |

### 必需的 GitHub Secrets

| Secret | 说明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | 具有 Workers 编辑权限的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |

> 在 [Cloudflare 控制台 → API Tokens](https://dash.cloudflare.com/profile/api-tokens) 创建 API Token，使用 "Edit Cloudflare Workers" 模板。

## 许可证

私有项目 — 保留所有权利。

## 变更日志

查看 [`CHANGELOG.md`](CHANGELOG.md) 了解版本发布历史。

---

<a id="english"></a>

## Overview

A production-grade B2B corporate website built with **Astro 6** and **React 19**, deployed on **Cloudflare Workers** with **D1** database, **R2** object storage, and **KV** session store. Features a **CSS custom properties** theme system with brand color/font customization and admin-controllable dark mode. Includes product showcase, news/blog with rich text editing, industry solution pages, quote request management, and a comprehensive admin panel — all with a built-in multi-channel notification system.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Edge                    │
│                                                      │
│  ┌──────────┐  ┌──────┐  ┌────┐  ┌────┐  ┌───────┐ │
│  │ Workers  │  │  D1  │  │ R2 │  │ KV │  │ Queue │ │
│  │ (Astro)  │──│(SQLite)│  │(Assets)│ │(Sessions)│ │
│  └────┬─────┘  └──────┘  └────┘  └────┘  └───┬───┘ │
│       │                                       │     │
│       │  ┌────────────────────────────────────┘     │
│       │  ▼                                          │
│       │  Queue Consumer ──→ Email (Resend)          │
│       │                ──→ Webhook (Slack/Discord/   │
│       │                     WeCom/Generic)           │
│       │                ──→ SSE Push → Admin Toast    │
└───────┼──────────────────────────────────────────────┘
        │
   Public Site (SSG/SSR)        Admin Panel (SSR)
   ─ Homepage                    ─ Dashboard
   ─ About                       ─ Products CRUD
   ─ Services                    ─ News CRUD (Tiptap)
   ─ Products                    ─ Comments Moderation
   ─ News                        ─ Quote Requests
   ─ Solutions (6 industries)    ─ Settings
   ─ Quote Request Form          ─ Notification Mgmt
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | 6.x |
| UI Islands | React | 19.x |
| Styling | CSS Custom Properties (Design Tokens) | — |
| Database | Cloudflare D1 (SQLite) | — |
| ORM | Drizzle ORM | 0.45.x |
| Auth | Better Auth | 1.6.x |
| Rich Text | Tiptap | 3.22.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Email | Resend SDK | 6.x |
| Message Queue | Cloudflare Queues | — |
| Real-time | Server-Sent Events (SSE) | — |
| Object Storage | Cloudflare R2 | — |
| Session Store | Cloudflare KV | — |
| Image Processing | Cloudflare Images | — |
| Deployment | Cloudflare Workers | — |
| Dev Tools | Wrangler, Vite | 4.x / 7.x |

## Features

### Public Website

- **Homepage** — Hero section, service highlights, product showcase, CTA
- **About** — Company profile, team, values
- **Services** — Service catalog with descriptions
- **Products** — Product listing with detail pages (slug-based routing)
- **News** — Blog/news with rich text content, comment system
- **Solutions** — 6 industry-specific solution pages (dynamically routed)
- **Quote Request** — Contact form with product inquiry submission

### Admin Panel (`/admin`)

- **Dashboard** — Overview with key metrics
- **Products** — Full CRUD with image upload (R2)
- **News** — Rich text editor (Tiptap) with image/link support
- **Comments** — Moderation workflow (approve/reply/delete)
- **Quote Requests** — Status tracking (new → contacted → quoted → closed)
- **Settings** — Centralized configuration panel:
  - Page visibility toggles (12 pages)
  - Notification channels (email + webhook CRUD)
  - Notification templates (custom `{{variable}}` per event)
  - Notification dashboard (stats, charts, trends)
  - Toast preferences (per-event-type)
  - SSE real-time toggle (default: off)

### Notification System

- **7 Event Types** — Quote created/updated, comment created/pending/reply, news/product published
- **Multi-Channel** — Email (Resend) + Webhook (Slack, Discord, WeCom, Generic)
- **Async Delivery** — Cloudflare Queue consumer with synchronous fallback for local dev
- **Custom Templates** — `{{variable}}` syntax with HTML auto-escaping, per-event customization
- **Rate Limiting** — Dedup within configurable time window (default: 5 min)
- **Real-time Toasts** — Event-driven SSE push to admin (no polling), dual-layer preference filtering
- **Dashboard** — Sent/failed/skipped stats, daily trends, per-event breakdowns

> See [`docs/NOTIFICATION.md`](docs/NOTIFICATION.md) for full notification system documentation.

### Theme System

- **Brand Color** — Single hex input auto-generates 10-level palette (50-900), build-time CSS injection
- **Font Family** — Custom CSS font-family string
- **Dark Mode** — `prefers-color-scheme` system follow + manual toggle (`localStorage` persistence)
- **Admin Controllable** — Backend toggle to enable/disable dark mode on public site (default: off)
- **Design Tokens** — Unified radius/shadow/color tokens, zero hardcoded colors in `src/`
- **Semantic Colors** — danger/info/success/warning token sets, auto-adapt to dark mode

### Infrastructure

- **Edge Deployment** — Runs on Cloudflare's global edge network
- **Zero Cold Start** — Workers with Vite bundling
- **Image Processing** — Cloudflare Images for responsive image delivery
- **Asset Storage** — R2 for uploaded images and files
- **Database Migrations** — Versioned SQL migrations (14 migrations)

## Project Structure

```
src/
├── components/              # React components (forms, editors, shared UI)
│   └── admin/settings/      # Admin settings components (theme, domain, branding)
├── layouts/
│   ├── BaseLayout.astro     # Public page layout (header, footer, nav, dark toggle)
│   └── AdminLayout.astro    # Admin panel layout (sidebar, toast, SSE client)
├── lib/
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth React client
│   ├── db/
│   │   ├── schema/          # Drizzle ORM schema definitions
│   │   └── index.ts         # D1 connection + query helpers
│   ├── notification/        # Notification system (8 modules)
│   │   ├── index.ts                  # Barrel exports
│   │   ├── notification.schema.ts    # Event types, Zod schemas
│   │   ├── notification.publisher.ts # Enqueue events
│   │   ├── queue-consumer.ts         # Queue consumer + SSE broadcast
│   │   ├── email.service.ts          # Resend integration + templates
│   │   ├── webhook.service.ts        # Multi-platform webhooks
│   │   ├── template-engine.ts        # {{variable}} rendering
│   │   └── rate-limiter.ts           # Dedup rate limiting
│   └── page-visibility.ts  # Shared page visibility helpers
├── middleware.ts             # Auth middleware (session + /admin protection)
├── pages/
│   ├── index.astro          # Homepage
│   ├── about.astro          # About page
│   ├── services.astro       # Services page
│   ├── products/            # Product list + [slug] detail
│   ├── news/                # News list + [slug] detail
│   ├── solutions/           # [industry] solution pages
│   ├── login.astro          # Login page
│   ├── admin/               # Admin panel
│   │   ├── index.astro      # Dashboard
│   │   ├── products/        # Product CRUD (list, new, [id]/edit)
│   │   ├── news/            # News CRUD + comments
│   │   ├── quotes/          # Quote request management
│   │   └── settings/        # Settings (visibility, notifications, templates, theme, branding)
│   └── api/                 # REST API routes
│       ├── auth/            # Better Auth endpoints
│       ├── products/        # Product API
│       ├── news/            # News API
│       ├── comments/        # Comments API
│       ├── quote-requests/  # Quote requests API
│       ├── notifications/   # Notification APIs (8 endpoints)
│       ├── settings.ts      # Visibility settings API
│       └── health.ts        # Health check endpoint
└── styles/
    ├── global.css           # Global styles + Design Tokens (light)
    ├── dark-mode.css        # Dark mode variables (conditionally injected)
    └── theme-overrides.css  # Brand color/font overrides (build-time generated)

scripts/
├── generate-mock-data.mjs   # Generate mock data (local dev)
├── export-build-data.mjs    # Export build data from D1
├── inject-theme.mjs         # Inject brand color/font CSS
└── seed-admin.mjs           # Seed admin user

migrations/                  # 14 versioned SQL migrations
├── 0000_initial_schema.sql          # Core tables
├── 0001_notification_system.sql     # Notification tables
├── 0002_notification_rate_limit.sql # Rate limit indexes
├── 0003_site_settings.sql           # Site settings
├── ...
├── 0010_site_branding.sql           # Branding settings
├── 0011_domain_isolation.sql        # Domain isolation
├── 0012_theme_settings.sql          # Theme settings
└── 0013_dark_mode_setting.sql       # Dark mode toggle

docs/
└── NOTIFICATION.md                  # Full notification system documentation
```

## Getting Started

### One-Click Deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/<your-github-repo-url>)

Click the button above to deploy directly to Cloudflare. D1, R2, KV, and Queues are provisioned automatically.

> **Note**: Replace `<your-github-repo-url>` with your actual GitHub repository URL.

### Prerequisites

- Node.js 22+
- npm

### Install

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Seed Admin User

```bash
node scripts/seed-admin.mjs
```

Default credentials: `admin@yourcompany.com` / `admin123`

### Build

```bash
npm run build
```

### Deploy

```bash
# Apply database migrations to remote D1
npx wrangler d1 migrations apply DB --remote

# Deploy Worker
npx wrangler deploy
```

### Production Secrets

```bash
# Required: Auth secret (min 32 chars)
npx auth secret
npx wrangler secret put BETTER_AUTH_SECRET

# Required: Resend API key for email notifications
npx wrangler secret put RESEND_API_KEY

# Optional: Custom sender address
npx wrangler secret put EMAIL_FROM
# Enter: YourCompany <noreply@yourcompany.com>

# Optional: Admin email for receiving notifications
npx wrangler secret put ADMIN_EMAIL
```

### Rate Limiting (Cloudflare WAF)

Public API endpoints (`POST /api/comments`, `POST /api/quote-requests`) should be protected by Cloudflare WAF Rate Limiting rules. The previous in-memory rate limiter was removed because it does not work on Cloudflare Workers (each request runs in an isolated V8 Isolate with no shared memory).

#### Setup via Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → your zone → **Security** → **WAF** → **Rate limiting rules**
2. Click **Create rule**
3. Configure:
   - **Rule name**: `API Rate Limit`
   - **Expression**: `URI Path contains "/api/" and not starts_with(cf.bot_management.verified_bot, "true")`
   - **Period**: `10 seconds` (Free plan) or `1 minute` (Pro plan)
   - **Requests per period**: `10` (adjust to your needs)
   - **Duration**: `10 seconds` (Free plan) or `1 minute` (Pro plan)
   - **Action**: `Block` (status 429)
4. Click **Deploy**

#### Plan Limits

| Feature | Free | Pro ($20/mo) | Business ($200/mo) |
|---------|------|-------------|-------------------|
| Number of rules | 1 | 2 | 5 |
| Counting characteristics | IP | IP | IP, URI Path, Method |
| Period options | 10s | 10s, 1min | 10s, 1min, 10min |
| Mitigation timeout | 10s | 10s, 1min, 1h | 10s, 1min, 1h, 1day |

> **Tip**: On the Free plan you get 1 rule with 10s period — sufficient for basic bot protection. For finer control, upgrade to Pro.

### Cloudflare Resources

| Resource | Binding | Purpose |
|----------|---------|---------|
| D1 Database | `DB` | SQLite database (products, news, users, notifications) |
| R2 Bucket | `R2` | Image and file uploads |
| KV Namespace | `SESSION` | Better Auth session storage |
| Cloudflare Images | `IMAGES` | Image processing and optimization |
| Queue | `NOTIFICATION_QUEUE` | Async notification delivery |

## API Reference

### Core CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/products` | List / create products |
| `GET/PUT/DELETE` | `/api/products/[id]` | Product CRUD |
| `GET/POST` | `/api/news` | List / create news articles |
| `GET/PUT/DELETE` | `/api/news/[id]` | News CRUD |
| `GET/POST` | `/api/comments` | List / create comments |
| `GET/PUT/DELETE` | `/api/comments/[id]` | Comment CRUD (approve, reply, delete) |
| `GET/POST` | `/api/quote-requests` | List / submit quote requests |
| `GET/PUT` | `/api/quote-requests/[id]` | Quote status management |
| `GET/PUT` | `/api/settings` | Page visibility settings |

### Notification APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/notifications/channels` | List / create channels |
| `GET/PUT/DELETE` | `/api/notifications/channels/[id]` | Channel CRUD |
| `GET/PUT` | `/api/notifications/subscriptions` | Channel event subscriptions |
| `GET/PUT` | `/api/notifications/settings` | Notification settings |
| `GET/PUT/DELETE` | `/api/notifications/templates` | Custom templates |
| `GET` | `/api/notifications/stats?period=7d` | Statistics dashboard |
| `GET/POST` | `/api/notifications/stream` | SSE stream (client / broadcast) |
| `GET` | `/api/notifications/logs` | Notification delivery logs |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `*` | `/api/auth/*` | Better Auth endpoints (sign-in, sign-out, session) |

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server |
| `build` | `npm run build` | Production build |
| `build:mock` | `npm run build:mock` | Generate mock data + inject theme CSS |
| `build:theme` | `npm run build:theme` | Inject theme CSS only |
| `build:export` | `npm run build:export` | Export build data from remote D1 |
| `build:full` | `npm run build:full` | Export data + production build |
| `preview` | `npm run preview` | Preview production build locally |
| `deploy` | `npm run deploy` | Build + migrate + deploy (one command) |
| `test` | `npm run test` | Run tests |
| `check` | `npm run check` | Astro type checking |
| `lint` | `npm run lint` | ESLint check |

## CI/CD

GitHub Actions workflows are included in `.github/workflows/`:

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push to `master`, PRs | Install dependencies + build verification |
| `deploy.yml` | Push to `master`, manual | Build + D1 migration + deploy to Cloudflare Workers |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

> Create an API token at [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens). Use the "Edit Cloudflare Workers" template.

## Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `BETTER_AUTH_URL` | Var | `http://localhost:4321` | Public URL for auth callbacks |
| `BETTER_AUTH_SECRET` | Secret | — | Auth encryption key (min 32 chars) |
| `ADMIN_EMAIL` | Var | `admin@yourcompany.com` | Admin email address |
| `EMAIL_FROM` | Var | `B2B Website <...>` | Email sender address |
| `RESEND_API_KEY` | Secret | — | Resend API key for emails |
| `ADMIN_EMAIL` | Secret | — | Notification recipient |

## License

Private — All rights reserved.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for versioned release history.

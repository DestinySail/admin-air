# Admin-Air 管理后台系统

> 版本：v2.3.6  
> 一个基于 Vue 3 + Hono 的全栈管理后台解决方案

---

## 📖 项目简介

Admin-Air 是一个双项目单体仓库（Monorepo），包含独立的前端和后端项目，共享同一 Git 仓库。系统采用前后端分离架构，前端基于 Vue 3 生态构建，后端使用 Hono 轻量级框架，数据层采用 PostgreSQL + Drizzle ORM。

---

## 🚀 快速开始

### 环境要求

- Node.js `>= 20.19.0`
- PostgreSQL 服务（本地开发）
- pnpm 包管理器

### 首次启动

```bash
# 1. 确保 PostgreSQL 服务已启动（Windows）
Start-Service postgresql-x64-18

# 2. 后端初始化
cd server
pnpm install
pnpm db:setup    # 创建数据库、执行迁移、导入 seed 数据

# 3. 启动后端开发服务器
pnpm dev

# 4. 前端启动（新终端）
cd ../web
pnpm install
pnpm dev
```

访问地址：
- 前端：http://localhost:5173
- 后端 API：http://127.0.0.1:8787

### 日常开发

```bash
# 后端（终端 1）
cd server && pnpm dev

# 前端（终端 2）
cd web && pnpm dev
```

---

## 🛠️ 技术栈

### 前端（`web/`）

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.31 | 渐进式框架 |
| Vue Router | 5.0.4 | Hash 路由 |
| Pinia | 3.0.4 | 状态管理 |
| Vite | 8.0.3 | 构建工具 |
| Element Plus | 2.13.6 | UI 组件库 |
| ECharts | 6.0.0 | 数据可视化 |
| Axios | 1.14.0 | HTTP 客户端 |
| Sass | 1.98.0 | CSS 预处理器 |
| GSAP | ^3.14.2 | 动画库 |
| VueUse | 14.2.1 | Vue 工具集 |

**开发工具**：ESLint + Prettier + vue-tsc + TypeScript 6.0

### 后端（`server/`）

| 技术 | 版本 | 说明 |
|------|------|------|
| Hono | 4.12.9 | 轻量 Web 框架 |
| @hono/node-server | 1.19.11 | Node 服务端适配 |
| Drizzle ORM | ^0.45.2 | 类型安全 ORM |
| PostgreSQL 驱动 | ^3.4.8 | 数据库客户端 |
| Zod | ^4.3.6 | 数据验证 |
| Jose | ^6.2.2 | JWT 处理 |

**开发工具**：tsx + drizzle-kit + ESLint + Prettier

---

## ��� 项目结构

```
admin-air/
├── web/                    # 前端项目
│   ├── src/
│   │   ├── main.ts         # 应用入口
│   │   ├── App.vue         # 根组件
│   │   ├── router/         # 路由配置（含权限守卫）
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面视图
│   │   ├── layouts/        # 布局系统
│   │   │   ├── backend/    # 后台布局（多种容器）
│   │   │   └── common/     # 公共布局
│   │   ├── components/     # 公共组件
│   │   │   ├── table/      # 表格（多字段渲染器）
│   │   │   ├── baInput/    # 增强输入组件
│   │   │   └── formItem/   # 表单项目
│   │   ├── utils/          # 工具函数
│   │   │   ├── axios.ts    # API 请求封装
│   │   │   ├── build.ts    # 构建工具
│   │   │   └── router.ts   # 路由工具
│   │   └── styles/         # 全局样式
│   ├── vite.config.ts      # Vite 配置（代理 + 模块化）
│   └── package.json
├── server/                 # 后端项目
│   ├── src/
│   │   ├── index.ts        # 服务器启动入口
│   │   ├── app.ts          # Hono 应用组装
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── admin/      # 管理员模块
│   │   │   └── routine/    # 常规 API
│   │   ├── db/             # 数据库层
│   │   │   ├── schema/     # 表结构定义
│   │   │   ├── client.ts   # Drizzle 客户端
│   │   │   ├── migrate.ts  # 迁移执行
│   │   │   └── seed.ts     # Seed 数据
│   │   ├── bootstrap/      # 启动数据初始化
│   │   └── shared/         # 共享工具
│   │       ├── http/       # HTTP 响应、错误处理
│   │       └── security/   # JWT 令牌
│   ├── drizzle/            # 数据库迁移文件
│   └── package.json
├── docs/                   # 项目文档
│   ├── index.md            # 文档索引
│   ├── repository-structure.md
│   ├── development-workflow.md
│   └── agent-working-guide.md
├── AGENTS.md               # 代理操作权威指南（英文）
├── AGENTS.zh-CN.md         # 中文参考镜像
└── CLAUDE.md               # 次要协作指南
```

---

## 🎯 核心特性

### 前端
- **布局系统**：多种容器布局（classic、default、double、streamline）
- **权限路由**：基于 JWT 的路由守卫，未登录自动跳转登录页
- **全局搜索**：菜单快速搜索功能
- **表格组件**：高度可配置，支持多种字段渲染器（图片、标签、开关、颜色、日期等）
- **表单组件**：丰富的输入类型（上传、远程选择、富文本编辑器等）
- **状态持久化**：Pinia 持久化插件，配置自动保存

### 后端
- **模块化路由**：auth、admin、routine 三大模块
- **统一响应**：`{ code, msg, data }` 格式
- **数据库迁移**：Drizzle 工具链，版本化迁移文件
- **种子数据**：启动时自动初始化必要数据
- **文件服务**：本地上传文件访问接口

---

## 📝 常用命令

### 前端（`web/` 目录）

```bash
pnpm dev          # 启动开发服务器（自动构建）
pnpm build        # 生产构建
pnpm lint         # ESLint 检查
pnpm lint-fix     # 自动修复 lint 问题
pnpm typecheck    # TypeScript 类型检查
pnpm format       # Prettier 格式化
```

### 后端（`server/` 目录）

```bash
pnpm dev          # 开发服务器（自动检测 PostgreSQL）
pnpm dev:raw      # 直接启动（跳过 PostgreSQL 检测）
pnpm start        # 生产启动
pnpm db:generate  # 生成数据库迁移文件
pnpm db:migrate   # 执行数据库迁移
pnpm db:seed      # 重置种子数据
pnpm db:setup     # 完整初始化（generate + migrate + seed）
pnpm build        # TypeScript 编译检查
pnpm lint         # ESLint 检查
pnpm format       # Prettier 格式化
```

---

## 🔧 配置说明

### 前端环境变量（`web/.env*`）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_PORT | 开发服务器端口 | 5173 |
| VITE_OPEN | 启动时自动打开浏览器 | true |
| VITE_BASE_PATH | 部署基础路径 | / |
| VITE_OUT_DIR | 构建输出目录 | dist |

### 后端环境变量（`server/.env`）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 8787 |
| DATABASE_URL | PostgreSQL 连接字符串 | - |
| NODE_ENV | 运行环境 | development |
| UPLOADS_DIR | 上传文件存储目录 | ./uploads |

### 数据库连接

开发环境默认配置：
- 用户：`admin_air_dev`
- 数据库：`admin_air`
- 本地 PostgreSQL 服务名：`postgresql-x64-18`

---

## 🧑‍💻 开发规范

### 代码风格
- 编辑器：UTF-8 编码，LF 换行，4 空格缩进
- Prettier：无分号、单引号、行宽 150、ES5 尾随逗号
- TypeScript：新增逻辑必须使用类型注解

### 前端约定
- 导入路径：使用 `/@` 别名指向 `src/`（如 `import axios from '/@/utils/axios'`）
- API 请求：必须通过 `src/utils/axios.ts` 封装，禁止直接使用 fetch/axios
- 组件开发：Composition API + `<script setup>` 语法
- 路由模式：保持 `createWebHashHistory()`（除非任务明确要求更改）

### 后端约定
- API 响应：保持 `{ code, msg, data }` 结构（除非任务明确改变 contract）
- 数据库：使用 Drizzle + PostgreSQL，禁止临时内存状态
- 工具复用：复用现有的搜索、排序、分页、树形结构辅助函数

---

## 🔐 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | AdminAir_2026 |

---

## 📚 文档体系

本项目采用 **"源代码即真相"**（source code as truth）原则：

1. **AGENTS.md**（英文） - 代理操作权威指南，冲突时以英文版为准
2. **docs/** 目录 - 持久化工作流和架构文档
3. **源代码与配置** - 最终行为依据
4. **CLAUDE.md** - 次要协作指南（与源代码冲突时以源码为准）

文档阅读顺序：
- 新手入门：`AGENTS.md` → `docs/repository-structure.md` → `docs/development-workflow.md`
- 代理工作：`AGENTS.md` → 按需深入 `docs/` 各主题页

---

## 🧪 验证与测试

### 代码检查
```bash
# 前端
cd web && pnpm lint && pnpm typecheck

# 后端
cd server && pnpm lint && pnpm build
```

### 构建验证
```bash
cd web && pnpm build   # 确保构建通过
```

### 浏览器 E2E 验证
对于用户可见的前端变更、交互变更、路由/权限变更、前后端集成变更，**必须**执行基于浏览器的 MCP E2E 验证（如 Chrome DevTools MCP），并记录：
- 执行的命令
- 验证的用户旅程场景
- 任何跳过的检查及原因

> 注：当前仓库未配置自动化 E2E 测试套件，主要依赖 lint、类型检查、构建验证和手动 MCP E2E。

---

## 🌿 分支工作流

- 所有任务从 `main` 分支创建新分支，**禁止**直接在 `main` 工作
- 完成任务后合并回 `main`，删除任务分支
- 分支命名：建议使用 `codex/` 前缀（如 `codex/add-user-management`）

---

## 🤝 贡献指南

如需贡献，请先阅读：
1. `AGENTS.md` - 了解代理工作规则
2. `docs/agent-working-guide.md` - 文档维护原则
3. 相关源码和配置 - 遵循现有模式

保持修改最小化、精准化，避免大规模重构。如需更新持久化的工作流或行为指南，请同步更新 `docs/` 对应文件。

---

## 📄 许可证

本项目为私有项目，未经授权不得用于商业用途。

---

**维护日期**：2026-04-14

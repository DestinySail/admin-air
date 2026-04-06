本项目是一套功能完备的**前后端分离管理后台系统**，采用单体仓库结构，包含前端（Vue 3）和后端（Hono）两个独立项目。项目版本为 **2.3.6**，专为中后台业务场景设计，支持用户管理、权限控制、数据可视化等核心功能。

## 系统架构

该系统采用经典的前后端分离架构，前端通过 Vite 开发服务器代理 API 请求到后端服务。后端基于 Hono 框架构建，提供 RESTful API 接口，数据库使用 PostgreSQL 配合 Drizzle ORM 实现持久化存储。

```mermaid
flowchart TB
    subgraph Client["前端 (web/)"]
        UI["Vue 3 + Element Plus"]
        Router["Vue Router (Hash)"]
        Store["Pinia 状态管理"]
        API["Axios 请求层"]
    end

    subgraph Server["后端 (server/)"]
        Hono["Hono 框架"]
        Auth["JWT 鉴权"]
        Modules["业务模块<br/>auth / admin / routine"]
        DB["PostgreSQL + Drizzle"]
    end

    UI --> Router
    Router --> Store
    Store --> API
    API -->|代理 /api /admin| Hono
    Hono --> Auth
    Auth --> Modules
    Modules --> DB

    style Client fill:#e8f5e9,stroke:#4caf50
    style Server fill:#e3f2fd,stroke:#2196f3
```

**数据流向说明**：用户在前端界面操作 → Vue Router 路由匹配 → Pinia 状态更新 → Axios 发起 HTTP 请求 → Vite 代理到后端 8787 端口 → Hono 处理路由 → JWT 鉴权 → 业务模块处理 → Drizzle ORM 执行数据库操作。

Sources: [CLAUDE.md](CLAUDE.md#L1-L10), [web/vite.config.ts](web/vite.config.ts#L43-L53)

## 技术栈概览

### 前端技术栈

| 类别 | 技术选型 | 版本 |
|------|----------|------|
| 框架 | Vue | 3.5.31 |
| 语言 | TypeScript | 6.0.2 |
| 构建工具 | Vite | 8.0.3 |
| UI 组件库 | Element Plus | 2.13.6 |
| 状态管理 | Pinia | 3.0.4 |
| 路由 | Vue Router | 5.0.4 |
| HTTP 客户端 | Axios | 1.14.0 |
| 可视化 | ECharts | 6.0.0 |
| 样式 | Sass | 1.98.0 |

Sources: [web/package.json](web/package.json#L1-L59)

### 后端技术栈

| 类别 | 技术选型 | 版本 |
|------|----------|------|
| 框架 | Hono | 4.12.9 |
| 语言 | TypeScript | 6.0.2 |
| ORM | Drizzle ORM | 0.45.2 |
| 数据库 | PostgreSQL | - |
| 数据校验 | Zod | 4.3.6 |
| JWT 鉴权 | jose | 6.2.2 |
| HTTP 服务器 | @hono/node-server | 1.19.11 |

Sources: [server/package.json](server/package.json#L1-L41)

## 项目结构

```
admin-air/
├── web/                     # 前端项目
│   ├── src/
│   │   ├── api/            # API 请求封装
│   │   ├── components/     # Vue 组件
│   │   ├── layouts/        # 布局组件
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── styles/         # 全局样式
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面视图
│   ├── vite.config.ts      # Vite 配置
│   └── package.json
│
├── server/                  # 后端项目
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── admin/      # 管理模块
│   │   │   └── routine/    # 常规业务模块
│   │   ├── db/             # 数据库相关
│   │   │   ├── schema/     # 数据表结构
│   │   │   ├── client.ts   # 数据库连接
│   │   │   └── migrate.ts # 迁移脚本
│   │   ├── config/         # 配置管理
│   │   ├── shared/         # 共享工具
│   │   └── bootstrap/      # 启动初始化
│   ├── drizzle.config.ts   # Drizzle 配置
│   └── package.json
│
└── docs/                    # 项目文档
```

Sources: [CLAUDE.md](CLAUDE.md#L1-L10), [server/src](server/src#L1-L20)

## 核心模块说明

### 前端模块

**路由系统**：采用 Hash 模式（`createWebHashHistory()`），所有路由以 `#/` 开头，适合服务端无法配置重定向的场景。路由配置位于 `web/src/router/static/index.ts`，路由守卫在 `web/src/router/index.ts` 中实现登录状态校验。

**状态管理**：使用 Pinia 管理应用状态，支持持久化存储（通过 pinia-plugin-persistedstate）。主要 Store 包括：`adminInfo`（管理员信息）、`config`（系统配置）。

**API 通信**：统一通过 `web/src/utils/axios.ts` 发起请求，Vite 代理配置将 `/api` 和 `/admin` 路径转发至 `http://127.0.0.1:8787`。

Sources: [web/src/router/index.ts](web/src/router/index.ts#L1-L42), [CLAUDE.md](CLAUDE.md#L34-L40)

### 后端模块

**认证模块（auth）**：处理用户登录、Token 刷新等认证逻辑，使用 JWT 进行状态保持。

**管理模块（admin）**：提供用户管理、角色管理、权限控制等后台管理功能。

**常规模块（routine）**：处理日常业务数据接口。

后端启动时会执行 `prepareRuntime()` 进行数据库初始化和种子数据加载，默认端口为 **8787**。

Sources: [server/src/index.ts](server/src/index.ts#L1-L25), [server/src/modules](server/src/modules#L1-L12)

## 环境配置

### 前端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_PORT | 开发服务器端口 | 5173 |
| VITE_OPEN | 启动时自动打开浏览器 | false |
| VITE_BASE_PATH | 部署基础路径 | `./` |
| VITE_AXIOS_BASE_URL | 请求基础 URL | getCurrentDomain |

Sources: [web/.env](web/.env#L1-L6), [web/.env.development](web/.env.development#L1-L9)

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 8787 |
| DATABASE_URL | PostgreSQL 连接字符串 | postgresql://postgres:postgres@127.0.0.1:5432/admin_air |
| JWT_SECRET | JWT 签名密钥 | - |
| JWT_REFRESH_SECRET | 刷新 Token 密钥 | - |
| APP_BASE_URL | 应用基础 URL | http://127.0.0.1:8787 |

Sources: [server/.env.example](server/.env.example#L1-L11)

## 启动命令

| 项目 | 命令 | 说明 |
|------|------|------|
| 前端 | `cd web && pnpm dev` | 启动前端开发服务器 (端口 5173) |
| 后端 | `cd server && pnpm dev` | 启动后端服务 (端口 8787) |
| 前端构建 | `cd web && pnpm build` | 生产环境构建 |
| 后端构建 | `cd server && pnpm build` | TypeScript 编译检查 |
| 代码检查 | `pnpm lint` | ESLint 检查 |
| 代码格式化 | `pnpm format` | Prettier 格式化 |

Sources: [CLAUDE.md](CLAUDE.md#L12-L26), [web/package.json](web/package.json#L4-L11), [server/package.json](server/package.json#L4-L11)

## 下一步学习路径

完成本页面学习后，建议按照以下顺序深入了解项目：

1. **[快速启动](2-kuai-su-qi-dong)** - 了解如何在本地搭建完整的开发环境
2. **[前端技术栈与依赖](3-qian-duan-ji-zhu-zhan-yu-yi-lai)** - 深入理解前端技术选型
3. **[后端技术栈与依赖](7-hou-duan-ji-zhu-zhan-yu-yi-lai)** - 深入理解后端技术选型
4. **[数据库与Schema](9-shu-ju-ku-yu-schema)** - 了解数据表结构设计

---

如需了解项目开发规范和代码质量检查方式，请参阅 [项目规范概览](25-xiang-mu-gui-fan-gai-lan)。
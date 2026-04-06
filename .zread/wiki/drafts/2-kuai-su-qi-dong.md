本页面面向初次接触本项目的开发新手，提供从环境准备到本地服务启动的完整指南。项目采用前后端分离架构，前端基于 Vue 3 + Vite，后端基于 Hono + TypeScript，双方通过 HTTP API 通信。

## 项目架构概览

本项目是一个典型的 Web 管理后台系统，包含前端展示层和后端服务层两部分。前端负责用户界面交互和菜单导航，后端处理业务逻辑、数据持久化和 API 响应。两者在同一开发机上通过 Vite 代理实现跨域通信，后端连接本地 PostgreSQL 数据库存储业务数据。

```mermaid
graph TB
    subgraph 开发环境
        A[前端: web/]
        B[后端: server/]
        C[数据库: PostgreSQL]
    end
    
    A -- 代理 /api, /admin --> B
    B -- Drizzle ORM --> C
    
    A1[Vite Dev Server<br/>端口 5173]
    B1[Hono Server<br/>端口 8787]
    C1[PostgreSQL<br/>端口 5432]
    
    A --> A1
    B --> B1
    C --> C1
```

| 组件 | 目录 | 技术栈 | 端口 | 启动命令 |
|------|------|--------|------|----------|
| 前端 | `web/` | Vue 3 + Vite + TypeScript | 5173 | `cd web && pnpm dev` |
| 后端 | `server/` | Hono + TypeScript + Drizzle | 8787 | `cd server && pnpm dev` |
| 数据库 | 本地 | PostgreSQL | 5432 | 由后端脚本自动管理 |

Sources: [repository-structure.md](docs/repository-structure.md#L1-L15), [vite.config.ts](web/vite.config.ts#L37-L46), [env.ts](server/src/config/env.ts#L1-L40)

## 环境准备

### 基础依赖

在开始之前，确保本地已安装以下软件：

- **Node.js**：推荐 v20 及以上版本，用于运行前端和后端开发服务
- **pnpm**：项目使用的包管理器，版本需与 package.json 兼容
- **PostgreSQL**：项目使用 PostgreSQL 存储业务数据，建议版本 15 或 16

### 安装 pnpm

如果尚未安装 pnpm，可通过 npm 全局安装：

```bash
npm install -g pnpm
```

Sources: [web/package.json](web/package.json#L1-L59), [server/package.json](server/package.json#L1-L41)

## 前端启动

### 第一步：安装依赖

进入前端项目目录，安装所需依赖包：

```bash
cd web
pnpm install
```

此命令会根据 `web/package.json` 中的 dependencies 和 devDependencies 安装所有必要的包，包括 Vue 3、Element Plus、Vite 等。

Sources: [package.json - web/](web/package.json#L16-L59)

### 第二步：启动开发服务

依赖安装完成后，运行开发命令启动前端服务：

```bash
pnpm dev
```

该命令执行的实际脚本为 `esno ./src/utils/build.ts && vite --force`，会先运行构建脚本（用于生成路由等配置），然后启动 Vite 开发服务器。服务默认监听 `http://localhost:5173`，可通过 `web/.env` 文件中的 `VITE_PORT` 配置修改端口。

首次启动时若 `VITE_OPEN=true`，Vite 会自动打开浏览器访问对应地址。

Sources: [web/package.json](web/package.json#L5), [.env - web/](web/.env#L1-L6)

### 第三步：验证前端运行

前端服务启动成功后，访问 http://localhost:5173 应能看到登录页面或主界面。若页面无法加载，请检查终端输出是否有报错信息，常见问题包括端口被占用（5173）或依赖未完全安装。

Sources: [vite.config.ts](web/vite.config.ts#L33-L38)

## 后端启动

### 第一步：配置环境变量

后端需要连接数据库，因此必须配置环境变量。进入 server 目录，复制示例配置：

```bash
cd server
copy .env.example .env
```

`.env` 文件中需要关注的核心配置项如下：

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| DATABASE_URL | PostgreSQL 连接字符串 | postgresql://user:pass@127.0.0.1:5432/dbname |
| PORT | 后端服务监听端口 | 8787 |
| JWT_SECRET | JWT 签名密钥（生产环境需强随机字符串） | change-me |

初次开发时，直接使用 `.env.example` 中的默认值通常可正常工作，但建议根据本地 PostgreSQL 实际配置修改 `POSTGRES_USER` 和 `POSTGRES_PASSWORD`。

Sources: [.env.example](server/.env.example#L1-L11), [env.ts](server/src/config/env.ts#L1-L40)

### 第二步：安装依赖

```bash
pnpm install
```

后端依赖包括 Hono 框架、Drizzle ORM、zod 验证库等。安装过程可能比前端稍长，因为需要编译部分原生模块。

Sources: [server/package.json](server/package.json#L16-L41)

### 第三步：初始化数据库

首次启动后端前，需要创建数据库表结构并导入初始数据：

```bash
pnpm db:setup
```

此命令会依次执行 `db:migrate`（运行数据库迁移脚本创建表）和 `db:seed`（导入系统初始化数据，如默认管理员账号、基础菜单等）。执行成功后，数据库中会创建所有业务表并填充必要数据。

Sources: [setup.ts](server/src/db/setup.ts#L1-L20), [server/package.json](server/package.json#L8-L10)

### 第四步：启动后端服务

数据库初始化完成后，启动后端开发服务：

```bash
pnpm dev
```

后端使用 `tsx watch` 模式启动，支持热重载。在 Windows 环境下，脚本会自动检查 PostgreSQL 服务状态，若服务未运行则尝试启动（服务名为 `postgresql-x64-18`），确保数据库可用后再启动后端服务。

服务启动成功后，默认监听 `http://127.0.0.1:8787`，前端通过 Vite 代理访问此地址。

Sources: [dev.ts](server/src/scripts/dev.ts#L1-L201), [server/package.json](server/package.json#L5)

### 验证后端运行

可以通过浏览器访问后端健康检查端点或直接访问前端页面验证后端是否正常运行。若前端页面能成功发起 API 请求并收到响应，说明前后端连接正常。

Sources: [vite.config.ts](web/vite.config.ts#L39-L46)

## 前后端联调

前端启动后，浏览器发出的 `/api` 和 `/admin` 请求会被 Vite 代理转发到后端 `http://127.0.0.1:8787`。这一代理配置在 `web/vite.config.ts` 中定义：

```typescript
proxy: {
    '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    '/admin': { target: 'http://127.0.0.1:8787', changeOrigin: true },
}
```

这意味着前端代码中无需写死后端地址，代理会自动处理请求转发。开发时确保前后端服务同时运行即可完成联调。

Sources: [vite.config.ts](web/vite.config.ts#L39-L46)

## 常见问题

### PostgreSQL 服务启动失败

在 Windows 环境下，后端启动脚本会自动尝试启动 PostgreSQL 服务。若失败，可能原因包括：PostgreSQL 未安装、服务名称不匹配、或权限不足。手动启动方法：打开 Windows 服务管理器，找到 `postgresql-x64-18` 服务并启动。

### 端口被占用

前端默认 5173 端口、后端默认 8787 端口若被其他程序占用，可通过以下方式修改：
- 前端：在 `web/.env` 中修改 `VITE_PORT`
- 后端：在 `.env` 中修改 `PORT`

### 数据库连接失败

确认 `.env` 中的 `DATABASE_URL` 格式正确，用户名密码与本地 PostgreSQL 配置一致。若不确定，可使用 pgAdmin 或 psql 命令行验证数据库可访问性。

Sources: [dev.ts](server/src/scripts/dev.ts#L60-L90)

## 下一步

完成快速启动后，建议按顺序阅读以下页面深入了解项目：

- [项目概览](1-xiang-mu-gai-lan) — 了解项目的整体设计目标和技术选型
- [前端技术栈与依赖](3-qian-duan-ji-zhu-zhan-yu-yi-lai) — 掌握前端使用的核心技术
- [后端技术栈与依赖](7-hou-duan-ji-zhu-zhan-yu-yi-lai) — 掌握后端使用的核心技术
- [首次启动流程](20-shou-ci-qi-dong-liu-cheng) — 了解完整的首次启动步骤详解
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Vue 3 + Element Plus 的中后台管理系统，采用 pnpm monorepo 架构，包含前端应用和模拟后端服务。

## 项目结构

```
admin-air/
├── apps/
│   ├── web/              # Vue 3 前端应用 (@baseadmin-air/web)
│   └── mock-server/       # Hono 模拟后端服务 (@baseadmin-air/mock-server)
├── package.json          # 工作区根配置
└── pnpm-workspace.yaml  # pnpm 工作区配置
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 同时启动前端和 mock-server 开发服务器 |
| `pnpm dev:client` | 仅启动前端开发服务器 |
| `pnpm dev:server` | 仅启动 mock-server |
| `pnpm build` | 构建前端和后端 |
| `pnpm start` | 启动生产环境的 mock-server |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm lint-fix` | 自动修复 ESLint 问题 |
| `pnpm format` | 运行 Prettier 格式化 |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |

## 技术栈

- **前端**: Vue 3.5 + TypeScript + Vite 6 + Pinia + Vue Router + Vue i18n
- **UI**: Element Plus 2.9
- **后端**: Hono 4.6 + @hono/node-server
- **工具**: Axios, Lodash-es, ECharts, SortableJS, Sass

## 架构要点

- **路由**: 使用 Hash 模式 (`createWebHashHistory`)
- **状态管理**: Pinia，持久化插件 `pinia-plugin-persistedstate`
- **国际化**: 按路由动态加载语言文件，存于 `src/lang/backend/` 和 `src/lang/common/`
- **API 请求**: Axios 封装在 `src/utils/axios.ts`
- **Mock 数据**: `apps/mock-server/src/mock-data.ts`
- **样式**: SCSS，入口文件 `src/styles/index.scss`

## 开发注意事项

- 前端开发服务器端口默认 5173，mock-server 默认 3000
- 语言文件采用动态按需加载，非预加载全部
- 路由守卫中处理认证跳转和语言文件加载

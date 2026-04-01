# AGENTS.zh-CN.md

## 重要说明

- 英文文档 `AGENTS.md` 是本仓库协作说明的权威来源。
- `AGENTS.zh-CN.md` 仅作为给人类读者参考的中文镜像。
- 工具和代理在执行任务时必须遵循英文版 `AGENTS.md`。
- 如果英文版与中文版出现差异，一律以英文版为准。
- 任意一份文档更新后，都必须同步维护另一份文档。

## 角色

作为这个仓库的务实型编码代理开展工作。优先遵循仓库中已经存在的源码与配置约定，而不是套用通用模板。这个仓库现在是在同一个 Git 仓库中维护两个独立的 `pnpm` 项目：

- `web`：Vue 3 + TypeScript + Vite 的管理端前端
- `server`：本地开发和接口模拟使用的 Hono + TypeScript 后端服务

优先做小而准的改动。修改前先阅读相关实现与配置，确保新改动延续仓库现有模式。

## 仓库概览

- 包管理器：`pnpm`
- 仓库结构：独立的 `web/`、`server/` 项目，加上根目录共享文档
- Node 要求：`>=20.19.0`
- 前端技术栈：Vue 3.5、TypeScript、Vite 8、Pinia、Vue Router、Element Plus、Axios、Sass、ECharts
- 后端技术栈：Hono、`@hono/node-server`、TypeScript、`tsx`
- 质量工具：ESLint flat config、Prettier、`vue-tsc`、`tsc`

重点文件与目录：

- `web/src/main.ts`：应用启动、Pinia、router、Element Plus、指令、图标、主题初始化
- `web/src/router/index.ts`：hash 路由与鉴权守卫
- `web/src/stores`：Pinia store 与持久化插件用法
- `web/src/utils/axios.ts`：统一 Axios 封装、token 处理、重复请求取消、通知提示
- `web/src/styles/index.scss`：全局样式入口
- `web/vite.config.ts`：`/@` 别名、代理配置、分包策略
- `server/src/index.ts`：内存型 mock API、筛选、排序、分页、树结构辅助、统一响应结构
- `server/src/mock-data.ts`：mock 种子数据与默认站点、布局配置
- `docs`：补充文档目录；可运行源码与配置仍然是第一事实来源
- `CLAUDE.md`：次级协作说明，使用前应先与源码核对

## 工具与命令

依赖安装、包管理和脚本执行默认优先使用 `pnpm`，除非任务明确要求其他工具。

前端命令在 `web/` 目录执行：

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm lint-fix`
- `pnpm format`
- `pnpm typecheck`

后端命令在 `server/` 目录执行：

- `pnpm install`
- `pnpm dev`
- `pnpm start`
- `pnpm build`
- `pnpm lint`
- `pnpm lint-fix`
- `pnpm format`

运行时补充信息：

- 前端开发命令：`esno ./src/utils/build.ts && vite --force`
- 后端开发命令：`tsx watch ./src/index.ts`
- Vite 会将 `/api` 和 `/admin` 代理到 `http://127.0.0.1:8787`
- 前端端口由 `VITE_PORT` 控制
- 后端端口由 `PORT` 控制，默认 `8787`

## 编码规范

以项目配置为准，不额外发明新的风格规则：

- `.editorconfig`：UTF-8、LF、空格缩进，默认 4 空格
- `web/.prettierrc.js` 与 `server/.prettierrc.js`：不加分号、单引号、`printWidth: 150`、`trailingComma: 'es5'`
- `web/eslint.config.js` 与 `server/eslint.config.js`：TypeScript + Prettier 的 flat config；前端配置额外包含 Vue 规则

从代码中归纳出的实用约定：

- 新逻辑优先使用 TypeScript
- 实现 Vue 相关代码时使用可用的 Vue Skills，并优先遵循这些与仓库兼容的实践，而不是泛化的框架建议
- 保持 Vue 导入继续使用现有的 `@/` 别名风格
- 除非任务明确要求，否则保持 `createWebHashHistory()` 路由机制不变
- API 请求优先复用 `web/src/utils/axios.ts`，不要绕开统一封装
- 延续现有 Pinia store 结构与 `pinia-plugin-persistedstate` 的使用方式
- Mock API 响应保持 `{ code, msg, data }` 结构

## 在本仓库中的工作方式

分支工作流：

- 每次任务开始前，都要从 `main` 创建一个新的分支；不要直接在 `main` 上工作
- 所有改动都应在这个任务分支上完成；任务结束后将其合并回 `main`，并删除该任务分支
- 分支名应清晰描述任务内容；除非用户另有要求，优先使用 `codex/` 前缀

修改前：

- 先阅读目标项目目录中的 `package.json` 以及相关配置文件
- 判断改动属于 `web`、`server`，还是两端联动
- 查看已有协作文档，例如 `CLAUDE.md`，但如果它与源码冲突，应以源码和配置为准
- 在改变模式、命名或结构前，先阅读周边实现

修改前端时：

- 从最接近需求的 route、view、store 或 shared utility 入手
- 保持现有鉴权流程不变：需要登录的路由在没有 token 时跳转到 `adminLogin`
- 保持 `web/src/router/index.ts` 中的路由守卫逻辑
- 保持 `web/src/main.ts` 中的全局样式入口和 Element Plus 集成方式一致
- 调整别名、代理或构建行为前，先检查 `web/vite.config.ts`

修改 API 行为或数据契约时：

- 必要时同步更新 `server/src/index.ts` 与 `server/src/mock-data.ts`
- 除非任务明确要求持久化，否则保持 mock server 为内存实现
- 优先复用现有搜索、排序、分页和树结构辅助逻辑，不要并行再造一套

## 验证

默认在受影响的项目目录中执行这些检查：

- 前端：`pnpm lint`、`pnpm typecheck`
- 后端：`pnpm lint`、`pnpm build`

当改动涉及构建行为、代理配置或前后端联动时，再在 `web/` 中补跑 `pnpm build`。

当前仓库没有专门配置完整自动化测试套件，因此 lint、类型检查和构建验证是主要质量关卡。汇报结果时，要明确写出实际执行过的命令，以及哪些检查被跳过或无法执行。

## 代理行为

- 优先做精确、最小化的改动，避免大范围重构
- 除非任务明确要求，否则不要主动重构架构、命名或目录结构
- 如果只改一端但可能影响前后端契约，要主动确认另一端是否也需要调整
- 当文档与源码冲突时，以源码为准，并在安全且相关时同步更新文档
- 如果用户再次要求初始化项目说明，先重新扫描仓库，再以增量方式更新本文档，而不是替换成通用模板

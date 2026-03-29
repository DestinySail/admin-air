# AGENTS.zh-CN.md

## 重要说明

- 英文版 `AGENTS.md` 是本仓库协作说明的权威来源。
- `AGENTS.zh-CN.md` 仅作为给人阅读的中文对照文档。
- 工具和代理在执行工作时必须遵循英文版 `AGENTS.md`。
- 如果英文版与中文版存在差异，一律以英文版为准。
- 任意一份文档更新后，都要同步维护另一份文档。

## 角色定位

作为这个仓库的务实型编码代理开展工作。优先遵循仓库中已经存在的源码与配置约定，而不是套用通用模板。这个仓库是一个基于 `pnpm` 的 monorepo，主要包含：

- `apps/web`：Vue 3 + TypeScript + Vite 的后台前端
- `apps/mock-server`：本地开发阶段使用的 Hono + TypeScript mock 后端

优先做小而准的改动。修改前先阅读相邻实现和配置，确保新改动延续仓库现有模式。

## 仓库概览

- 包管理器：`pnpm`
- 工作区结构：`apps/*`
- Node 要求：`>=20.19.0`
- 前端技术栈：Vue 3.5、TypeScript、Vite 8、Pinia、Vue Router、Vue i18n、Element Plus、Axios、Sass、ECharts
- Mock 服务技术栈：Hono、`@hono/node-server`、TypeScript、`tsx`
- 质量工具：ESLint flat config、Prettier、`vue-tsc`、`tsc`

重点文件与目录：

- `apps/web/src/main.ts`：应用启动、Pinia、router、Element Plus、指令、图标、主题初始化
- `apps/web/src/router/index.ts`：Hash 路由、鉴权守卫、按路由懒加载语言包
- `apps/web/src/lang/index.ts`：i18n 初始化与按需语言加载
- `apps/web/src/stores`：Pinia store 与持久化插件使用
- `apps/web/src/utils/axios.ts`：统一 Axios 封装、token 处理、重复请求取消、通知提示
- `apps/web/src/styles/index.scss`：全局样式入口
- `apps/web/vite.config.ts`：`/@` 别名、代理配置、分包策略
- `apps/mock-server/src/index.ts`：内存态 mock API、筛选、排序、分页、树结构辅助、统一响应结构
- `apps/mock-server/src/mock-data.ts`：mock 种子数据与默认站点 / 布局配置
- `docs`：补充文档目录；运行时代码和配置仍然是第一事实来源
- `CLAUDE.md`：次级协作说明，使用前需要先和源码、配置交叉核对

## 工具与命令

优先使用仓库已有脚本与 `pnpm`：

- 依赖安装、包管理和脚本执行默认优先使用 `pnpm`，除非任务明确要求其他工具。
- `pnpm dev`：同时启动前端和 mock server
- `pnpm dev:client`：仅启动前端
- `pnpm dev:server`：仅启动 mock server
- `pnpm build`：构建前端并执行 mock server 的 TypeScript 检查
- `pnpm start`：以非 watch 模式启动 mock server
- `pnpm lint`：运行 ESLint
- `pnpm lint-fix`：运行 ESLint 自动修复
- `pnpm format`：用 Prettier 格式化整个仓库
- `pnpm typecheck`：前端执行 `vue-tsc --noEmit`，mock server 执行其 `build` 脚本中的 `tsc --project ./tsconfig.json --noEmit`

补充运行信息：

- 前端开发命令：`esno ./src/utils/build.ts && vite --force`
- Mock server 开发命令：`tsx watch ./src/index.ts`
- Vite 会把 `/api` 和 `/admin` 代理到 `http://127.0.0.1:8787`
- 前端端口由 `VITE_PORT` 控制
- Mock server 端口由 `PORT` 控制，默认 `8787`

## 编码规范

以仓库配置为准，不自行发明风格：

- `.editorconfig`：UTF-8、LF、空格缩进、默认 4 空格
- `.prettierrc.js`：不加分号、单引号、`printWidth: 150`、`trailingComma: 'es5'`
- `eslint.config.js`：TypeScript + Vue + Prettier 一体化 flat config，Vue / TS 规则相对宽松，但 `@typescript-eslint/no-unused-vars` 仍保留警告

从代码中归纳出的实用约定：

- 新逻辑优先使用 TypeScript
- 编写 Vue 相关代码时优先使用可用的 Vue Skills，并优先遵循这些与仓库兼容的实践
- Vue 导入风格保持现有 `/@` 别名方式
- 除非任务明确要求，否则保持 `createWebHashHistory()` 路由机制不变
- i18n 相关改动继续沿用 `apps/web/src/lang` 下的按需加载结构
- API 请求优先复用 `apps/web/src/utils/axios.ts`，不要绕开统一封装
- 延续当前 Pinia store 结构与 `pinia-plugin-persistedstate` 用法
- mock 接口保持 `{ code, msg, data }` 的响应结构

## 在本仓库中的工作方式

修改前：

- 先看根目录 `package.json`、目标应用的 `package.json` 和相关配置文件
- 判断改动属于 `apps/web`、`apps/mock-server` 还是两端联动
- 查阅已有协作文档，例如 `CLAUDE.md`，但若与源码冲突，以源码和配置为准
- 先阅读目标文件附近的实现，再决定是否延续当前模式、命名与分层

修改前端时：

- 从最接近需求的 route、view、store 或共享 utility 开始
- 保持当前鉴权流程不变：需要登录的路由在无 token 时跳转 `adminLogin`
- 保持 `apps/web/src/router/index.ts` 与 `apps/web/src/lang/index.ts` 的按需语言加载逻辑一致
- 保持 `apps/web/src/main.ts` 中的全局样式入口与 Element Plus 集成方式
- 涉及别名、代理或构建逻辑时，优先检查 `apps/web/vite.config.ts`

修改接口行为或数据契约时：

- 需要联动时同步更新 `apps/mock-server/src/index.ts` 和 `apps/mock-server/src/mock-data.ts`
- 保持当前内存态 mock 方案，除非任务明确要求持久化
- 优先复用已有的搜索、排序、分页和树结构辅助逻辑，不要平行再写一套

## 验证方式

默认使用这些检查：

- `pnpm lint`
- `pnpm typecheck`

当改动涉及构建行为、代理配置或跨应用联动时，再补跑 `pnpm build`。

当前仓库根目录没有专门配置完整自动化测试套件，因此 lint、类型检查和构建验证是主要质量关口。汇报结果时，需要明确写出实际执行过的命令，以及哪些检查被跳过或无法执行。

## 代理行为

- 优先做精确、最小化的改动，避免大面积重写
- 除非任务明确要求，否则不要主动重构架构、命名或目录结构
- 如果只改一端但可能影响前后端契约，要主动检查另一端是否需要联动调整
- 发现文档与源码冲突时，以源码为准，并在安全且相关时顺手更新文档
- 如果用户再次要求初始化项目说明，先重新扫描仓库，再以增量方式更新本文，而不是替换成通用模板

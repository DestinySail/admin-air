本文档详细说明 admin-air 项目中前端构建系统的配置架构，涵盖 Vite 构建工具的配置策略、环境变量管理、自定义插件开发以及生产构建优化等核心内容。通过深入理解这些配置，开发者可以高效地进行开发调试和生产部署。

## 构建架构总览

admin-air 前端采用 Vite 作为构建工具，结合多项自定义配置实现高效的开发体验和生产优化。构建系统的核心由 `vite.config.ts` 主导，配合环境变量文件和自定义插件形成完整的构建流水线。

```mermaid
flowchart TB
    subgraph 配置层
        A[vite.config.ts] --> B[环境变量加载]
        B --> C[loadEnv 函数]
        C --> D[.env 文件]
        C --> E[.env.development]
        C --> F[.env.production]
    end
    
    subgraph 插件层
        G[@vitejs/plugin-vue] --> H[Vue SFC 编译]
        I[svgBuilder] --> J[SVG 雪碧图生成]
        K[customHotUpdate] --> L[热更新控制]
    end
    
    subgraph 构建层
        M[开发服务器] --> N[本地代理配置]
        M --> O[热更新监听]
        P[生产构建] --> Q[代码分割策略]
        P --> R[输出目录优化]
    end
    
    A --> G
    A --> I
    A --> K
    A --> M
    A --> P
```

## 核心配置文件

### Vite 主配置

项目的主构建配置文件位于 `web/vite.config.ts`，采用函数式配置设计，根据不同运行环境加载对应的环境变量。以下是配置的核心结构：

| 配置项 | 功能说明 | 默认值/典型值 |
|--------|----------|---------------|
| `root` | 项目根目录 | `__dirname` (web 目录) |
| `base` | 部署基础路径 | 通过 `VITE_BASE_PATH` 环境变量控制 |
| `server.port` | 开发服务器端口 | `5173` (通过 `VITE_PORT` 配置) |
| `server.proxy` | API 代理配置 | `/api` 和 `/admin` 指向后端服务 |
| `build.outDir` | 输出目录 | `dist` (生产环境) |
| `build.rollupOptions.output.manualChunks` | 代码分割策略 | 按 Vue/ Echarts 分组 |

Sources: [vite.config.ts](web/vite.config.ts#L1-L68)

### 环境变量体系

项目采用 Vite 标准的环境变量机制，通过 `.env` 文件定义基础配置，`.env.development` 和 `.env.production` 分别覆盖开发和生产环境的特定值。

**基础配置 (web/.env)**
```properties
VITE_PORT = 5173
VITE_OPEN = false
```

**开发环境配置 (web/.env.development)**
```properties
ENV = 'development'
VITE_BASE_PATH = './'
VITE_AXIOS_BASE_URL = 'getCurrentDomain'
```

**生产环境配置 (web/.env.production)**
```properties
ENV = 'production'
VITE_BASE_PATH = '/'
VITE_OUT_DIR = 'dist'
VITE_AXIOS_BASE_URL = 'getCurrentDomain'
```

Sources: [.env](web/.env#L1-L6)[.env.development](web/.env.development#L1-L9)[.env.production](web/.env.production#L1-L12)

## 路径别名配置

项目配置了路径别名以简化导入语句，提升开发效率。配置位于 `vite.config.ts` 的 `alias` 对象中：

```typescript
const alias: Record<string, string> = {
    '/@': pathResolve('./src/'),
    assets: pathResolve('./src/assets'),
}
```

这使得开发者可以使用以下导入方式：

```typescript
// 使用别名
import { useAuth } from '@/stores/auth'
import icon from 'assets/logo.png'

// 等价于
import { useAuth } from '../../src/stores/auth'
import icon from './src/assets/logo.png'
```

Sources: [vite.config.ts](web/vite.config.ts#L28-L31)

## 代码分割策略

生产构建采用手动分块策略，将依赖库与业务代码分离，实现更好的缓存命中效果。分割逻辑通过 `manualChunks` 函数实现：

```typescript
const manualChunks = (id: string) => {
    if (!id.includes('node_modules')) return

    // Vue 核心生态
    const vuePackages = ['vue', 'vue-router', 'pinia', 'element-plus']
    if (vuePackages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
        return 'vue'
    }

    // ECharts 单独分块
    if (id.includes('/node_modules/echarts/')) {
        return 'echarts'
    }
}
```

| 分块名称 | 包含模块 | 缓存策略 |
|----------|----------|----------|
| `vue` | vue, vue-router, pinia, element-plus | 长期缓存 |
| `echarts` | echarts 图表库 | 长期缓存 |
| `[其余vendor]` | 其他第三方模块 | 版本变化时更新 |

Sources: [vite.config.ts](web/vite.config.ts#L12-L23)

## 自定义插件系统

### SVG 图标构建器

项目实现了自定义 SVG 雪碧图生成插件 `svgBuilder`，位于 `web/src/components/icon/svg/index.ts`。该插件在开发服务器启动时自动扫描 `src/assets/icons/` 目录下的所有 SVG 文件，将它们转换为 Symbol 格式并注入到 HTML 中。

**工作原理：**

1. 递归扫描指定目录下的所有 SVG 文件
2. 清理 SVG 属性（移除 width/height，清理 fill 颜色）
3. 生成唯一的 symbol id（格式：`prefix-filename`）
4. 将处理后的 SVG 注入到 HTML `<body>` 起始标签后

```typescript
export const svgBuilder = (path: string, perfix = 'local') => {
    // 扫描目录 → 清理属性 → 生成 symbol → 注入 HTML
}
```

使用方式在 `vite.config.ts` 中配置：

```typescript
plugins: [vue(), svgBuilder('./src/assets/icons/'), customHotUpdate()]
```

Sources: [vite.config.ts](web/vite.config.ts#L34)[svg/index.ts](web/src/components/icon/svg/index.ts#L49-L69)

### 自定义热更新控制

项目实现了精细化的热更新控制插件 `customHotUpdate`，使开发者在调试模式下可以控制热更新的开启与关闭。该插件位于 `web/src/utils/vite.ts`：

**核心功能：**

- **状态管理**：记录热更新开关状态、关闭类型、脏文件标记
- **客户端通信**：通过 WebSocket 与客户端同步状态
- **脏文件检测**：监听新增文件，标记需要重启的情况

```typescript
export const hotUpdateState = reactive<HotUpdateState>({
    switch: true,           // 热更新开关
    closeType: '',         // 关闭类型
    dirtyFile: false,      // 是否有脏文件
    listenDirtyFileSwitch: true  // 是否监听脏文件
})
```

**服务端消息处理：**

| 消息类型 | 处理逻辑 |
|----------|----------|
| `custom:close-hot` | 关闭热更新，备份并移除文件监听器 |
| `custom:open-hot` | 开启热更新，恢复监听器 |
| `custom:reload-server` | 重启 Vite 开发服务器 |
| `custom:change-listen-dirty-file-switch` | 修改脏文件监听开关 |

Sources: [vite.ts](web/src/utils/vite.ts#L96-L184)

## 开发服务器配置

### 代理配置

项目配置了本地开发代理，解决跨域问题并实现前后端联调：

```typescript
server: {
    proxy: {
        '/api': {
            target: 'http://127.0.0.1:8787',
            changeOrigin: true,
        },
        '/admin': {
            target: 'http://127.0.0.1:8787',
            changeOrigin: true,
        },
    },
}
```

| 路径规则 | 目标地址 | 用途 |
|----------|----------|------|
| `/api/*` | http://127.0.0.1:8787 | API 接口代理 |
| `/admin/*` | http://127.0.0.1:8787 | 管理后台代理 |

Sources: [vite.config.ts](web/vite.config.ts#L38-L51)

## 生产构建配置

### 构建选项

生产构建针对性能和部署进行了优化配置：

```typescript
build: {
    cssCodeSplit: false,      // 禁用 CSS 代码分割
    sourcemap: false,        // 不生成 sourcemap
    outDir: VITE_OUT_DIR,    // 输出目录（默认 dist）
    emptyOutDir: true,       // 构建前清空输出目录
    chunkSizeWarningLimit: 1500,  // 分块大小警告阈值
}
```

| 配置项 | 说明 | 优化效果 |
|--------|------|----------|
| `cssCodeSplit: false` | 合并所有 CSS 到单个文件 | 减少 HTTP 请求 |
| `sourcemap: false` | 不生成调试映射文件 | 减小构建产物 |
| `chunkSizeWarningLimit` | 设置分块大小警告阈值 | 1500KB 内不警告 |

Sources: [vite.config.ts](web/vite.config.ts#L52-L63)

## 构建脚本

项目在构建过程中自动生成 TypeScript 类型定义文件，增强开发时的类型安全。

### 表格渲染器类型生成

`web/src/utils/build.ts` 脚本在构建时自动扫描 `src/components/table/fieldRender/` 目录，生成 `types/tableRenderer.d.ts` 类型定义文件：

```typescript
const buildTableRendererType = () => {
    let tableRenderer = getFileNames('./src/components/table/fieldRender/')
    
    // 增加 slot，去除 default
    tableRenderer.push('slot')
    tableRenderer = tableRenderer.filter((item) => item !== 'default')
    
    // 生成 TypeScript 类型
    let tableRendererContent = 
        '/** 可用的表格单元格渲染器 */\ntype TableRenderer =\n    | '
    // ... 生成联合类型
}
```

这使得前端组件可以自动获取可用的表格渲染器列表，无需手动维护类型。

Sources: [build.ts](web/src/utils/build.ts#L18-L37)

## 构建命令

项目在 `package.json` 中定义了完整的构建相关命令：

| 命令 | 功能 | 适用场景 |
|------|------|----------|
| `pnpm dev` | 启动开发服务器 | 本地开发调试 |
| `pnpm build` | 生产环境构建 | 部署前打包 |
| `pnpm typecheck` | TypeScript 类型检查 | 代码质量验证 |
| `pnpm lint` | ESLint 代码检查 | 规范校验 |
| `pnpm lint-fix` | 自动修复 ESLint 错误 | 快速修复 |
| `pnpm format` | Prettier 代码格式化 | 统一代码风格 |

Sources: [package.json](web/package.json#L6-L11)

## 配置决策说明

### 为什么禁用 CSS 代码分割？

项目中设置 `cssCodeSplit: false` 是为了将所有 CSS 合并到单个文件中。这种策略适合管理后台类应用——页面数量有限且样式复用率高，合并后的单 CSS 文件能更好地利用浏览器缓存，减少首屏加载时的请求数量。

### 为什么使用手动分块策略？

相比自动分块，项目采用手动配置 `manualChunks` 的方式可以精确控制依赖库的分组。将 Vue 生态和 ECharts 这类大型库单独分块，能够实现更长的缓存周期——这些库版本稳定，单独分块后即使业务代码频繁更新，用户也无需重新下载这些稳定依赖。

---

## 下一步学习

完成前端构建配置的学习后，建议按以下顺序深入：

- **[前端代理与环境变量](12-qian-duan-dai-li-yu-huan-jing-bian-liang)** — 深入了解开发代理的具体配置和环境变量的使用场景
- **[前端开发命令](16-qian-duan-kai-fa-ming-ling)** — 掌握项目的所有开发命令和构建脚本
- **[ESLint与Prettier配置](26-eslintyu-prettierpei-zhi)** — 了解代码质量工具的配置体系
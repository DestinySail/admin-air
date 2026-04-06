本文档详细介绍 AdminAir 项目前端路由架构与鉴权机制。该系统采用 **Vue Router 5** 结合 **Pinia** 状态管理，实现了基于 Token 的双令牌认证体系，并支持从后端动态加载菜单路由。

## 整体架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           前端路由与鉴权架构                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│  │   登录页      │────▶│  路由守卫     │────▶│  后台布局    │               │
│  │  /login      │     │  beforeEach  │     │   /          │               │
│  └──────────────┘     └──────────────┘     └──────────────┘               │
│         │                    │                      │                       │
│         │              ┌─────┴─────┐          ┌─────┴─────┐               │
│         │              │           │          │           │               │
│         ▼              ▼           ▼          ▼           ▼               │
│  ┌──────────────┐ ┌──────────────┐    ┌──────────────────────┐           │
│  │ adminInfo    │ │ 静态路由     │    │ 动态路由 (addRoute)  │           │
│  │ Store       │ │ /login      │    │ 来自后端菜单API     │           │
│  │ (Pinia)     │ │ /404        │    │                      │           │
│  │             │ │ /401        │    │ handleAdminRoute()   │           │
│  └──────────────┘ └──────────────┘    └──────────────────────┘           │
│         │                                                      │           │
│         │              ┌──────────────────────────────────────┘           │
│         │              │                                                    │
│         ▼              ▼                                                    │
│  ┌──────────────┐ ┌──────────────┐     ┌──────────────┐                 │
│  │ Axios        │ │ 页面组件     │     │ 菜单搜索      │                 │
│  │ 拦截器        │ │ 权限按钮     │     │              │                 │
│  │ (Token注入)  │ │              │     │ menuSearch   │                 │
│  └──────────────┘ └──────────────┘     └──────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心路由文件结构

```
web/src/router/
├── index.ts              # 路由主入口，包含全局守卫
├── static.ts             # 静态路由定义
└── static/
    └── adminBase.ts      # 后台基础路由结构
```

Sources: [web/src/router/index.ts](web/src/router/index.ts#L1-L42)

## 静态路由定义

静态路由在 `web/src/router/static.ts` 中定义，包含登录页、404、401 等无需鉴权的页面。

| 路由路径 | 路由名称 | 鉴权要求 | 说明 |
|---------|---------|---------|------|
| `/login` | `adminLogin` | `requiresAuth: false` | 登录页面 |
| `/404` | `notFound` | `requiresAuth: false` | 404错误页 |
| `/401` | `noPower` | `requiresAuth: false` | 401无权限页 |
| `/:pathMatch(.*)*` | - | `requiresAuth: false` | 捕获所有未匹配路由 |

```typescript
// web/src/router/static.ts (第4-45行)
const staticRoutes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'adminLogin',
        component: () => import('/@/views/login.vue'),
        meta: {
            title: '登录',
            requiresAuth: false,
        },
    },
    // ... 其他静态路由
]
```

Sources: [web/src/router/static.ts](web/src/router/static.ts#L1-L48)

后台基础路由采用父子嵌套结构，重定向到加载页：

```typescript
// web/src/router/static/adminBase.ts (第5-23行)
const adminBaseRoute: RouteRecordRaw = {
    path: '/',
    name: 'admin',
    component: () => import('/@/layouts/backend/index.vue'),
    redirect: '/loading',
    meta: {
        title: '后台管理',
    },
    children: [
        {
            path: 'loading/:to?',
            name: 'adminMainLoading',
            component: () => import('/@/layouts/common/components/loading.vue'),
            meta: {
                title: '加载中',
            },
        },
    ],
}
```

Sources: [web/src/router/static/adminBase.ts](web/src/router/static/adminBase.ts#L5-L23)

## 路由守卫与鉴权流程

路由守卫实现完整的鉴权逻辑，包括登录状态检查、自动跳转、加载进度管理。

```typescript
// web/src/router/index.ts (第13-32行)
router.beforeEach((to, from, next) => {
    NProgress.configure({ showSpinner: false })
    NProgress.start()
    if (!window.existLoading) {
        loading.show()
        window.existLoading = true
    }

    const adminInfo = useAdminInfo()
    // 1. 检查是否需要鉴权且非登录页
    if (to.meta.requiresAuth !== false && to.path !== '/login' && !adminInfo.token) {
        next({ name: 'adminLogin' })
        return
    }
    // 2. 已登录用户访问登录页则跳转首页
    if (to.path === '/login' && adminInfo.token) {
        next('/')
        return
    }

    next()
})
```

Sources: [web/src/router/index.ts](web/src/router/index.ts#L13-L32)

**鉴权流程说明**：

```
┌─────────────────────────────────────────────────────────────────┐
│                      路由守卫流程                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户发起路由跳转                                               │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────┐     是     ┌─────────────┐                    │
│   │ 访问/login  │──────────▶│ 已登录?      │                    │
│   └─────────────┘           └──────┬──────┘                    │
│         │                    是│        │否                      │
│         │                    ┌──┴───┐    │                        │
│         │                    ▼      ▼    ▼                        │
│         │             ┌──────────┐  ┌──────────┐                  │
│         │             │ 重定向/  │  │ 放行     │                  │
│         │             └──────────┘  └──────────┘                  │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────┐     是     ┌─────────────┐                    │
│   │ 需要鉴权?    │──────────▶│ 有Token?   │                    │
│   └──────┬──────┘           └──────┬──────┘                    │
│    否│        │是            是│       │否                       │
│   ┌──┴───┐    │               ┌──┴───┐   ▼                        │
│   ▼      ▼    ▼               ▼      ▼  ┌─────────────┐         │
│  ┌────┐ ┌────┐            ┌────┐ ┌────┐│ 重定向/login │         │
│  │放行│ │放行│            │放行│ │跳转││             │         │
│  └────┘ └────┘            └────┘ └────┘└─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 状态管理：AdminInfo Store

使用 **Pinia** 管理登录用户信息，支持持久化存储（刷新页面不丢失登录状态）。

```typescript
// web/src/stores/adminInfo.ts (第1-57行)
export const useAdminInfo = defineStore('adminInfo', {
    state: (): AdminInfo => {
        return {
            id: 0,
            username: '',
            nickname: '',
            avatar: '',
            last_login_time: '',
            token: '',           // Access Token
            refresh_token: '',   // Refresh Token
            super: false,
        }
    },
    actions: {
        dataFill(state: Partial<AdminInfo>, exclude: boolean | string[] = true) { /* 状态填充 */ },
        removeToken() { /* 清除Token */ },
        setToken(token: string, type: 'auth' | 'refresh') { /* 设置Token */ },
        getToken(type: 'auth' | 'refresh' = 'auth') { /* 获取Token */ },
        setSuper(val: boolean) { /* 设置超级管理员标识 */ },
    },
    persist: {
        key: ADMIN_INFO,  // 持久化到 localStorage
    },
})
```

Sources: [web/src/stores/adminInfo.ts](web/src/stores/adminInfo.ts#L1-L57)
Sources: [web/src/stores/constant/cacheKey.ts](web/src/stores/constant/cacheKey.ts#L1-L6)

**Store 数据结构**：

| 字段 | 类型 | 说明 |
|-----|------|------|
| `id` | `number` | 管理员ID |
| `username` | `string` | 用户名 |
| `nickname` | `string` | 昵称 |
| `avatar` | `string` | 头像URL |
| `token` | `string` | Access Token |
| `refresh_token` | `string` | Refresh Token |
| `super` | `boolean` | 是否超级管理员 |

## 动态路由加载机制

后端返回菜单数据后，前端通过 `handleAdminRoute()` 函数动态注册路由。

```typescript
// web/src/utils/router.ts (第79-85行)
export const handleAdminRoute = (routes: any) => {
    const viewsComponent = import.meta.glob('/src/views/**/*.vue')
    addRouteAll(viewsComponent, routes, adminBaseRoute.name as string)
    const navTabs = useNavTabs()
    navTabs.setTabsViewRoutes(handleMenuRule(routes, '/'))
    navTabs.fillAuthNode(handleAuthNode(routes, '/'))
}
```

Sources: [web/src/utils/router.ts](web/src/utils/router.ts#L79-L85)

动态路由注册核心逻辑：

```typescript
// web/src/utils/router.ts (第167-224行)
export const addRouteAll = (viewsComponent: Record<string, any>, routes: any, parentName: string, analyticRelation = false) => {
    for (const idx in routes) {
        if (routes[idx].extend == 'add_menu_only') continue
        if ((routes[idx].menu_type == 'tab' && viewsComponent[routes[idx].component]) || routes[idx].menu_type == 'iframe') {
            addRouteItem(viewsComponent, routes[idx], parentName, analyticRelation)
        }
        if (routes[idx].children && routes[idx].children.length > 0) {
            addRouteAll(viewsComponent, routes[idx].children, parentName, analyticRelation)
        }
    }
}

export const addRouteItem = (viewsComponent: Record<string, any>, route: any, parentName: string, analyticRelation: boolean) => {
    const path = route.menu_type == 'iframe' 
        ? (adminBaseRoute.path as string).replace(/\/$/, '') + '/iframe/' + encodeURIComponent(route.url)
        : parentName ? route.path : '/' + route.path
    const component = route.menu_type == 'iframe' 
        ? () => import('/@/layouts/common/router-view/iframe.vue') 
        : viewsComponent[route.component]
    // ... 路由基础信息构建
    if (parentName) {
        router.addRoute(parentName, routeBaseInfo)  // 动态添加子路由
    } else {
        router.addRoute(routeBaseInfo)               // 动态添加根路由
    }
}
```

Sources: [web/src/utils/router.ts](web/src/utils/router.ts#L167-L224)

**动态路由加载流程**：

```
┌─────────────────────────────────────────────────────────────────┐
│                   动态路由加载流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 后台布局组件挂载 (layouts/backend/index.vue)                │
│         │                                                        │
│         ▼                                                        │
│  2. 调用 /api/admin/init 获取初始化数据                         │
│         │                                                        │
│         ├──▶ siteConfig: 站点配置                               │
│         ├──▶ adminInfo: 当前管理员信息                          │
│         └──▶ menus: 菜单权限列表                                │
│                │                                                │
│                ▼                                                │
│  3. handleAdminRoute(menus) 处理菜单                           │
│         │                                                        │
│         ├──▶ import.meta.glob 批量导入视图组件                 │
│         ├──▶ addRouteAll 递归注册动态路由                      │
│         ├──▶ setTabsViewRoutes 设置标签页路由                  │
│         └──▶ fillAuthNode 填充按钮权限节点                     │
│                │                                                │
│                ▼                                                │
│  4. getFirstRoute() 获取首个可访问路由并跳转                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
// web/src/layouts/backend/index.vue (第55-103行)
const init = async () => {
    siteConfig.setInitialize(false)
    try {
        const res = await index()
        
        siteConfig.dataFill(res.data.siteConfig)
        config.setLayoutMode('Default')

        if (!isEmpty(res.data.adminInfo)) {
            adminInfo.dataFill(res.data.adminInfo, false)
            siteConfig.setUserInitialize(true)
        }

        if (res.data.menus) {
            handleAdminRoute(res.data.menus)  // 动态路由注册
        }

        siteConfig.setInitialize(true)
        // ... 路由跳转逻辑
    } catch { /* 错误处理 */ }
}
```

Sources: [web/src/layouts/backend/index.vue](web/src/layouts/backend/index.vue#L55-L103)

## 登录流程与Token管理

### 登录页面

登录页面 `web/src/views/login.vue` 包含表单验证、提交处理、Token存储。

```typescript
// web/src/views/login.vue (第127-145行)
const onSubmit = () => {
    state.submitLoading = true
    login(form)
        .then((res) => {
            adminInfo.dataFill(
                {
                    ...res.data.userInfo,
                    token: res.data.token,
                    refresh_token: res.data.refresh_token,
                },
                false  // 不排除 token 字段
            )
            router.push({ path: '/' })
        })
        .catch(() => undefined)
        .finally(() => {
            state.submitLoading = false
        })
}
```

Sources: [web/src/views/login.vue](web/src/views/login.vue#L127-L145)

### 登录API

前端调用 `/api/auth/login` 接口，传入用户名密码：

```typescript
// web/src/api/backend/index.ts (第16-22行)
export function login(params: object = {}) {
    return createAxios({
        url: '/api/auth/login',
        data: params,
        method: 'post',
    })
}
```

Sources: [web/src/api/backend/index.ts](web/src/api/backend/index.ts#L16-L22)

### 后端认证服务

后端 `server/src/modules/auth/service.ts` 实现完整的双令牌认证：

```typescript
// server/src/modules/auth/service.ts (第38-68行)
export const login = async (body: { username?: string; password?: string }, request: Request) => {
    const admin = await getAdminByUsername(String(body.username ?? ''))
    if (!admin || !verifyPassword(String(body.password ?? ''), admin.passwordHash)) 
        throw new AppError('账号或密码错误')
    if (admin.status !== 'enable') throw new AppError('账号已禁用')

    const { sessionId, accessToken, refreshToken } = await createSessionTokens(admin.id)
    // ... 创建会话记录
    return {
        userInfo: await getCurrentAdminPayload(admin.id, { token: accessToken, refresh_token: refreshToken }),
        token: accessToken,
        refresh_token: refreshToken,
    }
}
```

Sources: [server/src/modules/auth/service.ts](web/src/modules/auth/service.ts#L38-L68)

**Token类型对比**：

| Token类型 | 用途 | 有效期 | 存储位置 |
|----------|------|--------|----------|
| `token` (Access Token) | API请求鉴权 | 较短（默认2小时） | localStorage |
| `refresh_token` | 刷新Access Token | 较长（默认7天） | localStorage |

## Axios拦截器与自动Token注入

通过 Axios 请求拦截器自动注入 Token，并在响应拦截器中处理 Token 失效情况。

```typescript
// web/src/utils/axios.ts (第52-115行)
Axios.interceptors.request.use(
    (requestConfig) => {
        // ... 去除重复请求
        if (requestConfig.headers) {
            const token = options.anotherToken || adminInfo.getToken()
            if (token) (requestConfig.headers as anyObj).batoken = token  // Token注入
        }
        return requestConfig
    },
    (error) => Promise.reject(error)
)

Axios.interceptors.response.use(
    (response) => {
        // ... 响应处理
        if (response.data.code !== 1) {
            if (response.data.code === 303 || response.data.code === 401) {
                adminInfo.removeToken()  // 清除Token
                if (router.currentRoute.value.name !== 'adminLogin') {
                    router.push({ name: 'adminLogin' })  // 跳转登录页
                }
            }
            // ...
        }
        return options.reductDataFormat ? response.data : response
    },
    (error) => { /* 错误处理 */ }
)
```

Sources: [web/src/utils/axios.ts](web/src/utils/axios.ts#L52-L115)

**Token传递方式**：
- 请求头字段：`batoken`
- 备选方案：URL查询参数 `batoken`
- 备选方案：`Authorization: Bearer <token>` 格式

```typescript
// server/src/modules/auth/service.ts (第19-22行)
const getTokenFromRequest = (request: Request) => {
    const url = new URL(request.url)
    return request.headers.get('batoken') 
        ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') 
        ?? url.searchParams.get('batoken')
}
```

Sources: [server/src/modules/auth/service.ts](web/src/modules/auth/service.ts#L19-L22)

## 权限节点与按钮级控制

系统支持菜单级权限和按钮级权限控制，通过 `authNode` Map 存储。

```typescript
// web/src/stores/navTabs.ts (第19行)
const state: NavTabs = reactive({
    // ...
    authNode: new Map<string, string[]>(),
})
```

```typescript
// web/src/utils/router.ts (第148-165行)
const handleAuthNode = (routes: any, prefix = '/') => {
    const authNode: Map<string, string[]> = new Map([])
    assembleAuthNode(routes, authNode, prefix, prefix)
    return authNode
}

const assembleAuthNode = (routes: any, authNode: Map<string, string[]>, prefix = '/', parent = '/') => {
    const authNodeTemp = []
    for (const key in routes) {
        if (routes[key].type == 'button') authNodeTemp.push(prefix + routes[key].name)
        if (routes[key].children && routes[key].children.length > 0) {
            assembleAuthNode(routes[key].children, authNode, prefix, prefix + routes[key].name)
        }
    }
    if (authNodeTemp.length > 0) {
        authNode.set(parent, authNodeTemp)
    }
}
```

Sources: [web/src/utils/router.ts](web/src/utils/router.ts#L148-L165)

权限节点使用示例：

```typescript
// web/src/views/auth/admin/index.vue (第37-40行)
const optButtons = defaultOptButtons(['edit', 'delete'])
optButtons[1].display = (row) => {
    return row.id != adminInfo.id  // 只能删除其他用户
}
```

Sources: [web/src/views/auth/admin/index.vue](web/src/views/auth/admin/index.vue#L37-L40)

## 菜单搜索功能

系统提供全局菜单搜索功能，支持快速定位菜单和路由。

```typescript
// web/src/layouts/backend/components/search/menuSearch.vue
// 搜索功能实现，支持按菜单名称、父级、路由关键字搜索
```

Sources: [web/src/layouts/backend/components/search/menuSearch.vue](web/src/layouts/backend/components/search/menuSearch.vue#L1-L50)

## 相关文档推荐

完成本篇阅读后，建议继续以下主题：

- **[前端状态管理](5-qian-duan-zhuang-tai-guan-li)** — 了解 Pinia Store 的完整数据流
- **[前端组件与布局](6-qian-duan-zu-jian-yu-bu-ju)** — 探索后台布局与菜单渲染实现
- **[前端请求封装](14-qian-duan-qing-qiu-feng-zhuang)** — 深入 Axios 拦截器的高级特性
- **[前后端API契约](15-qian-hou-duan-apiqi-yue)** — 了解后端认证接口完整规范
本文档详细介绍 Admin Air 项目的数据库架构设计，基于 **Drizzle ORM** + **PostgreSQL** 构建，涵盖数据表结构定义、关联关系、迁移机制及初始化流程。

## 技术选型概述

项目采用 Drizzle ORM 作为数据库抽象层，配合 PostgreSQL 实现关系型数据存储。选型理由包括：轻量级（无额外运行时依赖）、类型安全的 Schema 定义、以及与现代 Edge Runtime 的兼容性。

| 技术组件 | 版本 | 用途 |
|---------|------|------|
| drizzle-orm | ^0.45.2 | ORM 抽象层 |
| postgres | ^3.4.8 | PostgreSQL 客户端 |
| drizzle-kit | ^0.31.10 | Schema 生成与迁移工具 |

数据源配置通过 `DATABASE_URL` 环境变量指定，默认连接字符串为 `postgresql://postgres:postgres@127.0.0.1:5432/admin_air`。

Sources: [drizzle.config.ts](server/drizzle.config.ts#L1-L16), [package.json](server/package.json#L1-L41)

---

## 架构分层概览

项目数据库模块位于 `server/src/db` 目录，采用分层架构设计：

```mermaid
graph TB
    subgraph "业务层"
        A[modules/auth/service.ts] --> B[db/client.ts]
        A2[modules/admin/service.ts] --> B
    end
    
    subgraph "数据访问层"
        B[db/client.ts] --> C[db/schema/]
    end
    
    subgraph "基础设施层"
        C --> D[db/migrate.ts]
        C --> E[db/seed.ts]
    end
    
    F[bootstrap/bootstrap-data.ts] --> E
    
    style A fill:#e1f5fe
    style B fill:#e8f5e9
    style C fill:#fff3e0
```

**各层职责**：
- **业务层**：通过 `db/client.ts` 导出 `db` 实例执行 CRUD 操作
- **数据访问层**：定义所有数据表 Schema (`admins`, `groups`, `rules` 等)
- **基础设施层**：数据库迁移 (`migrate.ts`) 与初始化种子数据 (`seed.ts`)

Sources: [client.ts](server/src/db/client.ts#L1-L11), [setup.ts](server/src/db/setup.ts#L1-L20)

---

## Schema 核心表结构

项目共定义 **8 张数据表**，涵盖管理员账户、权限组、菜单规则、操作日志、附件存储及会话管理六大领域。

### 1. 管理员账户 (admins)

```typescript
export const admins = pgTable('admins', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    username: text('username').notNull().unique(),
    nickname: text('nickname').notNull(),
    avatar: text('avatar').notNull(),
    email: text('email').notNull().default(''),
    mobile: text('mobile').notNull().default(''),
    motto: text('motto').notNull().default(''),
    passwordHash: text('password_hash').notNull(),
    status: text('status').notNull().default('enable'),
    isSuper: integer('is_super').notNull().default(0),
    lastLoginTime: text('last_login_time').notNull(),
    createTime: text('create_time').notNull(),
    updateTime: text('create_time').notNull(),
})
```

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| id | integer | PK, auto-increment | 主键 |
| username | text | unique, not null | 登录账号（全局唯一）|
| nickname | text | not null | 显示名称 |
| password_hash | text | not null | bcrypt 加密后的密码 |
| status | text | default='enable' | 账户状态：enable/disable |
| is_super | integer | default=0 | 超级管理员标识：0/1 |

Sources: [admins.ts](server/src/db/schema/admins.ts#L1-L32)

### 2. 权限组 (groups)

```typescript
export const groups = pgTable('groups', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    pid: integer('pid').notNull().default(0),
    name: text('name').notNull(),
    status: integer('status').notNull().default(1),
    createTime: text('create_time').notNull(),
    updateTime: text('update_time').notNull(),
})
```

支持树形结构设计（pid 字段），可实现权限组的层级继承。

Sources: [groups.ts](server/src/db/schema/groups.ts#L1-L22)

### 3. 菜单与权限规则 (rules)

```typescript
export const rules = pgTable('rules', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    pid: integer('pid').notNull().default(0),
    type: text('type').notNull(),
    title: text('title').notNull(),
    name: text('name').notNull(),
    path: text('path').notNull().default(''),
    icon: text('icon').notNull().default(''),
    menuType: text('menu_type'),
    component: text('component'),
    keepalive: integer('keepalive').notNull().default(0),
    extend: text('extend').notNull().default('none'),
    url: text('url'),
    status: integer('status').notNull().default(1),
    weigh: integer('weigh').notNull().default(0),
    remark: text('remark').notNull().default(''),
    buttons: jsonb('buttons').$type<string[] | null>(),
    createTime: text('create_time').notNull(),
    updateTime: text('update_time').notNull(),
})
```

| type 值 | 语义 |
|--------|------|
| menu_dir | 菜单目录（分组） |
| menu | 菜单项（可访问的页面） |
| button | 按钮/操作（权限粒度控制） |

Sources: [rules.ts](server/src/db/schema/rules.ts#L1-L23)

### 4. 会话管理 (sessions)

```typescript
export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    adminId: integer('admin_id').notNull().references(() => admins.id, { onDelete: 'cascade' }),
    accessToken: text('access_token').notNull().unique(),
    refreshToken: text('refresh_token').notNull().unique(),
    accessExpiresAt: text('access_expires_at').notNull(),
    refreshExpiresAt: text('refresh_expires_at').notNull(),
    ip: text('ip').notNull().default(''),
    useragent: text('useragent').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    revokedAt: text('revoked_at'),
})
```

支持双 Token 机制（Access Token + Refresh Token），实现安全的会话续期与主动注销。

Sources: [sessions.ts](server/src/db/schema/sessions.ts#L1-L19)

### 5. 操作日志 (admin-logs)

记录所有后台操作行为，用于安全审计与问题排查。

Sources: [admin-logs.ts](server/src/db/schema/admin-logs.ts#L1-L14)

### 6. 附件存储 (attachments)

存储上传文件元数据，支持本地存储模式。

Sources: [attachments.ts](server/src/db/schema/attachments.ts#L1-L17)

---

## 表间关联关系

```mermaid
erDiagram
    admins ||--o{ admin_groups : ""
    admins ||--o{ admin_logs : ""
    admins ||--o{ sessions : ""
    
    groups ||--o{ admin_groups : ""
    groups ||--o{ group_rules : ""
    
    rules ||--o{ group_rules : ""
    
    admin_groups {
        integer admin_id PK
        integer group_id PK
    }
    
    group_rules {
        integer group_id PK
        integer rule_id PK
    }
```

**关联说明**：
- **admins ↔ groups**：多对多，通过 `admin_groups` 中间表关联
- **groups ↔ rules**：多对多，通过 `group_rules` 中间表关联
- **admins → sessions**：一对多，一个管理员可拥有多个有效会话
- **Cascade**：所有外键均配置 `onDelete: 'cascade'`，删除主记录时自动清理关联数据

Sources: [admins.ts](server/src/db/schema/admins.ts#L24-L32), [groups.ts](server/src/db/schema/groups.ts#L17-L22)

---

## 数据库迁移机制

项目采用**纯 SQL 迁移文件**方式，迁移文件存放于 `server/drizzle/` 目录：

```mermaid
sequenceDiagram
    participant Dev as 开发者
    participant Kit as drizzle-kit
    participant DB as PostgreSQL
    
    Dev->>Kit: npm run db:generate
    Kit->>Dev: 生成 0000_init.sql
    Dev->>DB: npm run db:migrate
    DB->>Kit: 执行 SQL，创建表结构
    Kit->>DB: 记录迁移历史到 _drizzle_migrations
```

**迁移流程**（migrate.ts）：

1. 检查 `drizzle/` 目录是否存在，如不存在则创建
2. 确保 `_drizzle_migrations` 表存在（用于记录已执行的迁移）
3. 遍历 `*.sql` 文件，按文件名排序后逐个执行
4. 执行完成后写入迁移记录，避免重复执行

Sources: [migrate.ts](server/src/db/migrate.ts#L1-L40)

---

## 种子数据初始化

首次部署时通过 `seed.ts` 预置初始数据：

```typescript
export const seedDatabase = async () => {
    const existing = await db.select({ value: count() }).from(admins)
    if (existing[0]?.value) return false  // 已初始化则跳过

    // 1. 插入管理员
    await db.insert(admins).values(initialAdmins.map(...))
    
    // 2. 插入权限组
    await db.insert(groups).values(initialGroups.map(...))
    
    // 3. 插入菜单规则
    await db.insert(rules).values(initialRules.map(...))
    
    // 4. 插入关联关系
    await db.insert(adminGroups).values(initialAdmins.flatMap(...))
    await db.insert(groupRules).values(initialGroups.flatMap(...))
    
    // 5. 插入日志与附件
    // ...
}
```

**初始数据概览**：

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 管理员 | 2 | admin (超级管理员) / editor (内容管理员) |
| 权限组 | 2 | 超级管理员组 / 内容管理员组 |
| 菜单规则 | ~30 | 包含目录、菜单、按钮三种类型 |
| 操作日志 | ~5 | 预置样例日志 |

初始管理员账户：`admin` / `AdminAir_2026`

Sources: [seed.ts](server/src/db/seed.ts#L1-L115), [bootstrap-data.ts](server/src/bootstrap/bootstrap-data.ts#L1-L100)

---

## 业务层使用示例

在业务模块中通过 `db/client.ts` 导入数据库实例进行操作：

```typescript
import { db } from '../../db/client'
import { admins, sessions } from '../../db/schema'
import { eq } from 'drizzle-orm'

// 查询管理员
const admin = await db
    .select()
  .from(admins)
  .where(eq(admins.username, 'admin'))
  .then(rows => rows[0])

// 创建会话
await db.insert(sessions).values({
    id: sessionId,
    adminId: admin.id,
    accessToken: accessToken,
    // ...
})
```

Sources: [auth/service.ts](server/src/modules/auth/service.ts#L1-L20)

---

## 数据库相关命令

| 命令 | 说明 |
|------|------|
| `npm run db:generate` | 根据 schema 生成 SQL 迁移文件 |
| `npm run db:migrate` | 执行待定迁移 |
| `npm run db:seed` | 初始化种子数据 |
| `npm run db:setup` | 执行迁移 + 种子数据（一步到位）|

Sources: [package.json](server/package.json#L1-L41)

---

## 总结

Admin Air 的数据库设计围绕 **RBAC 权限模型** 展开：管理员（admins）通过分组（groups）关联菜单规则（rules），每条规则可细分为目录、菜单、按钮三种粒度。会话管理采用双 Token 机制确保安全性，迁移与种子数据机制支持快速部署。

后续可进一步扩展的方向包括：
- 引入数据库连接池监控
- 添加数据审计字段（如 createdBy, updatedBy）
- 支持多租户架构

---

## 下一步

- 了解数据初始化细节：**[数据初始化与Seed](10-shu-ju-chu-shi-hua-yu-seed)**
- 查看权限模块实现：**[后端路由与模块](8-hou-duan-lu-you-yu-mo-kuai)**
- 学习认证流程：**[后端技术栈与依赖](7-hou-duan-ji-zhu-zhan-yu-yi-lai)**
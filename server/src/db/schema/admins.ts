import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { groups } from './groups'

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
    updateTime: text('update_time').notNull(),
})

export const adminGroups = pgTable(
    'admin_groups',
    {
        adminId: integer('admin_id')
            .notNull()
            .references(() => admins.id, { onDelete: 'cascade' }),
        groupId: integer('group_id')
            .notNull()
            .references(() => groups.id, { onDelete: 'cascade' }),
    },
    (table) => [primaryKey({ columns: [table.adminId, table.groupId] })]
)

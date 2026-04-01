import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const adminLogs = pgTable('admin_logs', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    adminId: integer('admin_id').notNull(),
    username: text('username').notNull(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    ip: text('ip').notNull(),
    useragent: text('useragent').notNull(),
    createTime: text('create_time').notNull(),
    data: text('data').notNull().default('{}'),
})

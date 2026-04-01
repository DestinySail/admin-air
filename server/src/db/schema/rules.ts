import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core'

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

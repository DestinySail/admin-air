import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const groups = pgTable('groups', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    pid: integer('pid').notNull().default(0),
    name: text('name').notNull(),
    status: integer('status').notNull().default(1),
    createTime: text('create_time').notNull(),
    updateTime: text('update_time').notNull(),
})

export const groupRules = pgTable(
    'group_rules',
    {
        groupId: integer('group_id')
            .notNull()
            .references(() => groups.id, { onDelete: 'cascade' }),
        ruleId: integer('rule_id').notNull(),
    },
    (table) => [primaryKey({ columns: [table.groupId, table.ruleId] })]
)

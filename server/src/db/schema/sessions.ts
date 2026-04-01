import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { admins } from './admins'

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    adminId: integer('admin_id')
        .notNull()
        .references(() => admins.id, { onDelete: 'cascade' }),
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

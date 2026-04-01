import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const attachments = pgTable('attachments', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    topic: text('topic').notNull(),
    url: text('url').notNull(),
    fullUrl: text('full_url').notNull(),
    suffix: text('suffix').notNull(),
    mimetype: text('mimetype').notNull(),
    size: integer('size').notNull().default(0),
    quote: integer('quote').notNull().default(0),
    name: text('name').notNull(),
    storagePath: text('storage_path'),
    lastUploadTime: text('last_upload_time').notNull(),
    createTime: text('create_time').notNull(),
})

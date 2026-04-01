import { readFile } from 'fs/promises'
import { basename, resolve } from 'path'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { env } from './config/env'
import { db } from './db/client'
import { attachments } from './db/schema'
import { adminRoutes } from './modules/admin/routes'
import { authRoutes } from './modules/auth/routes'
import { routineRoutes } from './modules/routine/routes'
import { getMimeTypeBySuffix } from './shared/http/files'
import { fail } from './shared/http/response'
import type { AppEnv } from './shared/http/types'

export const createApp = () => {
    const app = new Hono<AppEnv>()

    app.use('*', async (c, next) => {
        const startedAt = Date.now()
        const url = new URL(c.req.url)

        await next()

        const durationMs = Date.now() - startedAt
        console.log(`[请求日志] ${c.req.method} ${url.pathname}${url.search} -> ${c.res.status} (${durationMs}ms)`)
    })

    app.onError((error, c) => {
        console.error(error)
        return fail(c, error.message || '服务器内部错误')
    })

    app.get('/uploads/:filename', async (c) => {
        const filename = basename(c.req.param('filename'))
        const path = resolve(env.uploadsDir, filename)
        const rows = await db
            .select()
            .from(attachments)
            .where(eq(attachments.url, `/uploads/${filename}`))

        try {
            const buffer = await readFile(path)
            c.header('Content-Type', getMimeTypeBySuffix(rows[0]?.suffix ?? filename.split('.').pop() ?? ''))
            return c.body(buffer)
        } catch {
            return fail(c, '文件不存在')
        }
    })

    app.route('/', authRoutes())
    app.route('/', adminRoutes())
    app.route('/', routineRoutes())

    return app
}

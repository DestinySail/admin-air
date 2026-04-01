import { Hono } from 'hono'
import { fail, success } from '../../shared/http/response'
import type { AppEnv } from '../../shared/http/types'
import { AppError } from '../../shared/http/errors'
import { requireAuth } from '../auth/service'
import { getRoutineAdminInfo, listAttachments, updateRoutineAdminInfo, uploadAttachment } from './service'

const getRequestInfo = (c: any) => ({
    ip: c.req.header('x-forwarded-for') ?? '127.0.0.1',
    useragent: c.req.header('user-agent') ?? 'Browser',
})

export const routineRoutes = () => {
    const app = new Hono<AppEnv>()

    app.use('/admin/routine.AdminInfo/*', requireAuth)
    app.use('/admin/routine.Attachment/*', requireAuth)
    app.use('/admin/ajax/upload', requireAuth)

    app.get('/admin/routine.AdminInfo/index', async (c) => success(c, await getRoutineAdminInfo(c.get('admin')!.id)))

    app.post('/admin/routine.AdminInfo/edit', async (c) => {
        try {
            return success(
                c,
                await updateRoutineAdminInfo(c.get('admin')!.id, await c.req.json<Record<string, any>>(), getRequestInfo(c)),
                '保存成功'
            )
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.get('/admin/routine.Attachment/index', async (c) => success(c, await listAttachments(new URL(c.req.url))))

    app.post('/admin/ajax/upload', async (c) => {
        try {
            const body = await c.req.parseBody()
            const file = body.file
            if (!(file instanceof File)) throw new AppError('请选择上传文件')
            return success(c, await uploadAttachment(c.get('admin')!.id, file, getRequestInfo(c)), '上传成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '上传失败')
        }
    })

    app.get('/admin/ajax/buildSuffixSvg', async (c) => {
        const suffix = (c.req.query('suffix') ?? 'FILE').slice(0, 6).toUpperCase()
        const background = c.req.query('background') ?? '#409eff'
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="24" fill="${background}"/><text x="80" y="92" text-anchor="middle" font-size="42" fill="#ffffff" font-family="Arial">${suffix}</text></svg>`
        c.header('Content-Type', 'image/svg+xml')
        return c.body(svg)
    })

    return app
}

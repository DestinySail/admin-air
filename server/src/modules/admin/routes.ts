import { Hono } from 'hono'
import { parseIds } from '../../shared/http/query'
import { fail, success } from '../../shared/http/response'
import type { AppEnv } from '../../shared/http/types'
import { AppError } from '../../shared/http/errors'
import { requireAuth } from '../auth/service'
import {
    addAdmin,
    addGroup,
    addRule,
    deleteAdminLogs,
    deleteAdmins,
    deleteGroups,
    deleteRules,
    editAdmin,
    editGroup,
    editRule,
    getAdminEditPayload,
    getAdminLogRows,
    getAdminRows,
    getGroupEditPayload,
    getGroupTree,
    getInitPayload,
    getRuleEditPayload,
    getRuleTree,
    sortRule,
} from './service'

const getRequestInfo = (c: any) => ({
    ip: c.req.header('x-forwarded-for') ?? '127.0.0.1',
    useragent: c.req.header('user-agent') ?? 'Browser',
})

export const adminRoutes = () => {
    const app = new Hono<AppEnv>()

    app.use('/api/admin/init', requireAuth)
    app.use('/admin/auth.Admin/*', requireAuth)
    app.use('/admin/auth.Group/*', requireAuth)
    app.use('/admin/auth.Rule/*', requireAuth)
    app.use('/admin/auth.AdminLog/*', requireAuth)

    app.get('/api/admin/init', async (c) => success(c, await getInitPayload(c.get('admin')!.id)))
    app.get('/admin/auth.Admin/index', async (c) => success(c, await getAdminRows(new URL(c.req.url))))
    app.get('/admin/auth.Group/index', async (c) => success(c, await getGroupTree(new URL(c.req.url))))
    app.get('/admin/auth.Rule/index', async (c) => success(c, await getRuleTree(new URL(c.req.url))))
    app.get('/admin/auth.AdminLog/index', async (c) => success(c, await getAdminLogRows(new URL(c.req.url))))

    app.get('/admin/auth.Admin/edit', async (c) => {
        try {
            return success(c, await getAdminEditPayload(Number(c.req.query('id'))))
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '管理员不存在')
        }
    })

    app.get('/admin/auth.Group/edit', async (c) => {
        try {
            return success(c, await getGroupEditPayload(Number(c.req.query('id'))))
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '角色组不存在')
        }
    })

    app.get('/admin/auth.Rule/edit', async (c) => {
        try {
            return success(c, await getRuleEditPayload(Number(c.req.query('id'))))
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '规则不存在')
        }
    })

    app.post('/admin/auth.Admin/add', async (c) => {
        try {
            return success(c, await addAdmin(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.post('/admin/auth.Admin/edit', async (c) => {
        try {
            return success(c, await editAdmin(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.delete('/admin/auth.Admin/del', async (c) => {
        await deleteAdmins(parseIds(new URL(c.req.url)), c.get('admin')!.id, getRequestInfo(c))
        return success(c, null, '删除成功')
    })

    app.post('/admin/auth.Group/add', async (c) => {
        try {
            return success(c, await addGroup(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.post('/admin/auth.Group/edit', async (c) => {
        try {
            return success(c, await editGroup(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.delete('/admin/auth.Group/del', async (c) => {
        await deleteGroups(parseIds(new URL(c.req.url)), c.get('admin')!.id, getRequestInfo(c))
        return success(c, null, '删除成功')
    })

    app.post('/admin/auth.Rule/add', async (c) => {
        try {
            return success(c, await addRule(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.post('/admin/auth.Rule/edit', async (c) => {
        try {
            return success(c, await editRule(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c)), '保存成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '保存失败')
        }
    })

    app.post('/admin/auth.Rule/sortable', async (c) => {
        try {
            await sortRule(await c.req.json<Record<string, any>>(), c.get('admin')!.id, getRequestInfo(c))
            return success(c, null, '排序成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '排序失败')
        }
    })

    app.delete('/admin/auth.Rule/del', async (c) => {
        await deleteRules(parseIds(new URL(c.req.url)), c.get('admin')!.id, getRequestInfo(c))
        return success(c, null, '删除成功')
    })

    app.delete('/admin/auth.AdminLog/del', async (c) => {
        await deleteAdminLogs(parseIds(new URL(c.req.url)))
        return success(c, null, '删除成功')
    })

    return app
}

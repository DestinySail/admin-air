import { Hono } from 'hono'
import { fail, success } from '../../shared/http/response'
import type { AppEnv } from '../../shared/http/types'
import { AppError } from '../../shared/http/errors'
import { login, logout, refreshSession } from './service'

export const authRoutes = () => {
    const app = new Hono<AppEnv>()

    app.post('/api/auth/login', async (c) => {
        try {
            const data = await login(await c.req.json<{ username?: string; password?: string }>().catch(() => ({})), c.req.raw)
            return success(c, data, '登录成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '登录失败')
        }
    })

    app.post('/api/auth/logout', async (c) => {
        await logout(c.req.raw)
        return success(c, null, '退出成功')
    })

    app.post('/api/common/refreshToken', async (c) => {
        try {
            const body: { refreshToken?: string } = await c.req.json<{ refreshToken?: string }>().catch(() => ({}))
            const data = await refreshSession(String(body.refreshToken ?? ''), c.req.raw)
            return success(c, data, '刷新成功')
        } catch (error) {
            return fail(c, error instanceof AppError ? error.message : '刷新失败', error instanceof AppError ? error.code : 0)
        }
    })

    return app
}

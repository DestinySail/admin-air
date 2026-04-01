import type { MiddlewareHandler } from 'hono'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/client'
import { admins, sessions } from '../../db/schema'
import { env } from '../../config/env'
import { fail } from '../../shared/http/response'
import type { AppEnv } from '../../shared/http/types'
import { createSessionTokens, rotateSessionTokens, verifyAccessToken, verifyRefreshToken } from '../../shared/security/tokens'
import { addSeconds, nowString, toDateString } from '../../shared/time'
import { AppError } from '../../shared/http/errors'
import { verifyPassword } from '../../shared/security/password'
import { appendAdminLog, getAdminById, getAdminByUsername, getCurrentAdminPayload } from '../admin/service'

const getRequestInfo = (request: Request) => ({
    ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
    useragent: request.headers.get('user-agent') ?? 'Browser',
})

const getTokenFromRequest = (request: Request) => {
    const url = new URL(request.url)
    return request.headers.get('batoken') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('batoken')
}

const ensureActiveSession = async (token: string, type: 'access' | 'refresh') => {
    const payload = type === 'access' ? await verifyAccessToken(token) : await verifyRefreshToken(token)
    const rows = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.id, payload.sessionId), isNull(sessions.revokedAt)))
    const session = rows[0]
    if (!session) throw new AppError('登录状态已失效', 401)
    if ((type === 'access' ? session.accessToken : session.refreshToken) !== token) throw new AppError('登录状态已失效', 401)
    const admin = await getAdminById(payload.adminId)
    if (!admin || admin.status !== 'enable') throw new AppError('账号不可用', 401)
    return { session, admin }
}

export const login = async (body: { username?: string; password?: string }, request: Request) => {
    const admin = await getAdminByUsername(String(body.username ?? ''))
    if (!admin || !verifyPassword(String(body.password ?? ''), admin.passwordHash)) throw new AppError('账号或密码错误')
    if (admin.status !== 'enable') throw new AppError('账号已禁用')

    const { sessionId, accessToken, refreshToken } = await createSessionTokens(admin.id)
    const requestInfo = getRequestInfo(request)
    const loginTime = nowString()

    await db.update(admins).set({ lastLoginTime: loginTime, updateTime: loginTime }).where(eq(admins.id, admin.id))
    await db.insert(sessions).values({
        id: sessionId,
        adminId: admin.id,
        accessToken,
        refreshToken,
        accessExpiresAt: toDateString(addSeconds(env.accessTokenTtlSeconds)),
        refreshExpiresAt: toDateString(addSeconds(env.refreshTokenTtlSeconds)),
        ip: requestInfo.ip,
        useragent: requestInfo.useragent,
        createdAt: loginTime,
        updatedAt: loginTime,
        revokedAt: null,
    })

    await appendAdminLog(admin.id, '登录后台', '/api/auth/login', { username: body.username ?? '' }, requestInfo)
    return {
        userInfo: await getCurrentAdminPayload(admin.id, { token: accessToken, refresh_token: refreshToken }),
        token: accessToken,
        refresh_token: refreshToken,
    }
}

export const logout = async (request: Request) => {
    const accessToken = getTokenFromRequest(request)
    if (!accessToken) return
    const rows = await db.select().from(sessions).where(eq(sessions.accessToken, accessToken))
    const session = rows[0]
    if (!session) return
    await db.update(sessions).set({ revokedAt: nowString(), updatedAt: nowString() }).where(eq(sessions.id, session.id))
}

export const refreshSession = async (refreshToken: string, request: Request) => {
    const { session, admin } = await ensureActiveSession(refreshToken, 'refresh')
    const rotated = await rotateSessionTokens(admin.id, session.id)
    const requestInfo = getRequestInfo(request)
    await db
        .update(sessions)
        .set({
            accessToken: rotated.accessToken,
            refreshToken: rotated.refreshToken,
            accessExpiresAt: toDateString(addSeconds(env.accessTokenTtlSeconds)),
            refreshExpiresAt: toDateString(addSeconds(env.refreshTokenTtlSeconds)),
            ip: requestInfo.ip,
            useragent: requestInfo.useragent,
            updatedAt: nowString(),
        })
        .where(eq(sessions.id, session.id))
    return { token: rotated.accessToken, refresh_token: rotated.refreshToken }
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
    const token = getTokenFromRequest(c.req.raw)
    if (!token) return fail(c, '未登录或登录已失效', 401)

    try {
        const { session, admin } = await ensureActiveSession(token, 'access')
        c.set('admin', {
            id: admin.id,
            username: admin.username,
            nickname: admin.nickname,
            avatar: admin.avatar,
            email: admin.email,
            mobile: admin.mobile,
            motto: admin.motto,
            status: admin.status as 'enable' | 'disable',
            super: admin.isSuper === 1,
            last_login_time: admin.lastLoginTime,
        })
        c.set('sessionId', session.id)
        c.set('accessToken', token)
        await next()
    } catch (error) {
        return fail(c, error instanceof AppError ? error.message : '未登录或登录已失效', 401)
    }
}

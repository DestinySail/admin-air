import { randomUUID } from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { env } from '../../config/env'

const encoder = new TextEncoder()

type TokenType = 'access' | 'refresh'

interface TokenPayload extends JWTPayload {
    adminId: number
    sessionId: string
    type: TokenType
}

const signToken = async (payload: TokenPayload, secret: string, expiresIn: number) =>
    new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${expiresIn}s`).sign(encoder.encode(secret))

export const createSessionTokens = async (adminId: number) => {
    const sessionId = randomUUID()
    const accessToken = await signToken({ adminId, sessionId, type: 'access' }, env.jwtSecret, env.accessTokenTtlSeconds)
    const refreshToken = await signToken({ adminId, sessionId, type: 'refresh' }, env.jwtRefreshSecret, env.refreshTokenTtlSeconds)
    return { sessionId, accessToken, refreshToken }
}

export const rotateSessionTokens = async (adminId: number, sessionId: string) => {
    const accessToken = await signToken({ adminId, sessionId, type: 'access' }, env.jwtSecret, env.accessTokenTtlSeconds)
    const refreshToken = await signToken({ adminId, sessionId, type: 'refresh' }, env.jwtRefreshSecret, env.refreshTokenTtlSeconds)
    return { accessToken, refreshToken }
}

export const verifyAccessToken = async (token: string) => {
    const result = await jwtVerify(token, encoder.encode(env.jwtSecret))
    return result.payload as unknown as TokenPayload & { exp: number }
}

export const verifyRefreshToken = async (token: string) => {
    const result = await jwtVerify(token, encoder.encode(env.jwtRefreshSecret))
    return result.payload as unknown as TokenPayload & { exp: number }
}

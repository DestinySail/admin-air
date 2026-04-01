import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'

loadEnv()

const schema = z.object({
    POSTGRES_HOST: z.string().default('127.0.0.1'),
    POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
    POSTGRES_DB: z.string().default('admin_air'),
    POSTGRES_USER: z.string().default('postgres'),
    POSTGRES_PASSWORD: z.string().default('postgres'),
    DATABASE_URL: z.string().optional(),
    PORT: z.coerce.number().int().positive().default(8787),
    APP_BASE_URL: z.string().default('http://127.0.0.1:8787'),
    JWT_SECRET: z.string().min(16).default('replace-with-a-long-random-string'),
    JWT_REFRESH_SECRET: z.string().min(16).default('replace-with-another-long-random-string'),
})

const parsed = schema.parse(process.env)
const databaseUrl =
    parsed.DATABASE_URL ??
    `postgresql://${parsed.POSTGRES_USER}:${parsed.POSTGRES_PASSWORD}@${parsed.POSTGRES_HOST}:${parsed.POSTGRES_PORT}/${parsed.POSTGRES_DB}`

export const env = {
    postgresHost: parsed.POSTGRES_HOST,
    postgresPort: parsed.POSTGRES_PORT,
    postgresDb: parsed.POSTGRES_DB,
    postgresUser: parsed.POSTGRES_USER,
    postgresPassword: parsed.POSTGRES_PASSWORD,
    databaseUrl,
    port: parsed.PORT,
    appBaseUrl: parsed.APP_BASE_URL,
    jwtSecret: parsed.JWT_SECRET,
    jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
    uploadsDir: resolve(process.cwd(), 'uploads'),
    accessTokenTtlSeconds: 60 * 60 * 2,
    refreshTokenTtlSeconds: 60 * 60 * 24 * 7,
} as const

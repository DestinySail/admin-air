import { defineConfig } from 'drizzle-kit'
import { config as loadEnv } from 'dotenv'

loadEnv()

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema/index.ts',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/admin_air',
    },
    verbose: true,
    strict: true,
})

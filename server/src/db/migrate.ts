import { mkdir, readdir, readFile } from 'fs/promises'
import { resolve } from 'path'
import { sql } from './client'

export const migrateDatabase = async () => {
    const migrationsDir = resolve(process.cwd(), 'drizzle')
    await mkdir(migrationsDir, { recursive: true })
    await sql`
        create table if not exists _drizzle_migrations (
            name text primary key,
            applied_at text not null
        )
    `

    const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()
    for (const file of files) {
        const existing = await sql<{ name: string }[]>`select name from _drizzle_migrations where name = ${file}`
        if (existing.length) continue

        const content = await readFile(resolve(migrationsDir, file), 'utf8')
        if (content.trim()) {
            await sql.unsafe(content)
        }
        await sql`insert into _drizzle_migrations (name, applied_at) values (${file}, ${new Date().toISOString()})`
    }
}

if (process.argv[1]?.endsWith('migrate.ts')) {
    migrateDatabase()
        .then(async () => {
            console.log('database migrations completed')
            await sql.end()
        })
        .catch(async (error) => {
            console.error('database migration failed', error)
            await sql.end()
            process.exit(1)
        })
}

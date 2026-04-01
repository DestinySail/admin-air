import { sql } from './client'
import { migrateDatabase } from './migrate'
import { seedDatabase } from './seed'

const run = async () => {
    await migrateDatabase()
    await seedDatabase()
}

run()
    .then(async () => {
        console.log('database setup completed')
        await sql.end()
    })
    .catch(async (error) => {
        console.error('database setup failed', error)
        await sql.end()
        process.exit(1)
    })

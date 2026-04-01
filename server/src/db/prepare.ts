import { mkdir } from 'fs/promises'
import { env } from '../config/env'
import { migrateDatabase } from './migrate'
import { seedDatabase } from './seed'

let prepared = false

export const prepareRuntime = async () => {
    if (prepared) return
    await mkdir(env.uploadsDir, { recursive: true })
    await migrateDatabase()
    await seedDatabase()
    prepared = true
}

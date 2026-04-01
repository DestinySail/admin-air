import { serve } from '@hono/node-server'
import { createApp } from './app'
import { env } from './config/env'
import { prepareRuntime } from './db/prepare'

const bootstrap = async () => {
    await prepareRuntime()
    const app = createApp()

    serve(
        {
            fetch: app.fetch,
            port: env.port,
        },
        (info) => {
            console.log(`admin-air backend running at http://127.0.0.1:${info.port}`)
        }
    )
}

bootstrap().catch((error) => {
    console.error('failed to start backend', error)
    process.exit(1)
})

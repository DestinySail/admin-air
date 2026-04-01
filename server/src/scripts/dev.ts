import { execFile, spawn } from 'node:child_process'
import { Socket } from 'node:net'
import { promisify } from 'node:util'
import { env } from '../config/env'

const execFileAsync = promisify(execFile)

const POSTGRES_SERVICE_NAME = 'postgresql-x64-18'
const READY_TIMEOUT_MS = 30_000
const READY_POLL_INTERVAL_MS = 1_000
const LOG_PREFIX = '[\u6570\u636e\u5e93\u9884\u68c0]'

const logInfo = (message: string) => {
    console.log(`${LOG_PREFIX} ${message}`)
}

const logError = (message: string) => {
    console.error(`${LOG_PREFIX} ${message}`)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message
    }

    return String(error)
}

const runPowerShell = async (command: string) => {
    try {
        const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
            windowsHide: true,
        })

        return stdout.trim()
    } catch (error) {
        throw new Error(`PowerShell \u6267\u884c\u5931\u8d25\uff1a${getErrorMessage(error)}`, { cause: error })
    }
}

const getPostgresServiceStatus = async () => {
    const command = `(Get-Service -Name '${POSTGRES_SERVICE_NAME}' -ErrorAction Stop).Status`

    try {
        return await runPowerShell(command)
    } catch (error) {
        throw new Error(
            `\u65e0\u6cd5\u83b7\u53d6 PostgreSQL \u670d\u52a1\u72b6\u6001\uff08${POSTGRES_SERVICE_NAME}\uff09\uff1a${getErrorMessage(error)}`,
            { cause: error }
        )
    }
}

const waitForPostgresServiceRunning = async () => {
    const deadline = Date.now() + READY_TIMEOUT_MS

    while (Date.now() < deadline) {
        const status = await getPostgresServiceStatus()

        if (status === 'Running') {
            logInfo(`PostgreSQL \u670d\u52a1 ${POSTGRES_SERVICE_NAME} \u5df2\u542f\u52a8\u3002`)
            return
        }

        logInfo(`\u6b63\u5728\u7b49\u5f85 PostgreSQL \u670d\u52a1\u542f\u52a8\uff0c\u5f53\u524d\u72b6\u6001\uff1a${status}`)
        await sleep(READY_POLL_INTERVAL_MS)
    }

    throw new Error(
        `\u7b49\u5f85 PostgreSQL \u670d\u52a1 ${POSTGRES_SERVICE_NAME} \u542f\u52a8\u8d85\u65f6\uff08${READY_TIMEOUT_MS / 1000} \u79d2\uff09\u3002`
    )
}

const startPostgresService = async () => {
    logInfo(`\u68c0\u6d4b\u5230 PostgreSQL \u670d\u52a1 ${POSTGRES_SERVICE_NAME} \u672a\u542f\u52a8\uff0c\u6b63\u5728\u5c1d\u8bd5\u542f\u52a8...`)
    await runPowerShell(`Start-Service -Name '${POSTGRES_SERVICE_NAME}' -ErrorAction Stop`)
    await waitForPostgresServiceRunning()
}

const isPortReachable = (host: string, port: number) =>
    new Promise<boolean>((resolve) => {
        const socket = new Socket()
        let settled = false

        const finish = (result: boolean) => {
            if (settled) {
                return
            }

            settled = true
            socket.destroy()
            resolve(result)
        }

        socket.setTimeout(1_000)
        socket.once('connect', () => finish(true))
        socket.once('timeout', () => finish(false))
        socket.once('error', () => finish(false))
        socket.connect(port, host)
    })

const waitForPostgresPortReady = async () => {
    const deadline = Date.now() + READY_TIMEOUT_MS
    let attempt = 1

    while (Date.now() < deadline) {
        if (await isPortReachable(env.postgresHost, env.postgresPort)) {
            logInfo(`PostgreSQL \u5df2\u76d1\u542c ${env.postgresHost}:${env.postgresPort}\u3002`)
            return
        }

        logInfo(
            `\u6b63\u5728\u7b49\u5f85 PostgreSQL \u76d1\u542c ${env.postgresHost}:${env.postgresPort}\uff08\u7b2c ${attempt} \u6b21\u68c0\u67e5\uff09...`
        )
        attempt += 1
        await sleep(READY_POLL_INTERVAL_MS)
    }

    throw new Error(
        `\u7b49\u5f85 PostgreSQL \u7aef\u53e3 ${env.postgresHost}:${env.postgresPort} \u5c31\u7eea\u8d85\u65f6\uff08${READY_TIMEOUT_MS / 1000} \u79d2\uff09\u3002`
    )
}

const ensurePostgresReady = async () => {
    logInfo(`\u6b63\u5728\u68c0\u67e5 PostgreSQL \u670d\u52a1 ${POSTGRES_SERVICE_NAME} \u72b6\u6001...`)
    const status = await getPostgresServiceStatus()

    if (status === 'Running') {
        logInfo(`PostgreSQL \u670d\u52a1 ${POSTGRES_SERVICE_NAME} \u5df2\u5728\u8fd0\u884c\u3002`)
    } else {
        await startPostgresService()
    }

    await waitForPostgresPortReady()
}

const startRawDevServer = async () => {
    logInfo('\u6570\u636e\u5e93\u9884\u68c0\u901a\u8fc7\uff0c\u6b63\u5728\u542f\u52a8\u540e\u7aef\u5f00\u53d1\u670d\u52a1...')

    const child =
        process.platform === 'win32'
            ? spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'pnpm run dev:raw'], {
                  cwd: process.cwd(),
                  env: process.env,
                  stdio: 'inherit',
              })
            : spawn('pnpm', ['run', 'dev:raw'], {
                  cwd: process.cwd(),
                  env: process.env,
                  stdio: 'inherit',
              })

    const childProcess = child

    const forwardSignal = () => {
        if (!childProcess.killed) {
            childProcess.kill()
        }
    }

    process.once('SIGINT', forwardSignal)
    process.once('SIGTERM', forwardSignal)

    const exitCode = await new Promise<number>((resolve, reject) => {
        childProcess.once('error', reject)
        childProcess.once('exit', (code, signal) => {
            process.removeListener('SIGINT', forwardSignal)
            process.removeListener('SIGTERM', forwardSignal)

            if (signal) {
                resolve(0)
                return
            }

            resolve(code ?? 0)
        })
    })

    process.exit(exitCode)
}

const bootstrapDevServer = async () => {
    if (process.platform !== 'win32') {
        logInfo(
            '\u5f53\u524d\u4e0d\u662f Windows \u73af\u5883\uff0c\u8df3\u8fc7 PostgreSQL \u670d\u52a1\u68c0\u67e5\uff0c\u76f4\u63a5\u542f\u52a8\u540e\u7aef\u5f00\u53d1\u670d\u52a1\u3002'
        )
        await startRawDevServer()
        return
    }

    await ensurePostgresReady()
    await startRawDevServer()
}

bootstrapDevServer().catch((error) => {
    logError(getErrorMessage(error))
    process.exit(1)
})

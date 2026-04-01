import type { Context } from 'hono'

export const success = (c: Context, data: unknown = null, msg = 'ok') =>
    c.json({
        code: 1,
        msg,
        data,
    })

export const fail = (c: Context, msg: string, code = 0) =>
    c.json({
        code,
        msg,
        data: null,
    })

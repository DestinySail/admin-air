import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { Context } from 'hono'
import {
    initialAdminLogs,
    initialAdminProfile,
    initialAdmins,
    initialAttachments,
    initialGroups,
    initialRules,
    layoutDefaults,
    siteConfig,
    type MockAdminItem,
    type MockAttachmentItem,
    type MockGroupItem,
    type MockRuleItem,
} from './mock-data'

const app = new Hono()

let adminProfile = structuredClone(initialAdminProfile)
let admins = structuredClone(initialAdmins)
let groups = structuredClone(initialGroups)
let rules = structuredClone(initialRules)
let adminLogs = structuredClone(initialAdminLogs)
const attachments = structuredClone(initialAttachments)

const success = (c: Context, data: unknown = null, msg = 'ok') =>
    c.json({
        code: 1,
        msg,
        data,
    })

const fail = (c: Context, msg: string, code = 0) =>
    c.json({
        code,
        msg,
        data: null,
    })

const clone = <T>(value: T): T => structuredClone(value)
const nowString = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
const nextId = (items: Array<{ id: number }>) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

const getValue = (row: Record<string, any>, field: string) => {
    if (!field.includes('.')) return row[field]
    return field.split('.').reduce((current, key) => (current ? current[key] : undefined), row as any)
}

const normalizeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((item) => String(item))
    if (value === undefined || value === null || value === '') return []
    return [String(value)]
}

const parseIds = (url: URL) => {
    const ids: number[] = []
    url.searchParams.forEach((value, key) => {
        if (key === 'ids' || key === 'ids[]' || /^ids\[\d+\]$/.test(key)) {
            ids.push(Number(value))
        }
    })
    return ids.filter((id) => !Number.isNaN(id))
}

const parseSearch = (url: URL) => {
    const bucket = new Map<number, Record<string, string>>()
    url.searchParams.forEach((value, key) => {
        const match = key.match(/^search\[(\d+)\]\[(field|val|operator)\]$/)
        if (!match) return
        const index = Number(match[1])
        const field = match[2]
        const item = bucket.get(index) ?? {}
        item[field] = value
        bucket.set(index, item)
    })
    return [...bucket.values()]
        .filter((item) => item.field && item.operator)
        .map((item) => ({
            field: item.field,
            val: item.val ?? '',
            operator: item.operator,
        }))
}

const matchesSearch = (row: Record<string, any>, filters: Array<{ field: string; val: string; operator: string }>) =>
    filters.every((filter) => {
        const raw = getValue(row, filter.field)
        const value = Array.isArray(raw) ? raw.join(',') : raw

        if (filter.operator === 'LIKE') {
            return String(value ?? '')
                .toLowerCase()
                .includes(String(filter.val).toLowerCase())
        }
        if (filter.operator === 'eq' || filter.operator === '=') {
            return String(value ?? '') === String(filter.val)
        }
        if (filter.operator === 'RANGE') {
            const [start, end] = String(filter.val ?? '').split(',')
            if (!start && !end) return true
            const current = new Date(String(value ?? '')).getTime()
            const startTime = start ? new Date(start).getTime() : Number.MIN_SAFE_INTEGER
            const endTime = end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER
            return current >= startTime && current <= endTime
        }
        return true
    })

const sortRows = <T extends Record<string, any>>(rows: T[], order?: string) => {
    if (!order) return rows
    const [field, direction] = order.split(',')
    return [...rows].sort((left, right) => {
        const leftValue = getValue(left, field)
        const rightValue = getValue(right, field)
        if (leftValue === rightValue) return 0
        const result = leftValue > rightValue ? 1 : -1
        return direction === 'desc' ? -result : result
    })
}

const paginateRows = <T>(rows: T[], page = 1, limit = 10) => rows.slice((page - 1) * limit, (page - 1) * limit + limit)

const buildTree = <T extends { id: number; pid: number }>(items: T[]) => {
    const map = new Map<number, T & { children?: Array<T & { children?: any[] }> }>()
    items.forEach((item) => map.set(item.id, { ...item }))
    const tree: Array<T & { children?: Array<T & { children?: any[] }> }> = []

    map.forEach((item) => {
        if (item.pid && map.has(item.pid)) {
            const parent = map.get(item.pid)!
            parent.children ??= []
            parent.children.push(item)
        } else {
            tree.push(item)
        }
    })

    const sortChildren = (nodes: Array<any>) => {
        nodes.sort((left, right) => (left.weigh ?? left.id) - (right.weigh ?? right.id))
        nodes.forEach((node) => node.children?.length && sortChildren(node.children))
    }
    sortChildren(tree)
    return tree
}

const flattenRules = () => sortRows(clone(rules), 'weigh,asc')
const flattenGroups = () => sortRows(clone(groups), 'id,asc')

const includeAncestors = <T extends { id: number; pid: number }>(items: T[], ids: Set<number>) => {
    let changed = true
    while (changed) {
        changed = false
        items.forEach((item) => {
            if (ids.has(item.id) && item.pid && !ids.has(item.pid)) {
                ids.add(item.pid)
                changed = true
            }
        })
    }
}

const getRuleTree = (query: URL) => {
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const allRules = flattenRules()

    if (query.searchParams.get('select')) {
        const list = allRules
            .filter((item) => item.type !== 'button')
            .filter((item) => !quickSearch || item.title.toLowerCase().includes(quickSearch) || item.name.toLowerCase().includes(quickSearch))
            .map((item) => ({ id: item.id, title: item.title, name: item.title, path: item.path }))
        return { list, total: list.length, remark: '' }
    }

    let matchedIds = new Set<number>(allRules.map((item) => item.id))
    if (filters.length || quickSearch) {
        matchedIds = new Set(
            allRules
                .filter((item) => {
                    const source = { ...item, keepalive: item.keepalive?.toString() ?? '0' }
                    const filterMatched = filters.length ? matchesSearch(source as Record<string, any>, filters) : true
                    const quickMatched = quickSearch ? `${item.title} ${item.name} ${item.path}`.toLowerCase().includes(quickSearch) : true
                    return filterMatched && quickMatched
                })
                .map((item) => item.id)
        )
        includeAncestors(allRules, matchedIds)
    }

    const list = buildTree(allRules.filter((item) => matchedIds.has(item.id)))
    return { list, total: allRules.length, remark: '' }
}

const getGroupTree = (query: URL) => {
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const allGroups = flattenGroups()

    if (query.searchParams.get('select')) {
        const list = allGroups
            .filter((item) => !quickSearch || item.name.toLowerCase().includes(quickSearch))
            .map((item) => ({ id: item.id, name: item.name }))
        return { list, total: list.length, remark: '' }
    }

    let matchedIds = new Set<number>(allGroups.map((item) => item.id))
    if (filters.length || quickSearch) {
        matchedIds = new Set(
            allGroups
                .filter((item) => {
                    const source = { ...item, rules: item.rules.join(',') }
                    const filterMatched = filters.length ? matchesSearch(source as Record<string, any>, filters) : true
                    const quickMatched = quickSearch ? item.name.toLowerCase().includes(quickSearch) : true
                    return filterMatched && quickMatched
                })
                .map((item) => item.id)
        )
        includeAncestors(allGroups, matchedIds)
    }

    const ruleMap = new Map(rules.map((item) => [item.id, item.title]))
    const list = buildTree(
        allGroups
            .filter((item) => matchedIds.has(item.id))
            .map((item) => ({
                ...item,
                rules: item.rules.map((ruleId) => ruleMap.get(ruleId) ?? String(ruleId)),
            }))
    )
    return { list, total: allGroups.length, remark: '', group: [1] }
}

const getAdminRows = (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 10)
    const filters = parseSearch(query)
    const order = query.searchParams.get('order') ?? undefined
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const groupMap = new Map(groups.map((item) => [item.id, item.name]))

    let rows = admins.map((item) => ({
        ...item,
        group_name_arr: item.group_arr.map((groupId) => groupMap.get(groupId) ?? String(groupId)),
    }))

    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch)
        rows = rows.filter((item) => `${item.username} ${item.nickname} ${item.email} ${item.mobile}`.toLowerCase().includes(quickSearch))

    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

const getAdminLogRows = (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 10)
    const filters = parseSearch(query)
    const order = query.searchParams.get('order') ?? 'create_time,desc'
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    let rows = clone(adminLogs)

    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch) rows = rows.filter((item) => `${item.title} ${item.username} ${item.url}`.toLowerCase().includes(quickSearch))

    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

const getAttachmentRows = (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 8)
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const order = query.searchParams.get('order') ?? 'last_upload_time,desc'
    let rows = clone(attachments)

    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch) rows = rows.filter((item) => `${item.name} ${item.topic} ${item.mimetype}`.toLowerCase().includes(quickSearch))

    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

const appendAdminLog = (title: string, url: string, data: Record<string, unknown>) => {
    adminLogs.unshift({
        id: nextId(adminLogs),
        admin_id: adminProfile.id,
        username: adminProfile.username,
        title,
        url,
        ip: '127.0.0.1',
        useragent: 'Mock Browser',
        create_time: nowString(),
        data: JSON.stringify(data),
    })
}

const syncAdminProfile = () => {
    const currentAdmin = admins.find((item) => item.id === adminProfile.id)
    if (!currentAdmin) return
    adminProfile = {
        ...adminProfile,
        nickname: currentAdmin.nickname,
        avatar: currentAdmin.avatar,
        email: currentAdmin.email,
        mobile: currentAdmin.mobile,
        motto: currentAdmin.motto,
        last_login_time: currentAdmin.last_login_time,
    }
}

const normalizeAdminResponse = (item: MockAdminItem) => ({
    ...item,
    group_arr: item.group_arr.map((groupId) => String(groupId)),
})

app.post('/api/auth/login', async (c) => {
    const body = (await c.req.json<{ username?: string; password?: string }>().catch(() => ({ username: '', password: '' }))) as {
        username?: string
        password?: string
    }
    if (body.username !== 'admin' || body.password !== '123456') {
        return fail(c, '账号或密码错误')
    }
    adminProfile.last_login_time = nowString()
    const currentAdmin = admins.find((item) => item.id === adminProfile.id)
    if (currentAdmin) currentAdmin.last_login_time = adminProfile.last_login_time
    appendAdminLog('登录后台', '/api/auth/login', { username: body.username ?? '' })
    return success(c, { userInfo: clone(adminProfile), token: adminProfile.token, refresh_token: adminProfile.refresh_token }, '登录成功')
})

app.post('/api/auth/logout', (c) => success(c, null, '退出成功'))

app.post('/api/common/refreshToken', (c) => {
    return success(c, { token: adminProfile.token, refresh_token: adminProfile.refresh_token }, '刷新成功')
})

app.get('/api/admin/init', (c) => {
    syncAdminProfile()
    return success(c, { siteConfig, adminInfo: clone(adminProfile), menus: buildTree(rules.filter((item) => item.status === 1)), layoutDefaults })
})

app.get('/admin/auth.Admin/index', (c) => success(c, getAdminRows(new URL(c.req.url))))
app.get('/admin/auth.Group/index', (c) => success(c, getGroupTree(new URL(c.req.url))))
app.get('/admin/auth.Rule/index', (c) => success(c, getRuleTree(new URL(c.req.url))))
app.get('/admin/auth.AdminLog/index', (c) => success(c, getAdminLogRows(new URL(c.req.url))))
app.get('/admin/routine.Attachment/index', (c) => success(c, getAttachmentRows(new URL(c.req.url))))

app.get('/admin/auth.Admin/edit', (c) => {
    const row = admins.find((item) => item.id === Number(c.req.query('id')))
    return row ? success(c, { row: normalizeAdminResponse(clone(row)) }) : fail(c, '管理员不存在')
})

app.get('/admin/auth.Group/edit', (c) => {
    const row = groups.find((item) => item.id === Number(c.req.query('id')))
    return row ? success(c, { row: clone(row) }) : fail(c, '角色组不存在')
})

app.get('/admin/auth.Rule/edit', (c) => {
    const row = rules.find((item) => item.id === Number(c.req.query('id')))
    return row ? success(c, { row: clone(row) }) : fail(c, '规则不存在')
})

app.get('/admin/routine.AdminInfo/index', (c) => {
    syncAdminProfile()
    return success(c, { info: clone(adminProfile) })
})

app.post('/admin/auth.Admin/add', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const item: MockAdminItem = {
        id: nextId(admins),
        username: String(body.username ?? ''),
        nickname: String(body.nickname ?? ''),
        avatar: String(body.avatar ?? '/static/images/avatar.png'),
        email: String(body.email ?? ''),
        mobile: String(body.mobile ?? ''),
        motto: String(body.motto ?? ''),
        password: String(body.password ?? ''),
        group_arr: normalizeArray(body.group_arr).map(Number),
        status: body.status === 'disable' ? 'disable' : 'enable',
        last_login_time: nowString(),
        create_time: nowString(),
    }
    admins.push(item)
    appendAdminLog('新增管理员', '/admin/auth.Admin/add', { id: item.id, username: item.username })
    return success(c, { row: normalizeAdminResponse(clone(item)) }, '保存成功')
})

app.post('/admin/auth.Admin/edit', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const item = admins.find((admin) => admin.id === Number(body.id))
    if (!item) return fail(c, '管理员不存在')

    if (body.username !== undefined) item.username = String(body.username)
    if (body.nickname !== undefined) item.nickname = String(body.nickname)
    if (body.avatar !== undefined) item.avatar = String(body.avatar)
    if (body.email !== undefined) item.email = String(body.email)
    if (body.mobile !== undefined) item.mobile = String(body.mobile)
    if (body.motto !== undefined) item.motto = String(body.motto)
    if (body.password) item.password = String(body.password)
    if (body.group_arr !== undefined) item.group_arr = normalizeArray(body.group_arr).map(Number)
    if (body.status !== undefined) item.status = body.status === 'disable' ? 'disable' : 'enable'
    if (item.id === adminProfile.id) syncAdminProfile()

    appendAdminLog('更新管理员', '/admin/auth.Admin/edit', { id: item.id })
    return success(c, { row: normalizeAdminResponse(clone(item)) }, '保存成功')
})

app.delete('/admin/auth.Admin/del', (c) => {
    const ids = parseIds(new URL(c.req.url)).filter((id) => id !== adminProfile.id)
    admins = admins.filter((item) => !ids.includes(item.id))
    appendAdminLog('删除管理员', '/admin/auth.Admin/del', { ids })
    return success(c, null, '删除成功')
})

app.post('/admin/auth.Group/add', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const item: MockGroupItem = {
        id: nextId(groups),
        pid: Number(body.pid ?? 0),
        name: String(body.name ?? ''),
        rules: normalizeArray(body.rules).map(Number),
        status: Number(body.status ?? 1) === 0 ? 0 : 1,
        create_time: nowString(),
        update_time: nowString(),
    }
    groups.push(item)
    appendAdminLog('新增角色组', '/admin/auth.Group/add', { id: item.id, name: item.name })
    return success(c, { row: clone(item) }, '保存成功')
})

app.post('/admin/auth.Group/edit', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const item = groups.find((group) => group.id === Number(body.id))
    if (!item) return fail(c, '角色组不存在')
    if (body.pid !== undefined) item.pid = Number(body.pid)
    if (body.name !== undefined) item.name = String(body.name)
    if (body.rules !== undefined) item.rules = normalizeArray(body.rules).map(Number)
    if (body.status !== undefined) item.status = Number(body.status) === 0 ? 0 : 1
    item.update_time = nowString()
    appendAdminLog('更新角色组', '/admin/auth.Group/edit', { id: item.id })
    return success(c, { row: clone(item) }, '保存成功')
})

app.delete('/admin/auth.Group/del', (c) => {
    const ids = parseIds(new URL(c.req.url)).filter((id) => id !== 1)
    groups = groups.filter((item) => !ids.includes(item.id))
    admins = admins.map((item) => ({ ...item, group_arr: item.group_arr.filter((groupId) => !ids.includes(groupId)) }))
    appendAdminLog('删除角色组', '/admin/auth.Group/del', { ids })
    return success(c, null, '删除成功')
})

app.post('/admin/auth.Rule/add', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const ruleId = nextId(rules)
    const item: MockRuleItem = {
        id: ruleId,
        pid: Number(body.pid ?? 0),
        type: (body.type as MockRuleItem['type']) ?? 'menu',
        title: String(body.title ?? ''),
        name: String(body.name ?? ''),
        path: String(body.path ?? ''),
        icon: String(body.icon ?? 'fa fa-circle-o'),
        menu_type: body.menu_type ?? 'tab',
        component: body.component ? String(body.component) : undefined,
        keepalive: Number(body.keepalive ?? 0),
        extend: body.extend ?? 'none',
        url: body.url ? String(body.url) : undefined,
        status: Number(body.status ?? 1) === 0 ? 0 : 1,
        weigh: Number(body.weigh ?? ruleId),
        create_time: nowString(),
        update_time: nowString(),
        remark: body.remark ? String(body.remark) : '',
        buttons: normalizeArray(body.buttons),
    }
    rules.push(item)
    if (item.type === 'menu' && item.buttons?.length) {
        item.buttons.forEach((buttonName, index) => {
            rules.push({
                id: nextId(rules),
                pid: item.id,
                type: 'button',
                title: buttonName,
                name: buttonName === 'delete' ? 'del' : buttonName,
                path: '',
                icon: '',
                keepalive: 0,
                extend: 'none',
                status: 1,
                weigh: index + 1,
                create_time: nowString(),
                update_time: nowString(),
            })
        })
    }
    appendAdminLog('新增规则', '/admin/auth.Rule/add', { id: item.id, name: item.name })
    return success(c, { row: clone(item) }, '保存成功')
})

app.post('/admin/auth.Rule/edit', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const item = rules.find((rule) => rule.id === Number(body.id))
    if (!item) return fail(c, '规则不存在')
    if (body.pid !== undefined) item.pid = Number(body.pid)
    if (body.title !== undefined) item.title = String(body.title)
    if (body.name !== undefined) item.name = String(body.name)
    if (body.path !== undefined) item.path = String(body.path)
    if (body.icon !== undefined) item.icon = String(body.icon)
    if (body.menu_type !== undefined) item.menu_type = body.menu_type
    if (body.component !== undefined) item.component = body.component ? String(body.component) : undefined
    if (body.extend !== undefined) item.extend = body.extend
    if (body.url !== undefined) item.url = body.url ? String(body.url) : undefined
    if (body.remark !== undefined) item.remark = String(body.remark)
    if (body.keepalive !== undefined) item.keepalive = Number(body.keepalive)
    if (body.status !== undefined) item.status = Number(body.status) === 0 ? 0 : 1
    if (body.weigh !== undefined) item.weigh = Number(body.weigh)
    item.update_time = nowString()
    appendAdminLog('更新规则', '/admin/auth.Rule/edit', { id: item.id })
    return success(c, { row: clone(item) }, '保存成功')
})

app.post('/admin/auth.Rule/sortable', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const moveItem = rules.find((item) => item.id === Number(body.move))
    const targetItem = rules.find((item) => item.id === Number(body.target))
    if (!moveItem || !targetItem) return fail(c, '规则不存在')
    const currentWeigh = moveItem.weigh
    moveItem.weigh = targetItem.weigh
    targetItem.weigh = currentWeigh
    moveItem.update_time = nowString()
    targetItem.update_time = nowString()
    appendAdminLog('调整规则排序', '/admin/auth.Rule/sortable', { moveId: moveItem.id, targetId: targetItem.id })
    return success(c, null, '排序成功')
})

app.delete('/admin/auth.Rule/del', (c) => {
    const ids = parseIds(new URL(c.req.url))
    const allIds = new Set<number>(ids)
    let changed = true
    while (changed) {
        changed = false
        rules.forEach((item) => {
            if (item.pid && allIds.has(item.pid) && !allIds.has(item.id)) {
                allIds.add(item.id)
                changed = true
            }
        })
    }
    rules = rules.filter((item) => !allIds.has(item.id))
    groups = groups.map((item) => ({ ...item, rules: item.rules.filter((ruleId) => !allIds.has(ruleId)) }))
    appendAdminLog('删除规则', '/admin/auth.Rule/del', { ids: [...allIds] })
    return success(c, null, '删除成功')
})

app.delete('/admin/auth.AdminLog/del', (c) => {
    const ids = parseIds(new URL(c.req.url))
    adminLogs = adminLogs.filter((item) => !ids.includes(item.id))
    return success(c, null, '删除成功')
})

app.post('/admin/routine.AdminInfo/edit', async (c) => {
    const body = await c.req.json<Record<string, any>>()
    const currentAdmin = admins.find((item) => item.id === adminProfile.id)
    if (!currentAdmin) return fail(c, '管理员不存在')
    if (body.nickname !== undefined) currentAdmin.nickname = String(body.nickname)
    if (body.email !== undefined) currentAdmin.email = String(body.email)
    if (body.mobile !== undefined) currentAdmin.mobile = String(body.mobile)
    if (body.motto !== undefined) currentAdmin.motto = String(body.motto)
    if (body.avatar !== undefined) currentAdmin.avatar = String(body.avatar)
    if (body.password) currentAdmin.password = String(body.password)
    currentAdmin.last_login_time = nowString()
    syncAdminProfile()
    appendAdminLog('更新个人资料', '/admin/routine.AdminInfo/edit', { id: adminProfile.id })
    return success(c, { info: clone(adminProfile) }, '保存成功')
})

app.post('/admin/ajax/upload', async (c) => {
    const body = await c.req.parseBody()
    const file = body.file
    const attachment: MockAttachmentItem = {
        id: nextId(attachments),
        topic: '上传文件',
        url: '/static/images/avatar.png',
        full_url: '/static/images/avatar.png',
        suffix: 'png',
        mimetype: 'image/png',
        size: 20480,
        quote: 1,
        name: typeof file === 'string' ? file : 'upload.png',
        last_upload_time: nowString(),
    }
    attachments.unshift(attachment)
    appendAdminLog('上传文件', '/admin/ajax/upload', { id: attachment.id, name: attachment.name })
    return success(c, { file: { url: attachment.url, full_url: attachment.full_url, name: attachment.name } }, '上传成功')
})

app.get('/admin/ajax/buildSuffixSvg', (c) => {
    const suffix = (c.req.query('suffix') ?? 'FILE').slice(0, 6).toUpperCase()
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="24" fill="#409eff"/><text x="80" y="92" text-anchor="middle" font-size="42" fill="#ffffff" font-family="Arial">${suffix}</text></svg>`
    c.header('Content-Type', 'image/svg+xml')
    return c.body(svg)
})

const port = Number(process.env.PORT ?? 8787)

serve(
    {
        fetch: app.fetch,
        port,
    },
    (info) => {
        console.log(`baseadmin-air mock server running at http://127.0.0.1:${info.port}`)
    }
)

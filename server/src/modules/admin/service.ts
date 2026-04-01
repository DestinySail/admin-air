import { eq, inArray } from 'drizzle-orm'
import { layoutDefaults, siteConfig, type BootstrapRule } from '../../bootstrap/bootstrap-data'
import { db } from '../../db/client'
import { adminLogs, adminGroups, admins, attachments, groupRules, groups, rules } from '../../db/schema'
import { AppError } from '../../shared/http/errors'
import { matchesSearch, normalizeArray, paginateRows, parseSearch, sortRows } from '../../shared/http/query'
import { buildTree, includeAncestors } from '../../shared/http/tree'
import { hashPassword } from '../../shared/security/password'
import { nowString } from '../../shared/time'

type RuleRow = typeof rules.$inferSelect
type AdminRow = typeof admins.$inferSelect

const nextId = (items: Array<{ id: number }>) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

const getAllAdmins = async () => db.select().from(admins)
const getAllGroups = async () => db.select().from(groups)
const getAllRules = async () => db.select().from(rules)
const getAllLogs = async () => db.select().from(adminLogs)
const getAllAttachments = async () => db.select().from(attachments)
const getAdminGroupRows = async () => db.select().from(adminGroups)
const getGroupRuleRows = async () => db.select().from(groupRules)

const toAdminInfo = (admin: AdminRow, tokens?: { token?: string; refresh_token?: string }) => ({
    id: admin.id,
    username: admin.username,
    nickname: admin.nickname,
    avatar: admin.avatar,
    email: admin.email,
    mobile: admin.mobile,
    motto: admin.motto,
    last_login_time: admin.lastLoginTime,
    super: admin.isSuper === 1,
    ...(tokens?.token ? { token: tokens.token } : {}),
    ...(tokens?.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
})

const normalizeRule = (rule: RuleRow) => ({
    id: rule.id,
    pid: rule.pid,
    type: rule.type as BootstrapRule['type'],
    title: rule.title,
    name: rule.name,
    path: rule.path,
    icon: rule.icon,
    menu_type: (rule.menuType ?? undefined) as BootstrapRule['menu_type'],
    component: rule.component ?? undefined,
    keepalive: rule.keepalive,
    extend: (rule.extend ?? 'none') as BootstrapRule['extend'],
    url: rule.url ?? undefined,
    status: rule.status,
    weigh: rule.weigh,
    create_time: rule.createTime,
    update_time: rule.updateTime,
    remark: rule.remark,
    buttons: rule.buttons ?? undefined,
})

export const getAdminById = async (adminId: number) => {
    const rows = await db.select().from(admins).where(eq(admins.id, adminId))
    return rows[0] ?? null
}

export const getAdminByUsername = async (username: string) => {
    const rows = await db.select().from(admins).where(eq(admins.username, username))
    return rows[0] ?? null
}

export const getCurrentAdminPayload = async (adminId: number, tokens?: { token?: string; refresh_token?: string }) => {
    const admin = await getAdminById(adminId)
    if (!admin) throw new AppError('管理员不存在')
    return toAdminInfo(admin, tokens)
}

export const appendAdminLog = async (
    adminId: number,
    title: string,
    url: string,
    data: Record<string, unknown>,
    requestInfo?: { ip?: string; useragent?: string }
) => {
    const admin = await getAdminById(adminId)
    if (!admin) return
    await db.insert(adminLogs).values({
        id: nextId(await getAllLogs()),
        adminId,
        username: admin.username,
        title,
        url,
        ip: requestInfo?.ip ?? '127.0.0.1',
        useragent: requestInfo?.useragent ?? 'Browser',
        createTime: nowString(),
        data: JSON.stringify(data),
    })
}

const getVisibleRuleIds = async (adminId: number) => {
    const admin = await getAdminById(adminId)
    if (!admin) return []
    const allRuleRows = await getAllRules()
    if (admin.isSuper === 1) return allRuleRows.map((item) => item.id)

    const adminRelationRows = await getAdminGroupRows()
    const groupRelationRows = await getGroupRuleRows()
    const groupIds = adminRelationRows.filter((item) => item.adminId === adminId).map((item) => item.groupId)
    const ids = new Set<number>()
    groupRelationRows.forEach((item) => {
        if (groupIds.includes(item.groupId)) ids.add(item.ruleId)
    })
    return [...ids]
}

export const getMenusForAdmin = async (adminId: number) => {
    const visibleRuleIds = new Set(await getVisibleRuleIds(adminId))
    const menus = (await getAllRules()).map(normalizeRule).filter((item) => item.status === 1 && visibleRuleIds.has(item.id))
    return buildTree(menus)
}

export const getInitPayload = async (adminId: number) => ({
    siteConfig,
    adminInfo: await getCurrentAdminPayload(adminId),
    menus: await getMenusForAdmin(adminId),
    layoutDefaults,
})

export const getAdminRows = async (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 10)
    const filters = parseSearch(query)
    const order = query.searchParams.get('order') ?? undefined
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const [adminRows, groupRows, adminGroupRows] = await Promise.all([getAllAdmins(), getAllGroups(), getAdminGroupRows()])

    const groupMap = new Map(groupRows.map((item) => [item.id, item.name]))
    let rows = adminRows.map((item) => {
        const groupIds = adminGroupRows.filter((row) => row.adminId === item.id).map((row) => row.groupId)
        return {
            id: item.id,
            username: item.username,
            nickname: item.nickname,
            avatar: item.avatar,
            email: item.email,
            mobile: item.mobile,
            motto: item.motto,
            status: item.status,
            last_login_time: item.lastLoginTime,
            create_time: item.createTime,
            group_arr: groupIds,
            group_name_arr: groupIds.map((groupId) => groupMap.get(groupId) ?? String(groupId)),
        }
    })

    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch)
        rows = rows.filter((item) => `${item.username} ${item.nickname} ${item.email} ${item.mobile}`.toLowerCase().includes(quickSearch))
    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

export const getAdminEditPayload = async (id: number) => {
    const admin = await getAdminById(id)
    if (!admin) throw new AppError('管理员不存在')
    const groupIds = (await getAdminGroupRows()).filter((item) => item.adminId === id).map((item) => String(item.groupId))
    return {
        row: {
            id: admin.id,
            username: admin.username,
            nickname: admin.nickname,
            avatar: admin.avatar,
            email: admin.email,
            mobile: admin.mobile,
            motto: admin.motto,
            status: admin.status,
            group_arr: groupIds,
        },
    }
}

export const addAdmin = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    if (await getAdminByUsername(String(body.username ?? ''))) throw new AppError('管理员账号已存在')
    const id = nextId(await getAllAdmins())
    const timestamp = nowString()
    await db.insert(admins).values({
        id,
        username: String(body.username ?? ''),
        nickname: String(body.nickname ?? ''),
        avatar: String(body.avatar ?? '/static/images/avatar.png'),
        email: String(body.email ?? ''),
        mobile: String(body.mobile ?? ''),
        motto: String(body.motto ?? ''),
        passwordHash: hashPassword(String(body.password ?? '123456')),
        status: body.status === 'disable' ? 'disable' : 'enable',
        isSuper: 0,
        lastLoginTime: timestamp,
        createTime: timestamp,
        updateTime: timestamp,
    })
    const groupIds = normalizeArray(body.group_arr)
        .map(Number)
        .filter((item) => !Number.isNaN(item))
    if (groupIds.length) await db.insert(adminGroups).values(groupIds.map((groupId) => ({ adminId: id, groupId })))
    await appendAdminLog(actorId, '新增管理员', '/admin/auth.Admin/add', { id, username: body.username ?? '' }, requestInfo)
    return getAdminEditPayload(id)
}

export const editAdmin = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const item = await getAdminById(Number(body.id))
    if (!item) throw new AppError('管理员不存在')

    const updates: Record<string, unknown> = { updateTime: nowString() }
    if (body.username !== undefined) updates.username = String(body.username)
    if (body.nickname !== undefined) updates.nickname = String(body.nickname)
    if (body.avatar !== undefined) updates.avatar = String(body.avatar)
    if (body.email !== undefined) updates.email = String(body.email)
    if (body.mobile !== undefined) updates.mobile = String(body.mobile)
    if (body.motto !== undefined) updates.motto = String(body.motto)
    if (body.status !== undefined) updates.status = body.status === 'disable' ? 'disable' : 'enable'
    if (body.password) updates.passwordHash = hashPassword(String(body.password))
    await db.update(admins).set(updates).where(eq(admins.id, item.id))

    if (body.group_arr !== undefined) {
        await db.delete(adminGroups).where(eq(adminGroups.adminId, item.id))
        const groupIds = normalizeArray(body.group_arr)
            .map(Number)
            .filter((value) => !Number.isNaN(value))
        if (groupIds.length) await db.insert(adminGroups).values(groupIds.map((groupId) => ({ adminId: item.id, groupId })))
    }

    await appendAdminLog(actorId, '更新管理员', '/admin/auth.Admin/edit', { id: item.id }, requestInfo)
    return getAdminEditPayload(item.id)
}

export const deleteAdmins = async (ids: number[], currentAdminId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const targetIds = ids.filter((id) => id !== currentAdminId)
    if (targetIds.length) await db.delete(admins).where(inArray(admins.id, targetIds))
    await appendAdminLog(currentAdminId, '删除管理员', '/admin/auth.Admin/del', { ids: targetIds }, requestInfo)
}

export const getGroupTree = async (query: URL) => {
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const [groupRows, groupRuleRows, ruleRows] = await Promise.all([getAllGroups(), getGroupRuleRows(), getAllRules()])
    const allGroups = groupRows.map((item) => ({
        id: item.id,
        pid: item.pid,
        name: item.name,
        status: item.status,
        create_time: item.createTime,
        update_time: item.updateTime,
        rules: groupRuleRows.filter((relation) => relation.groupId === item.id).map((relation) => relation.ruleId),
    }))

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

    const ruleMap = new Map(ruleRows.map((item) => [item.id, item.title]))
    const list = buildTree(
        allGroups
            .filter((item) => matchedIds.has(item.id))
            .map((item) => ({ ...item, rules: item.rules.map((ruleId) => ruleMap.get(ruleId) ?? String(ruleId)) }))
    )
    return { list, total: allGroups.length, remark: '', group: [1] }
}

export const getGroupEditPayload = async (id: number) => {
    const group = (await getAllGroups()).find((item) => item.id === id)
    if (!group) throw new AppError('角色组不存在')
    const ruleIds = (await getGroupRuleRows()).filter((item) => item.groupId === id).map((item) => item.ruleId)
    return { row: { id: group.id, pid: group.pid, name: group.name, rules: ruleIds, status: group.status } }
}

export const addGroup = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const id = nextId(await getAllGroups())
    const timestamp = nowString()
    await db.insert(groups).values({
        id,
        pid: Number(body.pid ?? 0),
        name: String(body.name ?? ''),
        status: Number(body.status ?? 1) === 0 ? 0 : 1,
        createTime: timestamp,
        updateTime: timestamp,
    })

    const ruleIds = normalizeArray(body.rules ?? body.auth)
        .map(Number)
        .filter((value) => !Number.isNaN(value))
    if (ruleIds.length) await db.insert(groupRules).values(ruleIds.map((ruleId) => ({ groupId: id, ruleId })))
    await appendAdminLog(actorId, '新增角色组', '/admin/auth.Group/add', { id, name: body.name ?? '' }, requestInfo)
    return getGroupEditPayload(id)
}

export const editGroup = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const item = (await getAllGroups()).find((group) => group.id === Number(body.id))
    if (!item) throw new AppError('角色组不存在')
    await db
        .update(groups)
        .set({
            pid: body.pid !== undefined ? Number(body.pid) : item.pid,
            name: body.name !== undefined ? String(body.name) : item.name,
            status: body.status !== undefined ? (Number(body.status) === 0 ? 0 : 1) : item.status,
            updateTime: nowString(),
        })
        .where(eq(groups.id, item.id))

    if (body.rules !== undefined || body.auth !== undefined) {
        await db.delete(groupRules).where(eq(groupRules.groupId, item.id))
        const ruleIds = normalizeArray(body.rules ?? body.auth)
            .map(Number)
            .filter((value) => !Number.isNaN(value))
        if (ruleIds.length) await db.insert(groupRules).values(ruleIds.map((ruleId) => ({ groupId: item.id, ruleId })))
    }

    await appendAdminLog(actorId, '更新角色组', '/admin/auth.Group/edit', { id: item.id }, requestInfo)
    return getGroupEditPayload(item.id)
}

export const deleteGroups = async (ids: number[], actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const targetIds = ids.filter((id) => id !== 1)
    if (targetIds.length) await db.delete(groups).where(inArray(groups.id, targetIds))
    await appendAdminLog(actorId, '删除角色组', '/admin/auth.Group/del', { ids: targetIds }, requestInfo)
}

export const getRuleTree = async (query: URL) => {
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const allRules = (await getAllRules()).map(normalizeRule)

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

export const getRuleEditPayload = async (id: number) => {
    const row = (await getAllRules()).find((item) => item.id === id)
    if (!row) throw new AppError('规则不存在')
    return { row: normalizeRule(row) }
}

export const addRule = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const existingRules = await getAllRules()
    const ruleId = nextId(existingRules)
    const timestamp = nowString()
    await db.insert(rules).values({
        id: ruleId,
        pid: Number(body.pid ?? 0),
        type: String(body.type ?? 'menu'),
        title: String(body.title ?? ''),
        name: String(body.name ?? ''),
        path: String(body.path ?? ''),
        icon: String(body.icon ?? 'fa fa-circle-o'),
        menuType: body.menu_type ? String(body.menu_type) : 'tab',
        component: body.component ? String(body.component) : null,
        keepalive: Number(body.keepalive ?? 0),
        extend: String(body.extend ?? 'none'),
        url: body.url ? String(body.url) : null,
        status: Number(body.status ?? 1) === 0 ? 0 : 1,
        weigh: Number(body.weigh ?? ruleId),
        remark: body.remark ? String(body.remark) : '',
        buttons: normalizeArray(body.buttons),
        createTime: timestamp,
        updateTime: timestamp,
    })

    const buttons = normalizeArray(body.buttons)
    let currentRows = [...existingRules, { id: ruleId } as RuleRow]
    for (const [index, buttonName] of buttons.entries()) {
        if (body.type !== 'menu') break
        const buttonId = nextId(currentRows)
        currentRows = [...currentRows, { id: buttonId } as RuleRow]
        await db.insert(rules).values({
            id: buttonId,
            pid: ruleId,
            type: 'button',
            title: buttonName,
            name: buttonName === 'delete' ? 'del' : buttonName,
            path: '',
            icon: '',
            menuType: null,
            component: null,
            keepalive: 0,
            extend: 'none',
            url: null,
            status: 1,
            weigh: index + 1,
            remark: '',
            buttons: null,
            createTime: timestamp,
            updateTime: timestamp,
        })
    }

    await appendAdminLog(actorId, '新增规则', '/admin/auth.Rule/add', { id: ruleId, name: body.name ?? '' }, requestInfo)
    return getRuleEditPayload(ruleId)
}

export const editRule = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const item = (await getAllRules()).find((rule) => rule.id === Number(body.id))
    if (!item) throw new AppError('规则不存在')
    await db
        .update(rules)
        .set({
            pid: body.pid !== undefined ? Number(body.pid) : item.pid,
            title: body.title !== undefined ? String(body.title) : item.title,
            name: body.name !== undefined ? String(body.name) : item.name,
            path: body.path !== undefined ? String(body.path) : item.path,
            icon: body.icon !== undefined ? String(body.icon) : item.icon,
            menuType: body.menu_type !== undefined ? String(body.menu_type) : item.menuType,
            component: body.component !== undefined ? (body.component ? String(body.component) : null) : item.component,
            extend: body.extend !== undefined ? String(body.extend) : item.extend,
            url: body.url !== undefined ? (body.url ? String(body.url) : null) : item.url,
            remark: body.remark !== undefined ? String(body.remark) : item.remark,
            keepalive: body.keepalive !== undefined ? Number(body.keepalive) : item.keepalive,
            status: body.status !== undefined ? (Number(body.status) === 0 ? 0 : 1) : item.status,
            weigh: body.weigh !== undefined ? Number(body.weigh) : item.weigh,
            updateTime: nowString(),
        })
        .where(eq(rules.id, item.id))
    await appendAdminLog(actorId, '更新规则', '/admin/auth.Rule/edit', { id: item.id }, requestInfo)
    return getRuleEditPayload(item.id)
}

export const sortRule = async (body: Record<string, any>, actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const ruleRows = await getAllRules()
    const moveItem = ruleRows.find((item) => item.id === Number(body.move))
    const targetItem = ruleRows.find((item) => item.id === Number(body.target))
    if (!moveItem || !targetItem) throw new AppError('规则不存在')
    await db.update(rules).set({ weigh: targetItem.weigh, updateTime: nowString() }).where(eq(rules.id, moveItem.id))
    await db.update(rules).set({ weigh: moveItem.weigh, updateTime: nowString() }).where(eq(rules.id, targetItem.id))
    await appendAdminLog(
        actorId,
        '调整规则顺序',
        '/admin/auth.Rule/sortable',
        { moveId: Number(body.move), targetId: Number(body.target) },
        requestInfo
    )
}

export const deleteRules = async (ids: number[], actorId: number, requestInfo?: { ip?: string; useragent?: string }) => {
    const allRules = await getAllRules()
    const allIds = new Set<number>(ids)
    let changed = true
    while (changed) {
        changed = false
        allRules.forEach((item) => {
            if (item.pid && allIds.has(item.pid) && !allIds.has(item.id)) {
                allIds.add(item.id)
                changed = true
            }
        })
    }
    const deleteIds = [...allIds]
    if (deleteIds.length) await db.delete(rules).where(inArray(rules.id, deleteIds))
    if (deleteIds.length) await db.delete(groupRules).where(inArray(groupRules.ruleId, deleteIds))
    await appendAdminLog(actorId, '删除规则', '/admin/auth.Rule/del', { ids: deleteIds }, requestInfo)
}

export const getAdminLogRows = async (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 10)
    const filters = parseSearch(query)
    const order = query.searchParams.get('order') ?? 'create_time,desc'
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    let rows = (await getAllLogs()).map((item) => ({
        id: item.id,
        admin_id: item.adminId,
        username: item.username,
        title: item.title,
        url: item.url,
        ip: item.ip,
        useragent: item.useragent,
        create_time: item.createTime,
        data: item.data,
    }))
    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch) rows = rows.filter((item) => `${item.title} ${item.username} ${item.url}`.toLowerCase().includes(quickSearch))
    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

export const deleteAdminLogs = async (ids: number[]) => {
    if (ids.length) await db.delete(adminLogs).where(inArray(adminLogs.id, ids))
}

export const getAttachmentRows = async (query: URL) => {
    const page = Number(query.searchParams.get('page') ?? 1)
    const limit = Number(query.searchParams.get('limit') ?? 8)
    const filters = parseSearch(query)
    const quickSearch = query.searchParams.get('quickSearch')?.toLowerCase() ?? ''
    const order = query.searchParams.get('order') ?? 'last_upload_time,desc'
    let rows = (await getAllAttachments()).map((item) => ({
        id: item.id,
        topic: item.topic,
        url: item.url,
        full_url: item.fullUrl,
        suffix: item.suffix,
        mimetype: item.mimetype,
        size: item.size,
        quote: item.quote,
        name: item.name,
        last_upload_time: item.lastUploadTime,
    }))
    if (filters.length) rows = rows.filter((item) => matchesSearch(item as Record<string, any>, filters))
    if (quickSearch) rows = rows.filter((item) => `${item.name} ${item.topic} ${item.mimetype}`.toLowerCase().includes(quickSearch))
    rows = sortRows(rows, order)
    return { list: paginateRows(rows, page, limit), total: rows.length, remark: '' }
}

export const getAdminProfileDetail = async (adminId: number) => {
    const admin = await getAdminById(adminId)
    if (!admin) throw new AppError('管理员不存在')
    return {
        info: {
            id: admin.id,
            username: admin.username,
            nickname: admin.nickname,
            avatar: admin.avatar,
            email: admin.email,
            mobile: admin.mobile,
            motto: admin.motto,
            password: '',
            last_login_time: admin.lastLoginTime,
        },
    }
}

export const updateAdminProfile = async (adminId: number, body: Record<string, any>, requestInfo?: { ip?: string; useragent?: string }) => {
    const admin = await getAdminById(adminId)
    if (!admin) throw new AppError('管理员不存在')
    const updates: Record<string, unknown> = { updateTime: nowString() }
    if (body.nickname !== undefined) updates.nickname = String(body.nickname)
    if (body.email !== undefined) updates.email = String(body.email)
    if (body.mobile !== undefined) updates.mobile = String(body.mobile)
    if (body.motto !== undefined) updates.motto = String(body.motto)
    if (body.avatar !== undefined) updates.avatar = String(body.avatar)
    if (body.password) updates.passwordHash = hashPassword(String(body.password))
    await db.update(admins).set(updates).where(eq(admins.id, adminId))
    await appendAdminLog(adminId, '更新个人资料', '/admin/routine.AdminInfo/edit', { id: adminId }, requestInfo)
    return getAdminProfileDetail(adminId)
}

export const createAttachment = async (payload: {
    topic: string
    url: string
    fullUrl: string
    suffix: string
    mimetype: string
    size: number
    quote: number
    name: string
    storagePath: string
}) => {
    const id = nextId(await getAllAttachments())
    const timestamp = nowString()
    await db.insert(attachments).values({
        id,
        topic: payload.topic,
        url: payload.url,
        fullUrl: payload.fullUrl,
        suffix: payload.suffix,
        mimetype: payload.mimetype,
        size: payload.size,
        quote: payload.quote,
        name: payload.name,
        storagePath: payload.storagePath,
        lastUploadTime: timestamp,
        createTime: timestamp,
    })
    return { id, ...payload, last_upload_time: timestamp }
}

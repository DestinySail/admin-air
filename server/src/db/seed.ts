import { count } from 'drizzle-orm'
import { initialAdminLogs, initialAdmins, initialAttachments, initialGroups, initialRules } from '../bootstrap/bootstrap-data'
import { db, sql } from './client'
import { adminLogs, adminGroups, admins, attachments, groupRules, groups, rules } from './schema'
import { hashPassword } from '../shared/security/password'
import { nowString } from '../shared/time'

export const seedDatabase = async () => {
    const existing = await db.select({ value: count() }).from(admins)
    if (existing[0]?.value) return false

    const timestamp = nowString()

    await db.insert(admins).values(
        initialAdmins.map((item) => ({
            id: item.id,
            username: item.username,
            nickname: item.nickname,
            avatar: item.avatar,
            email: item.email,
            mobile: item.mobile,
            motto: item.motto,
            passwordHash: hashPassword(item.password),
            status: item.status,
            isSuper: item.super ? 1 : 0,
            lastLoginTime: item.last_login_time,
            createTime: item.create_time,
            updateTime: timestamp,
        }))
    )

    await db.insert(groups).values(
        initialGroups.map((item) => ({
            id: item.id,
            pid: item.pid,
            name: item.name,
            status: item.status,
            createTime: item.create_time,
            updateTime: item.update_time,
        }))
    )

    await db.insert(rules).values(
        initialRules.map((item) => ({
            id: item.id,
            pid: item.pid,
            type: item.type,
            title: item.title,
            name: item.name,
            path: item.path,
            icon: item.icon,
            menuType: item.menu_type ?? null,
            component: item.component ?? null,
            keepalive: item.keepalive ?? 0,
            extend: item.extend ?? 'none',
            url: item.url ?? null,
            status: item.status,
            weigh: item.weigh,
            remark: item.remark ?? '',
            buttons: item.buttons ?? null,
            createTime: item.create_time,
            updateTime: item.update_time,
        }))
    )

    await db.insert(adminGroups).values(initialAdmins.flatMap((item) => item.group_arr.map((groupId) => ({ adminId: item.id, groupId }))))
    await db.insert(groupRules).values(initialGroups.flatMap((item) => item.rules.map((ruleId) => ({ groupId: item.id, ruleId }))))

    await db.insert(adminLogs).values(
        initialAdminLogs.map((item) => ({
            id: item.id,
            adminId: item.admin_id,
            username: item.username,
            title: item.title,
            url: item.url,
            ip: item.ip,
            useragent: item.useragent,
            createTime: item.create_time,
            data: item.data,
        }))
    )

    await db.insert(attachments).values(
        initialAttachments.map((item) => ({
            id: item.id,
            topic: item.topic,
            url: item.url,
            fullUrl: item.full_url,
            suffix: item.suffix,
            mimetype: item.mimetype,
            size: item.size,
            quote: item.quote,
            name: item.name,
            storagePath: null,
            lastUploadTime: item.last_upload_time,
            createTime: item.last_upload_time,
        }))
    )

    return true
}

if (process.argv[1]?.endsWith('seed.ts')) {
    seedDatabase()
        .then(async (changed) => {
            console.log(changed ? 'database seed completed' : 'database seed skipped')
            await sql.end()
        })
        .catch(async (error) => {
            console.error('database seed failed', error)
            await sql.end()
            process.exit(1)
        })
}

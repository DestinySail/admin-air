import { mkdir, writeFile } from 'fs/promises'
import { extname, resolve } from 'path'
import { env } from '../../config/env'
import { AppError } from '../../shared/http/errors'
import { createAttachment, getAdminProfileDetail, getAttachmentRows, updateAdminProfile } from '../admin/service'
import { appendAdminLog } from '../admin/service'
import { nowString } from '../../shared/time'

const sanitizeFileName = (name: string) => name.replace(/[^\w.-]+/g, '-')

const getExtension = (fileName: string, fileType: string) => {
    const suffix = extname(fileName).replace('.', '').toLowerCase()
    if (suffix) return suffix
    if (fileType.startsWith('image/')) return fileType.split('/')[1]
    return 'bin'
}

export const getRoutineAdminInfo = async (adminId: number) => getAdminProfileDetail(adminId)

export const updateRoutineAdminInfo = async (adminId: number, body: Record<string, any>, requestInfo?: { ip?: string; useragent?: string }) =>
    updateAdminProfile(adminId, body, requestInfo)

export const listAttachments = async (query: URL) => getAttachmentRows(query)

export const uploadAttachment = async (adminId: number, file: File, requestInfo?: { ip?: string; useragent?: string }) => {
    if (!file) throw new AppError('请选择上传文件')

    await mkdir(env.uploadsDir, { recursive: true })
    const suffix = getExtension(file.name, file.type)
    const filename = `${Date.now()}-${sanitizeFileName(file.name || `upload.${suffix}`)}`
    const storagePath = resolve(env.uploadsDir, filename)
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(storagePath, bytes)

    const url = `/uploads/${filename}`
    const attachment = await createAttachment({
        topic: '上传文件',
        url,
        fullUrl: `${env.appBaseUrl}${url}`,
        suffix,
        mimetype: file.type || 'application/octet-stream',
        size: bytes.byteLength,
        quote: 1,
        name: file.name || `upload.${suffix}`,
        storagePath,
    })

    await appendAdminLog(adminId, '上传文件', '/admin/ajax/upload', { id: attachment.id, name: attachment.name, at: nowString() }, requestInfo)

    return {
        file: {
            url,
            full_url: `${env.appBaseUrl}${url}`,
            name: attachment.name,
        },
    }
}

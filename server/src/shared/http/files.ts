export const getMimeTypeBySuffix = (suffix: string) => {
    const normalized = suffix.replace('.', '').toLowerCase()
    const map: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        webp: 'image/webp',
        txt: 'text/plain; charset=utf-8',
        json: 'application/json; charset=utf-8',
        pdf: 'application/pdf',
    }
    return map[normalized] ?? 'application/octet-stream'
}

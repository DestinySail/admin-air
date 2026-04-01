const getValue = (row: Record<string, any>, field: string) => {
    if (!field.includes('.')) return row[field]
    return field.split('.').reduce((current, key) => (current ? current[key] : undefined), row as any)
}

export const normalizeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((item) => String(item))
    if (value === undefined || value === null || value === '') return []
    return [String(value)]
}

export const parseIds = (url: URL) => {
    const ids: number[] = []
    url.searchParams.forEach((value, key) => {
        if (key === 'ids' || key === 'ids[]' || /^ids\[\d+\]$/.test(key)) {
            ids.push(Number(value))
        }
    })
    return ids.filter((id) => !Number.isNaN(id))
}

export const parseSearch = (url: URL) => {
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

export const matchesSearch = (row: Record<string, any>, filters: Array<{ field: string; val: string; operator: string }>) =>
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

export const sortRows = <T extends Record<string, any>>(rows: T[], order?: string) => {
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

export const paginateRows = <T>(rows: T[], page = 1, limit = 10) => rows.slice((page - 1) * limit, (page - 1) * limit + limit)

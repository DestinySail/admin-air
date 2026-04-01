export const buildTree = <T extends { id: number; pid: number }>(items: T[]) => {
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

export const includeAncestors = <T extends { id: number; pid: number }>(items: T[], ids: Set<number>) => {
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

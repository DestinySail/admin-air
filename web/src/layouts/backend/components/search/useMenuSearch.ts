import { computed, shallowRef, watch } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { onClickMenu } from '/@/utils/router'

type MenuProvider = () => RouteRecordRaw[]

export interface MenuSearchItem {
    id: string
    title: string
    path: string
    icon: string
    breadcrumbTitles: string[]
    breadcrumbText: string
    keywords: string
    rawMenu: RouteRecordRaw
    score: number
    order: number
}

const DEFAULT_RECOMMEND_LIMIT = 6
const NAVIGABLE_MENU_TYPES = ['tab', 'iframe', 'link']

export function useMenuSearch(getMenus: MenuProvider) {
    const query = shallowRef('')
    const activeIndex = shallowRef(0)

    const indexedMenus = computed(() => buildIndexedMenus(getMenus()))

    const recommendedItems = computed(() => indexedMenus.value.slice(0, DEFAULT_RECOMMEND_LIMIT))

    const normalizedQuery = computed(() => query.value.trim().toLowerCase())

    const displayedItems = computed(() => {
        if (!normalizedQuery.value) {
            return recommendedItems.value
        }

        const terms = normalizedQuery.value.split(/\s+/).filter(Boolean)

        return indexedMenus.value
            .map((item) => {
                const score = calculateScore(item, terms)
                return score > 0 ? { ...item, score } : null
            })
            .filter((item): item is MenuSearchItem => Boolean(item))
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score
                return a.order - b.order
            })
    })

    const activeItem = computed(() => {
        if (!displayedItems.value.length) return null
        const nextIndex = Math.min(activeIndex.value, displayedItems.value.length - 1)
        return displayedItems.value[nextIndex]
    })

    const setQuery = (value: string) => {
        query.value = value
    }

    const clearQuery = () => {
        query.value = ''
        activeIndex.value = 0
    }

    const reset = () => {
        query.value = ''
        activeIndex.value = 0
    }

    const setActiveIndex = (value: number) => {
        if (!displayedItems.value.length) {
            activeIndex.value = 0
            return
        }

        const lastIndex = displayedItems.value.length - 1
        activeIndex.value = Math.min(Math.max(value, 0), lastIndex)
    }

    const moveActive = (step: number) => {
        if (!displayedItems.value.length) return

        const total = displayedItems.value.length
        activeIndex.value = (activeIndex.value + step + total) % total
    }

    const selectItem = (item = activeItem.value) => {
        if (!item) return
        onClickMenu(item.rawMenu)
    }

    watch([normalizedQuery, indexedMenus], () => {
        activeIndex.value = 0
    })

    return {
        query,
        activeIndex,
        indexedMenus,
        displayedItems,
        activeItem,
        setQuery,
        clearQuery,
        reset,
        setActiveIndex,
        moveActive,
        selectItem,
    }
}

function buildIndexedMenus(menus: RouteRecordRaw[]) {
    const items: MenuSearchItem[] = []
    let order = 0

    const visit = (nodes: RouteRecordRaw[], breadcrumbTitles: string[]) => {
        nodes.forEach((node) => {
            const title = String(node.meta?.title ?? '').trim()
            const nextBreadcrumbTitles = title ? [...breadcrumbTitles, title] : breadcrumbTitles
            const hasChildren = Boolean(node.children?.length)
            const isNavigable = NAVIGABLE_MENU_TYPES.includes(String(node.meta?.menu_type ?? ''))

            if (isNavigable) {
                const currentBreadcrumbTitles = title ? breadcrumbTitles : nextBreadcrumbTitles
                items.push({
                    id: String(node.meta?.id ?? node.name ?? node.path ?? order),
                    title: title || String(node.name ?? node.path),
                    path: node.path,
                    icon: String(node.meta?.icon ?? ''),
                    breadcrumbTitles: currentBreadcrumbTitles,
                    breadcrumbText: currentBreadcrumbTitles.join(' / '),
                    keywords: [title, currentBreadcrumbTitles.join(' '), node.path, String(node.name ?? '')].join(' ').toLowerCase(),
                    rawMenu: node,
                    score: 0,
                    order,
                })
                order += 1
            }

            if (hasChildren) {
                visit(node.children!, nextBreadcrumbTitles)
            }
        })
    }

    visit(menus, [])
    return items
}

function calculateScore(item: MenuSearchItem, terms: string[]) {
    if (!terms.length) return 0

    const title = item.title.toLowerCase()
    const breadcrumb = item.breadcrumbText.toLowerCase()
    const path = item.path.toLowerCase()
    const keywords = item.keywords

    let score = 0

    for (const term of terms) {
        if (!keywords.includes(term)) {
            return 0
        }

        if (title === term) {
            score += 600
        } else if (title.startsWith(term)) {
            score += 420
        } else if (title.includes(term)) {
            score += 320
        }

        if (breadcrumb.startsWith(term)) {
            score += 180
        } else if (breadcrumb.includes(term)) {
            score += 120
        }

        if (path.startsWith(term)) {
            score += 100
        } else if (path.includes(term)) {
            score += 70
        }

        score += 20
    }

    return score
}

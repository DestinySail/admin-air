import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export interface Layout {
    showDrawer: boolean
    shrink: boolean
    layoutMode: string
    mainAnimation: string
    isDark: boolean
    menuWidth: number
    menuDefaultIcon: string
    menuCollapse: boolean
    menuUniqueOpened: boolean
    menuShowTopBar: boolean
    menuBackground: string[]
    menuColor: string[]
    menuActiveBackground: string[]
    menuActiveColor: string[]
    menuHoverBackground: string[]
    menuTopBarBackground: string[]
    headerBarTabColor: string[]
    headerBarBackground: string[]
    headerBarHoverBackground: string[]
    headerBarTabActiveBackground: string[]
    headerBarTabActiveColor: string[]
}

export interface Crud {
    syncType: 'manual' | 'automatic'
    syncedUpdate: 'no' | 'yes'
    syncAutoPublic: 'no' | 'yes'
}

export interface NavTabs {
    activeIndex: number
    activeRoute: RouteLocationNormalized | null
    tabsView: RouteLocationNormalized[]
    tabFullScreen: boolean
    tabsViewRoutes: RouteRecordRaw[]
    authNode: Map<string, string[]>
}

export interface AdminInfo {
    id: number
    username: string
    nickname: string
    avatar: string
    last_login_time: string
    token: string
    refresh_token: string
    super: boolean
}

export interface SiteConfig {
    siteName: string
    version: string
    cdnUrl: string
    apiUrl: string
    upload: {
        mode: string
        [key: string]: any
    }
    headNav: RouteRecordRaw[]
    recordNumber?: string
    cdnUrlParams: string
    initialize: boolean
    userInitialize: boolean
}

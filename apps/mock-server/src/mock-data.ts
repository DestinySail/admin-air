export type MockRuleType = 'menu_dir' | 'menu' | 'button'

export interface MockRuleItem {
    id: number
    pid: number
    type: MockRuleType
    title: string
    name: string
    path: string
    icon: string
    menu_type?: 'tab' | 'iframe' | 'link'
    component?: string
    keepalive?: number
    extend?: 'none' | 'add_rules_only' | 'add_menu_only'
    url?: string
    status: number
    weigh: number
    create_time: string
    update_time: string
    remark?: string
    buttons?: string[]
}

export interface MockAdminItem {
    id: number
    username: string
    nickname: string
    avatar: string
    email: string
    mobile: string
    motto: string
    password: string
    group_arr: number[]
    status: 'enable' | 'disable'
    last_login_time: string
    create_time: string
}

export interface MockGroupItem {
    id: number
    pid: number
    name: string
    rules: number[]
    status: 0 | 1
    create_time: string
    update_time: string
}

export interface MockAdminLogItem {
    id: number
    admin_id: number
    username: string
    title: string
    url: string
    ip: string
    useragent: string
    create_time: string
    data: string
}

export interface MockAttachmentItem {
    id: number
    topic: string
    url: string
    full_url: string
    suffix: string
    mimetype: string
    size: number
    quote: number
    name: string
    last_upload_time: string
}

export const layoutDefaults = {
    showDrawer: false,
    shrink: false,
    layoutMode: 'Default',
    mainAnimation: 'slide-right',
    isDark: false,
    menuBackground: ['#ffffff', '#1d1e1f'],
    menuColor: ['#303133', '#CFD3DC'],
    menuActiveBackground: ['#ffffff', '#1d1e1f'],
    menuActiveColor: ['#409eff', '#3375b9'],
    menuHoverBackground: ['#ecf5ff', '#18222c'],
    menuTopBarBackground: ['#fcfcfc', '#1d1e1f'],
    menuWidth: 260,
    menuDefaultIcon: 'fa fa-circle-o',
    menuCollapse: false,
    menuUniqueOpened: false,
    menuShowTopBar: true,
    headerBarTabColor: ['#000000', '#CFD3DC'],
    headerBarTabActiveBackground: ['#ffffff', '#1d1e1f'],
    headerBarTabActiveColor: ['#000000', '#409EFF'],
    headerBarBackground: ['#ffffff', '#1d1e1f'],
    headerBarHoverBackground: ['#f5f5f5', '#18222c'],
}

export const siteConfig = {
    siteName: 'Admin Air',
    version: 'v2.3.6-air',
    cdnUrl: '',
    apiUrl: '',
    upload: {
        mode: 'local',
        maxSize: 10485760,
        allowedSuffixes: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
    },
    headNav: [],
    recordNumber: '',
    cdnUrlParams: '',
    initialize: true,
    userInitialize: true,
}

export const initialAdminProfile = {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: '/static/images/avatar.png',
    email: 'admin@example.com',
    mobile: '13800000000',
    motto: '保持专注，持续交付。',
    password: '',
    last_login_time: '2026-03-29 10:00:00',
    token: 'mock-admin-token',
    refresh_token: 'mock-admin-refresh-token',
    super: false,
}

export const initialAdmins: MockAdminItem[] = [
    {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        avatar: '/static/images/avatar.png',
        email: 'admin@example.com',
        mobile: '13800000000',
        motto: '保持专注，持续交付。',
        password: '123456',
        group_arr: [1],
        status: 'enable',
        last_login_time: '2026-03-29 10:00:00',
        create_time: '2026-03-01 09:00:00',
    },
    {
        id: 2,
        username: 'editor',
        nickname: '内容管理员',
        avatar: '/static/images/avatar.png',
        email: 'editor@example.com',
        mobile: '13800000001',
        motto: '负责内容维护。',
        password: '123456',
        group_arr: [2],
        status: 'enable',
        last_login_time: '2026-03-28 17:20:00',
        create_time: '2026-03-05 10:00:00',
    },
]

export const initialGroups: MockGroupItem[] = [
    {
        id: 1,
        pid: 0,
        name: '超级管理员组',
        rules: [1, 10, 11, 111, 112, 113, 12, 121, 122, 123, 13, 131, 132, 133, 134, 14, 141, 90],
        status: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 2,
        pid: 1,
        name: '内容管理员组',
        rules: [1, 10, 11, 12, 13, 14, 90],
        status: 1,
        create_time: '2026-03-10 09:00:00',
        update_time: '2026-03-28 14:00:00',
    },
]

export const initialRules: MockRuleItem[] = [
    {
        id: 1,
        pid: 0,
        type: 'menu',
        title: '控制台',
        name: 'dashboard',
        path: 'dashboard',
        icon: 'fa fa-dashboard',
        menu_type: 'tab',
        component: '/src/views/dashboard.vue',
        keepalive: 1,
        extend: 'none',
        status: 1,
        weigh: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 10,
        pid: 0,
        type: 'menu_dir',
        title: '权限管理',
        name: 'auth',
        path: 'auth',
        icon: 'fa fa-shield',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 10,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 11,
        pid: 10,
        type: 'menu',
        title: '管理员管理',
        name: 'auth/admin',
        path: 'auth/admin',
        icon: 'el-icon-UserFilled',
        menu_type: 'tab',
        component: '/src/views/auth/admin/index.vue',
        keepalive: 1,
        extend: 'none',
        status: 1,
        weigh: 11,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 111,
        pid: 11,
        type: 'button',
        title: '新增',
        name: 'add',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 112,
        pid: 11,
        type: 'button',
        title: '编辑',
        name: 'edit',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 2,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 113,
        pid: 11,
        type: 'button',
        title: '删除',
        name: 'del',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 3,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 12,
        pid: 10,
        type: 'menu',
        title: '角色组管理',
        name: 'auth/group',
        path: 'auth/group',
        icon: 'fa fa-group',
        menu_type: 'tab',
        component: '/src/views/auth/group/index.vue',
        keepalive: 1,
        extend: 'none',
        status: 1,
        weigh: 12,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 121,
        pid: 12,
        type: 'button',
        title: '新增',
        name: 'add',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 122,
        pid: 12,
        type: 'button',
        title: '编辑',
        name: 'edit',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 2,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 123,
        pid: 12,
        type: 'button',
        title: '删除',
        name: 'del',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 3,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 13,
        pid: 10,
        type: 'menu',
        title: '菜单规则管理',
        name: 'auth/rule',
        path: 'auth/rule',
        icon: 'el-icon-Grid',
        menu_type: 'tab',
        component: '/src/views/auth/rule/index.vue',
        keepalive: 1,
        extend: 'none',
        status: 1,
        weigh: 13,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 131,
        pid: 13,
        type: 'button',
        title: '新增',
        name: 'add',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 132,
        pid: 13,
        type: 'button',
        title: '编辑',
        name: 'edit',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 2,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 133,
        pid: 13,
        type: 'button',
        title: '删除',
        name: 'del',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 3,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 134,
        pid: 13,
        type: 'button',
        title: '排序',
        name: 'sortable',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 4,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 14,
        pid: 10,
        type: 'menu',
        title: '管理员日志',
        name: 'auth/adminLog',
        path: 'auth/adminLog',
        icon: 'fa fa-list-alt',
        menu_type: 'tab',
        component: '/src/views/auth/adminLog/index.vue',
        keepalive: 1,
        extend: 'none',
        status: 1,
        weigh: 14,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 141,
        pid: 14,
        type: 'button',
        title: '删除',
        name: 'del',
        path: '',
        icon: '',
        keepalive: 0,
        extend: 'none',
        status: 1,
        weigh: 1,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
    {
        id: 90,
        pid: 0,
        type: 'menu',
        title: '个人资料',
        name: 'routine/adminInfo',
        path: 'routine/adminInfo',
        icon: 'fa fa-id-card-o',
        menu_type: 'tab',
        component: '/src/views/account/adminInfo.vue',
        keepalive: 1,
        extend: 'add_rules_only',
        status: 1,
        weigh: 90,
        create_time: '2026-03-01 09:00:00',
        update_time: '2026-03-29 10:00:00',
    },
]

export const initialAdminLogs: MockAdminLogItem[] = [
    {
        id: 1,
        admin_id: 1,
        username: 'admin',
        title: '登录后台',
        url: '/api/auth/login',
        ip: '127.0.0.1',
        useragent: 'Mock Browser',
        create_time: '2026-03-29 10:00:00',
        data: JSON.stringify({ username: 'admin' }),
    },
    {
        id: 2,
        admin_id: 1,
        username: 'admin',
        title: '更新布局配置',
        url: '/api/admin/init',
        ip: '127.0.0.1',
        useragent: 'Mock Browser',
        create_time: '2026-03-29 10:05:00',
        data: JSON.stringify({ layoutMode: 'Default' }),
    },
]

export const initialAttachments: MockAttachmentItem[] = [
    {
        id: 1,
        topic: '管理员头像',
        url: '/static/images/avatar.png',
        full_url: '/static/images/avatar.png',
        suffix: 'png',
        mimetype: 'image/png',
        size: 20480,
        quote: 2,
        name: 'avatar.png',
        last_upload_time: '2026-03-29 10:00:00',
    },
]

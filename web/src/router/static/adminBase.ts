import type { RouteRecordRaw } from 'vue-router'

export const adminBaseRoutePath = ''

const adminBaseRoute: RouteRecordRaw = {
    path: '/',
    name: 'admin',
    component: () => import('/@/layouts/backend/index.vue'),
    redirect: '/loading',
    meta: {
        title: '后台管理',
    },
    children: [
        {
            path: 'loading/:to?',
            name: 'adminMainLoading',
            component: () => import('/@/layouts/common/components/loading.vue'),
            meta: {
                title: '加载中',
            },
        },
    ],
}

export default adminBaseRoute

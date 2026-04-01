import type { RouteRecordRaw } from 'vue-router'
import adminBaseRoute from '/@/router/static/adminBase'

const staticRoutes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'adminLogin',
        component: () => import('/@/views/login.vue'),
        meta: {
            title: '登录',
            requiresAuth: false,
        },
    },
    adminBaseRoute,
    {
        path: '/404',
        name: 'notFound',
        component: () => import('/@/views/error/404.vue'),
        meta: {
            title: '404',
            requiresAuth: false,
        },
    },
    {
        path: '/401',
        name: 'noPower',
        component: () => import('/@/views/error/401.vue'),
        meta: {
            title: '401',
            requiresAuth: false,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: (to) => ({
            name: 'adminMainLoading',
            params: {
                to: JSON.stringify({
                    path: to.path,
                    query: to.query,
                }),
            },
        }),
    },
]

export default staticRoutes

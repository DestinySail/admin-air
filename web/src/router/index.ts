import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import staticRoutes from '/@/router/static'
import { loading } from '/@/utils/loading'
import { useAdminInfo } from '/@/stores/adminInfo'

const router = createRouter({
    history: createWebHashHistory(),
    routes: staticRoutes,
})

router.beforeEach((to, from, next) => {
    NProgress.configure({ showSpinner: false })
    NProgress.start()
    if (!window.existLoading) {
        loading.show()
        window.existLoading = true
    }

    const adminInfo = useAdminInfo()
    if (to.meta.requiresAuth !== false && to.path !== '/login' && !adminInfo.token) {
        next({ name: 'adminLogin' })
        return
    }
    if (to.path === '/login' && adminInfo.token) {
        next('/')
        return
    }

    next()
})

router.afterEach(() => {
    if (window.existLoading) {
        loading.hide()
    }
    NProgress.done()
})

export default router

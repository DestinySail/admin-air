<template>
    <component :is="config.layout.layoutMode"></component>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeMount } from 'vue'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'
import { useSiteConfig } from '/@/stores/siteConfig'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useRoute } from 'vue-router'
import Default from '/@/layouts/backend/container/default.vue'
import Classic from '/@/layouts/backend/container/classic.vue'
import Streamline from '/@/layouts/backend/container/streamline.vue'
import Double from '/@/layouts/backend/container/double.vue'
import { Session } from '/@/utils/storage'
import { index } from '/@/api/backend'
import { handleAdminRoute, getFirstRoute, routePush } from '/@/utils/router'
import router from '/@/router/index'
import { useEventListener } from '@vueuse/core'
import { BEFORE_RESIZE_LAYOUT } from '/@/stores/constant/cacheKey'
import { isEmpty } from 'lodash-es'
import { setNavTabsWidth } from '/@/utils/layout'

defineOptions({
    components: { Default, Classic, Streamline, Double },
})

const navTabs = useNavTabs()
const config = useConfig()
const route = useRoute()
const siteConfig = useSiteConfig()
const adminInfo = useAdminInfo()

const state = reactive({
    autoMenuCollapseLock: false,
})

onMounted(() => {
    if (!adminInfo.token) return router.push({ name: 'adminLogin' })

    init()
    setNavTabsWidth()
    useEventListener(window, 'resize', setNavTabsWidth)
})
onBeforeMount(() => {
    onAdaptiveLayout()
    useEventListener(window, 'resize', onAdaptiveLayout)
})

const init = () => {
    index().then((res) => {
        siteConfig.dataFill(res.data.siteConfig)
        siteConfig.setInitialize(true)
        config.setLayoutMode('Default')

        if (!isEmpty(res.data.adminInfo)) {
            adminInfo.dataFill(res.data.adminInfo, false)
            siteConfig.setUserInitialize(true)
        }

        if (res.data.menus) {
            handleAdminRoute(res.data.menus)

            if (route.params.to) {
                const lastRoute = JSON.parse(route.params.to as string)
                if (lastRoute.path !== '/') {
                    const query = !isEmpty(lastRoute.query) ? lastRoute.query : {}
                    if (router.getRoutes().some((item) => item.path === lastRoute.path)) {
                        routePush({ path: lastRoute.path, query })
                    } else {
                        routePush('/404')
                    }
                    return
                }
            }

            const firstRoute = getFirstRoute(navTabs.state.tabsViewRoutes)
            if (firstRoute) routePush(firstRoute.path)
        }
    })
}

const onAdaptiveLayout = () => {
    const defaultBeforeResizeLayout = {
        menuCollapse: config.layout.menuCollapse,
    }
    const beforeResizeLayout = Session.get(BEFORE_RESIZE_LAYOUT)
    if (!beforeResizeLayout) Session.set(BEFORE_RESIZE_LAYOUT, defaultBeforeResizeLayout)

    const clientWidth = document.body.clientWidth
    if (clientWidth < 1024) {
        if (!state.autoMenuCollapseLock) {
            state.autoMenuCollapseLock = true
            config.setLayout('menuCollapse', true)
        }
        config.setLayout('shrink', true)
    } else {
        state.autoMenuCollapseLock = false
        const beforeResizeLayoutTemp = beforeResizeLayout || defaultBeforeResizeLayout

        config.setLayout('menuCollapse', beforeResizeLayoutTemp.menuCollapse)
        config.setLayout('shrink', false)
    }
}
</script>

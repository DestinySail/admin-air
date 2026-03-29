import { isEmpty } from 'lodash-es'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { adminBaseRoutePath } from '/@/router/static/adminBase'
import { STORE_TAB_VIEW_CONFIG } from '/@/stores/constant/cacheKey'
import type { NavTabs } from '/@/stores/interface/index'
import { layoutNavTabsRef } from '/@/stores/refs'

export const useNavTabs = defineStore(
    'navTabs',
    () => {
        const state: NavTabs = reactive({
            activeIndex: 0,
            activeRoute: null,
            tabsView: [],
            tabFullScreen: false,
            tabsViewRoutes: [],
            authNode: new Map(),
        })

        const closeTabByPath = (fullPath: string) => {
            layoutNavTabsRef.value?.closeTabByPath(fullPath)
        }

        const closeAllTab = (menu?: RouteLocationNormalized) => {
            layoutNavTabsRef.value?.closeAllTab(menu)
        }

        const updateTabTitle = (fullPath: string, title: string) => {
            layoutNavTabsRef.value?.updateTabTitle(fullPath, title)
        }

        function _addTab(route: RouteLocationNormalized) {
            const tabView = { ...route, matched: [], meta: { ...route.meta } }
            if (!tabView.meta.addtab) return

            const tabViewRoute = getTabsViewDataByRoute(tabView)
            if (tabViewRoute && tabViewRoute.meta) {
                tabView.name = tabViewRoute.name
                tabView.meta.id = tabViewRoute.meta.id
                tabView.meta.title = tabViewRoute.meta.title
            }

            for (const key in state.tabsView) {
                if (state.tabsView[key].meta.id === tabView.meta.id || state.tabsView[key].fullPath == tabView.fullPath) {
                    state.tabsView[key].fullPath = tabView.fullPath
                    state.tabsView[key].params = !isEmpty(tabView.params) ? tabView.params : state.tabsView[key].params
                    state.tabsView[key].query = !isEmpty(tabView.query) ? tabView.query : state.tabsView[key].query
                    return
                }
            }

            state.tabsView.push(tabView)
        }

        const _setActiveRoute = (route: RouteLocationNormalized): void => {
            const currentRouteIndex: number = state.tabsView.findIndex((item: RouteLocationNormalized) => {
                return item.fullPath === route.fullPath
            })
            if (currentRouteIndex === -1) return
            state.activeRoute = route
            state.activeIndex = currentRouteIndex
        }

        function _closeTab(route: RouteLocationNormalized) {
            state.tabsView.map((v, k) => {
                if (v.fullPath == route.fullPath) {
                    state.tabsView.splice(k, 1)
                    return
                }
            })
        }

        const _closeTabs = (retainMenu: RouteLocationNormalized | false = false) => {
            if (retainMenu) {
                state.tabsView = [retainMenu]
            } else {
                state.tabsView = []
            }
        }

        const _updateTabTitle = (fullPath: string, title: string) => {
            for (const key in state.tabsView) {
                if (state.tabsView[key].fullPath == fullPath) {
                    state.tabsView[key].meta.title = title
                    break
                }
            }
        }

        const setTabsViewRoutes = (data: RouteRecordRaw[]): void => {
            state.tabsViewRoutes = encodeRoutesURI(data)
        }

        const setAuthNode = (key: string, data: string[]) => {
            state.authNode.set(key, data)
        }

        const fillAuthNode = (data: Map<string, string[]>) => {
            state.authNode = data
        }

        const setFullScreen = (status: boolean): void => {
            state.tabFullScreen = status
        }

        const getTabsViewDataByRoute = (route: RouteLocationNormalized, returnType: 'normal' | 'above' = 'normal'): RouteRecordRaw | false => {
            let found = getTabsViewDataByPath(route.fullPath, state.tabsViewRoutes, returnType)
            if (found) {
                found.meta!.matched = route.fullPath
                return found
            }

            found = getTabsViewDataByPath(route.path, state.tabsViewRoutes, returnType)
            if (found) {
                found.meta!.matched = route.path
                return found
            }

            return false
        }

        const getTabsViewDataByPath = (path: string, menus: RouteRecordRaw[], returnType: 'normal' | 'above'): RouteRecordRaw | false => {
            for (const key in menus) {
                if (menus[key].path === path) {
                    return menus[key]
                }
                if (menus[key].children && menus[key].children.length) {
                    const find = getTabsViewDataByPath(path, menus[key].children, returnType)
                    if (find) {
                        return returnType == 'above' ? menus[key] : find
                    }
                }
            }
            return false
        }

        return {
            state,
            closeAllTab,
            closeTabByPath,
            updateTabTitle,
            setTabsViewRoutes,
            setAuthNode,
            fillAuthNode,
            setFullScreen,
            getTabsViewDataByPath,
            getTabsViewDataByRoute,
            _addTab,
            _closeTab,
            _closeTabs,
            _setActiveRoute,
            _updateTabTitle,
        }
    },
    {
        persist: {
            key: STORE_TAB_VIEW_CONFIG,
            pick: ['state.tabFullScreen'],
        },
    }
)

function encodeRoutesURI(data: RouteRecordRaw[]) {
    data.forEach((item) => {
        if (item.meta?.menu_type == 'iframe') {
            item.path = adminBaseRoutePath + '/iframe/' + encodeURIComponent(item.path)
        }

        if (item.children && item.children.length) {
            item.children = encodeRoutesURI(item.children)
        }
    })
    return data
}

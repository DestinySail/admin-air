import { ElNotification } from 'element-plus'
import { compact, reverse } from 'lodash-es'
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import { isNavigationFailure, NavigationFailureType } from 'vue-router'
import router from '/@/router/index'
import adminBaseRoute from '/@/router/static/adminBase'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'
import { closeShade } from '/@/utils/pageShade'
import { translate } from '/@/utils/translate'

export const routePush = async (to: RouteLocationRaw) => {
    try {
        const failure = await router.push(to)
        if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
            ElNotification({
                message: translate('utils.Navigation failed, navigation guard intercepted!'),
                type: 'error',
            })
        } else if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
            ElNotification({
                message: translate('utils.Navigation failed, it is at the navigation target position!'),
                type: 'warning',
            })
        }
    } catch (error) {
        ElNotification({
            message: translate('utils.Navigation failed, invalid route!'),
            type: 'error',
        })
        console.error(error)
    }
}

export const getFirstRoute = (routes: RouteRecordRaw[]): false | RouteRecordRaw => {
    const routerPaths: string[] = []
    const routers = router.getRoutes()
    routers.forEach((item) => {
        if (item.path) routerPaths.push(item.path)
    })

    let find: boolean | RouteRecordRaw = false
    for (const key in routes) {
        if (routes[key].meta?.type == 'menu' && routerPaths.includes(routes[key].path)) {
            return routes[key]
        } else if (routes[key].children && routes[key].children?.length) {
            find = getFirstRoute(routes[key].children!)
            if (find) return find
        }
    }
    return find
}

export const onClickMenu = (menu: RouteRecordRaw) => {
    switch (menu.meta?.menu_type) {
        case 'iframe':
        case 'tab':
            routePush(menu.path)
            break
        case 'link':
            window.open(menu.path, '_blank')
            break
        default:
            ElNotification({
                message: translate('utils.Navigation failed, the menu type is unrecognized!'),
                type: 'error',
            })
            break
    }

    const config = useConfig()
    if (config.layout.shrink) {
        closeShade(() => {
            config.setLayout('menuCollapse', true)
        })
    }
}

export const handleAdminRoute = (routes: any) => {
    const viewsComponent = import.meta.glob('/src/views/**/*.vue')
    addRouteAll(viewsComponent, routes, adminBaseRoute.name as string)
    const navTabs = useNavTabs()
    navTabs.setTabsViewRoutes(handleMenuRule(routes, '/'))
    navTabs.fillAuthNode(handleAuthNode(routes, '/'))
}

export const getMenuPaths = (menus: RouteRecordRaw[]): string[] => {
    let menuPaths: string[] = []
    menus.forEach((item) => {
        menuPaths.push(item.path)
        if (item.children && item.children.length > 0) {
            menuPaths = menuPaths.concat(getMenuPaths(item.children))
        }
    })
    return menuPaths
}

export const getMenuKey = (menu: RouteRecordRaw, prefix = '') => {
    if (prefix === '') {
        prefix = menu.path
    }
    return `${prefix}-${menu.name as string}-${menu.meta && menu.meta.id ? menu.meta.id : ''}`
}

const handleMenuRule = (routes: any, pathPrefix = '/', type = ['menu', 'menu_dir']) => {
    const menuRule: RouteRecordRaw[] = []
    for (const key in routes) {
        if (routes[key].extend == 'add_rules_only') {
            continue
        }
        if (!type.includes(routes[key].type)) {
            continue
        }
        if (routes[key].type == 'menu_dir' && routes[key].children && !routes[key].children.length) {
            continue
        }
        if (
            ['route', 'menu', 'nav_user_menu', 'nav'].includes(routes[key].type) &&
            ((routes[key].menu_type == 'tab' && !routes[key].component) || (['link', 'iframe'].includes(routes[key].menu_type) && !routes[key].url))
        ) {
            continue
        }

        const currentPath = ['link', 'iframe'].includes(routes[key].menu_type) ? routes[key].url : pathPrefix + routes[key].path
        let children: RouteRecordRaw[] = []
        if (routes[key].children && routes[key].children.length > 0) {
            children = handleMenuRule(routes[key].children, pathPrefix, type)
        }

        menuRule.push({
            path: currentPath,
            name: routes[key].name,
            component: routes[key].component,
            meta: {
                id: routes[key].id,
                title: routes[key].title,
                icon: routes[key].icon,
                keepalive: routes[key].keepalive,
                menu_type: routes[key].menu_type,
                type: routes[key].type,
            },
            children,
        })
    }
    return menuRule
}

const handleAuthNode = (routes: any, prefix = '/') => {
    const authNode: Map<string, string[]> = new Map([])
    assembleAuthNode(routes, authNode, prefix, prefix)
    return authNode
}

const assembleAuthNode = (routes: any, authNode: Map<string, string[]>, prefix = '/', parent = '/') => {
    const authNodeTemp = []
    for (const key in routes) {
        if (routes[key].type == 'button') authNodeTemp.push(prefix + routes[key].name)
        if (routes[key].children && routes[key].children.length > 0) {
            assembleAuthNode(routes[key].children, authNode, prefix, prefix + routes[key].name)
        }
    }
    if (authNodeTemp.length > 0) {
        authNode.set(parent, authNodeTemp)
    }
}

export const addRouteAll = (viewsComponent: Record<string, any>, routes: any, parentName: string, analyticRelation = false) => {
    for (const idx in routes) {
        if (routes[idx].extend == 'add_menu_only') {
            continue
        }
        if ((routes[idx].menu_type == 'tab' && viewsComponent[routes[idx].component]) || routes[idx].menu_type == 'iframe') {
            addRouteItem(viewsComponent, routes[idx], parentName, analyticRelation)
        }

        if (routes[idx].children && routes[idx].children.length > 0) {
            addRouteAll(viewsComponent, routes[idx].children, parentName, analyticRelation)
        }
    }
}

export const addRouteItem = (viewsComponent: Record<string, any>, route: any, parentName: string, analyticRelation: boolean) => {
    const path =
        route.menu_type == 'iframe'
            ? (adminBaseRoute.path as string).replace(/\/$/, '') + '/iframe/' + encodeURIComponent(route.url)
            : parentName
              ? route.path
              : '/' + route.path
    const component = route.menu_type == 'iframe' ? () => import('/@/layouts/common/router-view/iframe.vue') : viewsComponent[route.component]

    if (route.menu_type == 'tab' && analyticRelation) {
        const parentNames = getParentNames(route.name)
        if (parentNames.length) {
            for (const key in parentNames) {
                if (router.hasRoute(parentNames[key])) {
                    parentName = parentNames[key]
                    break
                }
            }
        }
    }

    const routeBaseInfo: RouteRecordRaw = {
        path,
        name: route.name,
        component,
        meta: {
            title: route.title,
            extend: route.extend,
            icon: route.icon,
            keepalive: route.keepalive,
            menu_type: route.menu_type,
            type: route.type,
            url: route.url,
            addtab: true,
        },
    }

    if (parentName) {
        router.addRoute(parentName, routeBaseInfo)
    } else {
        router.addRoute(routeBaseInfo)
    }
}

const getParentNames = (name: string) => {
    const names = compact(name.split('/'))
    const tempNames = []
    const parentNames = []
    for (const key in names) {
        tempNames.push(names[key])
        if (parseInt(key) != names.length - 1) {
            parentNames.push(tempNames.join('/'))
        }
    }
    return reverse(parentNames)
}

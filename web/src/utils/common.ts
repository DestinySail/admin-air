import * as elIcons from '@element-plus/icons-vue'
import { useTitle } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { isArray, isNull, trim, trimStart } from 'lodash-es'
import type { App } from 'vue'
import { nextTick } from 'vue'
import { useSiteConfig } from '../stores/siteConfig'
import { getUrl } from './axios'
import { hasTranslation, translate } from './translate'
import Icon from '/@/components/icon/index.vue'
import router from '/@/router/index'
import { useNavTabs } from '/@/stores/navTabs'

export function registerIcons(app: App) {
    app.component('Icon', Icon)

    const icons = elIcons as any
    for (const i in icons) {
        app.component(`el-icon-${icons[i].name}`, icons[i])
    }
}

export function loadCss(url: string): void {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = 'anonymous'
    document.getElementsByTagName('head')[0].appendChild(link)
}

export function loadJs(url: string): void {
    const link = document.createElement('script')
    link.src = url
    document.body.appendChild(link)
}

export function setTitleFromRoute() {
    nextTick(() => {
        if (typeof router.currentRoute.value.meta.title != 'string') {
            return
        }
        const webTitle = router.currentRoute.value.meta.title
        const title = useTitle()
        const siteConfig = useSiteConfig()
        title.value = `${webTitle}${siteConfig.siteName ? ' - ' + siteConfig.siteName : ''}`
    })
}

export function setTitle(webTitle: string) {
    if (router.currentRoute.value) {
        router.currentRoute.value.meta.title = webTitle
    }
    nextTick(() => {
        const title = useTitle()
        const siteConfig = useSiteConfig()
        title.value = `${webTitle}${siteConfig.siteName ? ' - ' + siteConfig.siteName : ''}`
    })
}

export function isExternal(path: string): boolean {
    return /^(https?|ftp|mailto|tel):/.test(path)
}

export const debounce = (fn: Function, ms: number) => {
    return (...args: any[]) => {
        if (window.lazy) {
            clearTimeout(window.lazy)
        }
        window.lazy = window.setTimeout(() => {
            fn(...args)
        }, ms)
    }
}

export const getArrayKey = (arr: any, pk: string, value: any): any => {
    for (const key in arr) {
        if (arr[key][pk] == value) {
            return key
        }
    }
    return false
}

export const onResetForm = (formEl?: FormInstance | null) => {
    typeof formEl?.resetFields == 'function' && formEl.resetFields()
}

export const buildJsonToElTreeData = (data: any): ElTreeData[] => {
    if (typeof data == 'object') {
        const childrens = []
        for (const key in data) {
            childrens.push({
                label: key + ': ' + data[key],
                children: buildJsonToElTreeData(data[key]),
            })
        }
        return childrens
    }
    return []
}

export const isAdminApp = (path = '') => {
    const target = path || getCurrentRoutePath()
    return !['/401', '/404'].includes(target)
}

export const isMobile = () => {
    return !!navigator.userAgent.match(
        /android|webos|ip(hone|ad|od)|opera (mini|mobi|tablet)|iemobile|windows.+(phone|touch)|mobile|fennec|kindle (Fire)|Silk|maemo|blackberry|playbook|bb10\; (touch|kbd)|Symbian(OS)|Ubuntu Touch/i
    )
}

export const getFileNameFromPath = (path: string) => {
    const paths = path.split('/')
    return paths[paths.length - 1]
}

export function auth(node: string): boolean
export function auth(node: { name: string; subNodeName?: string }): boolean

export function auth(node: string | { name: string; subNodeName?: string }) {
    const store = useNavTabs()
    if (typeof node === 'string') {
        const path = getCurrentRoutePath()
        if (store.state.authNode.has(path)) {
            const subNodeName = path + (path == '/' ? '' : '/') + node
            if (store.state.authNode.get(path)!.some((v: string) => v == subNodeName)) {
                return true
            }
        }
    } else {
        if (!node.name || !store.state.authNode.has(node.name)) return false
        if (!node.subNodeName || store.state.authNode.get(node.name)?.includes(node.subNodeName)) return true
    }
    return false
}

export const fullUrl = (relativeUrl: string, domain = '') => {
    const siteConfig = useSiteConfig()
    if (!domain) {
        domain = siteConfig.cdnUrl ? siteConfig.cdnUrl : getUrl()
    }
    if (!relativeUrl) return domain

    const regUrl = new RegExp(/^http(s)?:\/\//)
    const regexImg = new RegExp(/^((?:[a-z]+:)?\/\/|data:image\/)(.*)/i)
    if (!domain || regUrl.test(relativeUrl) || regexImg.test(relativeUrl)) {
        return relativeUrl
    }

    let url = domain + relativeUrl
    if (domain === siteConfig.cdnUrl && siteConfig.cdnUrlParams) {
        const separator = url.includes('?') ? '&' : '?'
        url += separator + siteConfig.cdnUrlParams
    }
    return url
}

export const getCurrentRoutePath = () => {
    let path = router.currentRoute.value.path
    if (path == '/') path = trimStart(window.location.hash, '#')
    if (path.indexOf('?') !== -1) path = path.replace(/\?.*/, '')
    return path
}

export const __ = (key: string, named?: Record<string, unknown>) => {
    const path = getCurrentRoutePath()
    let langPath = trim(path, '/').replaceAll('/', '.')
    langPath = langPath ? langPath + '.' + key : key
    return hasTranslation(langPath) ? translate(langPath, named ?? {}) : translate(key, named ?? {})
}

export const checkFileMimetype = (fileName: string, fileType: string) => {
    if (!fileName) return false
    const siteConfig = useSiteConfig()
    const allowedSuffixes = isArray(siteConfig.upload.allowedSuffixes)
        ? siteConfig.upload.allowedSuffixes
        : siteConfig.upload.allowedSuffixes.toLowerCase().split(',')

    const allowedMimeTypes = isArray(siteConfig.upload.allowedMimeTypes)
        ? siteConfig.upload.allowedMimeTypes
        : siteConfig.upload.allowedMimeTypes.toLowerCase().split(',')

    const fileSuffix = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    if (allowedSuffixes.includes(fileSuffix) || allowedSuffixes.includes('.' + fileSuffix)) {
        return true
    }
    if (fileType && allowedMimeTypes.includes(fileType)) {
        return true
    }
    return false
}

export const arrayFullUrl = (relativeUrls: string | string[], domain = '') => {
    if (typeof relativeUrls === 'string') {
        relativeUrls = relativeUrls == '' ? [] : relativeUrls.split(',')
    }
    for (const key in relativeUrls) {
        relativeUrls[key] = fullUrl(relativeUrls[key], domain)
    }
    return relativeUrls
}

export const timeFormat = (dateTime: string | number | null = null, fmt = 'yyyy-mm-dd hh:MM:ss') => {
    if (dateTime == 'none') {
        return translate('None')
    }

    if (isNull(dateTime)) {
        dateTime = Number(new Date())
    }

    if (String(dateTime).length === 10 && isFinite(Number(dateTime))) {
        dateTime = +dateTime * 1000
    }

    let date = new Date(dateTime)
    if (isNaN(date.getTime())) {
        date = new Date(Number(dateTime))
        if (isNaN(date.getTime())) {
            return 'Invalid Date'
        }
    }

    let ret
    const opt: anyObj = {
        'y+': date.getFullYear().toString(),
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(),
        'h+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        's+': date.getSeconds().toString(),
    }
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : padStart(opt[k], ret[1].length, '0'))
        }
    }
    return fmt
}

const padStart = (str: string, maxLength: number, fillString = ' ') => {
    if (str.length >= maxLength) return str

    const fillLength = maxLength - str.length
    let times = Math.ceil(fillLength / fillString.length)
    while ((times >>= 1)) {
        fillString += fillString
        if (times === 1) {
            fillString += fillString
        }
    }
    return fillString.slice(0, fillLength) + str
}

export const getGreet = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 5) {
        return translate('utils.Late at night, pay attention to your body!')
    }
    if (hour < 9) {
        return translate('utils.good morning!') + translate('utils.welcome back')
    }
    if (hour < 12) {
        return translate('utils.Good morning!') + translate('utils.welcome back')
    }
    if (hour < 14) {
        return translate('utils.Good noon!') + translate('utils.welcome back')
    }
    if (hour < 18) {
        return translate('utils.good afternoon') + translate('utils.welcome back')
    }
    if (hour < 24) {
        return translate('utils.Good evening') + translate('utils.welcome back')
    }
    return translate('utils.Hello!') + translate('utils.welcome back')
}

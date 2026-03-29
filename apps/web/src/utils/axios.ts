import type { AxiosRequestConfig, Method } from 'axios'
import axios from 'axios'
import { ElLoading, ElNotification, type LoadingOptions } from 'element-plus'
import router from '/@/router'
import { useAdminInfo } from '/@/stores/adminInfo'
import { SYSTEM_ZINDEX } from '/@/stores/constant/common'
import { translate } from '/@/utils/translate'

window.requests = []
window.tokenRefreshing = false
const pendingMap = new Map()
const loadingInstance: LoadingInstance = {
    target: null,
    count: 0,
}

export const getUrl = (): string => {
    const value: string = import.meta.env.VITE_AXIOS_BASE_URL as string
    return value == 'getCurrentDomain' ? window.location.protocol + '//' + window.location.host : value
}

export const getUrlPort = (): string => {
    const url = getUrl()
    return new URL(url).port
}

function createAxios<Data = any, T = ApiPromise<Data>>(axiosConfig: AxiosRequestConfig, options: Options = {}, loading: LoadingOptions = {}): T {
    const adminInfo = useAdminInfo()

    const Axios = axios.create({
        baseURL: getUrl(),
        timeout: 1000 * 10,
        headers: {
            server: true,
        },
        responseType: 'json',
    })

    options = Object.assign(
        {
            cancelDuplicateRequest: true,
            loading: false,
            reductDataFormat: true,
            showErrorMessage: true,
            showCodeMessage: true,
            showSuccessMessage: false,
            anotherToken: '',
        },
        options
    )

    Axios.interceptors.request.use(
        (requestConfig) => {
            removePending(requestConfig)
            options.cancelDuplicateRequest && addPending(requestConfig)

            if (options.loading) {
                loadingInstance.count++
                if (loadingInstance.count === 1) {
                    loadingInstance.target = ElLoading.service(loading)
                }
            }

            if (requestConfig.headers) {
                const token = options.anotherToken || adminInfo.getToken()
                if (token) (requestConfig.headers as anyObj).batoken = token
            }

            return requestConfig
        },
        (error) => Promise.reject(error)
    )

    Axios.interceptors.response.use(
        (response) => {
            removePending(response.config)
            options.loading && closeLoading(options)

            if (response.config.responseType === 'json' && response.data && typeof response.data.code !== 'undefined') {
                if (response.data.code !== 1) {
                    if (response.data.code === 303 || response.data.code === 401) {
                        adminInfo.removeToken()
                        if (router.currentRoute.value.name !== 'adminLogin') {
                            router.push({ name: 'adminLogin' })
                        }
                    }

                    if (options.showCodeMessage) {
                        ElNotification({
                            type: 'error',
                            message: response.data.msg || translate('axios.Abnormal problem, please contact the website administrator!'),
                            zIndex: SYSTEM_ZINDEX,
                        })
                    }
                    return Promise.reject(response.data)
                }

                if (options.showSuccessMessage) {
                    ElNotification({
                        message: response.data.msg ? response.data.msg : translate('axios.Operation successful'),
                        type: 'success',
                        zIndex: SYSTEM_ZINDEX,
                    })
                }
            }

            return options.reductDataFormat ? response.data : response
        },
        (error) => {
            error.config && removePending(error.config)
            options.loading && closeLoading(options)
            options.showErrorMessage && httpErrorStatusHandle(error)
            return Promise.reject(error)
        }
    )

    return Axios(axiosConfig) as T
}

export default createAxios

function httpErrorStatusHandle(error: any) {
    if (axios.isCancel(error)) return

    let message = ''
    if (error && error.response) {
        switch (error.response.status) {
            case 400:
                message = translate('axios.Incorrect parameter!')
                break
            case 401:
            case 403:
                message = translate('axios.You do not have permission to operate!')
                break
            case 404:
                message = translate('axios.Error requesting address:') + error.response.config.url
                break
            case 408:
                message = translate('axios.Request timed out!')
                break
            case 500:
                message = translate('axios.Server internal error!')
                break
            default:
                message = translate('axios.Abnormal problem, please contact the website administrator!')
                break
        }
    }
    if (error.message?.includes('timeout')) message = translate('axios.Network request timeout!')
    if (error.message?.includes('Network')) {
        message = window.navigator.onLine ? translate('axios.Server exception!') : translate('axios.You are disconnected!')
    }

    ElNotification({
        type: 'error',
        message,
        zIndex: SYSTEM_ZINDEX,
    })
}

function closeLoading(options: Options) {
    if (options.loading && loadingInstance.count > 0) loadingInstance.count--
    if (loadingInstance.count === 0 && loadingInstance.target) {
        loadingInstance.target.close()
        loadingInstance.target = null
    }
}

function addPending(config: AxiosRequestConfig) {
    const pendingKey = getPendingKey(config)
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
            if (!pendingMap.has(pendingKey)) {
                pendingMap.set(pendingKey, cancel)
            }
        })
}

function removePending(config: AxiosRequestConfig) {
    const pendingKey = getPendingKey(config)
    if (pendingMap.has(pendingKey)) {
        const cancelToken = pendingMap.get(pendingKey)
        cancelToken(pendingKey)
        pendingMap.delete(pendingKey)
    }
}

function getPendingKey(config: AxiosRequestConfig) {
    let { data } = config
    const { url, method, params, headers } = config
    if (typeof data === 'string') data = JSON.parse(data)
    return [
        url,
        method,
        headers && (headers as anyObj).batoken ? (headers as anyObj).batoken : '',
        JSON.stringify(params),
        JSON.stringify(data),
    ].join('&')
}

export function requestPayload(method: Method, data: anyObj) {
    if (method == 'GET') {
        return {
            params: data,
        }
    } else if (method == 'POST') {
        return {
            data: data,
        }
    }
}

interface LoadingInstance {
    target: any
    count: number
}

interface Options {
    cancelDuplicateRequest?: boolean
    loading?: boolean
    reductDataFormat?: boolean
    showErrorMessage?: boolean
    showCodeMessage?: boolean
    showSuccessMessage?: boolean
    anotherToken?: string
}

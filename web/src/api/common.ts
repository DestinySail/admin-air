import type { AxiosRequestConfig } from 'axios'
import { ElNotification, type UploadRawFile } from 'element-plus'
import createAxios, { getUrl } from '/@/utils/axios'
import { checkFileMimetype } from '/@/utils/common'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useSiteConfig } from '/@/stores/siteConfig'
import { SYSTEM_ZINDEX } from '/@/stores/constant/common'
import { uuid } from '/@/utils/random'
import { translate } from '/@/utils/translate'

export const adminUploadUrl = '/admin/ajax/upload'
export const adminBuildSuffixSvgUrl = '/admin/ajax/buildSuffixSvg'
export const adminAreaUrl = '/admin/ajax/area'
export const refreshTokenUrl = '/api/common/refreshToken'

export function fileUpload(fd: FormData, params: anyObj = {}, _forceLocal = false, config: AxiosRequestConfig = {}): ApiPromise {
    let errorMsg = ''
    const file = fd.get('file') as UploadRawFile
    const siteConfig = useSiteConfig()

    if (!file.name || typeof file.size == 'undefined') {
        errorMsg = translate('utils.The data of the uploaded file is incomplete!')
    } else if (!checkFileMimetype(file.name, file.type)) {
        errorMsg = translate('utils.The type of uploaded file is not allowed!')
    } else if (file.size > siteConfig.upload.maxSize) {
        errorMsg = translate('utils.The size of the uploaded file exceeds the allowed range!')
    }

    if (errorMsg) {
        return new Promise((resolve, reject) => {
            ElNotification({
                type: 'error',
                message: errorMsg,
                zIndex: SYSTEM_ZINDEX,
            })
            reject(errorMsg)
        })
    }

    return createAxios({
        url: adminUploadUrl,
        method: 'POST',
        data: fd,
        params,
        timeout: 0,
        ...config,
    })
}

export function buildSuffixSvgUrl(suffix: string, background = '') {
    const adminInfo = useAdminInfo()
    return (
        getUrl() +
        adminBuildSuffixSvgUrl +
        '?batoken=' +
        adminInfo.getToken() +
        '&suffix=' +
        suffix +
        (background ? '&background=' + background : '') +
        '&server=1'
    )
}

export function getArea(values: number[]) {
    const params: { province?: number; city?: number; uuid?: string } = {}
    if (values[0]) params.province = values[0]
    if (values[1]) params.city = values[1]
    params.uuid = uuid()
    return createAxios({
        url: adminAreaUrl,
        method: 'GET',
        params,
    })
}

export function getSelectData(remoteUrl: string, q: string, params: anyObj = {}) {
    return createAxios({
        url: remoteUrl,
        method: 'get',
        params: {
            select: true,
            quickSearch: q,
            ...params,
        },
    })
}

export function refreshToken() {
    const adminInfo = useAdminInfo()
    return createAxios({
        url: refreshTokenUrl,
        method: 'POST',
        data: {
            refreshToken: adminInfo.getToken('refresh'),
        },
    })
}

export class baTableApi {
    private controllerUrl
    public actionUrl

    constructor(controllerUrl: string) {
        this.controllerUrl = controllerUrl
        this.actionUrl = new Map([
            ['index', controllerUrl + 'index'],
            ['add', controllerUrl + 'add'],
            ['edit', controllerUrl + 'edit'],
            ['del', controllerUrl + 'del'],
            ['sortable', controllerUrl + 'sortable'],
        ])
    }

    index(filter: BaTable['filter'] = {}) {
        return createAxios<TableDefaultData>({
            url: this.actionUrl.get('index'),
            method: 'get',
            params: filter,
        })
    }

    edit(params: anyObj) {
        return createAxios({
            url: this.actionUrl.get('edit'),
            method: 'get',
            params,
        })
    }

    del(ids: string[]) {
        return createAxios(
            {
                url: this.actionUrl.get('del'),
                method: 'DELETE',
                params: {
                    ids,
                },
            },
            {
                showSuccessMessage: true,
            }
        )
    }

    postData(action: string, data: anyObj) {
        return createAxios(
            {
                url: this.actionUrl.has(action) ? this.actionUrl.get(action) : this.controllerUrl + action,
                method: 'post',
                data,
            },
            {
                showSuccessMessage: true,
            }
        )
    }

    sortable(data: anyObj) {
        return createAxios({
            url: this.actionUrl.get('sortable'),
            method: 'post',
            data,
        })
    }
}

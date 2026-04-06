import createAxios from '/@/utils/axios'

export function index() {
    return createAxios(
        {
            url: '/api/admin/init',
            method: 'get',
        },
        {
            showErrorMessage: false,
            showCodeMessage: false,
        }
    )
}

export function login(params: object = {}) {
    return createAxios({
        url: '/api/auth/login',
        data: params,
        method: 'post',
    })
}

export function logout() {
    return createAxios({
        url: '/api/auth/logout',
        method: 'post',
    })
}

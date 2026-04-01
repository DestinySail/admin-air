export interface CurrentAdmin {
    id: number
    username: string
    nickname: string
    avatar: string
    email: string
    mobile: string
    motto: string
    status: 'enable' | 'disable'
    super: boolean
    last_login_time: string
}

export interface AppEnv {
    Variables: {
        admin: CurrentAdmin | null
        sessionId: string | null
        accessToken: string | null
    }
}

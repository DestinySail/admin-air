<template>
    <div>
        <div @contextmenu.stop="" id="bubble" class="bubble">
            <canvas id="bubble-canvas" class="bubble-canvas"></canvas>
        </div>
        <div class="login">
            <div class="login-box">
                <div class="head">
                    <img src="~assets/login-header.png" alt="" />
                </div>
                <div class="form">
                    <img class="profile-avatar" :src="fullUrl('/static/images/avatar.png')" alt="" />
                    <div class="content">
                        <el-form ref="formRef" :rules="rules" size="large" :model="form" @keyup.enter="onSubmitPre()">
                            <el-form-item prop="username">
                                <el-input
                                    ref="usernameRef"
                                    v-model="form.username"
                                    type="text"
                                    clearable
                                    :placeholder="t('login.Please enter an account')"
                                >
                                    <template #prefix>
                                        <Icon name="fa fa-user" class="form-item-icon" size="16" color="var(--el-input-icon-color)" />
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input
                                    ref="passwordRef"
                                    v-model="form.password"
                                    type="password"
                                    :placeholder="t('login.Please input a password')"
                                    show-password
                                >
                                    <template #prefix>
                                        <Icon name="fa fa-unlock-alt" class="form-item-icon" size="16" color="var(--el-input-icon-color)" />
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-checkbox v-model="form.keep" :label="t('login.Hold session')" size="default"></el-checkbox>
                            <el-form-item>
                                <el-button
                                    :loading="state.submitLoading"
                                    class="submit-button"
                                    round
                                    type="primary"
                                    size="large"
                                    @click="onSubmitPre()"
                                >
                                    {{ t('login.Sign in') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, useTemplateRef } from 'vue'
import * as pageBubble from '/@/utils/pageBubble'
import { login } from '/@/api/backend'
import router from '/@/router'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useConfig } from '/@/stores/config'
import { fullUrl } from '/@/utils/common'
import { translate as t } from '/@/utils/translate'
import toggleDark from '/@/utils/useDark'
import { buildValidatorData } from '/@/utils/validate'

let timer: number

const config = useConfig()
const adminInfo = useAdminInfo()
toggleDark(config.layout.isDark)

const formRef = useTemplateRef('formRef')
const usernameRef = useTemplateRef('usernameRef')
const passwordRef = useTemplateRef('passwordRef')

const state = reactive({
    submitLoading: false,
})

const form = reactive({
    username: 'admin',
    password: 'AdminAir_2026',
    keep: false,
})

const rules = reactive({
    username: [buildValidatorData({ name: 'required', message: t('login.Please enter an account') })],
    password: [buildValidatorData({ name: 'required', message: t('login.Please input a password') })],
})

const focusInput = () => {
    if (form.username === '') {
        usernameRef.value?.focus()
    } else if (form.password === '') {
        passwordRef.value?.focus()
    }
}

onMounted(() => {
    timer = window.setTimeout(() => {
        pageBubble.init()
    }, 1000)
    nextTick(() => focusInput())
})

onBeforeUnmount(() => {
    clearTimeout(timer)
    pageBubble.removeListeners()
})

const onSubmitPre = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            onSubmit()
        }
    })
}

const onSubmit = () => {
    state.submitLoading = true
    login(form)
        .then((res) => {
            adminInfo.dataFill(
                {
                    ...res.data.userInfo,
                    token: res.data.token,
                    refresh_token: res.data.refresh_token,
                },
                false
            )
            router.push({ path: '/' })
        })
        .catch(() => undefined)
        .finally(() => {
            state.submitLoading = false
        })
}
</script>

<style scoped lang="scss">
.bubble {
    overflow: hidden;
    background: url(/@/assets/bg.jpg) repeat;
}
.form-item-icon {
    height: auto;
}
.login {
    position: absolute;
    top: 0;
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
    .login-box {
        overflow: hidden;
        width: 430px;
        padding: 0;
        background: var(--ba-bg-color-overlay);
        margin-bottom: 80px;
    }
    .head {
        background: #ccccff;
        img {
            display: block;
            width: 430px;
            margin: 0 auto;
            user-select: none;
        }
    }
    .form {
        position: relative;
        .profile-avatar {
            display: block;
            position: absolute;
            height: 100px;
            width: 100px;
            border-radius: 50%;
            border: 4px solid var(--ba-bg-color-overlay);
            top: -50px;
            right: calc(50% - 50px);
            z-index: 2;
            user-select: none;
        }
        .content {
            padding: 100px 40px 40px 40px;
        }
        .submit-button {
            width: 100%;
            letter-spacing: 2px;
            font-weight: 300;
            margin-top: 15px;
            --el-button-bg-color: var(--el-color-primary);
        }
    }
}

@media screen and (max-width: 720px) {
    .login {
        display: flex;
        align-items: center;
        justify-content: center;
        .login-box {
            width: 340px;
            margin-top: 0;
        }
    }
}
.content :deep(.el-input__prefix) {
    display: flex;
    align-items: center;
}

@at-root .dark {
    .bubble {
        background: url(/@/assets/bg-dark.jpg) repeat;
    }
    .login {
        .login-box {
            background: #161b22;
        }
        .head {
            img {
                filter: brightness(61%);
            }
        }
        .form {
            .submit-button {
                --el-button-bg-color: var(--el-color-primary-light-5);
                --el-button-border-color: rgba(240, 252, 241, 0.1);
            }
        }
    }
}
@media screen and (max-height: 800px) {
    .login .login-box {
        margin-bottom: 0;
    }
}
</style>

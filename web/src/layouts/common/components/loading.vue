<template>
    <div class="startup-screen">
        <div
            v-if="!siteConfig.initializeFailed"
            v-loading="true"
            element-loading-background="transparent"
            :element-loading-text="t('utils.Loading')"
            class="startup-panel startup-panel--loading"
        ></div>
        <div v-else class="startup-panel startup-panel--failed">
            <div class="startup-panel__status">{{ t('utils.Service unavailable') }}</div>
            <div class="startup-panel__title">{{ t('utils.Startup failed') }}</div>
            <div class="startup-panel__subtitle">{{ t('utils.Please ensure the backend service is running and reload') }}</div>
        </div>
        <div v-if="showReloadButton" class="startup-actions">
            <el-button @click="refresh" type="warning">{{ t('utils.Reload') }}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue'
import router from '/@/router/index'
import { useSiteConfig } from '/@/stores/siteConfig'
import { translate as t } from '/@/utils/translate'

let timer: number

const siteConfig = useSiteConfig()
const state = reactive({
    maximumWait: 1000 * 6,
    showReload: false,
})
const showReloadButton = computed(() => siteConfig.initializeFailed || state.showReload)

const refresh = () => {
    router.go(0)
}

timer = window.setTimeout(() => {
    state.showReload = true
}, state.maximumWait)

onUnmounted(() => {
    clearTimeout(timer)
})
</script>

<style scoped lang="scss">
.startup-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
        radial-gradient(circle at top, rgba(64, 158, 255, 0.08), transparent 48%),
        linear-gradient(180deg, var(--ba-bg-color-overlay) 0%, var(--ba-bg-color) 100%);
}

.startup-panel {
    width: min(520px, 100%);
    min-height: 260px;
    padding: 32px 24px;
    border-radius: var(--el-border-radius-base);
    background: var(--ba-bg-color-overlay);
    box-shadow: var(--el-box-shadow-light);
}

.startup-panel--failed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 14px;
    text-align: center;
}

.startup-panel__status {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: var(--el-color-danger);
}

.startup-panel__title {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
}

.startup-panel__subtitle {
    max-width: 360px;
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
}

.startup-actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}
</style>

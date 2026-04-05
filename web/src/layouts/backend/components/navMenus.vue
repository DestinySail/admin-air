<template>
    <div class="nav-menus" :class="[configStore.layout.layoutMode, configStore.layout.shrink ? 'shrink' : '']">
        <button class="nav-search-trigger" :style="searchTriggerStyle" type="button" @click="menuSearchPanel.open()">
            <span class="nav-search-trigger__icon">
                <Icon :color="searchTriggerColors.icon" class="nav-menu-icon" name="el-icon-Search" size="16" />
            </span>
            <span class="nav-search-trigger__text">搜索菜单</span>
            <span class="nav-search-trigger__shortcut">{{ shortcutLabel }}</span>
        </button>

        <div class="nav-menu-item" :title="t('Home')" @click="onConsoleEntry">
            <Icon :color="configStore.getColorVal('headerBarTabColor')" class="nav-menu-icon" name="el-icon-Monitor" size="18" />
        </div>

        <div @click="onFullScreen" class="nav-menu-item" :class="state.isFullScreen ? 'hover' : ''">
            <Icon
                :color="configStore.getColorVal('headerBarTabColor')"
                class="nav-menu-icon"
                v-if="state.isFullScreen"
                name="local-full-screen-cancel"
                size="18"
            />
            <Icon :color="configStore.getColorVal('headerBarTabColor')" class="nav-menu-icon" v-else name="el-icon-FullScreen" size="18" />
        </div>

        <el-popover
            v-if="siteConfig.userInitialize"
            @show="onCurrentNavMenu(true, 'adminInfo')"
            @hide="onCurrentNavMenu(false, 'adminInfo')"
            placement="bottom-end"
            :hide-after="0"
            :width="260"
            trigger="click"
            popper-class="admin-info-box"
            v-model:visible="state.showAdminInfoPopover"
        >
            <template #reference>
                <div class="admin-info" :class="state.currentNavMenu == 'adminInfo' ? 'hover' : ''">
                    <el-avatar :size="25" :src="fullUrl(adminInfo.avatar)" />
                    <div class="admin-name">{{ adminInfo.nickname }}</div>
                </div>
            </template>
            <div>
                <div class="admin-info-base">
                    <el-avatar :size="70" :src="fullUrl(adminInfo.avatar)" />
                    <div class="admin-info-other">
                        <div class="admin-info-name">{{ adminInfo.nickname }}</div>
                        <div class="admin-info-lasttime">{{ timeFormat(adminInfo.last_login_time) }}</div>
                    </div>
                </div>
                <div class="admin-info-footer">
                    <el-button @click="onAdminInfo" type="primary" plain>{{ t('layouts.Profile') }}</el-button>
                    <el-button @click="onLogout" type="danger" plain>{{ t('layouts.Logout') }}</el-button>
                </div>
            </div>
        </el-popover>

        <div @click="configStore.setLayout('showDrawer', true)" class="nav-menu-item">
            <Icon :color="configStore.getColorVal('headerBarTabColor')" class="nav-menu-icon" name="fa fa-cogs" size="18" />
        </div>

        <Config />
    </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import Config from './config.vue'
import { logout } from '/@/api/backend/index'
import router from '/@/router'
import { useAdminInfo } from '/@/stores/adminInfo'
import { ADMIN_INFO } from '/@/stores/constant/cacheKey'
import { useConfig } from '/@/stores/config'
import { useMenuSearchPanel } from '/@/stores/menuSearch'
import { useSiteConfig } from '/@/stores/siteConfig'
import { fullUrl, timeFormat } from '/@/utils/common'
import { routePush } from '/@/utils/router'
import { Local } from '/@/utils/storage'
import { translate as t } from '/@/utils/translate'

const adminInfo = useAdminInfo()
const configStore = useConfig()
const siteConfig = useSiteConfig()
const menuSearchPanel = useMenuSearchPanel()

const state = reactive({
    isFullScreen: Boolean(document.fullscreenElement),
    currentNavMenu: '',
    showAdminInfoPopover: false,
})

const shortcutLabel = computed(() => {
    if (typeof navigator === 'undefined') return 'Ctrl+K'
    return /mac|iphone|ipad|ipod/i.test(navigator.platform) ? 'Cmd+K' : 'Ctrl+K'
})

const searchTriggerColors = computed(() => {
    const isDark = configStore.layout.isDark
    return {
        icon: isDark ? '#b7c8ff' : '#5a74dd',
        text: isDark ? '#edf2ff' : '#273252',
    }
})

const searchTriggerStyle = computed(() => {
    const isDark = configStore.layout.isDark
    return {
        color: searchTriggerColors.value.text,
        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(57, 82, 154, 0.14)',
        boxShadow: isDark ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.04)',
    }
})

const syncFullscreenState = () => {
    state.isFullScreen = Boolean(document.fullscreenElement)
}

onMounted(() => {
    document.addEventListener('fullscreenchange', syncFullscreenState)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', syncFullscreenState)
})

const onCurrentNavMenu = (status: boolean, name: string) => {
    state.currentNavMenu = status ? name : ''
}

const onConsoleEntry = () => {
    ElMessage.info('控制台快捷入口暂未开放')
}

const onFullScreen = async () => {
    const target = document.documentElement
    try {
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) {
                await target.requestFullscreen()
            } else {
                ElMessage.warning(t('layouts.Full screen is not supported'))
                return
            }
        } else if (document.exitFullscreen) {
            await document.exitFullscreen()
        }
        syncFullscreenState()
    } catch {
        ElMessage.warning('全屏切换失败，请检查浏览器权限')
    }
}

const onAdminInfo = () => {
    state.showAdminInfoPopover = false
    routePush({ path: '/routine/adminInfo' })
}

const onLogout = () => {
    logout().then(() => {
        Local.remove(ADMIN_INFO)
        router.go(0)
    })
}
</script>

<style scoped lang="scss">
.nav-menus.Default:not(.shrink) {
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
}

.nav-menus {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
    margin-left: auto;
    background-color: v-bind('configStore.getColorVal("headerBarBackground")');

    .nav-search-trigger {
        display: grid;
        grid-template-columns: 16px minmax(68px, 1fr) auto;
        align-items: center;
        column-gap: 8px;
        min-width: 148px;
        height: 30px;
        margin: 0 6px;
        padding: 0 8px 0 10px;
        border: 1px solid;
        border-radius: 4px;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;

        .nav-search-trigger__icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .nav-search-trigger__text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
        }

        .nav-search-trigger__shortcut {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 42px;
            height: 20px;
            padding: 0 6px;
            border-radius: 4px;
            background: v-bind('configStore.layout.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(72, 95, 169, 0.08)"');
            color: v-bind('configStore.layout.isDark ? "rgba(237, 242, 255, 0.76)" : "rgba(39, 50, 82, 0.7)"');
            font-size: 11px;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
        }

        &:hover {
            background: v-bind('configStore.layout.isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(248, 250, 255, 1)"') !important;
            border-color: v-bind('configStore.layout.isDark ? "rgba(180, 197, 255, 0.16)" : "rgba(57, 82, 154, 0.18)"') !important;
        }
    }

    .nav-menu-item {
        height: 100%;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .nav-menu-icon {
            box-sizing: content-box;
            color: v-bind('configStore.getColorVal("headerBarTabColor")');
        }

        &:hover {
            .icon {
                animation: twinkle 0.3s ease-in-out;
            }
        }
    }

    .admin-info {
        display: flex;
        height: 100%;
        padding: 0 10px;
        align-items: center;
        cursor: pointer;
        user-select: none;
        color: v-bind('configStore.getColorVal("headerBarTabColor")');
    }

    .admin-name {
        padding-left: 6px;
        white-space: nowrap;
    }

    .nav-menu-item:hover,
    .admin-info:hover,
    .nav-menu-item.hover,
    .admin-info.hover {
        background: v-bind('configStore.getColorVal("headerBarHoverBackground")');
    }
}

@media screen and (max-width: 768px) {
    .nav-menus {
        .nav-search-trigger {
            min-width: 30px;
            width: 30px;
            grid-template-columns: 1fr;
            margin: 0 4px;
            padding: 0;
            justify-content: center;

            .nav-search-trigger__text,
            .nav-search-trigger__shortcut {
                display: none;
            }
        }
    }
}

.admin-info-base {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding-top: 10px;

    .admin-info-other {
        display: block;
        width: 100%;
        text-align: center;
        padding: 10px 0;

        .admin-info-name {
            font-size: var(--el-font-size-large);
        }
    }
}

.admin-info-footer {
    padding: 10px 0;
    margin: 0 -12px -12px -12px;
    display: flex;
    justify-content: space-around;
}

@keyframes twinkle {
    0% {
        transform: scale(0);
    }
    80% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}
</style>

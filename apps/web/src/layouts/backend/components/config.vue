<template>
    <div class="layout-config-drawer">
        <el-drawer :model-value="configStore.layout.showDrawer" :title="t('layouts.Layout configuration')" size="310px" @close="onCloseDrawer">
            <el-scrollbar class="layout-mode-style-scrollbar">
                <div class="layout-mode-styles-box">
                    <el-divider border-style="dashed">{{ t('layouts.Layout mode') }}</el-divider>
                    <div class="layout-mode-box-style">
                        <el-row class="layout-mode-box-style-row" :gutter="10">
                            <el-col :span="12">
                                <div
                                    @click="setLayoutMode('Default')"
                                    class="layout-mode-style default"
                                    :class="configStore.layout.layoutMode == 'Default' ? 'active' : ''"
                                >
                                    <div class="layout-mode-style-box">
                                        <div class="layout-mode-style-aside"></div>
                                        <div class="layout-mode-style-container-box">
                                            <div class="layout-mode-style-header"></div>
                                            <div class="layout-mode-style-container"></div>
                                        </div>
                                    </div>
                                    <div class="layout-mode-style-name">{{ t('layouts.default') }}</div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div @click="setLayoutMode('Classic')" class="layout-mode-style classic disabled">
                                    <div class="layout-mode-style-box">
                                        <div class="layout-mode-style-aside"></div>
                                        <div class="layout-mode-style-container-box">
                                            <div class="layout-mode-style-header"></div>
                                            <div class="layout-mode-style-container"></div>
                                        </div>
                                    </div>
                                    <div class="layout-mode-style-name">{{ t('layouts.classic') }}</div>
                                </div>
                            </el-col>
                        </el-row>
                        <el-row :gutter="10">
                            <el-col :span="12">
                                <div @click="setLayoutMode('Streamline')" class="layout-mode-style streamline disabled">
                                    <div class="layout-mode-style-box">
                                        <div class="layout-mode-style-container-box">
                                            <div class="layout-mode-style-header"></div>
                                            <div class="layout-mode-style-container"></div>
                                        </div>
                                    </div>
                                    <div class="layout-mode-style-name">{{ t('layouts.Single column') }}</div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div @click="setLayoutMode('Double')" class="layout-mode-style double disabled">
                                    <div class="layout-mode-style-box">
                                        <div class="layout-mode-style-aside"></div>
                                        <div class="layout-mode-style-container-box">
                                            <div class="layout-mode-style-header"></div>
                                            <div class="layout-mode-style-container"></div>
                                        </div>
                                    </div>
                                    <div class="layout-mode-style-name">{{ t('layouts.Double column') }}</div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>

                    <el-divider border-style="dashed">{{ t('layouts.overall situation') }}</el-divider>
                    <div class="layout-config-section">
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Dark mode') }}</div>
                            <div class="config-control">
                                <DarkSwitch @click="toggleDark()" />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Background page switching animation') }}</div>
                            <div class="config-control">
                                <el-select
                                    @change="onCommitState($event, 'mainAnimation')"
                                    :model-value="configStore.layout.mainAnimation"
                                    :placeholder="t('layouts.Please select an animation name')"
                                >
                                    <el-option label="slide-right" value="slide-right"></el-option>
                                    <el-option label="slide-left" value="slide-left"></el-option>
                                    <el-option label="el-fade-in-linear" value="el-fade-in-linear"></el-option>
                                    <el-option label="el-fade-in" value="el-fade-in"></el-option>
                                    <el-option label="el-zoom-in-center" value="el-zoom-in-center"></el-option>
                                    <el-option label="el-zoom-in-top" value="el-zoom-in-top"></el-option>
                                    <el-option label="el-zoom-in-bottom" value="el-zoom-in-bottom"></el-option>
                                </el-select>
                            </div>
                        </div>
                    </div>

                    <el-divider border-style="dashed">{{ t('layouts.sidebar') }}</el-divider>
                    <div class="layout-config-section">
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu bar background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuBackground')"
                                    :model-value="configStore.getColorVal('menuBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu text color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuColor')"
                                    :model-value="configStore.getColorVal('menuColor')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu active item background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuActiveBackground')"
                                    :model-value="configStore.getColorVal('menuActiveBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu active item text color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuActiveColor')"
                                    :model-value="configStore.getColorVal('menuActiveColor')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu hover background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuHoverBackground')"
                                    :model-value="configStore.getColorVal('menuHoverBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Show side menu top bar (logo bar)') }}</div>
                            <div class="config-control">
                                <el-switch @change="onCommitState($event, 'menuShowTopBar')" :model-value="configStore.layout.menuShowTopBar" />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu top bar background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'menuTopBarBackground')"
                                    :model-value="configStore.getColorVal('menuTopBarBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu width (when expanded)') }}</div>
                            <div class="config-control">
                                <el-input
                                    @input="onCommitState($event, 'menuWidth')"
                                    type="number"
                                    :step="10"
                                    :model-value="configStore.layout.menuWidth"
                                >
                                    <template #append>px</template>
                                </el-input>
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu default icon') }}</div>
                            <div class="config-control">
                                <IconSelector
                                    @change="onCommitMenuDefaultIcon($event, 'menuDefaultIcon')"
                                    :model-value="configStore.layout.menuDefaultIcon"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu horizontal collapse') }}</div>
                            <div class="config-control">
                                <el-switch @change="onCommitState($event, 'menuCollapse')" :model-value="configStore.layout.menuCollapse" />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Side menu accordion') }}</div>
                            <div class="config-control">
                                <el-switch @change="onCommitState($event, 'menuUniqueOpened')" :model-value="configStore.layout.menuUniqueOpened" />
                            </div>
                        </div>
                    </div>

                    <el-divider border-style="dashed">{{ t('layouts.Top bar') }}</el-divider>
                    <div class="layout-config-section">
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Top bar background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'headerBarBackground')"
                                    :model-value="configStore.getColorVal('headerBarBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Top bar text color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'headerBarTabColor')"
                                    :model-value="configStore.getColorVal('headerBarTabColor')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Background color when hovering over the top bar') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'headerBarHoverBackground')"
                                    :model-value="configStore.getColorVal('headerBarHoverBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Top bar menu active item background color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'headerBarTabActiveBackground')"
                                    :model-value="configStore.getColorVal('headerBarTabActiveBackground')"
                                />
                            </div>
                        </div>
                        <div class="config-item">
                            <div class="config-label">{{ t('layouts.Top bar menu active item text color') }}</div>
                            <div class="config-control">
                                <el-color-picker
                                    @change="onCommitColorState($event, 'headerBarTabActiveColor')"
                                    :model-value="configStore.getColorVal('headerBarTabActiveColor')"
                                />
                            </div>
                        </div>
                    </div>

                    <el-popconfirm
                        @confirm="restoreDefault"
                        :title="t('layouts.Are you sure you want to restore all configurations to the default values?')"
                    >
                        <template #reference>
                            <div class="ba-center">
                                <el-button class="w80" type="info">{{ t('layouts.Restore default') }}</el-button>
                            </div>
                        </template>
                    </el-popconfirm>
                </div>
            </el-scrollbar>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import IconSelector from '/@/components/baInput/components/iconSelector.vue'
import DarkSwitch from '/@/layouts/common/components/darkSwitch.vue'
import { useConfig } from '/@/stores/config'
import { BEFORE_RESIZE_LAYOUT, STORE_CONFIG } from '/@/stores/constant/cacheKey'
import type { Layout } from '/@/stores/interface'
import { useNavTabs } from '/@/stores/navTabs'
import { Local, Session } from '/@/utils/storage'
import { translate as t } from '/@/utils/translate'
import toggleDark from '/@/utils/useDark'
const configStore = useConfig()
const navTabs = useNavTabs()
const router = useRouter()

const onCommitState = (value: any, name: keyof Layout) => {
    configStore.setLayout(name, value)
}

const onCommitColorState = (value: string | null, name: keyof Layout) => {
    if (value === null) return
    const colors = configStore.layout[name] as string[]
    if (configStore.layout.isDark) {
        colors[1] = value
    } else {
        colors[0] = value
    }
    configStore.setLayout(name, colors)
}

const setLayoutMode = (mode: string) => {
    if (mode !== 'Default') return
    Session.set(BEFORE_RESIZE_LAYOUT, {
        layoutMode: mode,
        menuCollapse: configStore.layout.menuCollapse,
    })
    configStore.setLayoutMode(mode)
}

const onCommitMenuDefaultIcon = (value: string, name: keyof Layout) => {
    configStore.setLayout(name, value)

    const menus = navTabs.state.tabsViewRoutes
    navTabs.setTabsViewRoutes([])
    nextTick(() => {
        navTabs.setTabsViewRoutes(menus)
    })
}

const onCloseDrawer = () => {
    configStore.setLayout('showDrawer', false)
}

const restoreDefault = () => {
    Local.remove(STORE_CONFIG)
    Session.remove(BEFORE_RESIZE_LAYOUT)
    router.go(0)
}
</script>

<style scoped lang="scss">
.layout-config-drawer :deep(.el-input__inner) {
    padding: 0 0 0 6px;
}
.layout-config-drawer :deep(.el-input-group__append) {
    padding: 0 10px;
}
.layout-config-drawer :deep(.el-drawer__header) {
    margin-bottom: 0 !important;
}
.layout-config-drawer :deep(.el-drawer__body) {
    padding: 0;
}
.layout-mode-styles-box {
    padding: 20px;
}
.layout-mode-box-style-row {
    margin-bottom: 15px;
}
.layout-config-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.config-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 32px;
}
.config-label {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--el-text-color-regular);
    line-height: 1.5;
}
.config-control {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 0 0 140px;
    min-width: 140px;
}
.config-control :deep(.el-select),
.config-control :deep(.el-input),
.config-control :deep(.el-input-number) {
    width: 100%;
}
.layout-mode-style {
    position: relative;
    height: 100px;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-small);
    &:hover,
    &.active {
        border: 1px solid var(--el-color-primary);
    }
    .layout-mode-style-name {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-color-primary-light-5);
        border-radius: 50%;
        height: 50px;
        width: 50px;
        border: 1px solid var(--el-color-primary-light-3);
    }
    .layout-mode-style-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
    &.disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
    &.default {
        display: flex;
        align-items: center;
        justify-content: center;
        .layout-mode-style-aside {
            width: 18%;
            height: 90%;
            background-color: var(--el-border-color-lighter);
        }
        .layout-mode-style-container-box {
            width: 68%;
            height: 90%;
            margin-left: 4%;
            .layout-mode-style-header {
                width: 100%;
                height: 10%;
                background-color: var(--el-border-color-lighter);
            }
            .layout-mode-style-container {
                width: 100%;
                height: 85%;
                background-color: var(--el-border-color-extra-light);
                margin-top: 5%;
            }
        }
    }
    &.classic {
        display: flex;
        align-items: center;
        justify-content: center;
        .layout-mode-style-aside {
            width: 18%;
            height: 100%;
            background-color: var(--el-border-color-lighter);
        }
        .layout-mode-style-container-box {
            width: 82%;
            height: 100%;
            .layout-mode-style-header {
                width: 100%;
                height: 10%;
                background-color: var(--el-border-color);
            }
            .layout-mode-style-container {
                width: 100%;
                height: 90%;
                background-color: var(--el-border-color-extra-light);
            }
        }
    }
    &.streamline {
        display: flex;
        align-items: center;
        justify-content: center;
        .layout-mode-style-container-box {
            width: 100%;
            height: 100%;
            .layout-mode-style-header {
                width: 100%;
                height: 10%;
                background-color: var(--el-border-color);
            }
            .layout-mode-style-container {
                width: 100%;
                height: 90%;
                background-color: var(--el-border-color-extra-light);
            }
        }
    }
    &.double {
        display: flex;
        align-items: center;
        justify-content: center;
        .layout-mode-style-aside {
            width: 18%;
            height: 100%;
            background-color: var(--el-border-color);
        }
        .layout-mode-style-container-box {
            width: 82%;
            height: 100%;
            .layout-mode-style-header {
                width: 100%;
                height: 10%;
                background-color: var(--el-border-color);
            }
            .layout-mode-style-container {
                width: 100%;
                height: 90%;
                background-color: var(--el-border-color-extra-light);
            }
        }
    }
}
.w80 {
    width: 90%;
}
</style>

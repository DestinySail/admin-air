<template>
    <el-dialog
        class="menu-search-dialog"
        :model-value="menuSearchPanel.isOpen"
        :show-close="false"
        :close-on-click-modal="true"
        :close-on-press-escape="false"
        :append-to-body="true"
        width="680px"
        top="11vh"
        modal-class="menu-search-dialog-modal"
        @close="closePanel"
    >
        <div class="menu-search-shell" :style="themeVars">
            <div class="menu-search-bar-wrap">
                <div class="menu-search-bar">
                    <div class="menu-search-bar__icon">
                        <Icon :color="themeColors.icon" name="el-icon-Search" size="18px" />
                    </div>
                    <input
                        ref="searchInput"
                        :value="query"
                        id="menu-search-input"
                        name="menu-search"
                        class="menu-search-bar__input"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="搜索菜单、父级或路由关键字"
                        @input="onQueryInput"
                    />
                    <div v-if="query" class="menu-search-bar__tools">
                        <button class="menu-search-bar__action is-text" type="button" @click="search.clearQuery()">清空</button>
                        <span class="menu-search-bar__divider" aria-hidden="true"></span>
                    </div>
                    <button class="menu-search-bar__action is-icon" type="button" @click="closePanel">
                        <Icon class="menu-search-bar__close-icon" :color="themeColors.mutedText" name="el-icon-Close" size="16px" />
                    </button>
                </div>
            </div>

            <div class="menu-search-body" :class="{ 'is-empty': !hasQuery, 'is-expanded': hasQuery }">
                <transition name="menu-search-results" mode="out-in">
                    <div v-if="showResults" class="menu-search-list" key="results">
                        <button
                            v-for="(item, index) in displayedItems"
                            :key="item.id"
                            :ref="resultRefs.set"
                            :class="['menu-search-item', activeIndex === index ? 'is-active' : '']"
                            type="button"
                            @mouseenter="search.setActiveIndex(index)"
                            @click="onSelect(item)"
                        >
                            <div class="menu-search-item__icon">
                                <Icon
                                    :color="activeIndex === index ? themeColors.activeText : themeColors.icon"
                                    :name="item.icon || fallbackIcon"
                                    size="18px"
                                />
                            </div>
                            <div class="menu-search-item__content">
                                <div class="menu-search-item__location">
                                    <span class="menu-search-item__location-label">位置</span>
                                    <span class="menu-search-item__location-text">{{ item.breadcrumbText || '主导航' }}</span>
                                </div>
                                <div class="menu-search-item__title-row">
                                    <span class="menu-search-item__title">{{ item.title }}</span>
                                    <span class="menu-search-item__path">{{ item.path }}</span>
                                </div>
                            </div>
                            <div class="menu-search-item__arrow">
                                <Icon
                                    :color="activeIndex === index ? themeColors.activeText : themeColors.mutedText"
                                    name="el-icon-Right"
                                    size="15px"
                                />
                            </div>
                        </button>
                    </div>

                    <div v-else-if="hasQuery" class="menu-search-empty" key="empty">
                        <div class="menu-search-empty__icon">
                            <Icon :color="themeColors.icon" name="el-icon-Search" size="22px" />
                        </div>
                        <div class="menu-search-empty__title">没有找到相关菜单</div>
                        <div class="menu-search-empty__text">试试输入父级名称、页面标题，或者路由关键字。</div>
                    </div>

                    <div v-else class="menu-search-idle" key="idle"></div>
                </transition>
            </div>

            <div class="menu-search-footer">
                <div class="menu-search-footer__hints">
                    <span class="footer-hint"><kbd>↑</kbd><kbd>↓</kbd>导航</span>
                    <span class="footer-hint"><kbd>Enter</kbd>选择</span>
                    <span class="footer-hint"><kbd>Esc</kbd>关闭</span>
                </div>
                <div class="menu-search-footer__brand">Powered by {{ siteConfig.siteName || 'Admin Air' }}</div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useEventListener, useTemplateRefsList } from '@vueuse/core'
import type { RouteRecordRaw } from 'vue-router'
import { useConfig } from '/@/stores/config'
import { useMenuSearchPanel } from '/@/stores/menuSearch'
import { useNavTabs } from '/@/stores/navTabs'
import { useSiteConfig } from '/@/stores/siteConfig'
import { useMenuSearch, type MenuSearchItem } from './useMenuSearch'

const config = useConfig()
const navTabs = useNavTabs()
const siteConfig = useSiteConfig()
const menuSearchPanel = useMenuSearchPanel()

const fallbackIcon = computed(() => config.layout.menuDefaultIcon)
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const resultRefs = useTemplateRefsList<HTMLButtonElement>()

const search = useMenuSearch(() => navTabs.state.tabsViewRoutes as RouteRecordRaw[])
const query = computed(() => search.query.value)
const displayedItems = computed(() => search.displayedItems.value)
const hasQuery = computed(() => query.value.trim().length > 0)
const showResults = computed(() => hasQuery.value && displayedItems.value.length > 0)

const activeIndex = computed(() => {
    if (!displayedItems.value.length) return -1
    return Math.min(search.activeIndex.value, displayedItems.value.length - 1)
})

const themeColors = computed(() => {
    const isDark = config.layout.isDark

    return {
        icon: isDark ? '#b7c8ff' : '#5a74dd',
        mutedText: isDark ? 'rgba(220, 228, 255, 0.62)' : 'rgba(83, 95, 129, 0.62)',
        activeText: isDark ? '#f5f8ff' : '#1d2746',
    }
})

const themeVars = computed(() => {
    const isDark = config.layout.isDark

    return {
        '--menu-search-panel-background': isDark ? 'rgba(19, 23, 32, 0.98)' : 'rgba(255, 255, 255, 0.99)',
        '--menu-search-panel-border': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(45, 64, 126, 0.12)',
        '--menu-search-surface': isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(244, 247, 255, 1)',
        '--menu-search-text': isDark ? '#edf2ff' : '#1d2746',
        '--menu-search-subtext': isDark ? 'rgba(214, 223, 255, 0.66)' : 'rgba(83, 95, 129, 0.72)',
        '--menu-search-divider': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(45, 64, 126, 0.08)',
        '--menu-search-item-background': isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(248, 250, 255, 1)',
        '--menu-search-item-hover': isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 255, 1)',
        '--menu-search-item-active': isDark ? 'rgba(85, 113, 207, 0.18)' : 'rgba(231, 238, 255, 1)',
        '--menu-search-item-active-border': isDark ? 'rgba(139, 164, 255, 0.2)' : 'rgba(94, 121, 214, 0.18)',
        '--menu-search-kbd-background': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(51, 72, 145, 0.06)',
        '--menu-search-kbd-border': isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(51, 72, 145, 0.12)',
        '--menu-search-shadow': isDark ? '0 14px 32px rgba(0, 0, 0, 0.32)' : '0 10px 28px rgba(24, 39, 75, 0.14)',
    }
})

const closePanel = () => {
    menuSearchPanel.close()
}

const focusInput = () => {
    nextTick(() => {
        searchInput.value?.focus()
        searchInput.value?.select()
    })
}

const onSelect = (item: MenuSearchItem) => {
    search.selectItem(item)
    closePanel()
}

const onQueryInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    search.setQuery(target.value)
}

const onWindowKeydown = (event: KeyboardEvent) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'

    if (isShortcut) {
        if (!menuSearchPanel.isOpen && isEditableTarget(event.target)) {
            return
        }

        event.preventDefault()
        if (!menuSearchPanel.isOpen) {
            menuSearchPanel.open()
        }
        focusInput()
        return
    }

    if (!menuSearchPanel.isOpen) return

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault()
            search.moveActive(1)
            break
        case 'ArrowUp':
            event.preventDefault()
            search.moveActive(-1)
            break
        case 'Enter':
            event.preventDefault()
            if (search.activeItem.value) {
                onSelect(search.activeItem.value)
            }
            break
        case 'Escape':
            event.preventDefault()
            closePanel()
            break
    }
}

useEventListener(window, 'keydown', onWindowKeydown)

watch(
    () => menuSearchPanel.isOpen,
    (isOpen) => {
        if (isOpen) {
            focusInput()
            return
        }

        search.reset()
    }
)

watch(activeIndex, (value) => {
    if (value < 0) return
    nextTick(() => {
        resultRefs.value[value]?.scrollIntoView({
            block: 'nearest',
        })
    })
})

function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable) return true

    const tagName = target.tagName.toLowerCase()
    return ['input', 'textarea', 'select'].includes(tagName)
}
</script>

<style scoped lang="scss">
:deep(.menu-search-dialog) {
    border-radius: 4px;
    background: transparent;
    box-shadow: none;
}

:deep(.menu-search-dialog .el-dialog) {
    background: transparent;
    box-shadow: none;
    border-radius: 4px;
}

:deep(.menu-search-dialog .el-dialog__header) {
    display: none;
}

:deep(.menu-search-dialog .el-dialog__body) {
    padding: 0;
}

:deep(.menu-search-dialog-modal) {
    background: transparent;
}

.menu-search-shell {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 154px;
    color: var(--menu-search-text);
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
}

.menu-search-bar-wrap {
    padding: 12px 12px 0;
}

.menu-search-bar {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    min-height: 46px;
    padding: 0 12px;
    border: 1px solid var(--menu-search-panel-border);
    border-radius: 4px;
    background: var(--menu-search-surface);
}

.menu-search-bar__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.menu-search-bar__icon :deep(.icon) {
    display: block;
    line-height: 1;
}

.menu-search-bar__input {
    flex: 1;
    display: block;
    align-self: stretch;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--menu-search-text);
    font-size: 16px;
    font-weight: 500;
    line-height: 1.2;
}

.menu-search-bar__input::placeholder {
    color: var(--menu-search-subtext);
}

.menu-search-bar__action {
    border: 0;
    background: transparent;
    color: var(--menu-search-subtext);
    cursor: pointer;
    transition:
        color 0.2s ease,
        background-color 0.2s ease,
        border-color 0.2s ease,
        transform 0.18s ease,
        box-shadow 0.2s ease;
}

.menu-search-bar__action:hover {
    color: var(--menu-search-text);
}

.menu-search-bar__action.is-text {
    font-size: 13px;
    font-weight: 600;
}

.menu-search-bar__tools {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.menu-search-bar__divider {
    width: 1px;
    height: 16px;
    background: var(--menu-search-divider);
}

.menu-search-bar__action.is-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: 4px;
}

.menu-search-bar__action.is-icon:hover {
    background: v-bind('config.layout.isDark ? "rgba(183, 200, 255, 0.28)" : "rgba(90, 116, 221, 0.22)"');
    border-color: v-bind('config.layout.isDark ? "rgba(183, 200, 255, 0.3)" : "rgba(90, 116, 221, 0.22)"');
    box-shadow: v-bind('config.layout.isDark ? "0 0 0 1px rgba(183, 200, 255, 0.08)" : "0 2px 6px rgba(90, 116, 221, 0.18)"');
    transform: scale(1.06);
}

.menu-search-bar__action.is-icon:hover :deep(.menu-search-bar__close-icon),
.menu-search-bar__action.is-icon:hover .menu-search-bar__close-icon {
    color: v-bind('config.layout.isDark ? "#f5f8ff" : "#5a74dd"') !important;
}

.menu-search-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 40px;
    max-height: 40px;
    padding-top: 12px;
    overflow: hidden;
    opacity: 1;
    transition:
        max-height 0.26s ease,
        min-height 0.26s ease,
        padding-top 0.26s ease,
        opacity 0.2s ease;
}

.menu-search-body.is-empty {
    min-height: 40px;
    max-height: 40px;
    padding-top: 12px;
    opacity: 1;
}

.menu-search-body.is-expanded {
    min-height: 160px;
    max-height: 360px;
    opacity: 1;
}

.menu-search-list {
    flex: 1;
    overflow: auto;
    padding: 0 12px 12px;
}

.menu-search-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 8px;
    padding: 10px 12px;
    text-align: left;
    border: 1px solid transparent;
    border-radius: 4px;
    background: var(--menu-search-item-background);
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease;
}

.menu-search-item:hover {
    background: var(--menu-search-item-hover);
}

.menu-search-item.is-active {
    background: var(--menu-search-item-active);
    border-color: var(--menu-search-item-active-border);
}

.menu-search-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    margin-right: 12px;
    border-radius: 4px;
    background: var(--menu-search-surface);
    flex-shrink: 0;
}

.menu-search-item__content {
    flex: 1;
    min-width: 0;
}

.menu-search-item__location {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center;
    column-gap: 8px;
    min-width: 0;
    margin-bottom: 4px;
    color: var(--menu-search-subtext);
    font-size: 12px;
    line-height: 16px;
}

.menu-search-item__location-label {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
}

.menu-search-item__location-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu-search-item__title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.menu-search-item__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 700;
}

.menu-search-item__path {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 0 8px;
    line-height: 20px;
    color: var(--menu-search-subtext);
    font-size: 11px;
    border-radius: 4px;
    background: var(--menu-search-surface);
}

.menu-search-item__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    flex-shrink: 0;
}

.menu-search-empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 156px;
    padding: 16px 20px 24px;
    text-align: center;
}

.menu-search-empty__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 4px;
    background: var(--menu-search-surface);
}

.menu-search-empty__title {
    margin-top: 14px;
    font-size: 16px;
    font-weight: 700;
}

.menu-search-empty__text {
    margin-top: 8px;
    color: var(--menu-search-subtext);
    font-size: 13px;
}

.menu-search-idle {
    flex: 1;
    min-height: 28px;
}

.menu-search-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px;
    border-top: 1px solid var(--menu-search-divider);
    color: var(--menu-search-subtext);
    font-size: 12px;
}

.menu-search-footer__hints {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
}

.footer-hint {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 8px;
    font-size: 11px;
    font-family: inherit;
    color: var(--menu-search-text);
    background: var(--menu-search-kbd-background);
    border: 1px solid var(--menu-search-kbd-border);
    border-radius: 4px;
}

.menu-search-footer__brand {
    white-space: nowrap;
}

.menu-search-results-enter-active,
.menu-search-results-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.22s ease;
}

.menu-search-results-enter-from,
.menu-search-results-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

@media screen and (max-width: 768px) {
    :deep(.menu-search-dialog) {
        width: calc(100vw - 20px) !important;
        margin: 0 auto;
    }

    .menu-search-bar-wrap {
        padding: 10px 10px 0;
    }

    .menu-search-bar {
        min-height: 42px;
        padding: 0 10px;
    }

    .menu-search-bar__input {
        font-size: 15px;
    }

    .menu-search-item__title-row {
        flex-wrap: wrap;
    }

    .menu-search-item__path {
        width: fit-content;
    }

    .menu-search-footer {
        flex-direction: column;
        align-items: flex-start;
    }

    .menu-search-footer__brand {
        white-space: normal;
    }
}
</style>

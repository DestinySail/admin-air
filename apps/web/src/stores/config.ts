import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { STORE_CONFIG } from '/@/stores/constant/cacheKey'
import type { Crud, Layout } from '/@/stores/interface'

export const useConfig = defineStore(
    'config',
    () => {
        const layout: Layout = reactive({
            showDrawer: false,
            shrink: false,
            layoutMode: 'Default',
            mainAnimation: 'slide-right',
            isDark: false,
            menuBackground: ['#ffffff', '#1d1e1f'],
            menuColor: ['#303133', '#CFD3DC'],
            menuActiveBackground: ['#ffffff', '#1d1e1f'],
            menuActiveColor: ['#409eff', '#3375b9'],
            menuHoverBackground: ['#ecf5ff', '#18222c'],
            menuTopBarBackground: ['#fcfcfc', '#1d1e1f'],
            menuWidth: 260,
            menuDefaultIcon: 'fa fa-circle-o',
            menuCollapse: false,
            menuUniqueOpened: false,
            menuShowTopBar: true,
            headerBarTabColor: ['#000000', '#CFD3DC'],
            headerBarTabActiveBackground: ['#ffffff', '#1d1e1f'],
            headerBarTabActiveColor: ['#000000', '#409EFF'],
            headerBarBackground: ['#ffffff', '#1d1e1f'],
            headerBarHoverBackground: ['#f5f5f5', '#18222c'],
        })

        const crud: Crud = reactive({
            syncType: 'manual',
            syncedUpdate: 'yes',
            syncAutoPublic: 'no',
        })

        function menuWidth() {
            if (layout.shrink) {
                return layout.menuCollapse ? '0px' : layout.menuWidth + 'px'
            }
            return layout.menuCollapse ? '64px' : layout.menuWidth + 'px'
        }

        function onSetLayoutColor(data = layout.layoutMode) {
            const tempValue = layout.isDark ? { idx: 1, color: '#1d1e1f', newColor: '#141414' } : { idx: 0, color: '#ffffff', newColor: '#f5f5f5' }
            if (
                data == 'Classic' &&
                layout.headerBarBackground[tempValue.idx] == tempValue.color &&
                layout.headerBarTabActiveBackground[tempValue.idx] == tempValue.color
            ) {
                layout.headerBarTabActiveBackground[tempValue.idx] = tempValue.newColor
            } else if (
                data == 'Default' &&
                layout.headerBarBackground[tempValue.idx] == tempValue.color &&
                layout.headerBarTabActiveBackground[tempValue.idx] == tempValue.newColor
            ) {
                layout.headerBarTabActiveBackground[tempValue.idx] = tempValue.color
            }
        }

        function setLayoutMode(_data: string) {
            layout.layoutMode = 'Default'
            onSetLayoutColor('Default')
        }

        const setLayout = (name: keyof Layout, value: any) => {
            ;(layout[name] as any) = value
        }

        const getColorVal = function (name: keyof Layout): string {
            const colors = layout[name] as string[]
            if (layout.isDark) {
                return colors[1]
            } else {
                return colors[0]
            }
        }

        const setCrud = (name: keyof Crud, value: any) => {
            ;(crud[name] as any) = value
        }

        return { layout, crud, menuWidth, setLayoutMode, setLayout, getColorVal, onSetLayoutColor, setCrud }
    },
    {
        persist: {
            key: STORE_CONFIG,
        },
    }
)

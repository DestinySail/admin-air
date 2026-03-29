import type { CSSProperties } from 'vue'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'

export const adminLayoutHeaderBarHeight = {
    Default: 70,
    Classic: 50,
    Streamline: 60,
    Double: 60,
}

export function mainHeight(extra = 0): CSSProperties {
    let height = extra
    const config = useConfig()
    const navTabs = useNavTabs()
    if (!navTabs.state.tabFullScreen) {
        height += adminLayoutHeaderBarHeight[config.layout.layoutMode as keyof typeof adminLayoutHeaderBarHeight]
    }
    return {
        height: 'calc(100vh - ' + height.toString() + 'px)',
    }
}

export function setNavTabsWidth() {
    const navTabs = document.querySelector('.nav-tabs') as HTMLElement
    if (!navTabs) {
        return
    }
    const navBar = document.querySelector('.nav-bar') as HTMLElement
    const navMenus = document.querySelector('.nav-menus') as HTMLElement
    const minWidth = navBar.offsetWidth - (navMenus.offsetWidth + 20)
    navTabs.style.width = minWidth.toString() + 'px'
}

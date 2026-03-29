import { useConfig } from '/@/stores/config'
import { onMounted, onUnmounted, ref, watch } from 'vue'

export function updateHtmlDarkClass(val: boolean) {
    const htmlEl = document.getElementsByTagName('html')[0]
    if (val) {
        htmlEl.setAttribute('class', 'dark')
    } else {
        htmlEl.setAttribute('class', '')
    }
}

function applyDarkState(val: boolean) {
    const config = useConfig()
    updateHtmlDarkClass(val)
    config.setLayout('isDark', val)
    config.onSetLayoutColor()
}

function toggleDark(force?: boolean) {
    const config = useConfig()
    const nextValue = typeof force === 'boolean' ? force : !config.layout.isDark
    applyDarkState(nextValue)
}

export function togglePageDark(val: boolean) {
    const config = useConfig()
    const isDark = ref(config.layout.isDark)
    onMounted(() => {
        if (isDark.value !== val) updateHtmlDarkClass(val)
    })
    onUnmounted(() => {
        updateHtmlDarkClass(isDark.value)
    })
    watch(
        () => config.layout.isDark,
        (newVal) => {
            isDark.value = newVal
            if (isDark.value !== val) updateHtmlDarkClass(val)
        }
    )
}

export default toggleDark

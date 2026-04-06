import { nextTick } from 'vue'
import '/@/styles/loading.scss'
import { translate as t } from '/@/utils/translate'

export const loading = {
    show: () => {
        const bodys: Element = document.body
        const div = document.createElement('div')
        div.className = 'block-loading'
        div.innerHTML = `
            <div class="block-loading-box" role="status" aria-live="polite" aria-label="${t('utils.Loading')}">
                <div class="ba-square-loader" aria-hidden="true">
                    <span class="ba-square-loader__square ba-square-loader__square--lead"></span>
                    <span class="ba-square-loader__square ba-square-loader__square--trail"></span>
                </div>
            </div>
        `
        bodys.insertBefore(div, bodys.childNodes[0])
    },
    hide: () => {
        nextTick(() => {
            setTimeout(() => {
                const el = document.querySelector('.block-loading')
                el && el.parentNode?.removeChild(el)
            }, 1000)
        })
    },
}

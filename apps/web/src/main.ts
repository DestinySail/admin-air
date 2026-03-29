import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerIcons } from '/@/utils/common'
import ElementPlus from 'element-plus'
import mitt from 'mitt'
import pinia from '/@/stores/index'
import { useConfig } from '/@/stores/config'
import { directives } from '/@/utils/directives'
import { updateHtmlDarkClass } from '/@/utils/useDark'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'font-awesome/css/font-awesome.min.css'
import '/@/styles/index.scss'

async function start() {
    const app = createApp(App)
    app.use(pinia)

    const config = useConfig(pinia)
    updateHtmlDarkClass(config.layout.isDark)

    app.use(router)
    app.use(ElementPlus)

    directives(app)
    registerIcons(app)

    app.mount('#app')
    app.config.globalProperties.eventBus = mitt()
}

start()

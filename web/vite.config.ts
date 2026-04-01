import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import { svgBuilder } from './src/components/icon/svg/index'
import { customHotUpdate } from './src/utils/vite'

const pathResolve = (dir: string): string => {
    return resolve(__dirname, '.', dir)
}

const manualChunks = (id: string) => {
    if (!id.includes('node_modules')) return

    const vuePackages = ['vue', 'vue-router', 'pinia', 'element-plus']
    if (vuePackages.some((pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
        return 'vue'
    }

    if (id.includes('/node_modules/echarts/') || id.includes('\\node_modules\\echarts\\')) {
        return 'echarts'
    }
}

const viteConfig = ({ mode }: ConfigEnv): UserConfig => {
    const { VITE_PORT, VITE_OPEN, VITE_BASE_PATH, VITE_OUT_DIR } = loadEnv(mode, __dirname)

    const alias: Record<string, string> = {
        '/@': pathResolve('./src/'),
        assets: pathResolve('./src/assets'),
    }

    return {
        plugins: [vue(), svgBuilder('./src/assets/icons/'), customHotUpdate()],
        root: __dirname,
        resolve: { alias },
        base: VITE_BASE_PATH,
        server: {
            port: parseInt(VITE_PORT, 10),
            open: VITE_OPEN != 'false',
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8787',
                    changeOrigin: true,
                },
                '/admin': {
                    target: 'http://127.0.0.1:8787',
                    changeOrigin: true,
                },
            },
        },
        build: {
            cssCodeSplit: false,
            sourcemap: false,
            outDir: VITE_OUT_DIR,
            emptyOutDir: true,
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    manualChunks,
                },
            },
        },
    }
}

export default viteConfig

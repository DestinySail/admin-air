<template>
    <el-config-provider :value-on-clear="() => null" :locale="zhCn">
        <router-view></router-view>
    </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { setTitleFromRoute } from '/@/utils/common'
import iconfontInit from '/@/utils/iconfont'
import { init as viteInit } from '/@/utils/vite'
// modules import mark, Please do not remove.

const route = useRoute()

onMounted(() => {
    viteInit()
    iconfontInit()

    // Modules onMounted mark, Please do not remove.
})

watch(
    () => route.path,
    () => {
        setTitleFromRoute()
    }
)
</script>

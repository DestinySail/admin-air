import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

export const useMenuSearchPanel = defineStore('menuSearchPanel', () => {
    const isOpen = shallowRef(false)

    const open = () => {
        isOpen.value = true
    }

    const close = () => {
        isOpen.value = false
    }

    const toggle = (status?: boolean) => {
        isOpen.value = typeof status === 'boolean' ? status : !isOpen.value
    }

    return {
        isOpen,
        open,
        close,
        toggle,
    }
})

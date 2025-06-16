<template>
    <button :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
        <span v-if="loading" class="loading-spinner"></span>
        <slot v-if="!loading"></slot>
        <span v-if="loading && loadingText">{{ loadingText }}</span>
    </button>
</template>

<script setup>
import { computed } from 'vue'

// Props 定義
const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        default: ''
    },
    block: {
        type: Boolean,
        default: false
    }
})

// Events 定義
const emit = defineEmits(['click'])

// 計算按鈕樣式類別
const buttonClasses = computed(() => {
    const classes = ['btn']

    // 變體樣式
    classes.push(`btn-${props.variant}`)

    // 尺寸樣式
    classes.push(`btn-${props.size}`)

    // 區塊樣式
    if (props.block) {
        classes.push('btn-block')
    }

    // 載入狀態
    if (props.loading) {
        classes.push('btn-loading')
    }

    return classes
})

// 處理點擊事件
function handleClick(event) {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped>
.btn {
    position: relative;
    overflow: hidden;
}

.btn-block {
    width: 100%;
}

.btn-loading {
    pointer-events: none;
}

.loading-spinner {
    width: 1rem;
    height: 1rem;
    margin-right: var(--spacing-sm);
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>

<template>
    <Teleport to="body">
        <div class="notification-container">
            <Transition name="notification">
                <div v-if="visible" class="notification" :class="`notification--${type}`">
                    <!-- 圖示 -->
                    <div class="notification-icon">{{ iconSymbol }}</div>

                    <!-- 內容 -->
                    <div class="notification-content">
                        <div v-if="title" class="notification-title">{{ title }}</div>
                        <div class="notification-message">{{ message }}</div>
                    </div>

                    <!-- 關閉按鈕 -->
                    <button class="notification-close" @click="$emit('close')">×</button>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, onMounted } from 'vue'

// 定義 Props
const props = defineProps({
    // 是否顯示
    visible: {
        type: Boolean,
        default: false,
    },
    // 通知類型
    type: {
        type: String,
        default: 'info',
        validator: (value) => ['success', 'info', 'warning', 'error'].includes(value),
    },
    // 標題
    title: {
        type: String,
        default: '',
    },
    // 訊息內容
    message: {
        type: String,
        required: true,
    },
    // 是否可關閉
    closable: {
        type: Boolean,
        default: true,
    },
    // 自動關閉時間（毫秒）
    duration: {
        type: Number,
        default: 4000,
    },
    // 位置
    position: {
        type: String,
        default: 'top-right',
        validator: (value) => [
            'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center'
        ].includes(value),
    },
})

// 定義 Emits
const emit = defineEmits(['close'])

// 計算屬性
const iconSymbol = computed(() => {
    const icons = {
        success: '✓',
        info: 'ℹ',
        warning: '⚠',
        error: '×',
    }
    return icons[props.type] || icons.info
})

// 方法
const close = () => {
    emit('close')
}

// 自動關閉
onMounted(() => {
    if (props.duration > 0) {
        setTimeout(() => {
            if (props.visible) {
                close()
            }
        }, props.duration)
    }
})
</script>

<style scoped>
.notification-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 2000;
    pointer-events: none;
}

.notification {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 300px;
    max-width: 400px;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid;
    margin-bottom: 12px;
    pointer-events: auto;
    border: 1px solid var(--border-color);
}

/* 類型樣式 */
.notification--success {
    border-left-color: var(--success-color);
}

.notification--info {
    border-left-color: var(--info-color);
}

.notification--warning {
    border-left-color: var(--warning-color);
}

.notification--error {
    border-left-color: var(--danger-color);
}

.notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
}

.notification--success .notification-icon {
    background-color: var(--success-color);
}

.notification--info .notification-icon {
    background-color: var(--info-color);
}

.notification--warning .notification-icon {
    background-color: var(--warning-color);
}

.notification--error .notification-icon {
    background-color: var(--danger-color);
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.notification-message {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color var(--transition-fast);
}

.notification-close:hover {
    color: var(--text-primary);
}

.notification-close:hover {
    color: var(--text-secondary, #6c757d);
}

/* 位置變體 */
.notification-container {
    top: 1rem;
    right: 1rem;
}

/* 過渡動畫 */
.notification-enter-active {
    transition: all 0.3s ease-out;
}

.notification-leave-active {
    transition: all 0.3s ease-in;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* 響應式 */
@media (max-width: 768px) {
    .notification-container {
        top: 1rem;
        left: 1rem;
        right: 1rem;
    }

    .notification {
        min-width: auto;
        max-width: none;
    }

    .notification-enter-from,
    .notification-leave-to {
        transform: translateY(-100%);
    }
}
</style>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" :style="modalStyles" @click.stop>
          <div v-if="$slots.header || title || closable" class="modal-header">
            <slot name="header">
              <h3 v-if="title" class="modal-title">{{ title }}</h3>
            </slot>
            <button v-if="closable" class="modal-close" @click="handleClose" aria-label="關閉">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'

// Props 定義
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '500px'
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  }
})

// Events 定義
const emit = defineEmits(['update:visible', 'close', 'opened', 'closed'])

// 計算模態框樣式
const modalStyles = computed(() => {
  const width = typeof props.width === 'number' ? `${props.width}px` : props.width
  return {
    width,
    maxWidth: '90vw'
  }
})

// 處理背景點擊
function handleOverlayClick() {
  if (props.maskClosable && props.closable) {
    handleClose()
  }
}

// 處理關閉
function handleClose() {
  emit('update:visible', false)
  emit('close')
}

// 處理鍵盤事件
function handleKeyDown(event) {
  if (event.key === 'Escape' && props.closable && props.visible) {
    handleClose()
  }
}

// 監聽 visible 變化
watch(() => props.visible, async (newVisible) => {
  if (newVisible) {
    await nextTick()
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    emit('opened')
  } else {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
    emit('closed')
  }
})

// 組件卸載時清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-xl);
  cursor: pointer;
  color: var(--text-muted);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  line-height: 1;
}

.modal-close:hover {
  background-color: var(--bg-accent);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* 動畫效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: scale(1) translateY(0);
}

/* 響應式設計 */
@media (max-width: 767px) {
  .modal-overlay {
    padding: var(--spacing-md);
    align-items: flex-end;
  }

  .modal-content {
    width: 100% !important;
    max-width: none !important;
    margin: 0;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    max-height: 85vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-md);
  }
}
</style>

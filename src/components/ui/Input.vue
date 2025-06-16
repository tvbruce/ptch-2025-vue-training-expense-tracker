<template>
    <div class="input-wrapper" :class="{ 'input-disabled': disabled }">
        <label v-if="label" class="input-label" :for="inputId">
            {{ label }}
            <span v-if="required" class="required-mark">*</span>
        </label>

        <div class="input-container" :class="{ 'input-error': error, 'input-focused': isFocused }">
            <!-- 前置圖示 -->
            <span v-if="prefixIcon" class="input-prefix-icon">{{ prefixIcon }}</span>

            <!-- 輸入框 -->
            <input :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
                :readonly="readonly" :required="required" :min="min" :max="max" :step="step" :maxlength="maxlength"
                :autocomplete="autocomplete" class="input-field" @input="handleInput" @focus="handleFocus"
                @blur="handleBlur" @keydown="handleKeydown" ref="inputRef" />

            <!-- 後置圖示 -->
            <span v-if="suffixIcon" class="input-suffix-icon">{{ suffixIcon }}</span>

            <!-- 清除按鈕 -->
            <button v-if="clearable && modelValue && !disabled && !readonly" type="button" class="input-clear-button"
                @click="clearInput">
                ×
            </button>

            <!-- 密碼顯示切換 -->
            <button v-if="type === 'password' && showPasswordToggle" type="button" class="input-password-toggle"
                @click="togglePasswordVisibility">
                {{ showPassword ? '🙈' : '👁️' }}
            </button>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="input-error-message">{{ error }}</div>

        <!-- 提示訊息 -->
        <div v-if="hint && !error" class="input-hint">{{ hint }}</div>

        <!-- 字數統計 -->
        <div v-if="showCount && maxlength" class="input-count">
            {{ (modelValue || '').length }} / {{ maxlength }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// Props 定義
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text',
        validator: (value) => [
            'text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'
        ].includes(value)
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    readonly: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    hint: {
        type: String,
        default: ''
    },
    prefixIcon: {
        type: String,
        default: ''
    },
    suffixIcon: {
        type: String,
        default: ''
    },
    clearable: {
        type: Boolean,
        default: false
    },
    showPasswordToggle: {
        type: Boolean,
        default: true
    },
    showCount: {
        type: Boolean,
        default: false
    },
    min: {
        type: [String, Number],
        default: undefined
    },
    max: {
        type: [String, Number],
        default: undefined
    },
    step: {
        type: [String, Number],
        default: undefined
    },
    maxlength: {
        type: [String, Number],
        default: undefined
    },
    autocomplete: {
        type: String,
        default: 'off'
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
})

// Emits 定義
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'keydown'])

// 響應式數據
const inputRef = ref(null)
const isFocused = ref(false)
const showPassword = ref(false)

// 計算屬性
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const actualType = computed(() => {
    if (props.type === 'password' && showPassword.value) {
        return 'text'
    }
    return props.type
})

// 方法
const handleInput = (event) => {
    let value = event.target.value

    // 數字類型處理
    if (props.type === 'number') {
        value = value === '' ? '' : Number(value)
    }

    emit('update:modelValue', value)
}

const handleFocus = (event) => {
    isFocused.value = true
    emit('focus', event)
}

const handleBlur = (event) => {
    isFocused.value = false
    emit('blur', event)
}

const handleKeydown = (event) => {
    emit('keydown', event)
}

const clearInput = () => {
    emit('update:modelValue', '')
    emit('clear')
    nextTick(() => {
        inputRef.value?.focus()
    })
}

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const focus = () => {
    inputRef.value?.focus()
}

const blur = () => {
    inputRef.value?.blur()
}

const select = () => {
    inputRef.value?.select()
}

// 暴露方法給父組件
defineExpose({
    focus,
    blur,
    select
})
</script>

<style scoped>
.input-wrapper {
    width: 100%;
}

.input-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
}

.required-mark {
    color: var(--danger-color);
    margin-left: 0.25rem;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.2s ease;
}

.input-container:hover:not(.input-error) {
    border-color: var(--primary-color);
}

.input-focused {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 216, 89, 0.2);
}

.input-error {
    border-color: var(--danger-color);
}

.input-error.input-focused {
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}

.input-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.input-disabled .input-container {
    background: var(--bg-secondary);
    cursor: not-allowed;
}

.input-field {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 0.875rem;
    outline: none;
    min-width: 0;
}

.input-field::placeholder {
    color: var(--text-muted);
}

.input-field:disabled {
    cursor: not-allowed;
}

.input-field:readonly {
    cursor: default;
}

/* 數字輸入框樣式 */
.input-field[type="number"] {
    -moz-appearance: textfield;
}

.input-field[type="number"]::-webkit-outer-spin-button,
.input-field[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.input-prefix-icon,
.input-suffix-icon {
    padding: 0 0.75rem;
    color: var(--text-secondary);
    font-size: 1rem;
    display: flex;
    align-items: center;
}

.input-prefix-icon {
    border-right: 1px solid var(--border-light);
}

.input-suffix-icon {
    border-left: 1px solid var(--border-light);
}

.input-clear-button,
.input-password-toggle {
    padding: 0.25rem;
    margin-right: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 4px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.input-clear-button:hover,
.input-password-toggle:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.input-clear-button {
    font-size: 1.25rem;
    line-height: 1;
}

.input-error-message {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--danger-color);
}

.input-hint {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.input-count {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: right;
}

/* 尺寸變體 */
.input-wrapper.size-small .input-field {
    padding: 0.5rem;
    font-size: 0.75rem;
}

.input-wrapper.size-small .input-prefix-icon,
.input-wrapper.size-small .input-suffix-icon {
    padding: 0 0.5rem;
    font-size: 0.875rem;
}

.input-wrapper.size-large .input-field {
    padding: 1rem;
    font-size: 1rem;
}

.input-wrapper.size-large .input-prefix-icon,
.input-wrapper.size-large .input-suffix-icon {
    padding: 0 1rem;
    font-size: 1.125rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .input-field {
        font-size: 16px;
        /* 防止 iOS Safari 縮放 */
    }

    .input-clear-button,
    .input-password-toggle {
        padding: 0.5rem;
        margin-right: 0.25rem;
    }
}

/* 深色主題支援 */
@media (prefers-color-scheme: dark) {
    .input-container {
        background: var(--bg-secondary);
    }

    .input-field {
        color: var(--text-primary);
    }

    .input-field::placeholder {
        color: var(--text-muted);
    }
}

/* 高對比度支援 */
@media (prefers-contrast: high) {
    .input-container {
        border-width: 2px;
    }

    .input-focused {
        box-shadow: 0 0 0 3px rgba(255, 216, 89, 0.3);
    }
}

/* 減少動畫支援 */
@media (prefers-reduced-motion: reduce) {

    .input-container,
    .input-clear-button,
    .input-password-toggle {
        transition: none;
    }
}
</style>

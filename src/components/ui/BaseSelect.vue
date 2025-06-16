<template>
    <div class="select-group">
        <!-- 標籤 -->
        <label v-if="label" :for="selectId" class="select-label">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>

        <!-- 選擇器容器 -->
        <div class="select-wrapper" :class="{
            'has-error': error,
            'has-success': success,
            'is-open': isOpen,
            'is-disabled': disabled
        }">
            <!-- 顯示區域 -->
            <div class="select-display" :class="{ 'select--sm': size === 'sm', 'select--lg': size === 'lg' }"
                @click="toggleDropdown">
                <!-- 前綴圖示 -->
                <span v-if="prefixIcon" class="select-icon select-icon--prefix">
                    {{ prefixIcon }}
                </span>

                <!-- 已選擇項目顯示 -->
                <div class="select-content">
                    <!-- 多選模式 -->
                    <div v-if="multiple && selectedItems.length > 0" class="select-tags">
                        <span v-for="item in selectedItems" :key="item.value" class="select-tag">
                            {{ item.label }}
                            <button class="select-tag-close" @click.stop="removeItem(item.value)">
                                ×
                            </button>
                        </span>
                    </div>

                    <!-- 單選模式 -->
                    <span v-else-if="!multiple && selectedItems.length > 0" class="select-value">
                        {{ selectedItems[0].label }}
                    </span>

                    <!-- 佔位符 -->
                    <span v-else class="select-placeholder">
                        {{ placeholder }}
                    </span>
                </div>

                <!-- 下拉箭頭 -->
                <span class="select-arrow" :class="{ 'is-open': isOpen }">
                    ▼
                </span>
            </div>

            <!-- 下拉選項 -->
            <Transition name="dropdown">
                <div v-if="isOpen" class="select-dropdown">
                    <!-- 搜尋框 -->
                    <div v-if="searchable" class="select-search">
                        <input v-model="searchQuery" type="text" placeholder="搜尋選項..." class="select-search-input"
                            @click.stop />
                    </div>

                    <!-- 選項列表 -->
                    <div class="select-options">
                        <div v-for="option in filteredOptions" :key="option.value" class="select-option" :class="{
                            'is-selected': isSelected(option.value),
                            'is-disabled': option.disabled
                        }" @click="selectOption(option)">
                            <!-- 選項圖示 -->
                            <span v-if="option.icon" class="select-option-icon">
                                {{ option.icon }}
                            </span>

                            <!-- 選項標籤 -->
                            <span class="select-option-label">{{ option.label }}</span>

                            <!-- 多選勾選 -->
                            <span v-if="multiple && isSelected(option.value)" class="select-option-check">
                                ✓
                            </span>
                        </div>

                        <!-- 無選項提示 -->
                        <div v-if="filteredOptions.length === 0" class="select-empty">
                            {{ searchQuery ? '找不到相關選項' : '無可用選項' }}
                        </div>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="select-error">
            {{ error }}
        </div>

        <!-- 成功訊息 -->
        <div v-if="success" class="select-success">
            {{ success }}
        </div>

        <!-- 提示訊息 -->
        <div v-if="hint && !error && !success" class="select-hint">
            {{ hint }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 定義 Props
const props = defineProps({
    // 雙向綁定值
    modelValue: {
        type: [String, Number, Array],
        default: () => [],
    },
    // 選項列表
    options: {
        type: Array,
        default: () => [],
        validator: (options) => {
            return options.every(option =>
                typeof option === 'object' &&
                'value' in option &&
                'label' in option
            )
        },
    },
    // 標籤
    label: {
        type: String,
        default: '',
    },
    // 佔位符
    placeholder: {
        type: String,
        default: '請選擇...',
    },
    // 尺寸
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    // 是否多選
    multiple: {
        type: Boolean,
        default: false,
    },
    // 是否可搜尋
    searchable: {
        type: Boolean,
        default: false,
    },
    // 錯誤訊息
    error: {
        type: String,
        default: '',
    },
    // 成功訊息
    success: {
        type: String,
        default: '',
    },
    // 提示訊息
    hint: {
        type: String,
        default: '',
    },
    // 前綴圖示
    prefixIcon: {
        type: String,
        default: '',
    },
    // 是否必填
    required: {
        type: Boolean,
        default: false,
    },
    // 是否禁用
    disabled: {
        type: Boolean,
        default: false,
    },
})

// 定義 Emits
const emit = defineEmits(['update:modelValue', 'change'])

// 響應式資料
const isOpen = ref(false)
const searchQuery = ref('')

// 計算屬性
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)

// 已選擇的項目
const selectedItems = computed(() => {
    const values = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    return props.options.filter(option => values.includes(option.value))
})

// 篩選後的選項
const filteredOptions = computed(() => {
    if (!props.searchable || !searchQuery.value) {
        return props.options
    }

    const query = searchQuery.value.toLowerCase()
    return props.options.filter(option =>
        option.label.toLowerCase().includes(query)
    )
})

// 方法
const toggleDropdown = () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
}

const closeDropdown = () => {
    isOpen.value = false
    searchQuery.value = ''
}

const isSelected = (value) => {
    if (props.multiple) {
        return Array.isArray(props.modelValue) && props.modelValue.includes(value)
    }
    return props.modelValue === value
}

const selectOption = (option) => {
    if (option.disabled) return

    let newValue

    if (props.multiple) {
        const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const index = currentValues.indexOf(option.value)

        if (index > -1) {
            currentValues.splice(index, 1)
        } else {
            currentValues.push(option.value)
        }

        newValue = currentValues
    } else {
        newValue = option.value
        closeDropdown()
    }

    emit('update:modelValue', newValue)
    emit('change', newValue)
}

const removeItem = (value) => {
    if (!props.multiple) return

    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(value)

    if (index > -1) {
        currentValues.splice(index, 1)
        emit('update:modelValue', currentValues)
        emit('change', currentValues)
    }
}

// 點擊外部關閉下拉
const handleClickOutside = (event) => {
    if (!event.target.closest('.select-wrapper')) {
        closeDropdown()
    }
}

// 生命週期
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.select-label {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.required {
    color: var(--danger-color);
}

.select-wrapper {
    position: relative;
}

.select-display {
    display: flex;
    align-items: center;
    min-height: 2.5rem;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    cursor: pointer;
    transition: var(--transition-base);
}

.select-display:hover:not(.is-disabled) {
    border-color: var(--primary-color);
}

.select-wrapper.is-open .select-display {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 216, 89, 0.2);
}

.select-wrapper.is-disabled .select-display {
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: not-allowed;
}

/* 尺寸變化 */
.select--sm {
    min-height: 2rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-sm);
}

.select--lg {
    min-height: 3rem;
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-lg);
}

.select-icon--prefix {
    margin-right: var(--spacing-sm);
    color: var(--text-secondary);
}

.select-content {
    flex: 1;
    display: flex;
    align-items: center;
    min-height: 1.5rem;
}

.select-placeholder {
    color: var(--text-secondary);
}

.select-value {
    color: var(--text-primary);
}

/* 多選標籤 */
.select-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    width: 100%;
}

.select-tag {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background-color: var(--primary-color);
    color: var(--text-primary);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-sm);
}

.select-tag-close {
    margin-left: var(--spacing-xs);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    color: inherit;
}

.select-tag-close:hover {
    opacity: 0.7;
}

.select-arrow {
    margin-left: var(--spacing-sm);
    color: var(--text-secondary);
    transition: transform var(--transition-base);
    font-size: 0.75rem;
}

.select-arrow.is-open {
    transform: rotate(180deg);
}

/* 下拉選項 */
.select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    max-height: 200px;
    overflow: hidden;
}

.select-search {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-light);
}

.select-search-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: var(--font-sm);
}

.select-options {
    max-height: 150px;
    overflow-y: auto;
}

.select-option {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: background-color var(--transition-base);
}

.select-option:hover:not(.is-disabled) {
    background-color: var(--bg-secondary);
}

.select-option.is-selected {
    background-color: rgba(255, 216, 89, 0.1);
    color: var(--primary-color);
}

.select-option.is-disabled {
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;
}

.select-option-icon {
    margin-right: var(--spacing-sm);
}

.select-option-label {
    flex: 1;
}

.select-option-check {
    margin-left: var(--spacing-sm);
    color: var(--success-color);
    font-weight: bold;
}

.select-empty {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-sm);
}

/* 狀態樣式 */
.select-wrapper.has-error .select-display {
    border-color: var(--danger-color);
}

.select-wrapper.has-success .select-display {
    border-color: var(--success-color);
}

/* 訊息樣式 */
.select-error {
    font-size: var(--font-sm);
    color: var(--danger-color);
    margin-top: var(--spacing-xs);
}

.select-success {
    font-size: var(--font-sm);
    color: var(--success-color);
    margin-top: var(--spacing-xs);
}

.select-hint {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
}

/* 過渡動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
    transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: scaleY(0.8);
}
</style>

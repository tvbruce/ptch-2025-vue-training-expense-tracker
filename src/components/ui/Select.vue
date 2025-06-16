<template>
    <div class="select-wrapper" :class="{ 'select-disabled': disabled }">
        <label v-if="label" class="select-label">{{ label }}</label>

        <div class="select-container" :class="{
            'select-open': isOpen,
            'select-error': error,
            'select-multiple': multiple
        }" @click="toggleDropdown" ref="selectRef">
            <!-- 單選顯示 -->
            <div v-if="!multiple" class="select-display">
                <div v-if="selectedOption" class="select-value">
                    <span v-if="selectedOption.icon" class="select-icon">{{ selectedOption.icon }}</span>
                    <span class="select-text">{{ selectedOption.label }}</span>
                </div>
                <div v-else class="select-placeholder">{{ placeholder }}</div>
                <span class="select-arrow" :class="{ 'select-arrow-up': isOpen }">▼</span>
            </div>

            <!-- 多選顯示 -->
            <div v-else class="select-display select-multiple-display">
                <div v-if="selectedOptions.length > 0" class="select-tags">
                    <span v-for="option in selectedOptions" :key="option.value" class="select-tag">
                        <span v-if="option.icon" class="select-tag-icon">{{ option.icon }}</span>
                        <span class="select-tag-text">{{ option.label }}</span>
                        <button type="button" class="select-tag-remove" @click.stop="removeOption(option)">
                            ×
                        </button>
                    </span>
                </div>
                <div v-else class="select-placeholder">{{ placeholder }}</div>
                <span class="select-arrow" :class="{ 'select-arrow-up': isOpen }">▼</span>
            </div>

            <!-- 下拉選項 -->
            <div v-if="isOpen" class="select-dropdown">
                <!-- 搜尋框 -->
                <div v-if="searchable" class="select-search">
                    <input type="text" v-model="searchQuery" :placeholder="searchPlaceholder"
                        class="select-search-input" @click.stop ref="searchInput" />
                </div>

                <!-- 選項列表 -->
                <div class="select-options" ref="optionsRef">
                    <template v-if="groupedOptions.length > 0">
                        <template v-for="group in groupedOptions" :key="group.label || 'default'">
                            <!-- 分組標題 -->
                            <div v-if="group.label" class="select-group-label">
                                {{ group.label }}
                            </div>

                            <!-- 分組選項 -->
                            <div v-for="option in group.options" :key="option.value" class="select-option" :class="{
                                'select-option-selected': isSelected(option),
                                'select-option-disabled': option.disabled
                            }" @click="selectOption(option)">
                                <div class="select-option-content">
                                    <span v-if="option.icon" class="select-option-icon">{{ option.icon }}</span>
                                    <span class="select-option-text">{{ option.label }}</span>
                                    <span v-if="option.description" class="select-option-description">
                                        {{ option.description }}
                                    </span>
                                </div>
                                <span v-if="multiple && isSelected(option)" class="select-option-check">✓</span>
                            </div>
                        </template>
                    </template>

                    <!-- 無選項提示 -->
                    <div v-else class="select-no-options">
                        {{ noOptionsText }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="select-error-message">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props 定義
const props = defineProps({
    modelValue: {
        type: [String, Number, Array],
        default: null
    },
    options: {
        type: Array,
        default: () => []
    },
    placeholder: {
        type: String,
        default: '請選擇...'
    },
    label: {
        type: String,
        default: ''
    },
    multiple: {
        type: Boolean,
        default: false
    },
    searchable: {
        type: Boolean,
        default: false
    },
    searchPlaceholder: {
        type: String,
        default: '搜尋選項...'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    noOptionsText: {
        type: String,
        default: '無可用選項'
    },
    clearable: {
        type: Boolean,
        default: false
    }
})

// Emits 定義
const emit = defineEmits(['update:modelValue', 'change', 'search'])

// 響應式數據
const isOpen = ref(false)
const searchQuery = ref('')
const selectRef = ref(null)
const searchInput = ref(null)
const optionsRef = ref(null)

// 計算屬性
const selectedOption = computed(() => {
    if (props.multiple) return null
    return props.options.find(option => option.value === props.modelValue)
})

const selectedOptions = computed(() => {
    if (!props.multiple) return []
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return props.options.filter(option => values.includes(option.value))
})

const filteredOptions = computed(() => {
    if (!props.searchable || !searchQuery.value) {
        return props.options
    }

    const query = searchQuery.value.toLowerCase()
    return props.options.filter(option =>
        option.label.toLowerCase().includes(query) ||
        (option.description && option.description.toLowerCase().includes(query))
    )
})

const groupedOptions = computed(() => {
    const options = filteredOptions.value

    // 檢查是否有分組
    const hasGroups = options.some(option => option.group)

    if (!hasGroups) {
        return [{ label: null, options }]
    }

    // 按分組整理選項
    const groups = {}
    options.forEach(option => {
        const groupName = option.group || '其他'
        if (!groups[groupName]) {
            groups[groupName] = []
        }
        groups[groupName].push(option)
    })

    return Object.entries(groups).map(([label, options]) => ({
        label: label === '其他' ? null : label,
        options
    }))
})

// 方法
const toggleDropdown = () => {
    if (props.disabled) return

    isOpen.value = !isOpen.value

    if (isOpen.value && props.searchable) {
        nextTick(() => {
            searchInput.value?.focus()
        })
    }
}

const selectOption = (option) => {
    if (option.disabled) return

    if (props.multiple) {
        const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const index = currentValues.indexOf(option.value)

        if (index > -1) {
            currentValues.splice(index, 1)
        } else {
            currentValues.push(option.value)
        }

        emit('update:modelValue', currentValues)
        emit('change', currentValues, selectedOptions.value)
    } else {
        emit('update:modelValue', option.value)
        emit('change', option.value, option)
        isOpen.value = false
    }
}

const removeOption = (option) => {
    if (props.disabled) return

    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(option.value)

    if (index > -1) {
        currentValues.splice(index, 1)
        emit('update:modelValue', currentValues)
        emit('change', currentValues, selectedOptions.value)
    }
}

const isSelected = (option) => {
    if (props.multiple) {
        const values = Array.isArray(props.modelValue) ? props.modelValue : []
        return values.includes(option.value)
    }
    return props.modelValue === option.value
}

const handleClickOutside = (event) => {
    if (selectRef.value && !selectRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

// 監聽搜尋查詢變化
watch(searchQuery, (newQuery) => {
    emit('search', newQuery)
})

// 生命週期
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-wrapper {
    position: relative;
    width: 100%;
}

.select-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
}

.select-container {
    position: relative;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.select-container:hover {
    border-color: var(--primary-color);
}

.select-open {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 216, 89, 0.2);
}

.select-error {
    border-color: var(--danger-color);
}

.select-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.select-disabled .select-container {
    cursor: not-allowed;
    background: var(--bg-secondary);
}

.select-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    min-height: 2.5rem;
}

.select-multiple-display {
    min-height: auto;
    padding: 0.5rem;
}

.select-value,
.select-placeholder {
    display: flex;
    align-items: center;
    flex: 1;
}

.select-placeholder {
    color: var(--text-muted);
}

.select-icon {
    margin-right: 0.5rem;
    font-size: 1rem;
}

.select-text {
    color: var(--text-primary);
}

.select-arrow {
    color: var(--text-secondary);
    font-size: 0.75rem;
    transition: transform 0.2s ease;
}

.select-arrow-up {
    transform: rotate(180deg);
}

.select-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
}

.select-tag {
    display: flex;
    align-items: center;
    background: var(--primary-color);
    color: var(--text-primary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
}

.select-tag-icon {
    margin-right: 0.25rem;
}

.select-tag-remove {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    margin-left: 0.25rem;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
}

.select-tag-remove:hover {
    color: var(--danger-color);
}

.select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow: hidden;
}

.select-search {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-light);
}

.select-search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.875rem;
    outline: none;
}

.select-search-input:focus {
    border-color: var(--primary-color);
}

.select-options {
    max-height: 150px;
    overflow-y: auto;
}

.select-group-label {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.select-option:hover {
    background: var(--bg-secondary);
}

.select-option-selected {
    background: rgba(255, 216, 89, 0.1);
    color: var(--primary-dark);
}

.select-option-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.select-option-content {
    display: flex;
    align-items: center;
    flex: 1;
}

.select-option-icon {
    margin-right: 0.5rem;
    font-size: 1rem;
}

.select-option-text {
    font-weight: 500;
}

.select-option-description {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.select-option-check {
    color: var(--success-color);
    font-weight: bold;
}

.select-no-options {
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
}

.select-error-message {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--danger-color);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .select-dropdown {
        max-height: 160px;
    }

    .select-options {
        max-height: 120px;
    }

    .select-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.4rem;
    }
}
</style>

<template>
    <form @submit.prevent="handleSubmit" class="category-form">
        <!-- 分類名稱 -->
        <div class="form-group">
            <Input v-model="form.name" label="分類名稱" required :error="errors.name" placeholder="請輸入分類名稱"
                maxlength="20" />
        </div>

        <!-- 分類類型 -->
        <div class="form-group">
            <label class="form-label">分類類型 *</label>
            <div class="type-toggle">
                <button type="button" class="type-btn" :class="{ 'type-btn--active': form.type === 'income' }"
                    @click="form.type = 'income'">
                    <span class="type-icon">💰</span>
                    收入
                </button>
                <button type="button" class="type-btn" :class="{ 'type-btn--active': form.type === 'expense' }"
                    @click="form.type = 'expense'">
                    <span class="type-icon">💸</span>
                    支出
                </button>
            </div>
        </div>

        <!-- 圖示選擇 -->
        <div class="form-group">
            <label class="form-label">圖示 *</label>
            <div class="icon-selector">
                <div class="icon-grid">
                    <button v-for="icon in iconOptions" :key="icon" type="button" class="icon-option"
                        :class="{ 'icon-option--active': form.icon === icon }" @click="form.icon = icon">
                        {{ icon }}
                    </button>
                </div>
                <div class="custom-icon">
                    <Input v-model="customIcon" placeholder="或輸入自訂圖示" @input="handleCustomIcon" />
                </div>
            </div>
        </div>

        <!-- 顏色選擇 -->
        <div class="form-group">
            <label class="form-label">顏色 *</label>
            <div class="color-selector">
                <div class="color-grid">
                    <button v-for="color in colorOptions" :key="color" type="button" class="color-option"
                        :class="{ 'color-option--active': form.color === color }" :style="{ backgroundColor: color }"
                        @click="form.color = color"></button>
                </div>
                <div class="custom-color">
                    <input v-model="form.color" type="color" class="color-picker" />
                    <span class="color-value">{{ form.color }}</span>
                </div>
            </div>
        </div>

        <!-- 描述 -->
        <div class="form-group">
            <Input v-model="form.description" label="描述" :error="errors.description" placeholder="請輸入分類描述（可選）"
                maxlength="100" />
        </div>

        <!-- 預覽 -->
        <div class="form-group">
            <label class="form-label">預覽</label>
            <div class="category-preview">
                <div class="preview-item">
                    <span class="preview-icon" :style="{ backgroundColor: form.color }">
                        {{ form.icon || '📝' }}
                    </span>
                    <span class="preview-name">{{ form.name || '分類名稱' }}</span>
                    <span class="preview-type">{{ form.type === 'income' ? '收入' : '支出' }}</span>
                </div>
            </div>
        </div>

        <!-- 表單操作按鈕 -->
        <div class="form-actions">
            <Button type="button" variant="secondary" @click="handleCancel">
                取消
            </Button>
            <Button type="submit" variant="primary" :loading="loading">
                {{ isEditing ? '更新' : '新增' }}
            </Button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useUIStore } from '@/stores/ui'
import { validateCategory } from '@/utils/validation'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

// 定義 Props
const props = defineProps({
    category: {
        type: Object,
        default: null,
    },
})

// 定義 Emits
const emit = defineEmits(['success', 'cancel'])

// 使用 stores
const categoryStore = useCategoryStore()
const uiStore = useUIStore()

// 響應式資料
const loading = ref(false)
const errors = ref({})
const customIcon = ref('')

// 表單資料
const form = reactive({
    name: '',
    type: 'expense',
    icon: '📝',
    color: '#4CAF50',
    description: '',
})

// 計算屬性
const isEditing = computed(() => !!props.category)

// 圖示選項
const iconOptions = computed(() => {
    const commonIcons = ['📝', '🏠', '🚗', '🍔', '👕', '💊', '🎬', '📚', '✈️', '🎁']

    if (form.type === 'income') {
        return ['💰', '💵', '💳', '🏦', '📈', '💼', '🎯', '🏆', '💎', '🌟', ...commonIcons]
    } else {
        return ['🛒', '🍕', '⛽', '🏥', '🎮', '👔', '📱', '🎵', '🚌', '💡', ...commonIcons]
    }
})

// 顏色選項
const colorOptions = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
    '#607D8B', '#795548', '#E91E63', '#00BCD4', '#8BC34A',
    '#FFC107', '#673AB7', '#3F51B5', '#009688', '#CDDC39'
]

// 方法
const initializeForm = () => {
    if (props.category) {
        // 編輯模式 - 填充現有資料
        Object.assign(form, {
            name: props.category.name,
            type: props.category.type,
            icon: props.category.icon,
            color: props.category.color,
            description: props.category.description || '',
        })
    } else {
        // 新增模式 - 重置表單
        Object.assign(form, {
            name: '',
            type: 'expense',
            icon: '📝',
            color: '#4CAF50',
            description: '',
        })
    }

    // 清除錯誤
    errors.value = {}
}

const validateForm = () => {
    const validation = validateCategory(form)
    errors.value = validation.errors
    return validation.isValid
}

const handleCustomIcon = () => {
    if (customIcon.value.trim()) {
        form.icon = customIcon.value.trim()
    }
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const categoryData = { ...form }

        if (isEditing.value) {
            await categoryStore.updateCategory(props.category.id, categoryData)
        } else {
            await categoryStore.addCategory(categoryData)
        }

        emit('success')
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '操作失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    emit('cancel')
}

// 監聽器
watch(() => props.category, () => {
    initializeForm()
}, { immediate: true })

// 監聽類型變化，更新預設顏色
watch(() => form.type, (newType) => {
    if (newType === 'income') {
        form.color = '#4CAF50' // 綠色
    } else {
        form.color = '#F44336' // 紅色
    }
})
</script>

<style scoped>
.category-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.form-label {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

/* 類型切換按鈕 */
.type-toggle {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-primary);
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-base);
    font-size: var(--font-sm);
}

.type-btn:first-child {
    border-right: 1px solid var(--border-color);
}

.type-btn:hover {
    background-color: var(--bg-secondary);
}

.type-btn--active {
    background-color: var(--primary-color);
    color: var(--text-primary);
    font-weight: var(--font-medium);
}

.type-icon {
    font-size: 1rem;
}

/* 圖示選擇器 */
.icon-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-secondary);
}

.icon-option {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-primary);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition-base);
    font-size: 1.25rem;
}

.icon-option:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
}

.icon-option--active {
    border-color: var(--primary-color);
    background-color: rgba(255, 216, 89, 0.1);
}

.custom-icon {
    max-width: 200px;
}

/* 顏色選擇器 */
.color-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-secondary);
}

.color-option {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition-base);
}

.color-option:hover {
    transform: scale(1.1);
    border-color: var(--text-secondary);
}

.color-option--active {
    border-color: var(--text-primary);
    transform: scale(1.1);
}

.custom-color {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.color-picker {
    width: 3rem;
    height: 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
}

.color-value {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    font-family: monospace;
}

/* 預覽 */
.category-preview {
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-secondary);
}

.preview-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.preview-icon {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.25rem;
    color: white;
}

.preview-name {
    font-size: var(--font-md);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.preview-type {
    padding: 0.25rem 0.5rem;
    background-color: var(--primary-color);
    color: var(--text-primary);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-xs);
    font-weight: var(--font-medium);
}

/* 表單操作按鈕 */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);
}

/* 響應式設計 */
@media (max-width: 480px) {
    .form-actions {
        flex-direction: column-reverse;
        gap: var(--spacing-sm);
    }

    .type-toggle {
        flex-direction: column;
    }

    .type-btn:first-child {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }

    .icon-grid {
        grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
    }

    .color-grid {
        grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    }

    .preview-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }
}
</style>

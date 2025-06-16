<template>
    <form @submit.prevent="handleSubmit" class="transaction-form">
        <!-- 交易類型 -->
        <div class="form-group">
            <label class="form-label">交易類型 *</label>
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

        <!-- 金額 -->
        <div class="form-group">
            <Input v-model="form.amount" label="金額" type="number" step="0.01" min="0" required :error="errors.amount"
                prefix-icon="$" placeholder="請輸入金額" />
        </div>

        <!-- 分類 -->
        <div class="form-group">
            <BaseSelect v-model="form.category" label="分類" :options="categoryOptions" required :error="errors.category"
                placeholder="請選擇分類" searchable />
        </div>

        <!-- 描述 -->
        <div class="form-group">
            <Input v-model="form.description" label="描述" :error="errors.description" placeholder="請輸入交易描述"
                maxlength="100" />
        </div>

        <!-- 日期 -->
        <div class="form-group">
            <Input v-model="form.date" label="日期" type="date" required :error="errors.date" />
        </div>

        <!-- 標籤 -->
        <div class="form-group">
            <label class="form-label">標籤</label>
            <div class="tags-input">
                <div class="tag-list">
                    <span v-for="tag in form.tags" :key="tag" class="tag">
                        {{ tag }}
                        <button type="button" class="tag-remove" @click="removeTag(tag)">
                            ×
                        </button>
                    </span>
                </div>
                <input v-model="newTag" type="text" class="tag-input" placeholder="輸入標籤後按 Enter"
                    @keydown.enter.prevent="addTag" @keydown="handleTagKeydown" />
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { useUIStore } from '@/stores/ui'
import { validateTransaction } from '@/utils/validation'
import { formatDate } from '@/utils/date'
import Input from '@/components/ui/Input.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Button from '@/components/ui/Button.vue'

// 定義 Props
const props = defineProps({
    transaction: {
        type: Object,
        default: null,
    },
})

// 定義 Emits
const emit = defineEmits(['success', 'cancel'])

// 使用 stores
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const uiStore = useUIStore()

// 響應式資料
const loading = ref(false)
const errors = ref({})
const newTag = ref('')

// 表單資料
const form = reactive({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: formatDate(new Date(), 'YYYY-MM-DD'),
    tags: [],
})

// 計算屬性
const isEditing = computed(() => !!props.transaction)

// 分類選項
const categoryOptions = computed(() => {
    const categories = form.type === 'income'
        ? categoryStore.incomeCategories
        : categoryStore.expenseCategories

    return categories.map(category => ({
        value: category.id,
        label: category.name,
        icon: category.icon,
    }))
})

// 方法
const initializeForm = () => {
    if (props.transaction) {
        // 編輯模式 - 填充現有資料
        Object.assign(form, {
            type: props.transaction.type,
            amount: props.transaction.amount.toString(),
            category: props.transaction.category,
            description: props.transaction.description || '',
            date: props.transaction.date,
            tags: [...(props.transaction.tags || [])],
        })
    } else {
        // 新增模式 - 重置表單
        Object.assign(form, {
            type: 'expense',
            amount: '',
            category: '',
            description: '',
            date: formatDate(new Date(), 'YYYY-MM-DD'),
            tags: [],
        })
    }

    // 清除錯誤
    errors.value = {}
}

const validateForm = () => {
    const validation = validateTransaction({
        ...form,
        amount: parseFloat(form.amount),
    })

    errors.value = validation.errors
    return validation.isValid
}

const addTag = () => {
    const tag = newTag.value.trim()
    if (tag && !form.tags.includes(tag)) {
        form.tags.push(tag)
        newTag.value = ''
    }
}

const removeTag = (tag) => {
    const index = form.tags.indexOf(tag)
    if (index > -1) {
        form.tags.splice(index, 1)
    }
}

const handleTagKeydown = (event) => {
    // 處理逗號鍵
    if (event.key === ',' || event.key === '，') {
        event.preventDefault()
        addTag()
    }
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const transactionData = {
            ...form,
            amount: parseFloat(form.amount),
        }

        if (isEditing.value) {
            await transactionStore.updateTransaction(props.transaction.id, transactionData)
        } else {
            await transactionStore.addTransaction(transactionData)
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
watch(() => form.type, () => {
    // 切換類型時重置分類
    form.category = ''
})

watch(() => props.transaction, () => {
    initializeForm()
}, { immediate: true })

// 生命週期
onMounted(() => {
    // 確保分類資料已載入
    if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories()
    }
})
</script>

<style scoped>
.transaction-form {
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

/* 標籤輸入 */
.tags-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    min-height: 2.5rem;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
}

.tag {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: 0.25rem 0.5rem;
    background-color: var(--primary-color);
    color: var(--text-primary);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-sm);
}

.tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: inherit;
    padding: 0;
    margin-left: 0.25rem;
}

.tag-remove:hover {
    opacity: 0.7;
}

.tag-input {
    flex: 1;
    min-width: 120px;
    border: none;
    outline: none;
    background: none;
    color: var(--text-primary);
    font-size: var(--font-sm);
}

.tag-input::placeholder {
    color: var(--text-secondary);
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
}
</style>

<template>
    <form @submit.prevent="handleSubmit" class="budget-form">
        <!-- 分類選擇 -->
        <div class="form-group">
            <BaseSelect v-model="form.category" label="分類" :options="categoryOptions" required :error="errors.category"
                placeholder="請選擇要設定預算的分類" searchable />
        </div>

        <!-- 預算金額 -->
        <div class="form-group">
            <Input v-model="form.amount" label="預算金額" type="number" step="0.01" min="0" required :error="errors.amount"
                prefix-icon="$" placeholder="請輸入預算金額" />
        </div>

        <!-- 預算週期 -->
        <div class="form-group">
            <label class="form-label">預算週期 *</label>
            <div class="period-toggle">
                <button type="button" class="period-btn" :class="{ 'period-btn--active': form.period === 'monthly' }"
                    @click="form.period = 'monthly'">
                    <span class="period-icon">📅</span>
                    月度預算
                </button>
                <button type="button" class="period-btn" :class="{ 'period-btn--active': form.period === 'yearly' }"
                    @click="form.period = 'yearly'">
                    <span class="period-icon">📆</span>
                    年度預算
                </button>
            </div>
        </div>

        <!-- 年份選擇 -->
        <div class="form-group">
            <BaseSelect v-model="form.year" label="年份" :options="yearOptions" required :error="errors.year" />
        </div>

        <!-- 月份選擇（僅月度預算） -->
        <div v-if="form.period === 'monthly'" class="form-group">
            <BaseSelect v-model="form.month" label="月份" :options="monthOptions" required :error="errors.month" />
        </div>

        <!-- 警告閾值 -->
        <div class="form-group">
            <label class="form-label">警告閾值</label>
            <div class="threshold-input">
                <Input v-model="form.alertThreshold" type="number" min="1" max="100" :error="errors.alertThreshold"
                    placeholder="80" />
                <span class="threshold-unit">%</span>
            </div>
            <div class="threshold-help">
                當支出達到預算的此百分比時會發出警告
            </div>
        </div>

        <!-- 預算預覽 -->
        <div class="form-group">
            <label class="form-label">預算預覽</label>
            <div class="budget-preview">
                <div class="preview-header">
                    <div class="preview-category">
                        <span v-if="selectedCategory" class="category-icon"
                            :style="{ backgroundColor: selectedCategory.color }">
                            {{ selectedCategory.icon }}
                        </span>
                        <span class="category-name">{{ selectedCategory?.name || '請選擇分類' }}</span>
                    </div>
                    <div class="preview-amount">{{ formatCurrency(parseFloat(form.amount) || 0) }}</div>
                </div>
                <div class="preview-details">
                    <div class="detail-item">
                        <span class="detail-label">週期：</span>
                        <span class="detail-value">{{ form.period === 'monthly' ? '月度' : '年度' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">時間：</span>
                        <span class="detail-value">
                            {{ form.period === 'monthly' ? `${form.year}年${form.month}月` : `${form.year}年` }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">警告閾值：</span>
                        <span class="detail-value">{{ form.alertThreshold }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 歷史預算參考 -->
        <div v-if="historicalBudgets.length > 0" class="form-group">
            <label class="form-label">歷史預算參考</label>
            <div class="historical-budgets">
                <div v-for="budget in historicalBudgets" :key="budget.id" class="historical-item"
                    @click="applyHistoricalBudget(budget)">
                    <div class="historical-period">
                        {{ budget.period === 'monthly' ? `${budget.year}年${budget.month}月` : `${budget.year}年` }}
                    </div>
                    <div class="historical-amount">{{ formatCurrency(budget.amount) }}</div>
                    <button type="button" class="apply-btn">套用</button>
                </div>
            </div>
        </div>

        <!-- 表單操作按鈕 -->
        <div class="form-actions">
            <Button type="button" variant="secondary" @click="handleCancel">
                取消
            </Button>
            <Button type="submit" variant="primary" :loading="loading">
                {{ isEditing ? '更新預算' : '設定預算' }}
            </Button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/category'
import { useUIStore } from '@/stores/ui'
import { validateBudget } from '@/utils/validation'
import { formatCurrency } from '@/utils/currency'
import Input from '@/components/ui/Input.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Button from '@/components/ui/Button.vue'

// 定義 Props
const props = defineProps({
    budget: {
        type: Object,
        default: null,
    },
})

// 定義 Emits
const emit = defineEmits(['success', 'cancel'])

// 使用 stores
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const uiStore = useUIStore()

// 響應式資料
const loading = ref(false)
const errors = ref({})

// 表單資料
const form = reactive({
    category: '',
    amount: '',
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    alertThreshold: 80,
})

// 計算屬性
const isEditing = computed(() => !!props.budget)

// 分類選項（僅支出分類）
const categoryOptions = computed(() => {
    return categoryStore.expenseCategories.map(category => ({
        value: category.id,
        label: category.name,
        icon: category.icon,
    }))
})

// 選中的分類
const selectedCategory = computed(() => {
    return categoryStore.categories.find(cat => cat.id === form.category)
})

// 年份選項
const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        years.push({
            value: i,
            label: `${i}年`,
        })
    }
    return years
})

// 月份選項
const monthOptions = [
    { value: 1, label: '1月' },
    { value: 2, label: '2月' },
    { value: 3, label: '3月' },
    { value: 4, label: '4月' },
    { value: 5, label: '5月' },
    { value: 6, label: '6月' },
    { value: 7, label: '7月' },
    { value: 8, label: '8月' },
    { value: 9, label: '9月' },
    { value: 10, label: '10月' },
    { value: 11, label: '11月' },
    { value: 12, label: '12月' },
]

// 歷史預算
const historicalBudgets = computed(() => {
    if (!form.category) return []

    return budgetStore.budgets
        .filter(budget =>
            budget.category === form.category &&
            !(budget.year === form.year && budget.month === form.month && budget.period === form.period)
        )
        .slice(0, 3) // 只顯示最近3個
})

// 方法
const initializeForm = () => {
    if (props.budget) {
        // 編輯模式 - 填充現有資料
        Object.assign(form, {
            category: props.budget.category,
            amount: props.budget.amount.toString(),
            period: props.budget.period,
            year: props.budget.year,
            month: props.budget.month || new Date().getMonth() + 1,
            alertThreshold: props.budget.alertThreshold || 80,
        })
    } else {
        // 新增模式 - 重置表單
        Object.assign(form, {
            category: '',
            amount: '',
            period: 'monthly',
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            alertThreshold: 80,
        })
    }

    // 清除錯誤
    errors.value = {}
}

const validateForm = () => {
    const validation = validateBudget({
        ...form,
        amount: parseFloat(form.amount),
    })

    errors.value = validation.errors
    return validation.isValid
}

const applyHistoricalBudget = (budget) => {
    form.amount = budget.amount.toString()
    form.alertThreshold = budget.alertThreshold || 80
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const budgetData = {
            ...form,
            amount: parseFloat(form.amount),
        }

        // 如果是年度預算，移除月份
        if (budgetData.period === 'yearly') {
            delete budgetData.month
        }

        if (isEditing.value) {
            await budgetStore.updateBudget(props.budget.id, budgetData)
        } else {
            await budgetStore.setBudget(budgetData)
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
watch(() => props.budget, () => {
    initializeForm()
}, { immediate: true })

// 生命週期
onMounted(() => {
    // 確保分類資料已載入
    if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories()
    }

    // 載入預算資料
    if (budgetStore.budgets.length === 0) {
        budgetStore.fetchBudgets()
    }
})
</script>

<style scoped>
.budget-form {
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

/* 週期切換按鈕 */
.period-toggle {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.period-btn {
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

.period-btn:first-child {
    border-right: 1px solid var(--border-color);
}

.period-btn:hover {
    background-color: var(--bg-secondary);
}

.period-btn--active {
    background-color: var(--primary-color);
    color: var(--text-primary);
    font-weight: var(--font-medium);
}

.period-icon {
    font-size: 1rem;
}

/* 閾值輸入 */
.threshold-input {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.threshold-unit {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
}

.threshold-help {
    font-size: var(--font-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
}

/* 預算預覽 */
.budget-preview {
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-secondary);
}

.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
}

.preview-category {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.category-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1rem;
    color: white;
}

.category-name {
    font-size: var(--font-md);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.preview-amount {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    color: var(--primary-color);
}

.preview-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-sm);
}

.detail-label {
    color: var(--text-secondary);
}

.detail-value {
    color: var(--text-primary);
    font-weight: var(--font-medium);
}

/* 歷史預算 */
.historical-budgets {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    max-height: 150px;
    overflow-y: auto;
}

.historical-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    cursor: pointer;
    transition: var(--transition-base);
}

.historical-item:hover {
    background-color: var(--bg-secondary);
    border-color: var(--primary-color);
}

.historical-period {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.historical-amount {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.apply-btn {
    padding: 0.25rem 0.5rem;
    background-color: var(--primary-color);
    color: var(--text-primary);
    border: none;
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-xs);
    cursor: pointer;
    transition: var(--transition-base);
}

.apply-btn:hover {
    background-color: var(--primary-dark);
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

    .period-toggle {
        flex-direction: column;
    }

    .period-btn:first-child {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }

    .preview-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
    }

    .historical-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }
}
</style>

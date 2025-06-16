<template>
    <div class="budget-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">預算管理</h1>
                <Button variant="primary" @click="openAddBudgetModal">
                    <span class="btn-icon">🎯</span>
                    設定預算
                </Button>
            </div>
        </div>

        <!-- 月份選擇器 -->
        <Card class="month-selector">
            <div class="selector-content">
                <div class="selector-group">
                    <label class="selector-label">年份</label>
                    <BaseSelect v-model="selectedYear" :options="yearOptions" @change="handleDateChange" />
                </div>
                <div class="selector-group">
                    <label class="selector-label">月份</label>
                    <BaseSelect v-model="selectedMonth" :options="monthOptions" @change="handleDateChange" />
                </div>
                <div class="selector-actions">
                    <Button variant="secondary" size="sm" @click="goToCurrentMonth">
                        回到本月
                    </Button>
                </div>
            </div>
        </Card>

        <!-- 預算總覽 -->
        <div class="budget-overview">
            <Card class="overview-card total-budget">
                <div class="overview-content">
                    <div class="overview-icon">💰</div>
                    <div class="overview-info">
                        <div class="overview-label">總預算</div>
                        <div class="overview-value">{{ formatCurrency(totalBudget) }}</div>
                    </div>
                </div>
            </Card>

            <Card class="overview-card total-spent">
                <div class="overview-content">
                    <div class="overview-icon">💸</div>
                    <div class="overview-info">
                        <div class="overview-label">已支出</div>
                        <div class="overview-value expense">{{ formatCurrency(totalSpent) }}</div>
                    </div>
                </div>
            </Card>

            <Card class="overview-card remaining-budget">
                <div class="overview-content">
                    <div class="overview-icon">💵</div>
                    <div class="overview-info">
                        <div class="overview-label">剩餘預算</div>
                        <div class="overview-value" :class="{ negative: remainingBudget < 0 }">
                            {{ formatCurrency(remainingBudget) }}
                        </div>
                    </div>
                </div>
            </Card>

            <Card class="overview-card usage-rate">
                <div class="overview-content">
                    <div class="overview-icon">📊</div>
                    <div class="overview-info">
                        <div class="overview-label">使用率</div>
                        <div class="overview-value" :class="getUsageRateClass()">
                            {{ usageRate }}%
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <!-- 預算警告 -->
        <div v-if="budgetAlerts.length > 0" class="budget-alerts">
            <Card class="alerts-card">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">⚠️</span>
                        預算警告
                    </h2>
                </template>

                <div class="alerts-list">
                    <div v-for="alert in budgetAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
                        <div class="alert-icon">
                            {{ alert.severity === 'danger' ? '🚨' : '⚠️' }}
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">{{ alert.categoryName }}</div>
                            <div class="alert-message">{{ alert.message }}</div>
                            <div class="alert-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" :class="alert.severity"
                                        :style="{ width: Math.min(alert.percentage, 100) + '%' }"></div>
                                </div>
                                <span class="progress-text">{{ alert.percentage }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <!-- 預算列表 -->
        <Card class="budget-list">
            <template #header>
                <div class="list-header">
                    <h2 class="section-title">
                        <span class="section-icon">📋</span>
                        預算明細
                    </h2>
                    <div class="list-actions">
                        <Button variant="secondary" size="sm" @click="copyFromPreviousMonth" :loading="copying"
                            :disabled="!hasPreviousMonthBudgets">
                            複製上月預算
                        </Button>
                    </div>
                </div>
            </template>

            <!-- 載入狀態 -->
            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-text">載入中...</div>
            </div>

            <!-- 空狀態 -->
            <div v-else-if="currentBudgets.length === 0" class="empty-state">
                <div class="empty-icon">🎯</div>
                <div class="empty-title">尚未設定預算</div>
                <div class="empty-subtitle">
                    為 {{ selectedYear }}年{{ selectedMonth }}月 設定預算，更好地管理您的支出
                </div>
                <Button variant="primary" @click="openAddBudgetModal">
                    設定第一個預算
                </Button>
            </div>

            <!-- 預算項目 -->
            <div v-else class="budget-items">
                <div v-for="budget in currentBudgets" :key="budget.id" class="budget-item"
                    :class="{ 'over-budget': budget.usagePercentage > 100 }">
                    <div class="budget-header">
                        <div class="budget-category">
                            <span class="category-icon" :style="{ backgroundColor: budget.categoryColor }">
                                {{ budget.categoryIcon }}
                            </span>
                            <div class="category-info">
                                <div class="category-name">{{ budget.categoryName }}</div>
                                <div class="category-type">{{ budget.period === 'monthly' ? '月度' : '年度' }}預算</div>
                            </div>
                        </div>

                        <div class="budget-actions">
                            <button class="action-btn edit-btn" @click="editBudget(budget)" title="編輯">
                                ✏️
                            </button>
                            <button class="action-btn delete-btn" @click="deleteBudget(budget)" title="刪除">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="budget-progress">
                        <div class="progress-info">
                            <div class="progress-amounts">
                                <span class="spent-amount">{{ formatCurrency(budget.spent) }}</span>
                                <span class="budget-amount">/ {{ formatCurrency(budget.amount) }}</span>
                            </div>
                            <div class="progress-percentage" :class="getProgressClass(budget.usagePercentage)">
                                {{ budget.usagePercentage }}%
                            </div>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill" :class="getProgressClass(budget.usagePercentage)"
                                :style="{ width: Math.min(budget.usagePercentage, 100) + '%' }"></div>
                        </div>

                        <div class="progress-details">
                            <div class="remaining-amount" :class="{ negative: budget.remaining < 0 }">
                                剩餘：{{ formatCurrency(budget.remaining) }}
                            </div>
                            <div v-if="budget.alertThreshold" class="alert-threshold">
                                警告閾值：{{ budget.alertThreshold }}%
                            </div>
                        </div>
                    </div>

                    <div v-if="budget.usagePercentage >= budget.alertThreshold" class="budget-warning">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">
                            {{ budget.usagePercentage >= 100 ? '已超出預算' : '接近預算上限' }}
                        </span>
                    </div>
                </div>
            </div>
        </Card>

        <!-- 新增/編輯預算模態框 -->
        <Modal :visible="uiStore.modals.setBudget" :title="editingBudget ? '編輯預算' : '設定預算'" width="600px"
            @close="closeBudgetModal">
            <BudgetForm :budget="editingBudget" @success="handleBudgetSuccess" @cancel="closeBudgetModal" />
        </Modal>

        <!-- 刪除確認模態框 -->
        <Modal :visible="showDeleteModal" title="確認刪除" width="400px" @close="showDeleteModal = false">
            <div class="delete-confirmation">
                <div class="delete-icon">⚠️</div>
                <div class="delete-message">
                    確定要刪除這個預算嗎？此操作無法復原。
                </div>
                <div v-if="deletingBudget" class="delete-details">
                    <div class="budget-preview">
                        <span class="preview-icon" :style="{ backgroundColor: deletingBudget.categoryColor }">
                            {{ deletingBudget.categoryIcon }}
                        </span>
                        <div class="preview-info">
                            <div class="preview-name">{{ deletingBudget.categoryName }}</div>
                            <div class="preview-amount">{{ formatCurrency(deletingBudget.amount) }}</div>
                            <div class="preview-period">
                                {{ deletingBudget.period === 'monthly' ? '月度' : '年度' }}預算
                            </div>
                        </div>
                    </div>
                </div>

                <div class="delete-actions">
                    <Button variant="secondary" @click="showDeleteModal = false">
                        取消
                    </Button>
                    <Button variant="danger" :loading="deleting" @click="confirmDelete">
                        確認刪除
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/category'
import { useTransactionStore } from '@/stores/transaction'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Modal from '@/components/ui/Modal.vue'
import BudgetForm from '@/components/forms/BudgetForm.vue'

// 使用 stores
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const uiStore = useUIStore()

// 響應式資料
const loading = ref(false)
const copying = ref(false)
const deleting = ref(false)
const editingBudget = ref(null)
const deletingBudget = ref(null)
const showDeleteModal = ref(false)

// 選中的年月
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

// 計算屬性
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

// 當前月份的預算
const currentBudgets = computed(() => {
    return budgetStore.budgets
        .filter(budget => {
            if (budget.period === 'monthly') {
                return budget.year === selectedYear.value && budget.month === selectedMonth.value
            } else {
                return budget.year === selectedYear.value
            }
        })
        .map(budget => {
            const category = categoryStore.getCategoryById(budget.category)
            const spent = getSpentAmount(budget)
            const remaining = budget.amount - spent
            const usagePercentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

            return {
                ...budget,
                categoryName: category?.name || '未知分類',
                categoryIcon: category?.icon || '📝',
                categoryColor: category?.color || '#666',
                spent,
                remaining,
                usagePercentage,
            }
        })
})

// 總預算
const totalBudget = computed(() => {
    return currentBudgets.value.reduce((sum, budget) => sum + budget.amount, 0)
})

// 總支出
const totalSpent = computed(() => {
    return currentBudgets.value.reduce((sum, budget) => sum + budget.spent, 0)
})

// 剩餘預算
const remainingBudget = computed(() => {
    return totalBudget.value - totalSpent.value
})

// 使用率
const usageRate = computed(() => {
    if (totalBudget.value === 0) return 0
    return Math.round((totalSpent.value / totalBudget.value) * 100)
})

// 預算警告
const budgetAlerts = computed(() => {
    return currentBudgets.value
        .filter(budget => budget.usagePercentage >= budget.alertThreshold)
        .map(budget => ({
            id: budget.id,
            categoryName: budget.categoryName,
            message: budget.usagePercentage >= 100
                ? `已超出預算 ${formatCurrency(budget.spent - budget.amount)}`
                : `已使用 ${budget.usagePercentage}% 的預算`,
            percentage: budget.usagePercentage,
            severity: budget.usagePercentage >= 100 ? 'danger' : 'warning',
        }))
})

// 是否有上月預算
const hasPreviousMonthBudgets = computed(() => {
    const prevMonth = selectedMonth.value === 1 ? 12 : selectedMonth.value - 1
    const prevYear = selectedMonth.value === 1 ? selectedYear.value - 1 : selectedYear.value

    return budgetStore.budgets.some(budget =>
        budget.period === 'monthly' &&
        budget.year === prevYear &&
        budget.month === prevMonth
    )
})

// 方法
const getSpentAmount = (budget) => {
    const startDate = budget.period === 'monthly'
        ? `${budget.year}-${String(budget.month).padStart(2, '0')}-01`
        : `${budget.year}-01-01`

    const endDate = budget.period === 'monthly'
        ? `${budget.year}-${String(budget.month).padStart(2, '0')}-31`
        : `${budget.year}-12-31`

    return transactionStore.transactions
        .filter(t =>
            t.type === 'expense' &&
            t.category === budget.category &&
            t.date >= startDate &&
            t.date <= endDate
        )
        .reduce((sum, t) => sum + t.amount, 0)
}

const getUsageRateClass = () => {
    if (usageRate.value >= 100) return 'danger'
    if (usageRate.value >= 80) return 'warning'
    return 'success'
}

const getProgressClass = (percentage) => {
    if (percentage >= 100) return 'danger'
    if (percentage >= 80) return 'warning'
    return 'success'
}

const handleDateChange = () => {
    budgetStore.setCurrentMonth(selectedMonth.value, selectedYear.value)
}

const goToCurrentMonth = () => {
    const now = new Date()
    selectedYear.value = now.getFullYear()
    selectedMonth.value = now.getMonth() + 1
    handleDateChange()
}

const openAddBudgetModal = () => {
    editingBudget.value = null
    uiStore.openModal('setBudget')
}

const closeBudgetModal = () => {
    editingBudget.value = null
    uiStore.closeModal('setBudget')
}

const editBudget = (budget) => {
    editingBudget.value = budget
    uiStore.openModal('setBudget')
}

const deleteBudget = (budget) => {
    deletingBudget.value = budget
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!deletingBudget.value) return

    deleting.value = true

    try {
        await budgetStore.deleteBudget(deletingBudget.value.id)
        showDeleteModal.value = false
        deletingBudget.value = null

        uiStore.showNotification({
            type: 'success',
            title: '刪除成功',
            message: '預算已成功刪除',
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '刪除失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        deleting.value = false
    }
}

const copyFromPreviousMonth = async () => {
    copying.value = true

    try {
        const prevMonth = selectedMonth.value === 1 ? 12 : selectedMonth.value - 1
        const prevYear = selectedMonth.value === 1 ? selectedYear.value - 1 : selectedYear.value

        await budgetStore.copyBudgetsFromPreviousMonth(prevYear, prevMonth, selectedYear.value, selectedMonth.value)

        uiStore.showNotification({
            type: 'success',
            title: '複製成功',
            message: '已成功複製上月預算',
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '複製失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        copying.value = false
    }
}

const handleBudgetSuccess = () => {
    closeBudgetModal()
    uiStore.showNotification({
        type: 'success',
        title: '操作成功',
        message: editingBudget.value ? '預算已更新' : '預算已設定',
    })
}

// 監聽器
watch([selectedYear, selectedMonth], () => {
    handleDateChange()
})

// 生命週期
onMounted(async () => {
    loading.value = true

    try {
        await Promise.all([
            budgetStore.fetchBudgets(),
            categoryStore.fetchCategories(),
            transactionStore.loadTransactions(),
        ])

        // 設定當前月份
        budgetStore.setCurrentMonth(selectedMonth.value, selectedYear.value)
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '載入失敗',
            message: error.message || '無法載入預算資料',
        })
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.budget-page {
    padding: var(--spacing-lg);
    max-width: 1400px;
    margin: 0 auto;
}

/* 頁面標題 */
.page-header {
    margin-bottom: var(--spacing-lg);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.page-title {
    font-size: var(--font-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
}

.btn-icon {
    margin-right: var(--spacing-xs);
}

/* 月份選擇器 */
.month-selector {
    margin-bottom: var(--spacing-lg);
}

.selector-content {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
}

.selector-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    min-width: 120px;
}

.selector-label {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.selector-actions {
    margin-left: auto;
}

/* 預算總覽 */
.budget-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.overview-card {
    transition: var(--transition-base);
}

.overview-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.overview-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
}

.overview-icon {
    font-size: 2.5rem;
}

.overview-info {
    flex: 1;
}

.overview-label {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.overview-value {
    font-size: var(--font-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
}

.overview-value.expense {
    color: var(--expense-color);
}

.overview-value.negative {
    color: var(--expense-color);
}

.overview-value.success {
    color: var(--success-color);
}

.overview-value.warning {
    color: var(--warning-color);
}

.overview-value.danger {
    color: var(--danger-color);
}

/* 預算警告 */
.budget-alerts {
    margin-bottom: var(--spacing-xl);
}

.section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
}

.section-icon {
    font-size: 1.25rem;
}

.alerts-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.alert-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    background-color: var(--bg-secondary);
}

.alert-item.warning {
    border-left: 4px solid var(--warning-color);
}

.alert-item.danger {
    border-left: 4px solid var(--danger-color);
}

.alert-icon {
    font-size: 1.5rem;
}

.alert-content {
    flex: 1;
}

.alert-title {
    font-size: var(--font-md);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.alert-message {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.alert-progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.progress-bar {
    flex: 1;
    height: 6px;
    background-color: var(--bg-accent);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    transition: var(--transition-base);
}

.progress-fill.success {
    background-color: var(--success-color);
}

.progress-fill.warning {
    background-color: var(--warning-color);
}

.progress-fill.danger {
    background-color: var(--danger-color);
}

.progress-text {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    min-width: 3rem;
    text-align: right;
}

/* 列表標題 */
.list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.list-actions {
    display: flex;
    gap: var(--spacing-sm);
}

/* 載入狀態 */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: var(--font-md);
}

/* 空狀態 */
.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
}

.empty-title {
    font-size: var(--font-lg);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.empty-subtitle {
    font-size: var(--font-md);
    margin-bottom: var(--spacing-lg);
}

/* 預算項目 */
.budget-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.budget-item {
    padding: var(--spacing-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    transition: var(--transition-base);
}

.budget-item:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
}

.budget-item.over-budget {
    border-color: var(--danger-color);
    background-color: rgba(244, 67, 54, 0.05);
}

.budget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-md);
}

.budget-category {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.category-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.5rem;
    color: white;
}

.category-info {
    flex: 1;
}

.category-name {
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.category-type {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.budget-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.action-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: calc(var(--border-radius) / 2);
    cursor: pointer;
    transition: var(--transition-base);
    font-size: 0.875rem;
}

.action-btn:hover {
    background-color: var(--bg-secondary);
}

.edit-btn:hover {
    background-color: rgba(33, 150, 243, 0.1);
}

.delete-btn:hover {
    background-color: rgba(244, 67, 54, 0.1);
}

/* 預算進度 */
.budget-progress {
    margin-bottom: var(--spacing-md);
}

.progress-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
}

.progress-amounts {
    font-size: var(--font-md);
}

.spent-amount {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
}

.budget-amount {
    color: var(--text-secondary);
}

.progress-percentage {
    font-size: var(--font-md);
    font-weight: var(--font-bold);
}

.progress-percentage.success {
    color: var(--success-color);
}

.progress-percentage.warning {
    color: var(--warning-color);
}

.progress-percentage.danger {
    color: var(--danger-color);
}

.progress-details {
    display: flex;
    justify-content: space-between;
    margin-top: var(--spacing-sm);
    font-size: var(--font-sm);
}

.remaining-amount {
    color: var(--text-secondary);
}

.remaining-amount.negative {
    color: var(--danger-color);
    font-weight: var(--font-medium);
}

.alert-threshold {
    color: var(--text-muted);
}

/* 預算警告 */
.budget-warning {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: rgba(255, 152, 0, 0.1);
    border: 1px solid var(--warning-color);
    border-radius: var(--border-radius);
    font-size: var(--font-sm);
}

.warning-icon {
    font-size: 1rem;
}

.warning-text {
    color: var(--warning-color);
    font-weight: var(--font-medium);
}

/* 刪除確認模態框 */
.delete-confirmation {
    text-align: center;
    padding: var(--spacing-md);
}

.delete-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

.delete-message {
    font-size: var(--font-md);
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
}

.delete-details {
    margin-bottom: var(--spacing-lg);
}

.budget-preview {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
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

.preview-info {
    flex: 1;
    text-align: left;
}

.preview-name {
    font-size: var(--font-md);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.preview-amount {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
}

.preview-period {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.delete-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
}

/* 響應式設計 */
@media (max-width: 1024px) {
    .budget-overview {
        grid-template-columns: repeat(2, 1fr);
    }

    .selector-content {
        flex-direction: column;
        align-items: stretch;
    }

    .selector-actions {
        margin-left: 0;
    }
}

@media (max-width: 768px) {
    .budget-page {
        padding: var(--spacing-md);
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .budget-overview {
        grid-template-columns: 1fr;
    }

    .list-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .budget-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .budget-category {
        justify-content: center;
        text-align: center;
    }

    .budget-actions {
        justify-content: center;
    }

    .progress-info {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .progress-details {
        flex-direction: column;
        gap: var(--spacing-xs);
    }
}

@media (max-width: 480px) {
    .overview-content {
        flex-direction: column;
        text-align: center;
    }

    .overview-icon {
        font-size: 2rem;
    }

    .category-icon {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.25rem;
    }

    .budget-item {
        padding: var(--spacing-md);
    }
}
</style>

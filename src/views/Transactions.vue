<template>
    <div class="transactions-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">交易記錄</h1>
                <Button variant="primary" @click="openAddTransactionModal">
                    <span class="btn-icon">➕</span>
                    新增交易
                </Button>
            </div>
        </div>

        <!-- 篩選工具列 -->
        <Card class="filter-card">
            <div class="filter-row">
                <!-- 搜尋框 -->
                <div class="search-box">
                    <Input v-model="searchQuery" placeholder="搜尋交易描述..." prefix-icon="🔍" @input="handleSearch" />
                </div>

                <!-- 類型篩選 -->
                <div class="filter-group">
                    <label class="filter-label">類型</label>
                    <BaseSelect v-model="filters.type" :options="typeOptions" placeholder="全部類型"
                        @change="applyFilters" />
                </div>

                <!-- 分類篩選 -->
                <div class="filter-group">
                    <label class="filter-label">分類</label>
                    <BaseSelect v-model="filters.category" :options="categoryOptions" placeholder="全部分類" searchable
                        @change="applyFilters" />
                </div>

                <!-- 日期範圍 -->
                <div class="filter-group">
                    <label class="filter-label">日期範圍</label>
                    <div class="date-range">
                        <input v-model="filters.startDate" type="date" class="date-input" @change="applyFilters" />
                        <span class="date-separator">至</span>
                        <input v-model="filters.endDate" type="date" class="date-input" @change="applyFilters" />
                    </div>
                </div>

                <!-- 清除篩選 -->
                <Button variant="secondary" size="sm" @click="clearFilters">
                    清除篩選
                </Button>
            </div>

            <!-- 快速日期篩選 -->
            <div class="quick-filters">
                <button v-for="quickFilter in quickDateFilters" :key="quickFilter.key" class="quick-filter-btn"
                    :class="{ active: activeQuickFilter === quickFilter.key }" @click="applyQuickFilter(quickFilter)">
                    {{ quickFilter.label }}
                </button>
            </div>
        </Card>

        <!-- 統計摘要 -->
        <div class="summary-stats">
            <div class="stat-item">
                <span class="stat-label">總筆數</span>
                <span class="stat-value">{{ filteredTransactions.length }}</span>
            </div>
            <div class="stat-item income">
                <span class="stat-label">收入</span>
                <span class="stat-value">{{ formatCurrency(summaryStats.totalIncome) }}</span>
            </div>
            <div class="stat-item expense">
                <span class="stat-label">支出</span>
                <span class="stat-value">{{ formatCurrency(summaryStats.totalExpense) }}</span>
            </div>
            <div class="stat-item balance" :class="{ negative: summaryStats.balance < 0 }">
                <span class="stat-label">淨額</span>
                <span class="stat-value">{{ formatCurrency(summaryStats.balance) }}</span>
            </div>
        </div>

        <!-- 交易列表 -->
        <Card class="transactions-card">
            <template #header>
                <div class="list-header">
                    <span class="list-title">交易列表</span>
                    <div class="list-actions">
                        <Button variant="secondary" size="sm" @click="exportTransactions" :loading="exporting">
                            <span class="btn-icon">📤</span>
                            匯出
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
            <div v-else-if="paginatedTransactions.length === 0" class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-title">
                    {{ searchQuery || hasActiveFilters ? '沒有符合條件的交易' : '尚無交易記錄' }}
                </div>
                <div class="empty-subtitle">
                    {{ searchQuery || hasActiveFilters ? '請嘗試調整篩選條件' : '開始記錄您的第一筆交易' }}
                </div>
                <Button v-if="!searchQuery && !hasActiveFilters" variant="primary" @click="openAddTransactionModal">
                    新增交易
                </Button>
            </div>

            <!-- 交易表格 -->
            <div v-else class="transactions-table">
                <div class="table-header">
                    <div class="header-cell date-col" @click="toggleSort('date')">
                        日期
                        <span class="sort-icon" :class="getSortClass('date')">{{ getSortIcon('date') }}</span>
                    </div>
                    <div class="header-cell category-col">分類</div>
                    <div class="header-cell description-col">描述</div>
                    <div class="header-cell amount-col" @click="toggleSort('amount')">
                        金額
                        <span class="sort-icon" :class="getSortClass('amount')">{{ getSortIcon('amount') }}</span>
                    </div>
                    <div class="header-cell actions-col">操作</div>
                </div>

                <div class="table-body">
                    <div v-for="transaction in paginatedTransactions" :key="transaction.id" class="table-row"
                        @click="viewTransaction(transaction)">
                        <div class="table-cell date-col">
                            <div class="date-info">
                                <div class="date-primary">{{ formatDate(transaction.date, 'MM/DD') }}</div>
                                <div class="date-secondary">{{ formatDate(transaction.date, 'YYYY') }}</div>
                            </div>
                        </div>

                        <div class="table-cell category-col">
                            <div class="category-info">
                                <span class="category-icon"
                                    :style="{ backgroundColor: getCategoryColor(transaction.category) }">
                                    {{ getCategoryIcon(transaction.category) }}
                                </span>
                                <span class="category-name">{{ getCategoryName(transaction.category) }}</span>
                            </div>
                        </div>

                        <div class="table-cell description-col">
                            <div class="description-content">
                                <div class="description-text">{{ transaction.description }}</div>
                                <div v-if="transaction.tags && transaction.tags.length > 0" class="transaction-tags">
                                    <span v-for="tag in transaction.tags" :key="tag" class="tag">
                                        {{ tag }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="table-cell amount-col">
                            <div class="amount-info" :class="transaction.type">
                                <span class="amount-sign">{{ transaction.type === 'income' ? '+' : '-' }}</span>
                                <span class="amount-value">{{ formatCurrency(transaction.amount) }}</span>
                            </div>
                        </div>

                        <div class="table-cell actions-col">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn" @click.stop="editTransaction(transaction)"
                                    title="編輯">
                                    ✏️
                                </button>
                                <button class="action-btn delete-btn" @click.stop="deleteTransaction(transaction)"
                                    title="刪除">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分頁 -->
            <div v-if="totalPages > 1" class="pagination">
                <Button variant="secondary" size="sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                    上一頁
                </Button>

                <div class="page-numbers">
                    <button v-for="page in visiblePages" :key="page" class="page-btn"
                        :class="{ active: page === currentPage }" @click="goToPage(page)">
                        {{ page }}
                    </button>
                </div>

                <Button variant="secondary" size="sm" :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)">
                    下一頁
                </Button>

                <div class="page-info">
                    第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
                </div>
            </div>
        </Card>

        <!-- 新增/編輯交易模態框 -->
        <Modal :visible="uiStore.modals.addTransaction" :title="editingTransaction ? '編輯交易' : '新增交易'" width="600px"
            @close="closeTransactionModal">
            <TransactionForm :transaction="editingTransaction" @success="handleTransactionSuccess"
                @cancel="closeTransactionModal" />
        </Modal>

        <!-- 刪除確認模態框 -->
        <Modal :visible="showDeleteModal" title="確認刪除" width="400px" @close="showDeleteModal = false">
            <div class="delete-confirmation">
                <div class="delete-icon">⚠️</div>
                <div class="delete-message">
                    確定要刪除這筆交易嗎？此操作無法復原。
                </div>
                <div v-if="deletingTransaction" class="delete-details">
                    <div class="detail-row">
                        <span class="detail-label">日期：</span>
                        <span class="detail-value">{{ formatDate(deletingTransaction.date) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">分類：</span>
                        <span class="detail-value">{{ getCategoryName(deletingTransaction.category) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">金額：</span>
                        <span class="detail-value" :class="deletingTransaction.type">
                            {{ deletingTransaction.type === 'income' ? '+' : '-' }}{{
                                formatCurrency(deletingTransaction.amount)
                            }}
                        </span>
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
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import { formatDate, getDateRange } from '@/utils/date'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Modal from '@/components/ui/Modal.vue'
import TransactionForm from '@/components/forms/TransactionForm.vue'

// 使用 stores
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const uiStore = useUIStore()

// 響應式資料
const loading = ref(false)
const exporting = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const editingTransaction = ref(null)
const deletingTransaction = ref(null)
const showDeleteModal = ref(false)
const activeQuickFilter = ref('')

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(20)

// 排序相關
const sortField = ref('date')
const sortOrder = ref('desc')

// 篩選條件
const filters = reactive({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
})

// 快速日期篩選選項
const quickDateFilters = [
    { key: 'today', label: '今天', ...getDateRange('today') },
    { key: 'yesterday', label: '昨天', ...getDateRange('yesterday') },
    { key: 'thisWeek', label: '本週', ...getDateRange('thisWeek') },
    { key: 'lastWeek', label: '上週', ...getDateRange('lastWeek') },
    { key: 'thisMonth', label: '本月', ...getDateRange('thisMonth') },
    { key: 'lastMonth', label: '上月', ...getDateRange('lastMonth') },
    { key: 'thisYear', label: '今年', ...getDateRange('thisYear') },
]

// 計算屬性
const typeOptions = [
    { value: '', label: '全部類型' },
    { value: 'income', label: '收入' },
    { value: 'expense', label: '支出' },
]

const categoryOptions = computed(() => {
    const options = [{ value: '', label: '全部分類' }]
    const categories = categoryStore.categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: cat.icon,
    }))
    return [...options, ...categories]
})

const hasActiveFilters = computed(() => {
    return filters.type || filters.category || filters.startDate || filters.endDate || searchQuery.value
})

// 篩選後的交易
const filteredTransactions = computed(() => {
    let transactions = [...transactionStore.transactions]

    // 搜尋篩選
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        transactions = transactions.filter(t =>
            t.description.toLowerCase().includes(query) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
        )
    }

    // 類型篩選
    if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type)
    }

    // 分類篩選
    if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category)
    }

    // 日期範圍篩選
    if (filters.startDate) {
        transactions = transactions.filter(t => t.date >= filters.startDate)
    }
    if (filters.endDate) {
        transactions = transactions.filter(t => t.date <= filters.endDate)
    }

    // 排序
    transactions.sort((a, b) => {
        let aValue = a[sortField.value]
        let bValue = b[sortField.value]

        if (sortField.value === 'date') {
            aValue = new Date(aValue)
            bValue = new Date(bValue)
        }

        if (sortOrder.value === 'asc') {
            return aValue > bValue ? 1 : -1
        } else {
            return aValue < bValue ? 1 : -1
        }
    })

    return transactions
})

// 分頁後的交易
const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredTransactions.value.slice(start, end)
})

const totalPages = computed(() => {
    return Math.ceil(filteredTransactions.value.length / pageSize.value)
})

const visiblePages = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('...', total)
        } else if (current >= total - 3) {
            pages.push(1, '...')
            for (let i = total - 4; i <= total; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1, '...')
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i)
            }
            pages.push('...', total)
        }
    }

    return pages
})

// 統計摘要
const summaryStats = computed(() => {
    const transactions = filteredTransactions.value
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    }
})

// 方法
const getCategoryName = (categoryId) => {
    const category = categoryStore.getCategoryById(categoryId)
    return category?.name || '未知分類'
}

const getCategoryIcon = (categoryId) => {
    const category = categoryStore.getCategoryById(categoryId)
    return category?.icon || '📝'
}

const getCategoryColor = (categoryId) => {
    const category = categoryStore.getCategoryById(categoryId)
    return category?.color || '#666'
}

const handleSearch = () => {
    currentPage.value = 1
}

const applyFilters = () => {
    currentPage.value = 1
    activeQuickFilter.value = ''
}

const clearFilters = () => {
    Object.assign(filters, {
        type: '',
        category: '',
        startDate: '',
        endDate: '',
    })
    searchQuery.value = ''
    activeQuickFilter.value = ''
    currentPage.value = 1
}

const applyQuickFilter = (quickFilter) => {
    filters.startDate = quickFilter.startDate
    filters.endDate = quickFilter.endDate
    activeQuickFilter.value = quickFilter.key
    currentPage.value = 1
}

const toggleSort = (field) => {
    if (sortField.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortField.value = field
        sortOrder.value = 'desc'
    }
}

const getSortClass = (field) => {
    if (sortField.value !== field) return ''
    return sortOrder.value === 'asc' ? 'asc' : 'desc'
}

const getSortIcon = (field) => {
    if (sortField.value !== field) return '↕️'
    return sortOrder.value === 'asc' ? '↑' : '↓'
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const openAddTransactionModal = () => {
    editingTransaction.value = null
    uiStore.openModal('addTransaction')
}

const closeTransactionModal = () => {
    editingTransaction.value = null
    uiStore.closeModal('addTransaction')
}

const viewTransaction = (transaction) => {
    // 可以實作查看詳情功能
    editTransaction(transaction)
}

const editTransaction = (transaction) => {
    editingTransaction.value = transaction
    uiStore.openModal('addTransaction')
}

const deleteTransaction = (transaction) => {
    deletingTransaction.value = transaction
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!deletingTransaction.value) return

    deleting.value = true

    try {
        await transactionStore.deleteTransaction(deletingTransaction.value.id)
        showDeleteModal.value = false
        deletingTransaction.value = null

        uiStore.showNotification({
            type: 'success',
            title: '刪除成功',
            message: '交易已成功刪除',
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

const handleTransactionSuccess = () => {
    closeTransactionModal()
    uiStore.showNotification({
        type: 'success',
        title: '操作成功',
        message: editingTransaction.value ? '交易已更新' : '交易已新增',
    })
}

const exportTransactions = async () => {
    exporting.value = true

    try {
        await transactionStore.exportTransactions('csv', filteredTransactions.value)
        uiStore.showNotification({
            type: 'success',
            title: '匯出成功',
            message: '交易資料已匯出',
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '匯出失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        exporting.value = false
    }
}

// 監聽器
watch([filteredTransactions], () => {
    // 當篩選結果改變時，確保當前頁面有效
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
    }
})

// 生命週期
onMounted(async () => {
    loading.value = true

    try {
        await Promise.all([
            transactionStore.loadTransactions(),
            categoryStore.fetchCategories(),
        ])
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '載入失敗',
            message: error.message || '無法載入交易資料',
        })
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.transactions-page {
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

/* 篩選卡片 */
.filter-card {
    margin-bottom: var(--spacing-lg);
}

.filter-row {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 200px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    min-width: 120px;
}

.filter-label {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.date-range {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.date-input {
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: var(--font-sm);
}

.date-separator {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

/* 快速篩選 */
.quick-filters {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
}

.quick-filter-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-base);
}

.quick-filter-btn:hover {
    background-color: var(--bg-accent);
    border-color: var(--primary-color);
}

.quick-filter-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary);
    font-weight: var(--font-medium);
}

/* 統計摘要 */
.summary-stats {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
}

.stat-label {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.stat-value {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    color: var(--text-primary);
}

.stat-item.income .stat-value {
    color: var(--income-color);
}

.stat-item.expense .stat-value {
    color: var(--expense-color);
}

.stat-item.balance.negative .stat-value {
    color: var(--expense-color);
}

/* 列表標題 */
.list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.list-title {
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
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

/* 交易表格 */
.transactions-table {
    overflow-x: auto;
}

.table-header {
    display: grid;
    grid-template-columns: 80px 150px 1fr 120px 80px;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.header-cell {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    user-select: none;
}

.header-cell:hover {
    color: var(--primary-color);
}

.sort-icon {
    font-size: 0.75rem;
    opacity: 0.6;
}

.sort-icon.asc,
.sort-icon.desc {
    opacity: 1;
    color: var(--primary-color);
}

.table-body {
    display: flex;
    flex-direction: column;
}

.table-row {
    display: grid;
    grid-template-columns: 80px 150px 1fr 120px 80px;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: var(--transition-base);
}

.table-row:hover {
    background-color: var(--bg-secondary);
}

.table-cell {
    display: flex;
    align-items: center;
}

/* 日期列 */
.date-info {
    text-align: center;
}

.date-primary {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.date-secondary {
    font-size: var(--font-xs);
    color: var(--text-secondary);
}

/* 分類列 */
.category-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.category-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75rem;
    color: white;
}

.category-name {
    font-size: var(--font-sm);
    color: var(--text-primary);
}

/* 描述列 */
.description-content {
    flex: 1;
}

.description-text {
    font-size: var(--font-sm);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.transaction-tags {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
}

.tag {
    padding: 0.125rem 0.375rem;
    background-color: var(--bg-accent);
    color: var(--text-secondary);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-xs);
}

/* 金額列 */
.amount-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: var(--font-medium);
}

.amount-info.income {
    color: var(--income-color);
}

.amount-info.expense {
    color: var(--expense-color);
}

.amount-sign {
    font-size: var(--font-sm);
}

.amount-value {
    font-size: var(--font-sm);
}

/* 操作列 */
.action-buttons {
    display: flex;
    gap: var(--spacing-xs);
}

.action-btn {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: calc(var(--border-radius) / 2);
    cursor: pointer;
    transition: var(--transition-base);
    font-size: 0.75rem;
}

.action-btn:hover {
    background-color: var(--bg-accent);
}

.edit-btn:hover {
    background-color: rgba(33, 150, 243, 0.1);
}

.delete-btn:hover {
    background-color: rgba(244, 67, 54, 0.1);
}

/* 分頁 */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-light);
}

.page-numbers {
    display: flex;
    gap: var(--spacing-xs);
}

.page-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition-base);
    font-size: var(--font-sm);
}

.page-btn:hover {
    background-color: var(--bg-secondary);
    border-color: var(--primary-color);
}

.page-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary);
    font-weight: var(--font-medium);
}

.page-info {
    font-size: var(--font-sm);
    color: var(--text-secondary);
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
    text-align: left;
    background-color: var(--bg-secondary);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-lg);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
}

.detail-row:last-child {
    margin-bottom: 0;
}

.detail-label {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.detail-value {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.detail-value.income {
    color: var(--income-color);
}

.detail-value.expense {
    color: var(--expense-color);
}

.delete-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
}

/* 響應式設計 */
@media (max-width: 1024px) {
    .filter-row {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        min-width: auto;
    }

    .summary-stats {
        flex-wrap: wrap;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .transactions-page {
        padding: var(--spacing-md);
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }

    .table-cell {
        justify-content: space-between;
        padding: var(--spacing-xs) 0;
    }

    .table-cell::before {
        content: attr(data-label);
        font-weight: var(--font-medium);
        color: var(--text-secondary);
        font-size: var(--font-sm);
    }

    .date-col::before {
        content: '日期：';
    }

    .category-col::before {
        content: '分類：';
    }

    .description-col::before {
        content: '描述：';
    }

    .amount-col::before {
        content: '金額：';
    }

    .actions-col::before {
        content: '操作：';
    }

    .pagination {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .page-numbers {
        order: -1;
    }
}
</style>

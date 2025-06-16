<template>
    <div class="home-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <h1 class="page-title">財務總覽</h1>
            <p class="page-subtitle">透過 Pinia 管理您的財務狀況</p>
        </div>

        <!-- 載入狀態 -->
        <div v-if="transactionStore.loading" class="loading">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
        </div>

        <!-- 主要內容 -->
        <div v-else class="main-content">
            <!-- 統計卡片 -->
            <div class="stats-grid">
                <!-- 總餘額 -->
                <div class="stat-card balance-card">
                    <div class="stat-header">
                        <span class="stat-icon">💰</span>
                        <span class="stat-title">總餘額</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-amount" :class="{ 'negative': transactionStore.balance < 0 }">
                            {{ formatCurrency(transactionStore.balance) }}
                        </div>
                        <div class="stat-detail">
                            收入 - 支出 = 餘額
                        </div>
                    </div>
                </div>

                <!-- 本月收入 -->
                <div class="stat-card income-card">
                    <div class="stat-header">
                        <span class="stat-icon">📈</span>
                        <span class="stat-title">本月收入</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-amount income">
                            {{ formatCurrency(transactionStore.monthlyIncome) }}
                        </div>
                        <div class="stat-detail">
                            共 {{ transactionStore.monthlyStats.incomeCount }} 筆交易
                        </div>
                    </div>
                </div>

                <!-- 本月支出 -->
                <div class="stat-card expense-card">
                    <div class="stat-header">
                        <span class="stat-icon">📉</span>
                        <span class="stat-title">本月支出</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-amount expense">
                            {{ formatCurrency(transactionStore.monthlyExpense) }}
                        </div>
                        <div class="stat-detail">
                            共 {{ transactionStore.monthlyStats.expenseCount }} 筆交易
                        </div>
                    </div>
                </div>

                <!-- 交易總數 -->
                <div class="stat-card total-card">
                    <div class="stat-header">
                        <span class="stat-icon">📊</span>
                        <span class="stat-title">總交易數</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-amount">
                            {{ transactionStore.transactions.length }}
                        </div>
                        <div class="stat-detail">
                            全部交易記錄
                        </div>
                    </div>
                </div>
            </div>

            <!-- 最近交易 -->
            <div class="recent-section">
                <div class="section-header">
                    <h2 class="section-title">最近交易</h2>
                    <button class="btn-link" @click="$router.push('/transactions')">
                        查看全部
                    </button>
                </div>

                <div v-if="transactionStore.recentTransactions.length === 0" class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">尚無交易記錄</div>
                    <button class="btn-primary" @click="addSampleTransaction">
                        新增示例交易
                    </button>
                </div>

                <div v-else class="transaction-list">
                    <div v-for="transaction in transactionStore.recentTransactions" :key="transaction.id"
                        class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-description">{{ transaction.description }}</div>
                            <div class="transaction-category">分類：{{ transaction.category }}</div>
                            <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
                        </div>
                        <div class="transaction-amount" :class="transaction.type">
                            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 快速操作 -->
            <div class="quick-actions">
                <h2 class="section-title">快速操作</h2>
                <div class="action-grid">
                    <button class="action-btn income-action" @click="addIncome">
                        <span class="action-icon">💰</span>
                        <span class="action-text">記錄收入</span>
                    </button>
                    <button class="action-btn expense-action" @click="addExpense">
                        <span class="action-icon">💸</span>
                        <span class="action-text">記錄支出</span>
                    </button>
                    <button class="action-btn manage-action" @click="$router.push('/transactions')">
                        <span class="action-icon">📋</span>
                        <span class="action-text">管理交易</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="transactionStore.error" class="error-message">
            {{ transactionStore.error }}
            <button @click="transactionStore.clearError">關閉</button>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useUIStore } from '@/stores/ui'

// 使用 Pinia Stores - 這是核心教學重點
const transactionStore = useTransactionStore()
const uiStore = useUIStore()

// 組件掛載時載入交易記錄
onMounted(() => {
    transactionStore.loadTransactions()
})

// 格式化貨幣 - 簡化版
function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: uiStore.currency
    }).format(amount)
}

// 格式化日期 - 簡化版
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-TW')
}

// 新增示例交易
function addSampleTransaction() {
    transactionStore.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'other',
        description: '示例收入',
        date: new Date().toISOString().split('T')[0]
    })

    uiStore.showSuccess('成功', '已新增示例交易')
}

// 快速新增收入
function addIncome() {
    const amount = prompt('請輸入收入金額：')
    const description = prompt('請輸入收入描述：')

    if (amount && description) {
        transactionStore.addTransaction({
            type: 'income',
            amount: parseFloat(amount),
            category: 'other',
            description,
            date: new Date().toISOString().split('T')[0]
        })

        uiStore.showSuccess('成功', '收入記錄已新增')
    }
}

// 快速新增支出
function addExpense() {
    const amount = prompt('請輸入支出金額：')
    const description = prompt('請輸入支出描述：')

    if (amount && description) {
        transactionStore.addTransaction({
            type: 'expense',
            amount: parseFloat(amount),
            category: 'other',
            description,
            date: new Date().toISOString().split('T')[0]
        })

        uiStore.showSuccess('成功', '支出記錄已新增')
    }
}
</script>

<style scoped>
.home-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* 頁面標題 */
.page-header {
    margin-bottom: 2rem;
    text-align: center;
}

.page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    font-size: 1rem;
    color: #6c757d;
}

/* 載入狀態 */
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #ffd859;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 統計卡片網格 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-title {
    font-size: 1rem;
    font-weight: 500;
    color: #2c3e50;
}

.stat-content {
    padding: 1rem 0;
}

.stat-amount {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: #2c3e50;
}

.stat-amount.income {
    color: #4caf50;
}

.stat-amount.expense {
    color: #f44336;
}

.stat-amount.negative {
    color: #f44336;
}

.stat-detail {
    font-size: 0.875rem;
    color: #6c757d;
}

/* 區塊標題 */
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
}

.btn-link {
    background: none;
    border: none;
    color: #ffd859;
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: underline;
}

/* 空狀態 */
.empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.empty-text {
    font-size: 1rem;
    margin-bottom: 1rem;
}

.btn-primary {
    background-color: #ffd859;
    color: #2c3e50;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background-color: #e6c24d;
}

/* 交易列表 */
.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.transaction-item:hover {
    background: #f0f0f0;
}

.transaction-info {
    flex: 1;
}

.transaction-description {
    font-size: 1rem;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.transaction-category {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.transaction-date {
    font-size: 0.875rem;
    color: #adb5bd;
}

.transaction-amount {
    font-size: 1rem;
    font-weight: bold;
    text-align: right;
}

.transaction-amount.income {
    color: #4caf50;
}

.transaction-amount.expense {
    color: #f44336;
}

/* 快速操作 */
.quick-actions {
    margin-top: 2rem;
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background-color: #f0f0f0;
    border-color: #ffd859;
    transform: translateY(-2px);
}

.action-icon {
    font-size: 2rem;
}

.action-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #2c3e50;
}

/* 錯誤提示 */
.error-message {
    background-color: #f44336;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .home-page {
        padding: 1rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .action-grid {
        grid-template-columns: 1fr;
    }

    .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .transaction-amount {
        align-self: flex-end;
    }
}

@media (max-width: 480px) {
    .page-header {
        margin-bottom: 1.5rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>

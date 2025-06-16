<template>
    <div class="reports-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <h1 class="page-title">報表分析</h1>
            <div class="header-actions">
                <select v-model="selectedTimeRange" @change="updateReports" class="time-range-select">
                    <option value="month">本月</option>
                    <option value="quarter">本季</option>
                    <option value="year">本年</option>
                    <option value="custom">自訂範圍</option>
                </select>

                <!-- 自訂日期範圍 -->
                <div v-if="selectedTimeRange === 'custom'" class="custom-date-range">
                    <input type="date" v-model="customDateRange.start" class="date-input" @change="updateReports" />
                    <span class="date-separator">至</span>
                    <input type="date" v-model="customDateRange.end" class="date-input" @change="updateReports" />
                </div>

                <button @click="exportReport" class="export-button" :disabled="loading">
                    <span class="button-icon">📊</span>
                    匯出報表
                </button>
            </div>
        </div>

        <!-- 載入狀態 -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>載入報表資料中...</p>
        </div>

        <!-- 報表內容 -->
        <div v-else class="reports-content">
            <!-- 總覽統計卡片 -->
            <div class="overview-stats">
                <div class="stat-card income">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3 class="stat-title">總收入</h3>
                        <p class="stat-value">{{ formatCurrency(overviewStats.totalIncome) }}</p>
                        <p class="stat-change"
                            :class="{ 'positive': overviewStats.incomeChange >= 0, 'negative': overviewStats.incomeChange < 0 }">
                            {{ overviewStats.incomeChange >= 0 ? '+' : '' }}{{ overviewStats.incomeChange.toFixed(1) }}%
                        </p>
                    </div>
                </div>

                <div class="stat-card expense">
                    <div class="stat-icon">💸</div>
                    <div class="stat-info">
                        <h3 class="stat-title">總支出</h3>
                        <p class="stat-value">{{ formatCurrency(overviewStats.totalExpense) }}</p>
                        <p class="stat-change"
                            :class="{ 'positive': overviewStats.expenseChange <= 0, 'negative': overviewStats.expenseChange > 0 }">
                            {{ overviewStats.expenseChange >= 0 ? '+' : '' }}{{ overviewStats.expenseChange.toFixed(1)
                            }}%
                        </p>
                    </div>
                </div>

                <div class="stat-card balance">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <h3 class="stat-title">淨收支</h3>
                        <p class="stat-value"
                            :class="{ 'positive': overviewStats.balance >= 0, 'negative': overviewStats.balance < 0 }">
                            {{ formatCurrency(overviewStats.balance) }}
                        </p>
                        <p class="stat-change"
                            :class="{ 'positive': overviewStats.balanceChange >= 0, 'negative': overviewStats.balanceChange < 0 }">
                            {{ overviewStats.balanceChange >= 0 ? '+' : '' }}{{ overviewStats.balanceChange.toFixed(1)
                            }}%
                        </p>
                    </div>
                </div>

                <div class="stat-card transactions">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <h3 class="stat-title">交易筆數</h3>
                        <p class="stat-value">{{ overviewStats.totalTransactions }}</p>
                        <p class="stat-change"
                            :class="{ 'positive': overviewStats.transactionChange >= 0, 'negative': overviewStats.transactionChange < 0 }">
                            {{ overviewStats.transactionChange >= 0 ? '+' : '' }}{{
                                overviewStats.transactionChange.toFixed(1) }}%
                        </p>
                    </div>
                </div>
            </div>

            <!-- 圖表區域 -->
            <div class="charts-section">
                <!-- 收支趨勢圖 -->
                <div class="chart-row">
                    <div class="chart-card full-width">
                        <div class="chart-header">
                            <h3 class="chart-title">收支趨勢</h3>
                            <div class="chart-controls">
                                <button v-for="period in trendPeriods" :key="period.value"
                                    @click="selectedTrendPeriod = period.value" class="period-button"
                                    :class="{ active: selectedTrendPeriod === period.value }">
                                    {{ period.label }}
                                </button>
                            </div>
                        </div>
                        <div class="trend-chart-container">
                            <canvas ref="trendChartCanvas"></canvas>
                        </div>
                    </div>
                </div>

                <!-- 分類分析圖表 -->
                <div class="chart-row">
                    <div class="chart-card half-width">
                        <CategoryChart title="支出分類分析" :height="350" ref="expenseCategoryChart" />
                    </div>
                    <div class="chart-card half-width">
                        <CategoryChart title="收入分類分析" :height="350" ref="incomeCategoryChart" />
                    </div>
                </div>

                <!-- 月度對比圖表 -->
                <div class="chart-row">
                    <div class="chart-card full-width">
                        <div class="chart-header">
                            <h3 class="chart-title">月度對比</h3>
                        </div>
                        <div class="monthly-comparison-container">
                            <canvas ref="monthlyComparisonCanvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 詳細統計表格 -->
            <div class="detailed-stats">
                <div class="stats-header">
                    <h3 class="stats-title">詳細統計</h3>
                    <div class="stats-tabs">
                        <button v-for="tab in statsTabs" :key="tab.value" @click="selectedStatsTab = tab.value"
                            class="tab-button" :class="{ active: selectedStatsTab === tab.value }">
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <!-- 分類統計表格 -->
                <div v-if="selectedStatsTab === 'category'" class="stats-table-container">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>分類</th>
                                <th>交易筆數</th>
                                <th>總金額</th>
                                <th>平均金額</th>
                                <th>佔比</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="stat in categoryStats" :key="stat.id">
                                <td>
                                    <div class="category-info">
                                        <span class="category-icon">{{ stat.icon }}</span>
                                        <span class="category-name">{{ stat.name }}</span>
                                    </div>
                                </td>
                                <td>{{ stat.count }}</td>
                                <td class="amount-cell" :class="stat.type">{{ formatCurrency(stat.total) }}</td>
                                <td>{{ formatCurrency(stat.average) }}</td>
                                <td>
                                    <div class="percentage-bar">
                                        <div class="percentage-fill"
                                            :style="{ width: stat.percentage + '%', backgroundColor: stat.color }">
                                        </div>
                                        <span class="percentage-text">{{ stat.percentage.toFixed(1) }}%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 月度統計表格 -->
                <div v-if="selectedStatsTab === 'monthly'" class="stats-table-container">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>月份</th>
                                <th>收入</th>
                                <th>支出</th>
                                <th>淨收支</th>
                                <th>交易筆數</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="stat in monthlyStats" :key="stat.month">
                                <td>{{ stat.monthLabel }}</td>
                                <td class="amount-cell income">{{ formatCurrency(stat.income) }}</td>
                                <td class="amount-cell expense">{{ formatCurrency(stat.expense) }}</td>
                                <td class="amount-cell"
                                    :class="{ 'positive': stat.balance >= 0, 'negative': stat.balance < 0 }">
                                    {{ formatCurrency(stat.balance) }}
                                </td>
                                <td>{{ stat.transactions }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 預算執行統計 -->
                <div v-if="selectedStatsTab === 'budget'" class="stats-table-container">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>預算分類</th>
                                <th>預算金額</th>
                                <th>實際支出</th>
                                <th>執行率</th>
                                <th>剩餘金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="stat in budgetStats" :key="stat.id">
                                <td>
                                    <div class="category-info">
                                        <span class="category-icon">{{ stat.icon }}</span>
                                        <span class="category-name">{{ stat.name }}</span>
                                    </div>
                                </td>
                                <td>{{ formatCurrency(stat.budgetAmount) }}</td>
                                <td class="amount-cell expense">{{ formatCurrency(stat.actualAmount) }}</td>
                                <td>
                                    <div class="usage-bar">
                                        <div class="usage-fill" :style="{
                                            width: Math.min(stat.usageRate, 100) + '%',
                                            backgroundColor: stat.usageRate > 100 ? '#f44336' : stat.usageRate > 80 ? '#ff9800' : '#4caf50'
                                        }"></div>
                                        <span class="usage-text" :class="{ 'over-budget': stat.usageRate > 100 }">
                                            {{ stat.usageRate.toFixed(1) }}%
                                        </span>
                                    </div>
                                </td>
                                <td class="amount-cell"
                                    :class="{ 'positive': stat.remaining >= 0, 'negative': stat.remaining < 0 }">
                                    {{ formatCurrency(stat.remaining) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { useBudgetStore } from '@/stores/budget'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import { exportToCSV, exportToJSON } from '@/utils/export'
import CategoryChart from '@/components/charts/CategoryChart.vue'
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

// Store 引用
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()
const uiStore = useUIStore()

// 響應式數據
const loading = ref(false)
const selectedTimeRange = ref('month')
const customDateRange = ref({
    start: '',
    end: ''
})
const selectedTrendPeriod = ref('month')
const selectedStatsTab = ref('category')

// 圖表引用
const trendChartCanvas = ref(null)
const monthlyComparisonCanvas = ref(null)
const trendChartInstance = ref(null)
const monthlyComparisonInstance = ref(null)

// 配置選項
const trendPeriods = [
    { value: 'week', label: '週' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季' },
    { value: 'year', label: '年' }
]

const statsTabs = [
    { value: 'category', label: '分類統計' },
    { value: 'monthly', label: '月度統計' },
    { value: 'budget', label: '預算執行' }
]

// 計算屬性
const filteredTransactions = computed(() => {
    let transactions = transactionStore.transactions
    const now = new Date()
    let startDate, endDate

    switch (selectedTimeRange.value) {
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            break
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3
            startDate = new Date(now.getFullYear(), quarterStart, 1)
            endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
            break
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31)
            break
        case 'custom':
            if (customDateRange.value.start && customDateRange.value.end) {
                startDate = new Date(customDateRange.value.start)
                endDate = new Date(customDateRange.value.end)
            } else {
                return transactions
            }
            break
        default:
            return transactions
    }

    return transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })
})

const overviewStats = computed(() => {
    const currentTransactions = filteredTransactions.value
    const currentIncome = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const currentExpense = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const currentBalance = currentIncome - currentExpense
    const currentTransactionCount = currentTransactions.length

    // 計算上期數據用於比較
    const previousPeriodTransactions = getPreviousPeriodTransactions()
    const previousIncome = previousPeriodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const previousExpense = previousPeriodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const previousBalance = previousIncome - previousExpense
    const previousTransactionCount = previousPeriodTransactions.length

    return {
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        balance: currentBalance,
        totalTransactions: currentTransactionCount,
        incomeChange: previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0,
        expenseChange: previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0,
        balanceChange: previousBalance !== 0 ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 : 0,
        transactionChange: previousTransactionCount > 0 ? ((currentTransactionCount - previousTransactionCount) / previousTransactionCount) * 100 : 0
    }
})

const categoryStats = computed(() => {
    const transactions = filteredTransactions.value
    const categoryMap = {}

    transactions.forEach(transaction => {
        const categoryId = transaction.category
        if (!categoryMap[categoryId]) {
            const category = categoryStore.getCategoryById(categoryId)
            categoryMap[categoryId] = {
                id: categoryId,
                name: category?.name || '未知分類',
                icon: category?.icon || '📝',
                color: category?.color || '#999999',
                type: transaction.type,
                total: 0,
                count: 0,
                transactions: []
            }
        }
        categoryMap[categoryId].total += transaction.amount
        categoryMap[categoryId].count += 1
        categoryMap[categoryId].transactions.push(transaction)
    })

    const totalAmount = Object.values(categoryMap).reduce((sum, cat) => sum + cat.total, 0)

    return Object.values(categoryMap)
        .map(cat => ({
            ...cat,
            average: cat.total / cat.count,
            percentage: totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total)
})

const monthlyStats = computed(() => {
    const transactions = transactionStore.transactions
    const monthlyMap = {}

    transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
                month: monthKey,
                monthLabel: date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
                income: 0,
                expense: 0,
                transactions: 0
            }
        }

        if (transaction.type === 'income') {
            monthlyMap[monthKey].income += transaction.amount
        } else {
            monthlyMap[monthKey].expense += transaction.amount
        }
        monthlyMap[monthKey].transactions += 1
    })

    return Object.values(monthlyMap)
        .map(month => ({
            ...month,
            balance: month.income - month.expense
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12) // 最近12個月
})

const budgetStats = computed(() => {
    const budgets = budgetStore.budgets
    const currentTransactions = filteredTransactions.value.filter(t => t.type === 'expense')

    return budgets.map(budget => {
        const category = categoryStore.getCategoryById(budget.category)
        const actualAmount = currentTransactions
            .filter(t => t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0)

        const usageRate = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0
        const remaining = budget.amount - actualAmount

        return {
            id: budget.id,
            name: category?.name || '未知分類',
            icon: category?.icon || '📝',
            budgetAmount: budget.amount,
            actualAmount,
            usageRate,
            remaining
        }
    }).sort((a, b) => b.usageRate - a.usageRate)
})

// 方法
const getPreviousPeriodTransactions = () => {
    const now = new Date()
    let startDate, endDate

    switch (selectedTimeRange.value) {
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            endDate = new Date(now.getFullYear(), now.getMonth(), 0)
            break
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3
            startDate = new Date(now.getFullYear(), quarterStart - 3, 1)
            endDate = new Date(now.getFullYear(), quarterStart, 0)
            break
        case 'year':
            startDate = new Date(now.getFullYear() - 1, 0, 1)
            endDate = new Date(now.getFullYear() - 1, 11, 31)
            break
        default:
            return []
    }

    return transactionStore.transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })
}

const createTrendChart = () => {
    if (!trendChartCanvas.value) return

    if (trendChartInstance.value) {
        trendChartInstance.value.destroy()
    }

    const ctx = trendChartCanvas.value.getContext('2d')
    const chartData = generateTrendChartData()

    trendChartInstance.value = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value)
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    })
}

const createMonthlyComparisonChart = () => {
    if (!monthlyComparisonCanvas.value) return

    if (monthlyComparisonInstance.value) {
        monthlyComparisonInstance.value.destroy()
    }

    const ctx = monthlyComparisonCanvas.value.getContext('2d')
    const chartData = generateMonthlyComparisonData()

    monthlyComparisonInstance.value = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value)
                        }
                    }
                }
            }
        }
    })
}

const generateTrendChartData = () => {
    // 根據選擇的時間週期生成趨勢數據
    const transactions = filteredTransactions.value
    const labels = []
    const incomeData = []
    const expenseData = []

    // 這裡簡化處理，實際應根據 selectedTrendPeriod 生成對應的標籤和數據
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        labels.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }))

        const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.toDateString() === date.toDateString()
        })

        incomeData.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))
        expenseData.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
    }

    return {
        labels,
        datasets: [
            {
                label: '收入',
                data: incomeData,
                borderColor: 'rgb(76, 175, 80)',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: '支出',
                data: expenseData,
                borderColor: 'rgb(244, 67, 54)',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    }
}

const generateMonthlyComparisonData = () => {
    const stats = monthlyStats.value.slice(0, 6).reverse() // 最近6個月

    return {
        labels: stats.map(s => s.monthLabel),
        datasets: [
            {
                label: '收入',
                data: stats.map(s => s.income),
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                borderColor: 'rgb(76, 175, 80)',
                borderWidth: 1
            },
            {
                label: '支出',
                data: stats.map(s => s.expense),
                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                borderColor: 'rgb(244, 67, 54)',
                borderWidth: 1
            }
        ]
    }
}

const updateReports = async () => {
    loading.value = true

    try {
        await nextTick()
        createTrendChart()
        createMonthlyComparisonChart()
    } catch (error) {
        console.error('更新報表失敗:', error)
        uiStore.showNotification('報表更新失敗', 'error')
    } finally {
        loading.value = false
    }
}

const exportReport = () => {
    try {
        const reportData = {
            overview: overviewStats.value,
            categoryStats: categoryStats.value,
            monthlyStats: monthlyStats.value,
            budgetStats: budgetStats.value,
            timeRange: selectedTimeRange.value,
            exportDate: new Date().toISOString()
        }

        exportToJSON(reportData, `財務報表_${new Date().toLocaleDateString('zh-TW')}`)
        uiStore.showNotification('報表匯出成功', 'success')
    } catch (error) {
        console.error('匯出報表失敗:', error)
        uiStore.showNotification('報表匯出失敗', 'error')
    }
}

// 監聽器
watch([selectedTimeRange, selectedTrendPeriod], () => {
    updateReports()
})

// 生命週期
onMounted(async () => {
    // 設置預設自訂日期範圍
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    customDateRange.value.start = firstDay.toISOString().split('T')[0]
    customDateRange.value.end = now.toISOString().split('T')[0]

    await nextTick()
    updateReports()
})
</script>

<style scoped>
.reports-page {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.time-range-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
}

.custom-date-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.date-input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.875rem;
}

.date-separator {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.export-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: var(--text-primary);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;
}

.export-button:hover:not(:disabled) {
    background: var(--primary-dark);
}

.export-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: var(--text-secondary);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
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

.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-card.income {
    border-left: 4px solid var(--income-color);
}

.stat-card.expense {
    border-left: 4px solid var(--expense-color);
}

.stat-card.balance {
    border-left: 4px solid var(--info-color);
}

.stat-card.transactions {
    border-left: 4px solid var(--warning-color);
}

.stat-icon {
    font-size: 2rem;
    opacity: 0.8;
}

.stat-info {
    flex: 1;
}

.stat-title {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem 0;
}

.stat-value.positive {
    color: var(--income-color);
}

.stat-value.negative {
    color: var(--expense-color);
}

.stat-change {
    font-size: 0.75rem;
    font-weight: 600;
}

.stat-change.positive {
    color: var(--success-color);
}

.stat-change.negative {
    color: var(--danger-color);
}

.charts-section {
    margin-bottom: 2rem;
}

.chart-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.chart-card {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card.full-width {
    flex: 1;
}

.chart-card.half-width {
    flex: 1;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.chart-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.chart-controls {
    display: flex;
    gap: 0.5rem;
}

.period-button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.period-button:hover {
    border-color: var(--primary-color);
    color: var(--text-primary);
}

.period-button.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary);
}

.trend-chart-container,
.monthly-comparison-container {
    position: relative;
    height: 300px;
}

.detailed-stats {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.stats-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.stats-tabs {
    display: flex;
    gap: 0.5rem;
}

.tab-button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.tab-button:hover {
    border-color: var(--primary-color);
    color: var(--text-primary);
}

.tab-button.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary);
}

.stats-table-container {
    overflow-x: auto;
}

.stats-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.stats-table th,
.stats-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
}

.stats-table th {
    background: var(--bg-secondary);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.75rem;
}

.category-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.category-icon {
    font-size: 1rem;
}

.category-name {
    font-weight: 500;
}

.amount-cell {
    font-weight: 600;
}

.amount-cell.income {
    color: var(--income-color);
}

.amount-cell.expense {
    color: var(--expense-color);
}

.amount-cell.positive {
    color: var(--success-color);
}

.amount-cell.negative {
    color: var(--danger-color);
}

.percentage-bar,
.usage-bar {
    position: relative;
    height: 20px;
    background: var(--bg-secondary);
    border-radius: 10px;
    overflow: hidden;
    min-width: 100px;
}

.percentage-fill,
.usage-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.percentage-text,
.usage-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
}

.usage-text.over-budget {
    color: var(--danger-color);
}

/* 響應式設計 */
@media (max-width: 1024px) {
    .chart-row {
        flex-direction: column;
    }

    .chart-card.half-width {
        flex: none;
    }
}

@media (max-width: 768px) {
    .reports-page {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
        justify-content: space-between;
    }

    .overview-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .stat-card {
        padding: 1rem;
    }

    .chart-card {
        padding: 1rem;
    }

    .stats-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .stats-tabs {
        width: 100%;
        justify-content: space-between;
    }

    .tab-button {
        flex: 1;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .custom-date-range {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .date-input {
        width: 100%;
    }

    .export-button {
        width: 100%;
        justify-content: center;
    }

    .stats-tabs {
        flex-direction: column;
    }

    .stats-table {
        font-size: 0.75rem;
    }

    .stats-table th,
    .stats-table td {
        padding: 0.5rem;
    }
}
</style>

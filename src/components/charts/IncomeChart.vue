<template>
    <div class="income-chart">
        <div class="chart-header">
            <h3 class="chart-title">{{ title }}</h3>
            <div class="chart-controls">
                <select v-model="selectedPeriod" @change="updateChart" class="period-select">
                    <option value="week">本週</option>
                    <option value="month">本月</option>
                    <option value="quarter">本季</option>
                    <option value="year">本年</option>
                </select>
            </div>
        </div>

        <div class="chart-container" ref="chartContainer">
            <canvas ref="chartCanvas"></canvas>
        </div>

        <div v-if="loading" class="chart-loading">
            <div class="loading-spinner"></div>
            <p>載入圖表資料中...</p>
        </div>

        <div v-if="error" class="chart-error">
            <p>{{ error }}</p>
            <button @click="retryLoad" class="retry-button">重新載入</button>
        </div>

        <!-- 圖表統計資訊 -->
        <div v-if="chartData && !loading" class="chart-stats">
            <div class="stat-item">
                <span class="stat-label">總收入</span>
                <span class="stat-value income">{{ formatCurrency(totalIncome) }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">平均收入</span>
                <span class="stat-value">{{ formatCurrency(averageIncome) }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最高收入</span>
                <span class="stat-value">{{ formatCurrency(maxIncome) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
    Title,
    Tooltip,
    Legend,
    Filler
)

// Props 定義
const props = defineProps({
    title: {
        type: String,
        default: '收入趨勢'
    },
    height: {
        type: Number,
        default: 300
    },
    showStats: {
        type: Boolean,
        default: true
    }
})

// Store 引用
const transactionStore = useTransactionStore()
const uiStore = useUIStore()

// 響應式數據
const chartCanvas = ref(null)
const chartContainer = ref(null)
const chartInstance = ref(null)
const selectedPeriod = ref('month')
const loading = ref(false)
const error = ref('')

// 計算屬性
const chartData = computed(() => {
    const transactions = transactionStore.transactions.filter(t => t.type === 'income')

    if (!transactions.length) return null

    const now = new Date()
    let startDate, endDate, labels, groupBy

    switch (selectedPeriod.value) {
        case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            labels = generateWeekLabels()
            groupBy = 'day'
            break
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            labels = generateMonthLabels()
            groupBy = 'day'
            break
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3
            startDate = new Date(now.getFullYear(), quarterStart, 1)
            endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
            labels = generateQuarterLabels()
            groupBy = 'month'
            break
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31)
            labels = generateYearLabels()
            groupBy = 'month'
            break
    }

    // 篩選時間範圍內的交易
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })

    // 按時間分組統計
    const groupedData = groupTransactionsByPeriod(filteredTransactions, groupBy, labels)

    return {
        labels,
        datasets: [{
            label: '收入金額',
            data: groupedData,
            borderColor: 'rgb(76, 175, 80)',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(76, 175, 80)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    }
})

const totalIncome = computed(() => {
    if (!chartData.value) return 0
    return chartData.value.datasets[0].data.reduce((sum, value) => sum + value, 0)
})

const averageIncome = computed(() => {
    if (!chartData.value || chartData.value.datasets[0].data.length === 0) return 0
    return totalIncome.value / chartData.value.datasets[0].data.length
})

const maxIncome = computed(() => {
    if (!chartData.value) return 0
    return Math.max(...chartData.value.datasets[0].data)
})

// 方法
const generateWeekLabels = () => {
    const labels = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        labels.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }))
    }

    return labels
}

const generateMonthLabels = () => {
    const labels = []
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
        labels.push(`${day}日`)
    }

    return labels
}

const generateQuarterLabels = () => {
    const now = new Date()
    const quarterStart = Math.floor(now.getMonth() / 3) * 3
    const labels = []

    for (let i = 0; i < 3; i++) {
        const month = quarterStart + i
        const date = new Date(now.getFullYear(), month, 1)
        labels.push(date.toLocaleDateString('zh-TW', { month: 'long' }))
    }

    return labels
}

const generateYearLabels = () => {
    return [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
    ]
}

const groupTransactionsByPeriod = (transactions, groupBy, labels) => {
    const data = new Array(labels.length).fill(0)

    transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        let index

        if (groupBy === 'day') {
            if (selectedPeriod.value === 'week') {
                const now = new Date()
                const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
                index = 6 - daysDiff
            } else if (selectedPeriod.value === 'month') {
                index = date.getDate() - 1
            }
        } else if (groupBy === 'month') {
            if (selectedPeriod.value === 'quarter') {
                const quarterStart = Math.floor(new Date().getMonth() / 3) * 3
                index = date.getMonth() - quarterStart
            } else if (selectedPeriod.value === 'year') {
                index = date.getMonth()
            }
        }

        if (index >= 0 && index < data.length) {
            data[index] += transaction.amount
        }
    })

    return data
}

const createChart = () => {
    if (!chartCanvas.value || !chartData.value) return

    // 銷毀現有圖表
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: chartData.value,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `收入：${formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        },
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
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#fff',
                    hoverBorderWidth: 3
                }
            }
        }
    })
}

const updateChart = async () => {
    loading.value = true
    error.value = ''

    try {
        await nextTick()
        createChart()
    } catch (err) {
        console.error('更新圖表失敗:', err)
        error.value = '圖表載入失敗，請稍後再試'
    } finally {
        loading.value = false
    }
}

const retryLoad = () => {
    updateChart()
}

const handleResize = () => {
    if (chartInstance.value) {
        chartInstance.value.resize()
    }
}

// 監聽器
watch(chartData, () => {
    if (chartData.value) {
        updateChart()
    }
}, { deep: true })

// 生命週期
onMounted(async () => {
    await nextTick()

    // 設置圖表容器高度
    if (chartContainer.value) {
        chartContainer.value.style.height = `${props.height}px`
    }

    // 初始化圖表
    if (chartData.value) {
        createChart()
    }

    // 監聽視窗大小變化
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    // 清理圖表實例
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

    // 移除事件監聽器
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.income-chart {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.period-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.period-select:hover {
    border-color: var(--primary-color);
}

.period-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 216, 89, 0.2);
}

.chart-container {
    position: relative;
    width: 100%;
    height: 300px;
}

.chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-secondary);
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
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

.chart-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--danger-color);
    text-align: center;
}

.retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: var(--text-primary);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;
}

.retry-button:hover {
    background: var(--primary-dark);
}

.chart-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
}

.stat-value.income {
    color: var(--income-color);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .income-chart {
        padding: 1rem;
    }

    .chart-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .chart-title {
        font-size: 1.125rem;
    }

    .chart-stats {
        flex-direction: column;
        gap: 1rem;
    }

    .stat-item {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
    }

    .stat-label {
        margin-bottom: 0;
    }
}

@media (max-width: 480px) {
    .chart-container {
        height: 250px;
    }

    .period-select {
        width: 100%;
    }
}
</style>

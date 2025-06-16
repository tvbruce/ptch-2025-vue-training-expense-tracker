<template>
    <div class="category-chart">
        <div class="chart-header">
            <h3 class="chart-title">{{ title }}</h3>
            <div class="chart-controls">
                <select v-model="selectedType" @change="updateChart" class="type-select">
                    <option value="expense">支出分析</option>
                    <option value="income">收入分析</option>
                </select>
                <select v-model="selectedPeriod" @change="updateChart" class="period-select">
                    <option value="month">本月</option>
                    <option value="quarter">本季</option>
                    <option value="year">本年</option>
                </select>
            </div>
        </div>

        <div class="chart-content">
            <div class="chart-container" ref="chartContainer">
                <canvas ref="chartCanvas"></canvas>
            </div>

            <!-- 圖例列表 -->
            <div v-if="chartData && !loading" class="chart-legend">
                <div v-for="(item, index) in legendData" :key="item.category" class="legend-item"
                    @click="toggleCategory(index)" :class="{ 'legend-item-hidden': item.hidden }">
                    <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                    <div class="legend-info">
                        <div class="legend-label">
                            <span class="legend-icon">{{ item.icon }}</span>
                            <span class="legend-name">{{ item.name }}</span>
                        </div>
                        <div class="legend-stats">
                            <span class="legend-amount">{{ formatCurrency(item.amount) }}</span>
                            <span class="legend-percentage">{{ item.percentage }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="chart-loading">
            <div class="loading-spinner"></div>
            <p>載入圖表資料中...</p>
        </div>

        <div v-if="error" class="chart-error">
            <p>{{ error }}</p>
            <button @click="retryLoad" class="retry-button">重新載入</button>
        </div>

        <!-- 無資料提示 -->
        <div v-if="!chartData && !loading && !error" class="no-data">
            <p>暫無{{ selectedType === 'expense' ? '支出' : '收入' }}資料</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import {
    Chart,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(ArcElement, Tooltip, Legend)

// Props 定義
const props = defineProps({
    title: {
        type: String,
        default: '分類分析'
    },
    height: {
        type: Number,
        default: 400
    },
    showLegend: {
        type: Boolean,
        default: true
    }
})

// Store 引用
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const uiStore = useUIStore()

// 響應式數據
const chartCanvas = ref(null)
const chartContainer = ref(null)
const chartInstance = ref(null)
const selectedType = ref('expense')
const selectedPeriod = ref('month')
const loading = ref(false)
const error = ref('')

// 預設顏色調色盤
const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
]

// 計算屬性
const chartData = computed(() => {
    const transactions = transactionStore.transactions.filter(t => t.type === selectedType.value)

    if (!transactions.length) return null

    // 根據選擇的時間範圍篩選交易
    const filteredTransactions = filterTransactionsByPeriod(transactions)

    if (!filteredTransactions.length) return null

    // 按分類統計金額
    const categoryStats = {}
    filteredTransactions.forEach(transaction => {
        const categoryId = transaction.category
        if (!categoryStats[categoryId]) {
            categoryStats[categoryId] = 0
        }
        categoryStats[categoryId] += transaction.amount
    })

    // 獲取分類資訊並排序
    const categories = Object.entries(categoryStats)
        .map(([categoryId, amount]) => {
            const category = categoryStore.getCategoryById(categoryId)
            return {
                id: categoryId,
                name: category?.name || '未知分類',
                icon: category?.icon || '📝',
                color: category?.color || '#999999',
                amount
            }
        })
        .sort((a, b) => b.amount - a.amount)

    if (!categories.length) return null

    const labels = categories.map(cat => cat.name)
    const data = categories.map(cat => cat.amount)
    const colors = categories.map((cat, index) => cat.color || colorPalette[index % colorPalette.length])

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: colors,
            borderColor: colors.map(color => color),
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10
        }],
        categories
    }
})

const legendData = computed(() => {
    if (!chartData.value) return []

    const total = chartData.value.datasets[0].data.reduce((sum, value) => sum + value, 0)

    return chartData.value.categories.map((category, index) => ({
        category: category.id,
        name: category.name,
        icon: category.icon,
        color: chartData.value.datasets[0].backgroundColor[index],
        amount: category.amount,
        percentage: total > 0 ? Math.round((category.amount / total) * 100) : 0,
        hidden: false
    }))
})

// 方法
const filterTransactionsByPeriod = (transactions) => {
    const now = new Date()
    let startDate, endDate

    switch (selectedPeriod.value) {
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
    }

    return transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })
}

const createChart = () => {
    if (!chartCanvas.value || !chartData.value) return

    // 銷毀現有圖表
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.value.labels,
            datasets: chartData.value.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false // 使用自訂圖例
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((sum, value) => sum + value, 0)
                            const percentage = Math.round((context.parsed / total) * 100)
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            },
            onHover: (event, elements) => {
                event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
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

const toggleCategory = (index) => {
    if (!chartInstance.value) return

    const meta = chartInstance.value.getDatasetMeta(0)
    const item = meta.data[index]

    if (item.hidden === null) {
        item.hidden = !chartInstance.value.data.datasets[0].data[index]
    } else {
        item.hidden = !item.hidden
    }

    // 更新圖例狀態
    legendData.value[index].hidden = item.hidden

    chartInstance.value.update()
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
watch([chartData, selectedType, selectedPeriod], () => {
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
.category-chart {
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

.type-select,
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

.type-select:hover,
.period-select:hover {
    border-color: var(--primary-color);
}

.type-select:focus,
.period-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 216, 89, 0.2);
}

.chart-content {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
}

.chart-container {
    flex: 1;
    position: relative;
    min-width: 300px;
    height: 400px;
}

.chart-legend {
    flex: 0 0 250px;
    max-height: 400px;
    overflow-y: auto;
}

.legend-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
}

.legend-item:hover {
    background: var(--bg-secondary);
}

.legend-item-hidden {
    opacity: 0.5;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.legend-info {
    flex: 1;
    min-width: 0;
}

.legend-label {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
}

.legend-icon {
    margin-right: 0.5rem;
    font-size: 1rem;
}

.legend-name {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.legend-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.legend-amount {
    font-size: 0.875rem;
    color: var(--text-primary);
    font-weight: 600;
}

.legend-percentage {
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 0.125rem 0.375rem;
    border-radius: 12px;
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

.chart-error,
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-secondary);
    text-align: center;
}

.chart-error {
    color: var(--danger-color);
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

/* 響應式設計 */
@media (max-width: 1024px) {
    .chart-content {
        flex-direction: column;
        gap: 1.5rem;
    }

    .chart-legend {
        flex: none;
        max-height: none;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
    }
}

@media (max-width: 768px) {
    .category-chart {
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

    .chart-controls {
        width: 100%;
        justify-content: space-between;
    }

    .type-select,
    .period-select {
        flex: 1;
    }

    .chart-container {
        min-width: auto;
        height: 300px;
    }

    .chart-legend {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .chart-controls {
        flex-direction: column;
        gap: 0.5rem;
    }

    .chart-container {
        height: 250px;
    }

    .legend-item {
        padding: 0.5rem;
    }

    .legend-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}
</style>

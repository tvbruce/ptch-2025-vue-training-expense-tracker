<template>
    <div class="settings-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <h1 class="page-title">設定</h1>
            <p class="page-subtitle">個人化您的記帳體驗</p>
        </div>

        <!-- 設定內容 -->
        <div class="settings-content">
            <!-- 外觀設定 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">🎨</span>
                        外觀設定
                    </h2>
                </template>

                <div class="setting-items">
                    <!-- 主題設定 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">主題</div>
                            <div class="setting-description">選擇您偏好的介面主題</div>
                        </div>
                        <div class="setting-control">
                            <div class="theme-options">
                                <button class="theme-option" :class="{ active: uiStore.theme === 'light' }"
                                    @click="changeTheme('light')">
                                    <span class="theme-icon">☀️</span>
                                    <span class="theme-name">淺色</span>
                                </button>
                                <button class="theme-option" :class="{ active: uiStore.theme === 'dark' }"
                                    @click="changeTheme('dark')">
                                    <span class="theme-icon">🌙</span>
                                    <span class="theme-name">深色</span>
                                </button>
                                <button class="theme-option" :class="{ active: uiStore.theme === 'auto' }"
                                    @click="changeTheme('auto')">
                                    <span class="theme-icon">🔄</span>
                                    <span class="theme-name">自動</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 語言設定 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">語言</div>
                            <div class="setting-description">選擇介面顯示語言</div>
                        </div>
                        <div class="setting-control">
                            <BaseSelect v-model="uiStore.language" :options="languageOptions"
                                @change="changeLanguage" />
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 貨幣設定 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">💰</span>
                        貨幣設定
                    </h2>
                </template>

                <div class="setting-items">
                    <!-- 預設貨幣 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">預設貨幣</div>
                            <div class="setting-description">選擇記帳使用的貨幣單位</div>
                        </div>
                        <div class="setting-control">
                            <BaseSelect v-model="uiStore.currency" :options="currencyOptions"
                                @change="changeCurrency" />
                        </div>
                    </div>

                    <!-- 小數位數 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">顯示小數</div>
                            <div class="setting-description">是否顯示金額的小數位數</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="uiStore.showDecimals" @change="toggleDecimals" />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- 千分位分隔符 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">千分位分隔符</div>
                            <div class="setting-description">大數字使用逗號分隔</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="uiStore.useThousandsSeparator"
                                    @change="toggleThousandsSeparator" />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 日期格式設定 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">📅</span>
                        日期格式
                    </h2>
                </template>

                <div class="setting-items">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">日期格式</div>
                            <div class="setting-description">選擇日期的顯示格式</div>
                        </div>
                        <div class="setting-control">
                            <BaseSelect v-model="uiStore.dateFormat" :options="dateFormatOptions"
                                @change="changeDateFormat" />
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 資料管理 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">💾</span>
                        資料管理
                    </h2>
                </template>

                <div class="setting-items">
                    <!-- 匯出資料 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">匯出資料</div>
                            <div class="setting-description">將您的記帳資料匯出為檔案</div>
                        </div>
                        <div class="setting-control">
                            <div class="export-buttons">
                                <Button variant="secondary" size="sm" @click="exportData('csv')"
                                    :loading="exporting.csv">
                                    匯出 CSV
                                </Button>
                                <Button variant="secondary" size="sm" @click="exportData('json')"
                                    :loading="exporting.json">
                                    匯出 JSON
                                </Button>
                            </div>
                        </div>
                    </div>

                    <!-- 匯入資料 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">匯入資料</div>
                            <div class="setting-description">從檔案匯入交易記錄</div>
                        </div>
                        <div class="setting-control">
                            <div class="import-area">
                                <input ref="fileInput" type="file" accept=".csv,.json" @change="handleFileSelect"
                                    style="display: none" />
                                <Button variant="secondary" size="sm" @click="$refs.fileInput.click()"
                                    :loading="importing">
                                    選擇檔案
                                </Button>
                                <div v-if="selectedFile" class="selected-file">
                                    <span class="file-name">{{ selectedFile.name }}</span>
                                    <Button variant="primary" size="sm" @click="importData" :loading="importing">
                                        匯入
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 清除資料 -->
                    <div class="setting-item danger">
                        <div class="setting-info">
                            <div class="setting-label">清除所有資料</div>
                            <div class="setting-description">永久刪除所有交易記錄和設定</div>
                        </div>
                        <div class="setting-control">
                            <Button variant="danger" size="sm" @click="showClearDataModal = true">
                                清除資料
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 通知設定 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">🔔</span>
                        通知設定
                    </h2>
                </template>

                <div class="setting-items">
                    <!-- 預算警告 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">預算警告</div>
                            <div class="setting-description">當支出接近預算時顯示警告</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="uiStore.enableBudgetAlerts"
                                    @change="toggleBudgetAlerts" />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- 每日提醒 -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">每日記帳提醒</div>
                            <div class="setting-description">提醒您記錄當天的支出</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" v-model="uiStore.enableDailyReminder"
                                    @change="toggleDailyReminder" />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 關於 -->
            <Card class="setting-section">
                <template #header>
                    <h2 class="section-title">
                        <span class="section-icon">ℹ️</span>
                        關於應用程式
                    </h2>
                </template>

                <div class="about-content">
                    <div class="app-info">
                        <div class="app-icon">💰</div>
                        <div class="app-details">
                            <div class="app-name">個人記帳應用</div>
                            <div class="app-version">版本 1.0.0</div>
                            <div class="app-description">
                                一個簡潔易用的個人財務管理工具，幫助您更好地管理收支和預算。
                            </div>
                        </div>
                    </div>

                    <div class="app-stats">
                        <div class="stat-item">
                            <div class="stat-value">{{ totalTransactions }}</div>
                            <div class="stat-label">總交易數</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ totalCategories }}</div>
                            <div class="stat-label">分類數</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ totalBudgets }}</div>
                            <div class="stat-label">預算數</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ usageDays }}</div>
                            <div class="stat-label">使用天數</div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <!-- 清除資料確認模態框 -->
        <Modal :visible="showClearDataModal" title="確認清除資料" width="500px" @close="showClearDataModal = false">
            <div class="clear-data-confirmation">
                <div class="warning-icon">⚠️</div>
                <div class="warning-title">此操作無法復原</div>
                <div class="warning-message">
                    您即將刪除所有的交易記錄、分類和預算設定。請確認您已經備份了重要資料。
                </div>

                <div class="data-summary">
                    <div class="summary-item">
                        <span class="summary-label">交易記錄：</span>
                        <span class="summary-value">{{ totalTransactions }} 筆</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">分類：</span>
                        <span class="summary-value">{{ totalCategories }} 個</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">預算：</span>
                        <span class="summary-value">{{ totalBudgets }} 個</span>
                    </div>
                </div>

                <div class="confirmation-input">
                    <label class="input-label">
                        請輸入「清除資料」來確認：
                    </label>
                    <Input v-model="clearConfirmText" placeholder="清除資料" @keyup.enter="confirmClearData" />
                </div>

                <div class="clear-actions">
                    <Button variant="secondary" @click="showClearDataModal = false">
                        取消
                    </Button>
                    <Button variant="danger" :disabled="clearConfirmText !== '清除資料'" :loading="clearing"
                        @click="confirmClearData">
                        確認清除
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { useBudgetStore } from '@/stores/budget'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'

// 使用 stores
const uiStore = useUIStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

// 響應式資料
const selectedFile = ref(null)
const importing = ref(false)
const clearing = ref(false)
const showClearDataModal = ref(false)
const clearConfirmText = ref('')

const exporting = reactive({
    csv: false,
    json: false,
})

// 選項配置
const languageOptions = [
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja-JP', label: '日本語' },
]

const currencyOptions = [
    { value: 'TWD', label: '新台幣 (TWD)' },
    { value: 'USD', label: '美元 (USD)' },
    { value: 'EUR', label: '歐元 (EUR)' },
    { value: 'JPY', label: '日圓 (JPY)' },
    { value: 'CNY', label: '人民幣 (CNY)' },
]

const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: '2024-01-15' },
    { value: 'DD/MM/YYYY', label: '15/01/2024' },
    { value: 'MM/DD/YYYY', label: '01/15/2024' },
    { value: 'YYYY年MM月DD日', label: '2024年01月15日' },
]

// 計算屬性
const totalTransactions = computed(() => transactionStore.transactions.length)
const totalCategories = computed(() => categoryStore.categories.length)
const totalBudgets = computed(() => budgetStore.budgets.length)

const usageDays = computed(() => {
    if (transactionStore.transactions.length === 0) return 0

    const firstTransaction = transactionStore.transactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

    if (!firstTransaction) return 0

    const firstDate = new Date(firstTransaction.date)
    const today = new Date()
    const diffTime = Math.abs(today - firstDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
})

// 方法
const changeTheme = (theme) => {
    uiStore.setTheme(theme)
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: `主題已切換為${theme === 'light' ? '淺色' : theme === 'dark' ? '深色' : '自動'}模式`,
    })
}

const changeLanguage = (language) => {
    uiStore.setLanguage(language)
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: '語言設定已更新',
    })
}

const changeCurrency = (currency) => {
    uiStore.setCurrency(currency)
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: '貨幣設定已更新',
    })
}

const changeDateFormat = (format) => {
    uiStore.setDateFormat(format)
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: '日期格式已更新',
    })
}

const toggleDecimals = () => {
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: `${uiStore.showDecimals ? '已開啟' : '已關閉'}小數顯示`,
    })
}

const toggleThousandsSeparator = () => {
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: `${uiStore.useThousandsSeparator ? '已開啟' : '已關閉'}千分位分隔符`,
    })
}

const toggleBudgetAlerts = () => {
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: `${uiStore.enableBudgetAlerts ? '已開啟' : '已關閉'}預算警告`,
    })
}

const toggleDailyReminder = () => {
    uiStore.showNotification({
        type: 'success',
        title: '設定已更新',
        message: `${uiStore.enableDailyReminder ? '已開啟' : '已關閉'}每日提醒`,
    })
}

const exportData = async (format) => {
    exporting[format] = true

    try {
        const data = {
            transactions: transactionStore.transactions,
            categories: categoryStore.categories,
            budgets: budgetStore.budgets,
            settings: {
                theme: uiStore.theme,
                language: uiStore.language,
                currency: uiStore.currency,
                dateFormat: uiStore.dateFormat,
                showDecimals: uiStore.showDecimals,
            },
            exportDate: new Date().toISOString(),
        }

        if (format === 'csv') {
            // 使用 export 工具函數直接匯出交易記錄為 CSV
            const { exportTransactionsToCSV } = await import('@/utils/export')
            await exportTransactionsToCSV(transactionStore.transactions)
        } else {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

        uiStore.showNotification({
            type: 'success',
            title: '匯出成功',
            message: `資料已匯出為 ${format.toUpperCase()} 格式`,
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '匯出失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        exporting[format] = false
    }
}

const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
    }
}

const importData = async () => {
    if (!selectedFile.value) return

    importing.value = true

    try {
        const text = await selectedFile.value.text()
        let data

        if (selectedFile.value.name.endsWith('.json')) {
            data = JSON.parse(text)

            // 匯入交易記錄
            if (data.transactions) {
                for (const transaction of data.transactions) {
                    await transactionStore.addTransaction(transaction)
                }
            }

            // 匯入分類
            if (data.categories) {
                for (const category of data.categories) {
                    if (!category.isDefault) {
                        await categoryStore.addCategory(category)
                    }
                }
            }

            // 匯入預算
            if (data.budgets) {
                for (const budget of data.budgets) {
                    await budgetStore.setBudget(budget)
                }
            }

            // 匯入設定
            if (data.settings) {
                if (data.settings.theme) uiStore.setTheme(data.settings.theme)
                if (data.settings.language) uiStore.setLanguage(data.settings.language)
                if (data.settings.currency) uiStore.setCurrency(data.settings.currency)
                if (data.settings.dateFormat) uiStore.setDateFormat(data.settings.dateFormat)
                if (typeof data.settings.showDecimals === 'boolean') {
                    uiStore.showDecimals = data.settings.showDecimals
                }
            }
        } else if (selectedFile.value.name.endsWith('.csv')) {
            // 處理 CSV 匯入
            await transactionStore.importTransactions(selectedFile.value)
        }

        selectedFile.value = null

        uiStore.showNotification({
            type: 'success',
            title: '匯入成功',
            message: '資料已成功匯入',
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '匯入失敗',
            message: error.message || '檔案格式不正確',
        })
    } finally {
        importing.value = false
    }
}

const confirmClearData = async () => {
    if (clearConfirmText.value !== '清除資料') return

    clearing.value = true

    try {
        // 清除所有資料
        await Promise.all([
            transactionStore.clearAllTransactions(),
            categoryStore.clearCustomCategories(),
            budgetStore.clearAllBudgets(),
        ])

        // 重置設定
        uiStore.resetSettings()

        showClearDataModal.value = false
        clearConfirmText.value = ''

        uiStore.showNotification({
            type: 'success',
            title: '清除完成',
            message: '所有資料已清除',
        })
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '清除失敗',
            message: error.message || '發生未知錯誤',
        })
    } finally {
        clearing.value = false
    }
}

// 生命週期
onMounted(async () => {
    try {
        await Promise.all([
            transactionStore.loadTransactions(),
            categoryStore.fetchCategories(),
            budgetStore.fetchBudgets(),
        ])
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '載入失敗',
            message: error.message || '無法載入設定資料',
        })
    }
})
</script>

<style scoped>
.settings-page {
    padding: var(--spacing-lg);
    max-width: 1000px;
    margin: 0 auto;
}

/* 頁面標題 */
.page-header {
    margin-bottom: var(--spacing-xl);
    text-align: center;
}

.page-title {
    font-size: var(--font-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.page-subtitle {
    font-size: var(--font-md);
    color: var(--text-secondary);
}

/* 設定內容 */
.settings-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.setting-section {
    overflow: visible;
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

/* 設定項目 */
.setting-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    transition: var(--transition-base);
}

.setting-item:hover {
    border-color: var(--border-color);
    background-color: var(--bg-secondary);
}

.setting-item.danger {
    border-color: rgba(244, 67, 54, 0.3);
}

.setting-item.danger:hover {
    border-color: var(--danger-color);
    background-color: rgba(244, 67, 54, 0.05);
}

.setting-info {
    flex: 1;
}

.setting-label {
    font-size: var(--font-md);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.setting-description {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    line-height: 1.5;
}

.setting-control {
    flex-shrink: 0;
    margin-left: var(--spacing-lg);
}

/* 主題選項 */
.theme-options {
    display: flex;
    gap: var(--spacing-sm);
}

.theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition-base);
    min-width: 4rem;
}

.theme-option:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-accent);
}

.theme-option.active {
    border-color: var(--primary-color);
    background-color: rgba(255, 216, 89, 0.1);
}

.theme-icon {
    font-size: 1.5rem;
}

.theme-name {
    font-size: var(--font-sm);
    color: var(--text-primary);
}

/* 切換開關 */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 1.5rem;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border-color);
    transition: var(--transition-base);
    border-radius: 1.5rem;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 1.125rem;
    width: 1.125rem;
    left: 0.1875rem;
    bottom: 0.1875rem;
    background-color: white;
    transition: var(--transition-base);
    border-radius: 50%;
}

input:checked+.toggle-slider {
    background-color: var(--primary-color);
}

input:checked+.toggle-slider:before {
    transform: translateX(1.5rem);
}

/* 匯出按鈕 */
.export-buttons {
    display: flex;
    gap: var(--spacing-sm);
}

/* 匯入區域 */
.import-area {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.selected-file {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
}

.file-name {
    font-size: var(--font-sm);
    color: var(--text-primary);
    flex: 1;
}

/* 關於內容 */
.about-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.app-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

.app-icon {
    font-size: 4rem;
}

.app-details {
    flex: 1;
}

.app-name {
    font-size: var(--font-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.app-version {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.app-description {
    font-size: var(--font-md);
    color: var(--text-secondary);
    line-height: 1.6;
}

.app-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: var(--font-xl);
    font-weight: var(--font-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
}

.stat-label {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

/* 清除資料確認 */
.clear-data-confirmation {
    text-align: center;
    padding: var(--spacing-md);
}

.warning-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
}

.warning-title {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    color: var(--danger-color);
    margin-bottom: var(--spacing-sm);
}

.warning-message {
    font-size: var(--font-md);
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: var(--spacing-lg);
}

.data-summary {
    text-align: left;
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-lg);
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
}

.summary-item:last-child {
    margin-bottom: 0;
}

.summary-label {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.summary-value {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.confirmation-input {
    text-align: left;
    margin-bottom: var(--spacing-lg);
}

.input-label {
    display: block;
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.clear-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .settings-page {
        padding: var(--spacing-md);
    }

    .setting-item {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .setting-control {
        margin-left: 0;
    }

    .theme-options {
        justify-content: center;
    }

    .export-buttons {
        flex-direction: column;
    }

    .app-info {
        flex-direction: column;
        text-align: center;
    }

    .app-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .theme-options {
        flex-direction: column;
    }

    .app-stats {
        grid-template-columns: 1fr;
    }

    .clear-actions {
        flex-direction: column;
    }
}
</style>

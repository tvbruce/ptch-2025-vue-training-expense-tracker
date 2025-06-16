<template>
    <aside class="app-sidebar" :class="{ 'sidebar--collapsed': uiStore.sidebarCollapsed }">
        <div class="sidebar-content">
            <!-- Logo 區域 -->
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">💰</span>
                    <span v-if="!uiStore.sidebarCollapsed" class="logo-text">記帳本</span>
                </div>
                <button class="collapse-btn" @click="uiStore.toggleSidebar()"
                    :title="uiStore.sidebarCollapsed ? '展開' : '收合'">
                    {{ uiStore.sidebarCollapsed ? '▶' : '◀' }}
                </button>
            </div>

            <!-- 主要導航 -->
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <li v-for="item in navigationItems" :key="item.name" class="nav-item">
                        <router-link :to="item.path" class="nav-link"
                            :class="{ 'nav-link--active': $route.path === item.path }">
                            <span class="nav-icon">{{ item.icon }}</span>
                            <span v-if="!uiStore.sidebarCollapsed" class="nav-text">{{ item.title }}</span>
                        </router-link>
                    </li>
                </ul>
            </nav>

            <!-- 簡化的統計資訊 -->
            <div v-if="!uiStore.sidebarCollapsed" class="sidebar-stats">
                <div class="stats-title">本月統計</div>
                <div class="stat-item income">
                    <span class="stat-label">收入</span>
                    <span class="stat-value">{{ formatCurrency(transactionStore.monthlyIncome) }}</span>
                </div>
                <div class="stat-item expense">
                    <span class="stat-label">支出</span>
                    <span class="stat-value">{{ formatCurrency(transactionStore.monthlyExpense) }}</span>
                </div>
                <div class="stat-item balance" :class="{ 'negative': balance < 0 }">
                    <span class="stat-label">餘額</span>
                    <span class="stat-value">{{ formatCurrency(balance) }}</span>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useTransactionStore } from '@/stores/transaction'

// 使用 Pinia Stores
const uiStore = useUIStore()
const transactionStore = useTransactionStore()

// 導航項目
const navigationItems = [
    { name: 'home', path: '/', title: '首頁', icon: '🏠' },
    { name: 'transactions', path: '/transactions', title: '交易記錄', icon: '📊' },
    { name: 'categories', path: '/categories', title: '分類管理', icon: '📋' },
    { name: 'settings', path: '/settings', title: '設定', icon: '⚙️' }
]

// 計算總餘額
const balance = computed(() => transactionStore.balance)

// 格式化貨幣
function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: uiStore.currency
    }).format(amount)
}
</script>

<style scoped>
.app-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 250px;
    background: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transition: width var(--transition-normal);
    z-index: 100;
}

.sidebar--collapsed {
    width: 60px;
}

.sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px 0;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    margin-bottom: 24px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    font-size: 1.5rem;
}

.logo-text {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--text-primary);
    white-space: nowrap;
}

.collapse-btn {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
}

.collapse-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--primary-color);
}

.sidebar-nav {
    flex: 1;
    padding: 0 8px;
}

.nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav-item {
    margin-bottom: 4px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all var(--transition-fast);
    position: relative;
}

.nav-link:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.nav-link--active {
    background: var(--primary-color);
    color: var(--text-primary);
    font-weight: 600;
}

.nav-icon {
    font-size: 1.2rem;
    min-width: 20px;
    text-align: center;
}

.nav-text {
    white-space: nowrap;
    overflow: hidden;
}

.sidebar-stats {
    padding: 16px;
    margin: 16px 8px 0;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-light);
}

.stats-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-align: center;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
}

.stat-item:last-child {
    border-bottom: none;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.stat-value {
    font-size: 0.9rem;
    font-weight: 600;
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

/* 響應式設計 */
@media (max-width: 768px) {
    .app-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .app-sidebar.mobile-open {
        transform: translateX(0);
    }
}
</style>

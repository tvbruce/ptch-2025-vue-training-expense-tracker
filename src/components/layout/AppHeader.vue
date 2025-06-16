<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左側：標題 -->
      <div class="header-left">
        <div class="app-title">
          <h1>個人記帳應用</h1>
          <span class="app-subtitle">Vue 3 + Pinia 教學專案</span>
        </div>
      </div>

      <!-- 右側：操作按鈕 -->
      <div class="header-right">
        <!-- 主題切換 -->
        <button class="theme-toggle-btn" @click="uiStore.toggleTheme()"
          :title="uiStore.isDarkTheme ? '切換到淺色模式' : '切換到深色模式'">
          {{ uiStore.isDarkTheme ? '☀️' : '🌙' }}
        </button>

        <!-- 貨幣設定 -->
        <select class="currency-select" v-model="uiStore.currency" @change="uiStore.setCurrency($event.target.value)">
          <option value="TWD">TWD (NT$)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </select>

        <!-- 通知數量 -->
        <div v-if="uiStore.notifications.length > 0" class="notification-count">
          通知: {{ uiStore.notifications.length }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useUIStore } from '@/stores/ui'

// 使用 UI Store - 展示 Pinia 的基本使用
const uiStore = useUIStore()
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 110;
  transition: all var(--transition-normal);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title h1 {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.app-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-left: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all var(--transition-fast);
}

.theme-toggle-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.currency-select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.currency-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.notification-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .app-subtitle {
    display: none;
  }

  .app-title h1 {
    font-size: 1.1rem;
  }
}
</style>

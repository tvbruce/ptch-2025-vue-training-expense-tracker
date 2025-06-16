<template>
    <div class="app-layout">
        <!-- 頭部導航 -->
        <AppHeader />

        <!-- 側邊欄導航 -->
        <AppSidebar />

        <!-- 主要內容區域 -->
        <main class="main-content" :class="{ 'main-content--collapsed': uiStore.sidebarCollapsed }">
            <div class="content-wrapper">
                <router-view />
            </div>
        </main>

        <!-- 全域通知 -->
        <div class="notification-container">
            <BaseNotification v-for="notification in uiStore.notifications" :key="notification.id"
                :visible="notification.visible" :type="notification.type" :title="notification.title"
                :message="notification.message" @close="uiStore.hideNotification(notification.id)" />
        </div>
    </div>
</template>

<script setup>
import { useUIStore } from '@/stores/ui'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import BaseNotification from '@/components/ui/BaseNotification.vue'

// 使用 UI Store
const uiStore = useUIStore()
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--bg-secondary);
}

.main-content {
    margin-left: 250px;
    margin-top: 60px;
    transition: margin-left var(--transition-normal);
    min-height: calc(100vh - 60px);
    background-color: var(--bg-secondary);
}

.main-content--collapsed {
    margin-left: 60px;
}

.content-wrapper {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.notification-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .main-content {
        margin-left: 0;
        margin-top: 60px;
    }

    .content-wrapper {
        padding: 16px;
    }
}
</style>

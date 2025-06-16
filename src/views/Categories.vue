<template>
    <div class="categories-page">
        <!-- 頁面標題 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">分類管理</h1>
                <Button variant="primary" @click="openAddCategoryModal">
                    <span class="btn-icon">➕</span>
                    新增分類
                </Button>
            </div>
        </div>

        <!-- 分類統計 -->
        <div class="category-stats">
            <Card class="stat-card">
                <div class="stat-content">
                    <div class="stat-number">{{ totalCategories }}</div>
                    <div class="stat-label">總分類數</div>
                </div>
            </Card>
            <Card class="stat-card">
                <div class="stat-content">
                    <div class="stat-number">{{ incomeCategories.length }}</div>
                    <div class="stat-label">收入分類</div>
                </div>
            </Card>
            <Card class="stat-card">
                <div class="stat-content">
                    <div class="stat-number">{{ expenseCategories.length }}</div>
                    <div class="stat-label">支出分類</div>
                </div>
            </Card>
            <Card class="stat-card">
                <div class="stat-content">
                    <div class="stat-number">{{ customCategories.length }}</div>
                    <div class="stat-label">自訂分類</div>
                </div>
            </Card>
        </div>

        <!-- 分類列表 -->
        <div class="categories-content">
            <!-- 收入分類 -->
            <Card class="category-section">
                <template #header>
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="section-icon">💰</span>
                            收入分類
                        </h2>
                        <Button variant="secondary" size="sm" @click="openAddCategoryModal('income')">
                            新增收入分類
                        </Button>
                    </div>
                </template>

                <div v-if="incomeCategories.length === 0" class="empty-state">
                    <div class="empty-icon">💰</div>
                    <div class="empty-text">尚無收入分類</div>
                    <Button variant="primary" size="sm" @click="openAddCategoryModal('income')">
                        新增第一個收入分類
                    </Button>
                </div>

                <div v-else class="category-grid">
                    <div v-for="category in incomeCategories" :key="category.id" class="category-card"
                        @click="editCategory(category)">
                        <div class="category-header">
                            <span class="category-icon" :style="{ backgroundColor: category.color }">
                                {{ category.icon }}
                            </span>
                            <div class="category-info">
                                <div class="category-name">{{ category.name }}</div>
                                <div class="category-type">收入</div>
                            </div>
                            <div class="category-actions">
                                <button class="action-btn edit-btn" @click.stop="editCategory(category)" title="編輯">
                                    ✏️
                                </button>
                                <button v-if="!category.isDefault" class="action-btn delete-btn"
                                    @click.stop="deleteCategory(category)" title="刪除">
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div v-if="category.description" class="category-description">
                            {{ category.description }}
                        </div>

                        <div class="category-stats">
                            <div class="stat-item">
                                <span class="stat-label">使用次數</span>
                                <span class="stat-value">{{ getCategoryUsageCount(category.id) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">總金額</span>
                                <span class="stat-value">{{ formatCurrency(getCategoryTotalAmount(category.id))
                                    }}</span>
                            </div>
                        </div>

                        <div v-if="category.isDefault" class="default-badge">
                            系統預設
                        </div>
                    </div>
                </div>
            </Card>

            <!-- 支出分類 -->
            <Card class="category-section">
                <template #header>
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="section-icon">💸</span>
                            支出分類
                        </h2>
                        <Button variant="secondary" size="sm" @click="openAddCategoryModal('expense')">
                            新增支出分類
                        </Button>
                    </div>
                </template>

                <div v-if="expenseCategories.length === 0" class="empty-state">
                    <div class="empty-icon">💸</div>
                    <div class="empty-text">尚無支出分類</div>
                    <Button variant="primary" size="sm" @click="openAddCategoryModal('expense')">
                        新增第一個支出分類
                    </Button>
                </div>

                <div v-else class="category-grid">
                    <div v-for="category in expenseCategories" :key="category.id" class="category-card"
                        @click="editCategory(category)">
                        <div class="category-header">
                            <span class="category-icon" :style="{ backgroundColor: category.color }">
                                {{ category.icon }}
                            </span>
                            <div class="category-info">
                                <div class="category-name">{{ category.name }}</div>
                                <div class="category-type">支出</div>
                            </div>
                            <div class="category-actions">
                                <button class="action-btn edit-btn" @click.stop="editCategory(category)" title="編輯">
                                    ✏️
                                </button>
                                <button v-if="!category.isDefault" class="action-btn delete-btn"
                                    @click.stop="deleteCategory(category)" title="刪除">
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div v-if="category.description" class="category-description">
                            {{ category.description }}
                        </div>

                        <div class="category-stats">
                            <div class="stat-item">
                                <span class="stat-label">使用次數</span>
                                <span class="stat-value">{{ getCategoryUsageCount(category.id) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">總金額</span>
                                <span class="stat-value">{{ formatCurrency(getCategoryTotalAmount(category.id))
                                    }}</span>
                            </div>
                        </div>

                        <div v-if="category.isDefault" class="default-badge">
                            系統預設
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <!-- 新增/編輯分類模態框 -->
        <Modal :visible="uiStore.modals.addCategory" :title="editingCategory ? '編輯分類' : '新增分類'" width="600px"
            @close="closeCategoryModal">
            <CategoryForm :category="editingCategory" @success="handleCategorySuccess" @cancel="closeCategoryModal" />
        </Modal>

        <!-- 刪除確認模態框 -->
        <Modal :visible="showDeleteModal" title="確認刪除" width="400px" @close="showDeleteModal = false">
            <div class="delete-confirmation">
                <div class="delete-icon">⚠️</div>
                <div class="delete-message">
                    確定要刪除這個分類嗎？
                </div>
                <div v-if="deletingCategory" class="delete-details">
                    <div class="category-preview">
                        <span class="preview-icon" :style="{ backgroundColor: deletingCategory.color }">
                            {{ deletingCategory.icon }}
                        </span>
                        <div class="preview-info">
                            <div class="preview-name">{{ deletingCategory.name }}</div>
                            <div class="preview-type">{{ deletingCategory.type === 'income' ? '收入' : '支出' }}分類</div>
                        </div>
                    </div>

                    <div v-if="getCategoryUsageCount(deletingCategory.id) > 0" class="usage-warning">
                        <div class="warning-text">
                            此分類已被使用 {{ getCategoryUsageCount(deletingCategory.id) }} 次，
                            刪除後相關交易記錄的分類將顯示為「未知分類」。
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
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useTransactionStore } from '@/stores/transaction'
import { useUIStore } from '@/stores/ui'
import { formatCurrency } from '@/utils/currency'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import CategoryForm from '@/components/forms/CategoryForm.vue'

// 使用 stores
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const uiStore = useUIStore()

// 響應式資料
const editingCategory = ref(null)
const deletingCategory = ref(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

// 計算屬性
const totalCategories = computed(() => categoryStore.categories.length)
const incomeCategories = computed(() => categoryStore.incomeCategories)
const expenseCategories = computed(() => categoryStore.expenseCategories)
const customCategories = computed(() =>
    categoryStore.categories.filter(cat => !cat.isDefault)
)

// 方法
const getCategoryUsageCount = (categoryId) => {
    return transactionStore.transactions.filter(t => t.category === categoryId).length
}

const getCategoryTotalAmount = (categoryId) => {
    return transactionStore.transactions
        .filter(t => t.category === categoryId)
        .reduce((sum, t) => sum + t.amount, 0)
}

const openAddCategoryModal = (type = 'expense') => {
    editingCategory.value = null
    // 可以設定預設類型
    uiStore.openModal('addCategory')
}

const closeCategoryModal = () => {
    editingCategory.value = null
    uiStore.closeModal('addCategory')
}

const editCategory = (category) => {
    editingCategory.value = category
    uiStore.openModal('addCategory')
}

const deleteCategory = (category) => {
    if (category.isDefault) {
        uiStore.showNotification({
            type: 'warning',
            title: '無法刪除',
            message: '系統預設分類無法刪除',
        })
        return
    }

    deletingCategory.value = category
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!deletingCategory.value) return

    deleting.value = true

    try {
        await categoryStore.deleteCategory(deletingCategory.value.id)
        showDeleteModal.value = false
        deletingCategory.value = null

        uiStore.showNotification({
            type: 'success',
            title: '刪除成功',
            message: '分類已成功刪除',
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

const handleCategorySuccess = () => {
    closeCategoryModal()
    uiStore.showNotification({
        type: 'success',
        title: '操作成功',
        message: editingCategory.value ? '分類已更新' : '分類已新增',
    })
}

// 生命週期
onMounted(async () => {
    try {
        await Promise.all([
            categoryStore.fetchCategories(),
            transactionStore.loadTransactions(),
        ])
    } catch (error) {
        uiStore.showNotification({
            type: 'error',
            title: '載入失敗',
            message: error.message || '無法載入分類資料',
        })
    }
})
</script>

<style scoped>
.categories-page {
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

/* 分類統計 */
.category-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.stat-card {
    text-align: center;
    transition: var(--transition-base);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stat-content {
    padding: var(--spacing-lg);
}

.stat-number {
    font-size: var(--font-3xl);
    font-weight: var(--font-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
}

.stat-label {
    font-size: var(--font-md);
    color: var(--text-secondary);
}

/* 分類內容 */
.categories-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.category-section {
    overflow: visible;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

.empty-text {
    font-size: var(--font-md);
    margin-bottom: var(--spacing-lg);
}

/* 分類網格 */
.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
}

.category-card {
    position: relative;
    padding: var(--spacing-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    cursor: pointer;
    transition: var(--transition-base);
}

.category-card:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.category-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
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
    flex-shrink: 0;
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
    padding: 0.25rem 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: calc(var(--border-radius) / 2);
    display: inline-block;
}

.category-actions {
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

.category-description {
    font-size: var(--font-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
}

.category-stats {
    display: flex;
    justify-content: space-between;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);
}

.stat-item {
    text-align: center;
}

.stat-label {
    font-size: var(--font-xs);
    color: var(--text-secondary);
    display: block;
    margin-bottom: var(--spacing-xs);
}

.stat-value {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
}

.default-badge {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: 0.25rem 0.5rem;
    background-color: var(--primary-color);
    color: var(--text-primary);
    border-radius: calc(var(--border-radius) / 2);
    font-size: var(--font-xs);
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

.category-preview {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-md);
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

.preview-type {
    font-size: var(--font-sm);
    color: var(--text-secondary);
}

.usage-warning {
    padding: var(--spacing-md);
    background-color: rgba(255, 152, 0, 0.1);
    border: 1px solid var(--warning-color);
    border-radius: var(--border-radius);
}

.warning-text {
    font-size: var(--font-sm);
    color: var(--warning-color);
    line-height: 1.5;
}

.delete-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
}

/* 響應式設計 */
@media (max-width: 1024px) {
    .category-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .category-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
}

@media (max-width: 768px) {
    .categories-page {
        padding: var(--spacing-md);
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .category-stats {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .category-grid {
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .category-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .category-actions {
        justify-content: center;
    }

    .category-stats {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .stat-label {
        margin-bottom: 0;
    }
}

@media (max-width: 480px) {
    .category-card {
        padding: var(--spacing-md);
    }

    .category-icon {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.25rem;
    }

    .category-name {
        font-size: var(--font-md);
    }

    .default-badge {
        position: static;
        margin-top: var(--spacing-sm);
        display: inline-block;
    }
}
</style>

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

/**
 * 分類管理 Store
 * 負責管理收入和支出分類的 CRUD 操作
 */
export const useCategoryStore = defineStore('category', () => {
  // 狀態定義
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 預設分類資料
  const defaultCategories = [
    // 收入分類
    {
      id: 'income-salary',
      name: '薪水',
      type: 'income',
      color: '#4CAF50',
      icon: '💰',
      isDefault: true,
    },
    {
      id: 'income-bonus',
      name: '獎金',
      type: 'income',
      color: '#8BC34A',
      icon: '🎁',
      isDefault: true,
    },
    {
      id: 'income-investment',
      name: '投資收益',
      type: 'income',
      color: '#CDDC39',
      icon: '📈',
      isDefault: true,
    },
    {
      id: 'income-other',
      name: '其他收入',
      type: 'income',
      color: '#FFC107',
      icon: '💡',
      isDefault: true,
    },

    // 支出分類
    {
      id: 'expense-food',
      name: '飲食',
      type: 'expense',
      color: '#FF5722',
      icon: '🍔',
      isDefault: true,
    },
    {
      id: 'expense-transport',
      name: '交通',
      type: 'expense',
      color: '#FF9800',
      icon: '🚗',
      isDefault: true,
    },
    {
      id: 'expense-shopping',
      name: '購物',
      type: 'expense',
      color: '#F44336',
      icon: '🛍️',
      isDefault: true,
    },
    {
      id: 'expense-entertainment',
      name: '娛樂',
      type: 'expense',
      color: '#E91E63',
      icon: '🎬',
      isDefault: true,
    },
    {
      id: 'expense-education',
      name: '教育',
      type: 'expense',
      color: '#9C27B0',
      icon: '📚',
      isDefault: true,
    },
    {
      id: 'expense-health',
      name: '醫療',
      type: 'expense',
      color: '#673AB7',
      icon: '🏥',
      isDefault: true,
    },
    {
      id: 'expense-utilities',
      name: '水電費',
      type: 'expense',
      color: '#3F51B5',
      icon: '💡',
      isDefault: true,
    },
    {
      id: 'expense-rent',
      name: '房租',
      type: 'expense',
      color: '#2196F3',
      icon: '🏠',
      isDefault: true,
    },
    {
      id: 'expense-other',
      name: '其他支出',
      type: 'expense',
      color: '#607D8B',
      icon: '📋',
      isDefault: true,
    },
  ]

  // 計算屬性
  const incomeCategories = computed(() =>
    categories.value.filter((category) => category.type === 'income'),
  )

  const expenseCategories = computed(() =>
    categories.value.filter((category) => category.type === 'expense'),
  )

  const categoriesByType = computed(() => ({
    income: incomeCategories.value,
    expense: expenseCategories.value,
  }))

  // 根據使用頻率獲取分類統計
  const categoryUsageStats = computed(() => {
    // 這裡需要與交易記錄 store 配合，暫時回傳空陣列
    return []
  })

  // 操作方法

  /**
   * 載入分類資料
   */
  async function fetchCategories() {
    loading.value = true
    error.value = null

    try {
      // 從 localStorage 載入分類資料
      const savedCategories = localStorage.getItem('expense-tracker-categories')

      if (savedCategories) {
        categories.value = JSON.parse(savedCategories)
      } else {
        // 如果沒有儲存的分類，使用預設分類
        categories.value = defaultCategories.map((category) => ({
          ...category,
          createdAt: new Date().toISOString(),
        }))
        await saveCategoriesToStorage()
      }
    } catch (err) {
      error.value = '載入分類資料失敗'
      console.error('載入分類失敗:', err)
      // 使用預設分類作為回退
      categories.value = defaultCategories
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增分類
   */
  async function addCategory(categoryData) {
    loading.value = true
    error.value = null

    try {
      const newCategory = {
        id: uuidv4(),
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color || '#607D8B',
        icon: categoryData.icon || '📋',
        description: categoryData.description || '',
        isDefault: false,
        createdAt: new Date().toISOString(),
      }

      categories.value.push(newCategory)
      await saveCategoriesToStorage()

      return newCategory
    } catch (err) {
      error.value = '新增分類失敗'
      console.error('新增分類失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新分類
   */
  async function updateCategory(id, categoryData) {
    loading.value = true
    error.value = null

    try {
      const index = categories.value.findIndex((category) => category.id === id)
      if (index === -1) {
        throw new Error('找不到指定的分類')
      }

      const updatedCategory = {
        ...categories.value[index],
        ...categoryData,
        updatedAt: new Date().toISOString(),
      }

      categories.value[index] = updatedCategory
      await saveCategoriesToStorage()

      return updatedCategory
    } catch (err) {
      error.value = '更新分類失敗'
      console.error('更新分類失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除分類
   */
  async function deleteCategory(id) {
    loading.value = true
    error.value = null

    try {
      const category = categories.value.find((cat) => cat.id === id)
      if (!category) {
        throw new Error('找不到指定的分類')
      }

      // 不允許刪除預設分類
      if (category.isDefault) {
        throw new Error('無法刪除系統預設分類')
      }

      // 這裡應該檢查是否有交易記錄使用此分類
      // 暫時跳過檢查，實際應用中需要與交易記錄 store 配合

      categories.value = categories.value.filter((cat) => cat.id !== id)
      await saveCategoriesToStorage()

      return true
    } catch (err) {
      error.value = err.message || '刪除分類失敗'
      console.error('刪除分類失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根據 ID 獲取分類
   */
  function getCategoryById(id) {
    return categories.value.find((category) => category.id === id)
  }

  /**
   * 根據類型獲取分類選項
   */
  function getCategoriesByType(type) {
    return categories.value.filter((category) => category.type === type)
  }

  /**
   * 搜尋分類
   */
  function searchCategories(query) {
    if (!query) return categories.value

    const lowercaseQuery = query.toLowerCase()
    return categories.value.filter(
      (category) =>
        category.name.toLowerCase().includes(lowercaseQuery) ||
        (category.description && category.description.toLowerCase().includes(lowercaseQuery)),
    )
  }

  /**
   * 驗證分類名稱是否重複
   */
  function isCategoryNameDuplicate(name, excludeId = null) {
    return categories.value.some((category) => category.name === name && category.id !== excludeId)
  }

  /**
   * 儲存分類資料到 localStorage
   */
  async function saveCategoriesToStorage() {
    try {
      localStorage.setItem('expense-tracker-categories', JSON.stringify(categories.value))
    } catch (err) {
      console.error('儲存分類資料失敗:', err)
      throw new Error('儲存資料失敗')
    }
  }

  /**
   * 重置分類為預設狀態
   */
  async function resetToDefault() {
    loading.value = true
    error.value = null

    try {
      categories.value = defaultCategories.map((category) => ({
        ...category,
        createdAt: new Date().toISOString(),
      }))
      await saveCategoriesToStorage()
    } catch (err) {
      error.value = '重置分類失敗'
      console.error('重置分類失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取分類色彩選項
   */
  function getColorOptions() {
    return [
      '#F44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
    ]
  }

  /**
   * 獲取圖示選項
   */
  function getIconOptions(type = 'all') {
    const incomeIcons = ['💰', '💵', '💸', '💳', '🏆', '🎁', '📈', '💡', '⭐', '🌟']
    const expenseIcons = ['🍔', '🚗', '🛍️', '🎬', '📚', '🏥', '💡', '🏠', '📋', '💊', '✈️', '🎮']

    if (type === 'income') return incomeIcons
    if (type === 'expense') return expenseIcons
    return [...incomeIcons, ...expenseIcons]
  }

  // 初始化時自動載入分類
  fetchCategories()

  return {
    // 狀態
    categories,
    loading,
    error,

    // 計算屬性
    incomeCategories,
    expenseCategories,
    categoriesByType,
    categoryUsageStats,

    // 方法
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByType,
    searchCategories,
    isCategoryNameDuplicate,
    resetToDefault,
    getColorOptions,
    getIconOptions,
  }
})

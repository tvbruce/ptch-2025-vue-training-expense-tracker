import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { useTransactionStore } from './transaction'
import { useCategoryStore } from './category'

/**
 * 預算管理 Store
 * 負責管理月度和年度預算設定、使用追蹤及超預算警告
 */
export const useBudgetStore = defineStore('budget', () => {
  // 狀態定義
  const budgets = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 當前日期資訊
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

  // 計算屬性

  /**
   * 當前月份的預算列表
   */
  const currentMonthBudgets = computed(() => {
    return budgets.value.filter((budget) => {
      if (budget.period === 'yearly') {
        return budget.year === currentYear.value
      } else {
        return budget.year === currentYear.value && budget.month === currentMonth.value
      }
    })
  })

  /**
   * 預算使用情況統計
   */
  const budgetUsage = computed(() => {
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()

    return currentMonthBudgets.value.map((budget) => {
      const category = categoryStore.getCategoryById(budget.category)

      // 計算已使用金額
      let usedAmount = 0
      const dateRange = getBudgetDateRange(budget)

      const relevantTransactions = transactionStore.transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.category === budget.category &&
          transaction.type === 'expense' &&
          transactionDate >= dateRange.start &&
          transactionDate <= dateRange.end
        )
      })

      usedAmount = relevantTransactions.reduce((total, t) => total + t.amount, 0)

      const percentage = budget.amount > 0 ? (usedAmount / budget.amount) * 100 : 0
      const isOverBudget = usedAmount > budget.amount
      const isNearLimit = percentage >= (budget.alertThreshold || 80)

      return {
        ...budget,
        category,
        usedAmount,
        remainingAmount: Math.max(0, budget.amount - usedAmount),
        percentage: Math.min(100, percentage),
        isOverBudget,
        isNearLimit,
        transactionCount: relevantTransactions.length,
      }
    })
  })

  /**
   * 總預算統計
   */
  const totalBudgetStats = computed(() => {
    const usage = budgetUsage.value

    const totalBudget = usage.reduce((total, item) => total + item.amount, 0)
    const totalUsed = usage.reduce((total, item) => total + item.usedAmount, 0)
    const totalRemaining = Math.max(0, totalBudget - totalUsed)

    return {
      totalBudget,
      totalUsed,
      totalRemaining,
      overallPercentage: totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0,
      budgetCount: usage.length,
      overBudgetCount: usage.filter((item) => item.isOverBudget).length,
      nearLimitCount: usage.filter((item) => item.isNearLimit && !item.isOverBudget).length,
    }
  })

  /**
   * 超預算的分類
   */
  const overBudgetCategories = computed(() => {
    return budgetUsage.value
      .filter((item) => item.isOverBudget)
      .sort((a, b) => b.percentage - a.percentage)
  })

  /**
   * 接近預算上限的分類
   */
  const nearLimitCategories = computed(() => {
    return budgetUsage.value
      .filter((item) => item.isNearLimit && !item.isOverBudget)
      .sort((a, b) => b.percentage - a.percentage)
  })

  /**
   * 本月總預算
   */
  const totalMonthlyBudget = computed(() => {
    return currentMonthBudgets.value.reduce((total, budget) => total + budget.amount, 0)
  })

  /**
   * 本月預算已使用總額
   */
  const totalBudgetUsed = computed(() => {
    return budgetUsage.value.reduce((total, item) => total + item.usedAmount, 0)
  })

  /**
   * 預算警告列表
   */
  const budgetAlerts = computed(() => {
    const alerts = []

    budgetUsage.value.forEach((item) => {
      if (item.isOverBudget) {
        alerts.push({
          id: item.id,
          categoryName: item.category?.name || '未知分類',
          categoryId: item.category,
          severity: 'danger',
          message: `已超出預算 ${(item.usedAmount - item.amount).toFixed(0)} 元`,
          percentage: Math.round(item.percentage),
        })
      } else if (item.isNearLimit) {
        alerts.push({
          id: item.id,
          categoryName: item.category?.name || '未知分類',
          categoryId: item.category,
          severity: 'warning',
          message: `預算即將用完，已使用 ${item.percentage.toFixed(0)}%`,
          percentage: Math.round(item.percentage),
        })
      }
    })

    return alerts.sort((a, b) => b.percentage - a.percentage)
  })

  // 操作方法

  /**
   * 載入預算資料
   */
  async function fetchBudgets() {
    loading.value = true
    error.value = null

    try {
      const savedBudgets = localStorage.getItem('expense-tracker-budgets')

      if (savedBudgets) {
        budgets.value = JSON.parse(savedBudgets)
      } else {
        budgets.value = []
      }
    } catch (err) {
      error.value = '載入預算資料失敗'
      console.error('載入預算失敗:', err)
      budgets.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 設定預算
   */
  async function setBudget(budgetData) {
    loading.value = true
    error.value = null

    try {
      // 檢查是否已經存在相同的預算設定
      const existingBudgetIndex = budgets.value.findIndex(
        (budget) =>
          budget.category === budgetData.category &&
          budget.period === budgetData.period &&
          budget.year === budgetData.year &&
          (budgetData.period === 'yearly' || budget.month === budgetData.month),
      )

      const budgetInfo = {
        id: existingBudgetIndex >= 0 ? budgets.value[existingBudgetIndex].id : uuidv4(),
        category: budgetData.category,
        amount: parseFloat(budgetData.amount),
        period: budgetData.period,
        year: budgetData.year,
        month: budgetData.period === 'monthly' ? budgetData.month : null,
        alertThreshold: budgetData.alertThreshold || 80,
        createdAt:
          existingBudgetIndex >= 0
            ? budgets.value[existingBudgetIndex].createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (existingBudgetIndex >= 0) {
        // 更新現有預算
        budgets.value[existingBudgetIndex] = budgetInfo
      } else {
        // 新增預算
        budgets.value.push(budgetInfo)
      }

      await saveBudgetsToStorage()
      return budgetInfo
    } catch (err) {
      error.value = '設定預算失敗'
      console.error('設定預算失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新預算
   */
  async function updateBudget(id, budgetData) {
    loading.value = true
    error.value = null

    try {
      const index = budgets.value.findIndex((budget) => budget.id === id)
      if (index === -1) {
        throw new Error('找不到指定的預算')
      }

      const updatedBudget = {
        ...budgets.value[index],
        ...budgetData,
        amount: parseFloat(budgetData.amount),
        updatedAt: new Date().toISOString(),
      }

      budgets.value[index] = updatedBudget
      await saveBudgetsToStorage()

      return updatedBudget
    } catch (err) {
      error.value = '更新預算失敗'
      console.error('更新預算失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除預算
   */
  async function deleteBudget(id) {
    loading.value = true
    error.value = null

    try {
      const index = budgets.value.findIndex((budget) => budget.id === id)
      if (index === -1) {
        throw new Error('找不到指定的預算')
      }

      budgets.value.splice(index, 1)
      await saveBudgetsToStorage()

      return true
    } catch (err) {
      error.value = '刪除預算失敗'
      console.error('刪除預算失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 設定當前月份和年份
   */
  function setCurrentMonth(month, year) {
    currentMonth.value = month
    currentYear.value = year
  }

  /**
   * 獲取預算的日期範圍
   */
  function getBudgetDateRange(budget) {
    if (budget.period === 'yearly') {
      return {
        start: new Date(budget.year, 0, 1),
        end: new Date(budget.year, 11, 31, 23, 59, 59, 999),
      }
    } else {
      return {
        start: new Date(budget.year, budget.month - 1, 1),
        end: new Date(budget.year, budget.month, 0, 23, 59, 59, 999),
      }
    }
  }

  /**
   * 檢查是否存在指定分類的預算
   */
  function hasBudgetForCategory(
    categoryId,
    period = 'monthly',
    year = currentYear.value,
    month = currentMonth.value,
  ) {
    return budgets.value.some(
      (budget) =>
        budget.category === categoryId &&
        budget.period === period &&
        budget.year === year &&
        (period === 'yearly' || budget.month === month),
    )
  }

  /**
   * 獲取指定分類的預算
   */
  function getBudgetForCategory(
    categoryId,
    period = 'monthly',
    year = currentYear.value,
    month = currentMonth.value,
  ) {
    return budgets.value.find(
      (budget) =>
        budget.category === categoryId &&
        budget.period === period &&
        budget.year === year &&
        (period === 'yearly' || budget.month === month),
    )
  }

  /**
   * 獲取預算歷史記錄
   */
  function getBudgetHistory(categoryId) {
    return budgets.value
      .filter((budget) => budget.category === categoryId)
      .sort((a, b) => {
        // 按年份和月份排序
        if (a.year !== b.year) {
          return b.year - a.year
        }
        if (a.period === 'yearly' && b.period === 'monthly') {
          return -1
        }
        if (a.period === 'monthly' && b.period === 'yearly') {
          return 1
        }
        return (b.month || 0) - (a.month || 0)
      })
  }

  /**
   * 複製上個月的預算到這個月
   */
  async function copyLastMonthBudgets() {
    loading.value = true
    error.value = null

    try {
      const lastMonth = currentMonth.value === 1 ? 12 : currentMonth.value - 1
      const lastYear = currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value

      const lastMonthBudgets = budgets.value.filter(
        (budget) =>
          budget.period === 'monthly' && budget.year === lastYear && budget.month === lastMonth,
      )

      const newBudgets = []

      for (const budget of lastMonthBudgets) {
        // 檢查本月是否已經有相同分類的預算
        const existingBudget = budgets.value.find(
          (b) =>
            b.category === budget.category &&
            b.period === 'monthly' &&
            b.year === currentYear.value &&
            b.month === currentMonth.value,
        )

        if (!existingBudget) {
          const newBudget = {
            id: uuidv4(),
            category: budget.category,
            amount: budget.amount,
            period: 'monthly',
            year: currentYear.value,
            month: currentMonth.value,
            alertThreshold: budget.alertThreshold,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          budgets.value.push(newBudget)
          newBudgets.push(newBudget)
        }
      }

      if (newBudgets.length > 0) {
        await saveBudgetsToStorage()
      }

      return newBudgets
    } catch (err) {
      error.value = '複製預算失敗'
      console.error('複製預算失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取預算建議
   */
  function getBudgetSuggestions(categoryId) {
    const transactionStore = useTransactionStore()

    // 獲取過去6個月的支出平均
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const relevantTransactions = transactionStore.transactions.filter(
      (transaction) =>
        transaction.category === categoryId &&
        transaction.type === 'expense' &&
        new Date(transaction.date) >= sixMonthsAgo,
    )

    if (relevantTransactions.length === 0) {
      return null
    }

    const totalAmount = relevantTransactions.reduce((total, t) => total + t.amount, 0)
    const averageMonthly = totalAmount / 6

    return {
      averageMonthly: Math.ceil(averageMonthly),
      maxMonthly: Math.ceil(averageMonthly * 1.2), // 建議增加20%緩衝
      conservative: Math.ceil(averageMonthly * 0.9), // 保守建議
      transactionCount: relevantTransactions.length,
    }
  }

  /**
   * 儲存預算資料到 localStorage
   */
  async function saveBudgetsToStorage() {
    try {
      localStorage.setItem('expense-tracker-budgets', JSON.stringify(budgets.value))
    } catch (err) {
      console.error('儲存預算資料失敗:', err)
      throw new Error('儲存資料失敗')
    }
  }

  /**
   * 重置所有預算
   */
  async function resetAllBudgets() {
    loading.value = true
    error.value = null

    try {
      budgets.value = []
      await saveBudgetsToStorage()
    } catch (err) {
      error.value = '重置預算失敗'
      console.error('重置預算失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 初始化時自動載入預算
  // fetchBudgets() - 移除自動載入，改為在需要時手動載入

  return {
    // 狀態
    budgets,
    loading,
    error,
    currentMonth,
    currentYear,

    // 計算屬性
    currentMonthBudgets,
    budgetUsage,
    totalBudgetStats,
    overBudgetCategories,
    nearLimitCategories,
    totalMonthlyBudget,
    totalBudgetUsed,
    budgetAlerts,

    // 方法
    fetchBudgets,
    setBudget,
    updateBudget,
    deleteBudget,
    setCurrentMonth,
    getBudgetDateRange,
    hasBudgetForCategory,
    getBudgetForCategory,
    getBudgetHistory,
    copyLastMonthBudgets,
    getBudgetSuggestions,
    resetAllBudgets,
  }
})

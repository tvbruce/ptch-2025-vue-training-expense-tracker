import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { v4 as uuidv4 } from 'uuid' // TODO: 學員練習時需要取消註解

/**
 * 交易記錄管理 Store
 * 展示 Pinia 狀態管理的核心概念：狀態、計算屬性、操作方法
 *
 * 🎯 學習目標：
 * 1. 使用 ref 建立響應式狀態
 * 2. 使用 computed 建立衍生狀態
 * 3. 實作狀態管理的操作方法
 * 4. 理解資料持久化
 */
export const useTransactionStore = defineStore('transaction', () => {
  // ==================== 狀態定義 ====================
  // 🔧 練習重點：使用 ref 建立響應式狀態

  // TODO: 請建立以下響應式狀態
  // 1. transactions - 交易記錄陣列，初始值為 []
  // 2. loading - 載入狀態，初始值為 false
  // 3. error - 錯誤訊息，初始值為 null

  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==================== 計算屬性 ====================
  // 🔧 練習重點：使用 computed 建立衍生狀態

  /**
   * 總餘額 = 收入總額 - 支出總額
   * TODO: 請實作這個計算屬性
   * 提示：使用 reduce 方法遍歷 transactions，根據 type 判斷是加還是減
   */
  const balance = computed(() => {
    // TODO: 在這裡實作餘額計算邏輯
    // 收入：transaction.type === 'income'，金額應該加到總額
    // 支出：transaction.type === 'expense'，金額應該從總額減去
    return 0 // 請替換成正確的計算邏輯
  })

  /**
   * 總收入
   * TODO: 請實作這個計算屬性
   * 提示：篩選出所有收入類型的交易，然後加總金額
   */
  const totalIncome = computed(() => {
    // TODO: 在這裡實作總收入計算邏輯
    return 0 // 請替換成正確的計算邏輯
  })

  /**
   * 總支出
   * TODO: 請實作這個計算屬性
   * 提示：篩選出所有支出類型的交易，然後加總金額
   */
  const totalExpense = computed(() => {
    // TODO: 在這裡實作總支出計算邏輯
    return 0 // 請替換成正確的計算邏輯
  })

  /**
   * 本月收入（簡化版日期判斷）
   * TODO: 請實作這個計算屬性
   * 提示：先取得當前月份和年份，然後篩選符合條件的收入交易
   */
  const monthlyIncome = computed(() => {
    // TODO: 在這裡實作本月收入計算邏輯
    // 1. 取得當前月份和年份
    // const currentMonth = new Date().getMonth()
    // const currentYear = new Date().getFullYear()
    // 2. 篩選出本月的收入交易
    // 3. 加總金額
    return 0 // 請替換成正確的計算邏輯
  })

  /**
   * 本月支出（簡化版日期判斷）
   * TODO: 請實作這個計算屬性
   */
  const monthlyExpense = computed(() => {
    // TODO: 在這裡實作本月支出計算邏輯
    // 1. 取得當前月份和年份
    // const currentMonth = new Date().getMonth()
    // const currentYear = new Date().getFullYear()
    // 2. 篩選出本月的支出交易
    // 3. 加總金額
    return 0 // 請替換成正確的計算邏輯
  })

  /**
   * 最近 5 筆交易
   * TODO: 請實作這個計算屬性
   * 提示：需要先排序（最新的在前），然後取前 5 筆
   */
  const recentTransactions = computed(() => {
    // TODO: 在這裡實作最近交易邏輯
    // 1. 複製 transactions 陣列（避免修改原陣列）
    // 2. 按日期排序（最新的在前）
    // 3. 取前 5 筆
    return [] // 請替換成正確的計算邏輯
  })

  /**
   * 本月交易數量統計
   * TODO: 請實作這個計算屬性
   */
  const monthlyStats = computed(() => {
    // TODO: 在這裡實作本月統計邏輯
    // 1. 取得當前月份和年份
    // const currentMonth = new Date().getMonth()
    // const currentYear = new Date().getFullYear()
    // 2. 篩選出本月的交易
    // 3. 分別計算收入和支出的筆數
    // 4. 計算總筆數

    return {
      incomeCount: 0,
      expenseCount: 0,
      totalCount: 0,
    } // 請替換成正確的計算邏輯
  })

  // ==================== 操作方法 ====================
  // 🔧 練習重點：實作狀態管理的操作方法

  /**
   * 載入交易記錄（從 localStorage）
   * TODO: 請實作這個方法
   * 提示：使用 try-catch 處理錯誤，設定 loading 狀態
   */
  async function loadTransactions() {
    // TODO: 在這裡實作載入邏輯
    // 1. 設定 loading 為 true
    // 2. 清空 error
    // 3. 嘗試從 localStorage 讀取資料
    // 4. 如果沒有資料，建立示例資料
    // 5. 處理錯誤情況
    // 6. 最後設定 loading 為 false

    console.log('TODO: 實作 loadTransactions 方法')
  }

  /**
   * 儲存交易記錄到 localStorage
   * TODO: 請實作這個方法
   * 提示：使用 JSON.stringify 轉換資料，處理可能的錯誤
   */
  function saveTransactions() {
    // TODO: 在這裡實作儲存邏輯
    // 1. 使用 localStorage.setItem 儲存
    // 2. 使用 JSON.stringify 轉換陣列
    // 3. 處理可能的錯誤

    console.log('TODO: 實作 saveTransactions 方法')
  }

  /**
   * 新增交易記錄
   * TODO: 請實作這個方法
   * 提示：需要產生 UUID、新增時間戳，然後更新狀態並儲存
   */
  function addTransaction(transactionData) {
    // TODO: 在這裡實作新增邏輯
    // 1. 建立包含 id、時間戳的完整交易物件
    // 2. 加入到 transactions 陣列
    // 3. 儲存到 localStorage
    // 4. 回傳新的交易物件

    console.log('TODO: 實作 addTransaction 方法', transactionData)
    return null
  }

  /**
   * 更新交易記錄
   * TODO: 請實作這個方法
   * 提示：先找到要更新的交易，然後更新資料並儲存
   */
  function updateTransaction(id, updateData) {
    // TODO: 在這裡實作更新邏輯
    // 1. 根據 id 找到要更新的交易
    // 2. 更新交易資料
    // 3. 更新 updatedAt 時間戳
    // 4. 儲存到 localStorage
    // 5. 回傳是否成功

    console.log('TODO: 實作 updateTransaction 方法', id, updateData)
    return false
  }

  /**
   * 刪除交易記錄
   * TODO: 請實作這個方法
   * 提示：找到並移除指定的交易，然後儲存
   */
  function deleteTransaction(id) {
    // TODO: 在這裡實作刪除邏輯
    // 1. 根據 id 找到要刪除的交易索引
    // 2. 從陣列中移除
    // 3. 儲存到 localStorage
    // 4. 回傳是否成功

    console.log('TODO: 實作 deleteTransaction 方法', id)
    return false
  }

  /**
   * 根據類型取得交易記錄
   * TODO: 請實作這個方法
   */
  function getTransactionsByType(/* type */) {
    // TODO: 在這裡實作篩選邏輯
    // 根據傳入的 type 參數篩選交易記錄
    return []
  }

  /**
   * 清除錯誤訊息
   * TODO: 請實作這個方法
   */
  function clearError() {
    // TODO: 在這裡實作清除錯誤邏輯
  }

  /**
   * 建立示例資料
   * TODO: 請實作這個方法（可選）
   * 提示：建立一些範例交易資料，方便測試
   */
  async function createSampleData() {
    // TODO: 在這裡實作示例資料建立邏輯
    // 可以建立一些範例的收入和支出記錄

    console.log('TODO: 實作 createSampleData 方法')
  }

  // ==================== 返回 Store API ====================
  // 🔧 練習重點：暴露狀態和方法給組件使用

  return {
    // 狀態
    transactions,
    loading,
    error,

    // 計算屬性
    balance,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    recentTransactions,
    monthlyStats,

    // 操作方法
    loadTransactions,
    saveTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByType,
    clearError,
    createSampleData,
  }
})

// ==================== 學習重點總結 ====================
/**
 * 🎓 完成這個練習後，您將學會：
 *
 * 1. Pinia Store 的基本結構
 *    - 使用 defineStore 建立 store
 *    - 使用 setup stores 語法
 *
 * 2. 響應式狀態管理
 *    - 使用 ref 建立基礎狀態
 *    - 使用 computed 建立衍生狀態
 *
 * 3. 業務邏輯實作
 *    - CRUD 操作的實作
 *    - 資料持久化
 *    - 錯誤處理
 *
 * 4. Store API 設計
 *    - 合理地暴露狀態和方法
 *    - 保持代碼的可維護性
 *
 * 💡 提示：
 * - 請按照 TODO 的順序逐步實作
 * - 可以參考註解中的提示
 * - 測試每個功能是否正常運作
 * - 不確定時可以查看 Vue 和 Pinia 的官方文檔
 */

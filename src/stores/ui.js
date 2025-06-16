import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * UI 狀態管理 Store
 * 專注於基礎 UI 狀態管理，適合學習 Pinia 的使用方式
 *
 * 🎯 學習目標：
 * 1. 管理全域 UI 狀態
 * 2. 實現設定資料的持久化
 * 3. 建立通知系統
 * 4. 學習模態框狀態管理
 */
export const useUIStore = defineStore('ui', () => {
  // ==================== 狀態定義 ====================
  // 🔧 練習重點：建立各種 UI 相關的響應式狀態

  // TODO: 請建立以下響應式狀態
  // 1. 從 localStorage 讀取保存的設置（如果沒有則使用預設值）
  // 2. 基礎 UI 狀態
  // 3. 模態框狀態物件
  // 4. 通知系統相關狀態

  // TODO: 請建立以下響應式狀態，使用 ref() 包裝
  const sidebarCollapsed = ref(false) // TODO: 在這裡實作 - 側邊欄收合狀態
  const theme = ref('light') // TODO: 在這裡實作 - 從 localStorage 讀取或使用 'light'
  const currency = ref('TWD') // TODO: 在這裡實作 - 從 localStorage 讀取或使用 'TWD'
  const language = ref('zh-TW') // TODO: 在這裡實作 - 從 localStorage 讀取或使用 'zh-TW'
  const dateFormat = ref('YYYY-MM-DD') // TODO: 在這裡實作 - 從 localStorage 讀取或使用 'YYYY-MM-DD'
  const showDecimals = ref(true) // TODO: 在這裡實作 - 是否顯示小數

  // TODO: 初始化主題到 DOM
  // 提示：使用 document.documentElement.setAttribute('data-theme', theme.value)

  // TODO: 建立模態框狀態物件
  // 包含：addTransaction, editTransaction, addCategory, setBudget，初始值都為 false
  const modals = ref({}) // TODO: 在這裡實作 - 建立包含各種模態框狀態的物件

  // TODO: 建立通知系統狀態
  const notifications = ref([]) // TODO: 在這裡實作 - 通知陣列
  let notificationId = 0 // 通知 ID 計數器

  // ==================== 計算屬性 ====================
  // 🔧 練習重點：建立衍生狀態

  /**
   * 是否為深色主題
   * TODO: 請實作這個計算屬性
   */
  const isDarkTheme = computed(() => {
    // TODO: 在這裡實作深色主題判斷邏輯
    return false
  })

  /**
   * 是否有開啟的模態框
   * TODO: 請實作這個計算屬性
   * 提示：檢查 modals 物件中是否有任何值為 true
   */
  const hasOpenModal = computed(() => {
    // TODO: 在這裡實作模態框檢查邏輯
    return false
  })

  // ==================== 操作方法 ====================
  // 🔧 練習重點：實作 UI 狀態管理的操作方法

  /**
   * 切換側邊欄
   * TODO: 請實作這個方法
   */
  function toggleSidebar() {
    // TODO: 在這裡實作側邊欄切換邏輯
    console.log('TODO: 實作 toggleSidebar 方法')
  }

  /**
   * 切換主題
   * TODO: 請實作這個方法
   * 提示：切換 light/dark，更新 DOM，儲存到 localStorage
   */
  function toggleTheme() {
    // TODO: 在這裡實作主題切換邏輯
    // 1. 切換主題值
    // 2. 更新 DOM 屬性
    // 3. 儲存到 localStorage
    console.log('TODO: 實作 toggleTheme 方法')
  }

  /**
   * 設定主題
   * TODO: 請實作這個方法
   */
  function setTheme(newTheme) {
    // TODO: 在這裡實作主題設定邏輯
    // 1. 驗證主題值是否有效
    // 2. 更新狀態
    // 3. 更新 DOM
    // 4. 儲存到 localStorage
    console.log('TODO: 實作 setTheme 方法', newTheme)
  }

  /**
   * 設定語言
   * TODO: 請實作這個方法
   */
  function setLanguage(newLanguage) {
    // TODO: 在這裡實作語言設定邏輯
    console.log('TODO: 實作 setLanguage 方法', newLanguage)
  }

  /**
   * 設定日期格式
   * TODO: 請實作這個方法
   */
  function setDateFormat(newFormat) {
    // TODO: 在這裡實作日期格式設定邏輯
    console.log('TODO: 實作 setDateFormat 方法', newFormat)
  }

  /**
   * 設定貨幣
   * TODO: 請實作這個方法
   */
  function setCurrency(newCurrency) {
    // TODO: 在這裡實作貨幣設定邏輯
    console.log('TODO: 實作 setCurrency 方法', newCurrency)
  }

  /**
   * 開啟模態框
   * TODO: 請實作這個方法
   * 提示：檢查模態框名稱是否存在，然後設為 true
   */
  function openModal(modalName) {
    // TODO: 在這裡實作開啟模態框邏輯
    console.log('TODO: 實作 openModal 方法', modalName)
  }

  /**
   * 關閉模態框
   * TODO: 請實作這個方法
   */
  function closeModal(modalName) {
    // TODO: 在這裡實作關閉模態框邏輯
    console.log('TODO: 實作 closeModal 方法', modalName)
  }

  /**
   * 關閉所有模態框
   * TODO: 請實作這個方法
   * 提示：遍歷 modals 物件，將所有值設為 false
   */
  function closeAllModals() {
    // TODO: 在這裡實作關閉所有模態框邏輯
    console.log('TODO: 實作 closeAllModals 方法')
  }

  /**
   * 顯示通知
   * TODO: 請實作這個方法
   * 提示：建立通知物件，加入陣列，設定自動移除
   */
  function showNotification({ type = 'info', title, message, duration = 3000 }) {
    // TODO: 在這裡實作顯示通知邏輯
    // 1. 建立通知物件（包含 id, type, title, message, duration 等）
    // 2. 加入到 notifications 陣列
    // 3. 如果 duration > 0，設定自動移除計時器
    // 4. 回傳通知 ID

    console.log('TODO: 實作 showNotification 方法', { type, title, message, duration })
    return ++notificationId
  }

  /**
   * 隱藏通知
   * TODO: 請實作這個方法
   */
  function hideNotification(id) {
    // TODO: 在這裡實作隱藏通知邏輯
    // 1. 根據 id 找到通知
    // 2. 設定 visible 為 false（支援動畫）
    // 3. 延遲移除通知物件

    console.log('TODO: 實作 hideNotification 方法', id)
  }

  /**
   * 清除所有通知
   * TODO: 請實作這個方法
   */
  function clearNotifications() {
    // TODO: 在這裡實作清除所有通知邏輯
    console.log('TODO: 實作 clearNotifications 方法')
  }

  // ==================== 便捷方法 ====================
  // 🔧 練習重點：基於基礎方法建立便捷的方法

  /**
   * 顯示成功通知
   * TODO: 請實作這個方法
   * 提示：使用 showNotification 方法，傳入適當的參數
   */
  function showSuccess(title, message) {
    // TODO: 在這裡實作成功通知邏輯
    console.log('TODO: 實作 showSuccess 方法', title, message)
    return 0
  }

  /**
   * 顯示錯誤通知
   * TODO: 請實作這個方法
   */
  function showError(title, message) {
    // TODO: 在這裡實作錯誤通知邏輯
    console.log('TODO: 實作 showError 方法', title, message)
    return 0
  }

  /**
   * 顯示警告通知
   * TODO: 請實作這個方法
   */
  function showWarning(title, message) {
    // TODO: 在這裡實作警告通知邏輯
    console.log('TODO: 實作 showWarning 方法', title, message)
    return 0
  }

  // ==================== 返回 Store API ====================
  // �� 練習重點：暴露狀態和方法給組件使用

  return {
    // 狀態
    sidebarCollapsed,
    theme,
    currency,
    language,
    dateFormat,
    showDecimals,
    modals,
    notifications,

    // 計算屬性
    isDarkTheme,
    hasOpenModal,

    // 基礎操作方法
    toggleSidebar,
    toggleTheme,
    setTheme,
    setLanguage,
    setDateFormat,
    setCurrency,

    // 模態框管理
    openModal,
    closeModal,
    closeAllModals,

    // 通知系統
    showNotification,
    hideNotification,
    clearNotifications,

    // 便捷方法
    showSuccess,
    showError,
    showWarning,
  }
})

// ==================== 學習重點總結 ====================
/**
 * 🎓 完成這個練習後，您將學會：
 *
 * 1. UI 狀態管理
 *    - 管理全域的 UI 設定
 *    - 實現設定的持久化儲存
 *
 * 2. 計算屬性的應用
 *    - 基於基礎狀態建立衍生狀態
 *    - 提供便捷的狀態檢查方法
 *
 * 3. 模態框狀態管理
 *    - 統一管理多個模態框的開關狀態
 *    - 提供便捷的操作方法
 *
 * 4. 通知系統設計
 *    - 建立靈活的通知機制
 *    - 支援不同類型的通知
 *    - 實現自動移除功能
 *
 * 💡 提示：
 * - 注意 localStorage 的讀取和儲存
 * - 考慮邊界情況和錯誤處理
 * - 測試各種 UI 狀態的切換
 * - 確保狀態變更能正確反映到 UI
 */

# 🎯 個人記帳應用 - Pinia 實戰練習

歡迎進入 Pinia 狀態管理的實戰練習！這個專案將幫助您深度體驗 Vue 3 + Pinia 在真實應用中的使用方式。

## 📚 練習概述

本專案是一個完整的個人記帳應用，但關鍵的 Pinia Store 邏輯已被移除，需要您親自實作。透過這個練習，您將學會：

- ✅ **Pinia Store 基礎結構**：使用 `defineStore` 建立狀態管理
- ✅ **響應式狀態管理**：使用 `ref` 和 `computed` 管理狀態
- ✅ **業務邏輯實作**：實現完整的 CRUD 操作
- ✅ **資料持久化**：與 localStorage 整合
- ✅ **錯誤處理**：建立健壯的錯誤處理機制
- ✅ **UI 狀態管理**：管理全域 UI 狀態

## 🏗️ 專案架構

```
src/
├── stores/
│   ├── transaction.js    # 🔧 需要實作：交易記錄管理
│   ├── category.js       # 📋 已完成：分類管理（參考用）
│   ├── budget.js         # 💰 已完成：預算管理（參考用）
│   └── ui.js            # 🔧 需要實作：UI 狀態管理
├── views/
│   ├── Home.vue         # 首頁（使用 stores）
│   ├── Transactions.vue # 交易記錄頁
│   └── ...其他頁面
└── components/
    └── ...各種組件
```

## 🎯 練習重點

### 第一階段：Transaction Store（核心練習）

**檔案：`src/stores/transaction.js`**

#### 🔧 需要實作的內容：

1. **響應式狀態定義**

   ```javascript
   const transactions = ref([])
   const loading = ref(false)
   const error = ref(null)
   ```

2. **計算屬性實作**

   - `balance` - 總餘額計算
   - `totalIncome` - 總收入
   - `totalExpense` - 總支出
   - `monthlyIncome` - 本月收入
   - `monthlyExpense` - 本月支出
   - `recentTransactions` - 最近5筆交易

3. **核心方法實作**
   - `loadTransactions()` - 從 localStorage 載入資料
   - `saveTransactions()` - 儲存資料到 localStorage
   - `addTransaction()` - 新增交易
   - `updateTransaction()` - 更新交易
   - `deleteTransaction()` - 刪除交易

#### 💡 實作提示：

**計算餘額範例：**

```javascript
const balance = computed(() => {
  return transactions.value.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount
  }, 0)
})
```

**新增交易範例：**

```javascript
function addTransaction(transactionData) {
  const newTransaction = {
    id: uuidv4(), // 記得取消註解 import
    ...transactionData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  transactions.value.push(newTransaction)
  saveTransactions()
  return newTransaction
}
```

### 第二階段：UI Store（進階練習）

**檔案：`src/stores/ui.js`**

#### 🔧 需要實作的內容：

1. **從 localStorage 讀取設定**

   ```javascript
   const theme = ref(localStorage.getItem('expense-tracker-theme') || 'light')
   ```

2. **計算屬性**

   - `isDarkTheme` - 深色主題判斷
   - `hasOpenModal` - 是否有開啟的模態框

3. **UI 狀態管理方法**
   - 主題切換和設定
   - 模態框管理
   - 通知系統

## 📋 實作步驟建議

### Step 1: 基礎狀態建立（15分鐘）

1. 在 `transaction.js` 中實作基礎 ref 狀態
2. 取消註解 `uuidv4` import
3. 測試基礎狀態是否建立成功

### Step 2: 計算屬性實作（20分鐘）

1. 實作 `balance` 計算屬性
2. 實作 `totalIncome` 和 `totalExpense`
3. 實作月度統計相關計算屬性
4. 在瀏覽器中查看計算結果

### Step 3: CRUD 操作實作（25分鐘）

1. 實作 `addTransaction` 方法
2. 實作 `loadTransactions` 和 `saveTransactions`
3. 實作 `updateTransaction` 和 `deleteTransaction`
4. 測試完整的增刪改查功能

### Step 4: UI Store 實作（20分鐘）

1. 實作基礎狀態和 localStorage 整合
2. 實作主題切換功能
3. 實作模態框管理
4. 實作通知系統

### Step 5: 測試和完善（10分鐘）

1. 在首頁測試各項功能
2. 檢查瀏覽器 DevTools 中的 Pinia 狀態
3. 測試資料持久化
4. 完善錯誤處理

## 🧪 測試檢查點

### ✅ Transaction Store 檢查：

- [ ] 新增交易後，餘額正確更新
- [ ] 重新整理頁面後，資料仍然存在
- [ ] 最近交易列表顯示正確
- [ ] 月度統計數字正確

### ✅ UI Store 檢查：

- [ ] 主題切換功能正常
- [ ] 設定能夠持久化儲存
- [ ] 通知系統顯示正常

## 🔍 除錯技巧

### 1. 使用 Vue DevTools

安裝 Vue DevTools 擴展程式，可以即時查看 Pinia 狀態變化。

### 2. Console 除錯

在關鍵位置加入 `console.log` 來追蹤資料流：

```javascript
function addTransaction(transactionData) {
  console.log('新增交易前：', transactions.value.length)
  // ...實作邏輯
  console.log('新增交易後：', transactions.value.length)
}
```

### 3. 檢查 localStorage

在瀏覽器 DevTools 的 Application 頁籤中檢查 localStorage。

## 📖 參考資料

### Pinia 官方文檔：

- [Pinia 基本概念](https://pinia.vuejs.org/core-concepts/)
- [Setup Stores](https://pinia.vuejs.org/core-concepts/setup-stores.html)

### Vue 3 相關：

- [Composition API](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Computed Properties](https://vuejs.org/guide/essentials/computed.html)

## 🎉 完成檢查清單

完成練習後，您應該能夠：

- [ ] 理解 Pinia Store 的基本結構
- [ ] 熟練使用 `ref` 和 `computed`
- [ ] 實作完整的狀態管理邏輯
- [ ] 整合 localStorage 實現資料持久化
- [ ] 建立健壯的錯誤處理機制
- [ ] 理解響應式狀態如何驅動 UI 更新

## 💪 進階挑戰

如果您快速完成了基礎練習，可以嘗試：

1. **新增搜尋功能**：實作交易記錄的搜尋和篩選
2. **資料匯出**：實作 CSV 匯出功能
3. **樂觀更新**：改進 UI 回應速度
4. **快取機制**：加入智慧快取策略
5. **錯誤重試**：加入操作失敗自動重試

## 🤝 獲得幫助

遇到困難時：

1. **查看註解**：檔案中的 TODO 註解包含詳細提示
2. **參考完整實作**：`category.js` 和 `budget.js` 是完整實作的參考
3. **查看 Console**：留意瀏覽器控制台的錯誤訊息
4. **使用 DevTools**：善用 Vue DevTools 觀察狀態變化

祝您練習愉快！透過這個實戰練習，您將對 Pinia 有更深入的理解。💪

---

**最後提醒**：記住，程式開發是一個持續學習的過程。不要害怕出錯，每個錯誤都是學習的機會！🚀

# 💰 個人記帳應用 - Pinia 狀態管理實戰練習

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2.x-FFD859?style=flat-square&logo=pinia)](https://pinia.vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

> 🎯 **學習目標**：透過實作完整的個人記帳應用，深度掌握 Vue 3 + Pinia 狀態管理的核心技術

## 📋 專案簡介

這是一個專為 Vue 3 + Pinia 學習設計的實戰練習專案。您將在一個真實的業務場景中學習：

- ✅ **Pinia Setup Stores** 語法和最佳實踐
- ✅ **響應式狀態管理** 與計算屬性應用
- ✅ **完整 CRUD 操作** 實作
- ✅ **資料持久化** 與 localStorage 整合
- ✅ **UI 狀態管理** 和通知系統
- ✅ **錯誤處理** 和使用者體驗優化

## 🏗️ 專案架構

```
ptch-2025-vue-training-expense-tracker/
├── src/
│   ├── stores/                    # 🎯 主要練習區域
│   │   ├── transaction.js         # 🔧 待實作：交易記錄管理
│   │   ├── ui.js                 # 🔧 待實作：UI 狀態管理
│   │   ├── category.js           # ✅ 已完成：分類管理（參考）
│   │   └── budget.js             # ✅ 已完成：預算管理（參考）
│   ├── views/                    # 頁面組件
│   ├── components/               # UI 組件
│   └── utils/                    # 工具函數
├── PRACTICE_GUIDE.md             # 📚 詳細練習指南
├── PRACTICE_HINTS.md             # 💡 語法提示和除錯技巧
└── PRACTICE_CHECKLIST.md         # ✅ 完成度檢查清單
```

## 🚀 快速開始

### 1. 環境準備

確保您的開發環境已安裝：

- **Node.js** 16.0+
- **npm** 或 **yarn**
- **Vue DevTools** 瀏覽器擴展（強烈推薦）

### 2. 專案設置

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 開啟瀏覽器訪問：http://localhost:5173
```

### 3. 檢查初始狀態

啟動後您應該看到：

- ✅ 頁面正常載入，但統計數據顯示為 0
- ✅ 導航功能正常
- ❌ 新增交易功能尚未運作（待您實作）

## 🎯 練習流程

### 📚 第一步：閱讀文檔（5分鐘）

1. **先閱讀** [PRACTICE_GUIDE.md](./PRACTICE_GUIDE.md) - 了解整體架構和目標
2. **準備** [PRACTICE_HINTS.md](./PRACTICE_HINTS.md) - 語法提示隨時查看
3. **準備** [PRACTICE_CHECKLIST.md](./PRACTICE_CHECKLIST.md) - 用於檢查進度

### 🔧 第二步：Transaction Store 實作（45分鐘）

**檔案：`src/stores/transaction.js`**

#### 階段 1：基礎狀態（10分鐘）

```javascript
// 需要實作的響應式狀態
const transactions = ref([])
const loading = ref(false)
const error = ref(null)

// ⚠️ 記得取消註解這行：
// import { v4 as uuidv4 } from 'uuid'
```

#### 階段 2：計算屬性（15分鐘）

實作這些計算屬性：

- `balance` - 總餘額（收入 - 支出）
- `totalIncome` - 總收入
- `totalExpense` - 總支出
- `monthlyIncome` - 本月收入
- `monthlyExpense` - 本月支出
- `recentTransactions` - 最近5筆交易

#### 階段 3：核心方法（20分鐘）

實作這些方法：

- `loadTransactions()` - 從 localStorage 載入
- `saveTransactions()` - 儲存到 localStorage
- `addTransaction()` - 新增交易
- `updateTransaction()` - 更新交易
- `deleteTransaction()` - 刪除交易

### 🎨 第三步：UI Store 實作（30分鐘）

**檔案：`src/stores/ui.js`**

實作 UI 狀態管理：

- 主題切換（深色/淺色）
- 模態框管理
- 通知系統
- 設定持久化

### ✅ 第四步：功能測試（15分鐘）

使用 [PRACTICE_CHECKLIST.md](./PRACTICE_CHECKLIST.md) 逐項檢查：

#### 基礎功能測試

- [ ] 新增交易後餘額正確更新
- [ ] 重新整理頁面後資料仍存在
- [ ] 統計數字計算正確
- [ ] 主題切換功能正常

#### 檢查 DevTools

1. 打開 **Vue DevTools**
2. 查看 **Pinia** 頁籤
3. 確認狀態變化正常

## 💡 實作提示

### 🔍 計算餘額範例

```javascript
const balance = computed(() => {
  return transactions.value.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount
  }, 0)
})
```

### 💾 新增交易範例

```javascript
function addTransaction(transactionData) {
  const newTransaction = {
    id: uuidv4(), // 產生唯一 ID
    ...transactionData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  transactions.value.push(newTransaction)
  saveTransactions()
  return newTransaction
}
```

### 🗄️ localStorage 整合

```javascript
function saveTransactions() {
  try {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions.value))
  } catch (error) {
    console.error('儲存失敗:', error)
  }
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem('expense-tracker-transactions')
    if (saved) {
      transactions.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('載入失敗:', error)
  }
}
```

## 🐛 除錯技巧

### 常見問題解決

1. **狀態沒有響應**

   ```javascript
   // ❌ 錯誤：直接賦值
   transactions = newData

   // ✅ 正確：使用 .value
   transactions.value = newData
   ```

2. **計算屬性不更新**

   ```javascript
   // 檢查是否正確使用 computed
   const balance = computed(() => {
     // 確保依賴的響應式數據正確
     return transactions.value.reduce(...)
   })
   ```

3. **localStorage 資料丟失**
   ```javascript
   // 確保正確的 JSON 處理
   JSON.parse(localStorage.getItem('key') || '[]')
   ```

### 除錯工具使用

1. **Vue DevTools**：即時查看 Pinia 狀態
2. **Console 除錯**：在關鍵位置加入 `console.log`
3. **瀏覽器 DevTools**：檢查 localStorage 內容

## 📊 進度檢查

在練習過程中，使用這個快速檢查：

```javascript
// 在瀏覽器 Console 中測試
const store = useTransactionStore()

// 測試新增交易
store.addTransaction({
  type: 'income',
  amount: 1000,
  category: 'test',
  description: '測試收入',
  date: '2024-01-01',
})

// 檢查結果
console.log('餘額:', store.balance)
console.log('交易數量:', store.transactions.length)
```

## 🎓 學習成果

完成這個練習後，您將掌握：

- ✅ **Pinia Setup Stores** 的完整使用方式
- ✅ **響應式狀態管理** 的核心概念
- ✅ **計算屬性** 在實際業務中的應用
- ✅ **狀態持久化** 的實作技巧
- ✅ **錯誤處理** 和使用者體驗設計
- ✅ **Vue DevTools** 的除錯技能

## 🚀 進階挑戰

基礎練習完成後，可以嘗試：

1. **功能擴展**

   - 實作交易搜尋和篩選
   - 新增資料匯出功能（CSV/JSON）
   - 實作統計圖表整合

2. **效能優化**

   - 新增虛擬滾動（大量資料）
   - 實作樂觀更新機制
   - 新增快取策略

3. **架構改進**
   - 新增資料驗證層
   - 實作 Store 組合模式
   - 新增單元測試

## 📚 參考資源

### 官方文檔

- [Pinia 官方文檔](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 響應式 API](https://vuejs.org/api/reactivity-core.html)

### 實用工具

- [Vue DevTools](https://devtools.vuejs.org/)
- [Vite 文檔](https://vitejs.dev/)

## 🤝 獲得協助

遇到困難時：

1. **查看錯誤訊息**：仔細閱讀瀏覽器 Console 的錯誤
2. **參考完整實作**：查看 `category.js` 和 `budget.js` 的實作方式
3. **使用 DevTools**：觀察 Pinia 狀態的變化
4. **查看提示文檔**：[PRACTICE_HINTS.md](./PRACTICE_HINTS.md) 包含常用語法

## 📝 完成確認

使用 [PRACTICE_CHECKLIST.md](./PRACTICE_CHECKLIST.md) 確認您的學習成果：

- [ ] 所有基礎功能正常運作
- [ ] 計算屬性邏輯正確
- [ ] 資料持久化成功
- [ ] UI 互動體驗良好
- [ ] 程式碼品質符合標準

---

## 🎉 恭喜完成！

完成這個練習代表您已經掌握了 Pinia 狀態管理的核心技能！

### 下一步建議：

1. 🔄 **複習鞏固**：回顧重要概念和實作細節
2. 🚀 **應用實踐**：在個人專案中使用 Pinia
3. 📚 **深入學習**：探索 Pinia 的進階特性
4. 🤝 **分享交流**：與其他開發者討論學習心得

繼續保持學習熱忱，您在 Vue.js 開發路上又邁出了重要一步！💪

---

**License:** MIT | **作者:** Vue.js Taiwan Community

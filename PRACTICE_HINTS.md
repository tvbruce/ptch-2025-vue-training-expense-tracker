# 🚀 Pinia 練習快速提示卡

## 基礎語法提醒

### 定義 Store

```javascript
export const useTransactionStore = defineStore('transaction', () => {
  // 狀態、計算屬性、方法...
  return {
    /* 暴露的 API */
  }
})
```

### 響應式狀態

```javascript
const transactions = ref([]) // 陣列
const loading = ref(false) // 布林值
const error = ref(null) // 可為 null
```

### 計算屬性

```javascript
const balance = computed(() => {
  // 計算邏輯
  return result
})
```

### 使用 Store

```javascript
const store = useTransactionStore()
store.addTransaction(data)
console.log(store.balance)
```

## 常用 JavaScript 方法

### 陣列操作

```javascript
// 篩選
array.filter((item) => item.type === 'income')

// 加總
array.reduce((total, item) => total + item.amount, 0)

// 排序
array.sort((a, b) => new Date(b.date) - new Date(a.date))

// 取前 N 筆
array.slice(0, 5)

// 尋找索引
array.findIndex((item) => item.id === id)

// 新增
array.push(newItem)

// 移除
array.splice(index, 1)
```

### localStorage

```javascript
// 儲存
localStorage.setItem('key', JSON.stringify(data))

// 讀取
const data = JSON.parse(localStorage.getItem('key') || '[]')

// 讀取（帶預設值）
const theme = localStorage.getItem('theme') || 'light'
```

### 日期操作

```javascript
const now = new Date()
const currentMonth = now.getMonth() // 0-11
const currentYear = now.getFullYear() // 2024

// 比較日期
const date = new Date(dateString)
date.getMonth() === currentMonth
```

### UUID 產生

```javascript
import { v4 as uuidv4 } from 'uuid'
const id = uuidv4()
```

## 常見模式

### 錯誤處理

```javascript
async function someAction() {
  loading.value = true
  error.value = null

  try {
    // 執行操作
  } catch (err) {
    error.value = '錯誤訊息'
    console.error('操作失敗:', err)
  } finally {
    loading.value = false
  }
}
```

### 資料驗證

```javascript
function addItem(data) {
  if (!data.name) {
    error.value = '名稱不能為空'
    return false
  }

  // 新增邏輯...
  return true
}
```

### 搜尋/篩選

```javascript
function search(query) {
  return items.value.filter((item) => item.description.toLowerCase().includes(query.toLowerCase()))
}
```

## 除錯檢查點

### 1. 檢查狀態是否正確初始化

```javascript
console.log('初始狀態:', { transactions: transactions.value })
```

### 2. 檢查計算屬性是否運作

```javascript
console.log('餘額計算:', balance.value)
```

### 3. 檢查 localStorage

在瀏覽器 DevTools > Application > Local Storage

### 4. 檢查 Vue DevTools

確認 Pinia 狀態顯示正確

## 實作檢查清單

### Transaction Store

- [ ] `transactions` 狀態建立
- [ ] `balance` 計算正確
- [ ] `addTransaction` 能新增
- [ ] `loadTransactions` 能載入
- [ ] `saveTransactions` 能儲存
- [ ] localStorage 整合正常

### UI Store

- [ ] `theme` 狀態建立
- [ ] `toggleTheme` 能切換
- [ ] `modals` 狀態管理
- [ ] `notifications` 通知系統
- [ ] localStorage 設定儲存

## 常見錯誤解決

### 錯誤：Cannot read property 'value' of undefined

**解決**：檢查是否使用了 `ref()` 包裝狀態

### 錯誤：computed is not a function

**解決**：確認有 import computed

### 錯誤：localStorage 資料丟失

**解決**：檢查 JSON.stringify/parse 是否正確

### 錯誤：頁面沒有更新

**解決**：確認使用 `.value` 來存取 ref 值

## 快速測試指令

在瀏覽器 Console 中：

```javascript
// 測試新增交易
const store = useTransactionStore()
store.addTransaction({
  type: 'income',
  amount: 1000,
  category: 'test',
  description: '測試',
  date: '2024-01-01',
})

// 檢查餘額
console.log(store.balance)

// 檢查 localStorage
console.log(localStorage.getItem('expense-tracker-transactions'))
```

---

💡 **記住**：遇到困難時，先檢查瀏覽器 Console 的錯誤訊息！

/**
 * 資料匯出工具函數
 * 支援 CSV 和 JSON 格式的資料匯出
 */

/**
 * 將資料匯出為 CSV 格式
 * @param {Array} data - 要匯出的資料陣列
 * @param {string} filename - 檔案名稱（不含副檔名）
 * @param {Array} headers - CSV 標題行（可選）
 */
export function exportToCSV(data, filename = 'export', headers = null) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('資料為空或格式不正確')
    }

    let csvContent = ''

    // 如果沒有提供標題，使用第一個物件的鍵作為標題
    if (!headers && data.length > 0) {
      headers = Object.keys(data[0])
    }

    // 添加標題行
    if (headers && headers.length > 0) {
      csvContent += headers.map((header) => `"${header}"`).join(',') + '\n'
    }

    // 添加資料行
    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header] || ''

        // 處理特殊字符和換行符
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""') // 轉義雙引號
        }

        return `"${value}"`
      })

      csvContent += values.join(',') + '\n'
    })

    // 創建並下載檔案
    downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;')

    return true
  } catch (error) {
    console.error('CSV 匯出失敗:', error)
    throw error
  }
}

/**
 * 將資料匯出為 JSON 格式
 * @param {any} data - 要匯出的資料
 * @param {string} filename - 檔案名稱（不含副檔名）
 * @param {boolean} pretty - 是否格式化 JSON（預設為 true）
 */
export function exportToJSON(data, filename = 'export', pretty = true) {
  try {
    const jsonContent = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)

    downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;')

    return true
  } catch (error) {
    console.error('JSON 匯出失敗:', error)
    throw error
  }
}

/**
 * 匯出交易記錄為 CSV
 * @param {Array} transactions - 交易記錄陣列
 * @param {string} filename - 檔案名稱
 */
export function exportTransactionsToCSV(transactions, filename = '交易記錄') {
  const headers = ['日期', '類型', '分類', '金額', '描述', '標籤', '創建時間']

  const data = transactions.map((transaction) => ({
    日期: transaction.date,
    類型: transaction.type === 'income' ? '收入' : '支出',
    分類: transaction.categoryName || transaction.category,
    金額: transaction.amount,
    描述: transaction.description || '',
    標籤: Array.isArray(transaction.tags) ? transaction.tags.join(', ') : '',
    創建時間: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('zh-TW') : '',
  }))

  return exportToCSV(data, filename, headers)
}

/**
 * 匯出分類資料為 CSV
 * @param {Array} categories - 分類陣列
 * @param {string} filename - 檔案名稱
 */
export function exportCategoriesToCSV(categories, filename = '分類資料') {
  const headers = ['名稱', '類型', '圖示', '顏色', '描述', '是否預設', '創建時間']

  const data = categories.map((category) => ({
    名稱: category.name,
    類型: category.type === 'income' ? '收入' : '支出',
    圖示: category.icon || '',
    顏色: category.color || '',
    描述: category.description || '',
    是否預設: category.isDefault ? '是' : '否',
    創建時間: category.createdAt ? new Date(category.createdAt).toLocaleString('zh-TW') : '',
  }))

  return exportToCSV(data, filename, headers)
}

/**
 * 匯出預算資料為 CSV
 * @param {Array} budgets - 預算陣列
 * @param {string} filename - 檔案名稱
 */
export function exportBudgetsToCSV(budgets, filename = '預算資料') {
  const headers = ['分類', '預算金額', '週期', '年份', '月份', '警告閾值', '創建時間']

  const data = budgets.map((budget) => ({
    分類: budget.categoryName || budget.category,
    預算金額: budget.amount,
    週期: budget.period === 'monthly' ? '月度' : '年度',
    年份: budget.year,
    月份: budget.month || '',
    警告閾值: `${budget.alertThreshold}%`,
    創建時間: budget.createdAt ? new Date(budget.createdAt).toLocaleString('zh-TW') : '',
  }))

  return exportToCSV(data, filename, headers)
}

/**
 * 匯出完整的財務資料
 * @param {Object} data - 包含所有財務資料的物件
 * @param {string} filename - 檔案名稱
 */
export function exportFullFinancialData(data, filename = '完整財務資料') {
  const exportData = {
    exportInfo: {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      description: '個人記帳應用完整資料匯出',
    },
    transactions: data.transactions || [],
    categories: data.categories || [],
    budgets: data.budgets || [],
    settings: data.settings || {},
  }

  return exportToJSON(exportData, filename)
}

/**
 * 從 JSON 檔案匯入資料
 * @param {File} file - 要匯入的檔案
 * @returns {Promise} 解析後的資料
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('請選擇要匯入的檔案'))
      return
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      reject(new Error('請選擇 JSON 格式的檔案'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('檔案格式不正確，請確認是有效的 JSON 檔案'))
      }
    }

    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'))
    }

    reader.readAsText(file, 'utf-8')
  })
}

/**
 * 從 CSV 檔案匯入資料
 * @param {File} file - 要匯入的檔案
 * @returns {Promise} 解析後的資料陣列
 */
export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('請選擇要匯入的檔案'))
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('請選擇 CSV 格式的檔案'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvData = event.target.result
        const data = parseCSV(csvData)
        resolve(data)
      } catch (error) {
        reject(new Error('CSV 檔案解析失敗：' + error.message))
      }
    }

    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'))
    }

    reader.readAsText(file, 'utf-8')
  })
}

/**
 * 解析 CSV 字串
 * @param {string} csvString - CSV 字串
 * @returns {Array} 解析後的資料陣列
 */
function parseCSV(csvString) {
  const lines = csvString.split('\n').filter((line) => line.trim())

  if (lines.length === 0) {
    throw new Error('CSV 檔案為空')
  }

  // 解析標題行
  const headers = parseCSVLine(lines[0])

  // 解析資料行
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  return data
}

/**
 * 解析 CSV 行
 * @param {string} line - CSV 行字串
 * @returns {Array} 解析後的值陣列
 */
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 轉義的雙引號
        current += '"'
        i++ // 跳過下一個引號
      } else {
        // 切換引號狀態
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // 欄位分隔符
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // 添加最後一個值
  values.push(current.trim())

  return values
}

/**
 * 下載檔案的通用函數
 * @param {string} content - 檔案內容
 * @param {string} filename - 檔案名稱
 * @param {string} mimeType - MIME 類型
 */
function downloadFile(content, filename, mimeType) {
  // 創建 Blob 物件
  const blob = new Blob([content], { type: mimeType })

  // 創建下載連結
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  // 觸發下載
  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 驗證匯入的資料格式
 * @param {Object} data - 要驗證的資料
 * @returns {Object} 驗證結果
 */
export function validateImportData(data) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
  }

  try {
    // 檢查基本結構
    if (!data || typeof data !== 'object') {
      result.valid = false
      result.errors.push('資料格式不正確')
      return result
    }

    // 檢查交易記錄
    if (data.transactions && Array.isArray(data.transactions)) {
      data.transactions.forEach((transaction, index) => {
        if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
          result.warnings.push(`交易記錄 ${index + 1}: 類型不正確`)
        }

        if (!transaction.amount || isNaN(transaction.amount)) {
          result.warnings.push(`交易記錄 ${index + 1}: 金額不正確`)
        }

        if (!transaction.date) {
          result.warnings.push(`交易記錄 ${index + 1}: 缺少日期`)
        }
      })
    }

    // 檢查分類資料
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((category, index) => {
        if (!category.name) {
          result.warnings.push(`分類 ${index + 1}: 缺少名稱`)
        }

        if (!category.type || !['income', 'expense'].includes(category.type)) {
          result.warnings.push(`分類 ${index + 1}: 類型不正確`)
        }
      })
    }

    // 檢查預算資料
    if (data.budgets && Array.isArray(data.budgets)) {
      data.budgets.forEach((budget, index) => {
        if (!budget.amount || isNaN(budget.amount)) {
          result.warnings.push(`預算 ${index + 1}: 金額不正確`)
        }

        if (!budget.period || !['monthly', 'yearly'].includes(budget.period)) {
          result.warnings.push(`預算 ${index + 1}: 週期不正確`)
        }
      })
    }
  } catch (error) {
    result.valid = false
    result.errors.push('資料驗證過程中發生錯誤：' + error.message)
  }

  return result
}

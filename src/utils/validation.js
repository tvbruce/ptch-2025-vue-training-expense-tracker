/**
 * 表單驗證工具函數
 */

/**
 * 驗證必填欄位
 * @param {any} value - 輸入值
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateRequired(value, fieldName = '此欄位') {
  if (!value && value !== 0) {
    return { isValid: false, error: `${fieldName}為必填項目` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName}不能為空` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證字串長度
 * @param {string} value - 輸入值
 * @param {number} min - 最小長度
 * @param {number} max - 最大長度
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateLength(value, min = 0, max = Infinity, fieldName = '此欄位') {
  const str = value ? value.toString() : ''

  if (str.length < min) {
    return { isValid: false, error: `${fieldName}至少需要${min}個字元` }
  }

  if (str.length > max) {
    return { isValid: false, error: `${fieldName}不能超過${max}個字元` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證數字範圍
 * @param {number} value - 輸入值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateRange(value, min = -Infinity, max = Infinity, fieldName = '此欄位') {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName}必須是有效數字` }
  }

  if (num < min) {
    return { isValid: false, error: `${fieldName}不能小於${min}` }
  }

  if (num > max) {
    return { isValid: false, error: `${fieldName}不能大於${max}` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證日期格式
 * @param {string} value - 日期字串
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateDate(value, fieldName = '日期') {
  if (!value) {
    return { isValid: false, error: `請選擇${fieldName}` }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName}格式不正確` }
  }

  // 檢查日期是否在合理範圍內
  const minDate = new Date('1900-01-01')
  const maxDate = new Date('2100-12-31')

  if (date < minDate || date > maxDate) {
    return { isValid: false, error: `${fieldName}必須在1900年到2100年之間` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證電子郵件格式
 * @param {string} value - 電子郵件
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateEmail(value, fieldName = '電子郵件') {
  if (!value) {
    return { isValid: false, error: `請輸入${fieldName}` }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return { isValid: false, error: `${fieldName}格式不正確` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證選項選擇
 * @param {any} value - 選擇值
 * @param {array} options - 有效選項
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateSelect(value, options = [], fieldName = '選項') {
  if (!value && value !== 0) {
    return { isValid: false, error: `請選擇${fieldName}` }
  }

  if (options.length > 0 && !options.includes(value)) {
    return { isValid: false, error: `${fieldName}選擇無效` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證陣列
 * @param {array} value - 陣列值
 * @param {number} minLength - 最小長度
 * @param {number} maxLength - 最大長度
 * @param {string} fieldName - 欄位名稱
 * @returns {object} 驗證結果
 */
export function validateArray(value, minLength = 0, maxLength = Infinity, fieldName = '項目') {
  if (!Array.isArray(value)) {
    return { isValid: false, error: `${fieldName}格式不正確` }
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName}至少需要選擇${minLength}項` }
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName}最多只能選擇${maxLength}項` }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證交易記錄
 * @param {object} transaction - 交易記錄對象
 * @returns {object} 驗證結果
 */
export function validateTransaction(transaction) {
  const errors = {}

  // 驗證交易類型
  const typeResult = validateSelect(transaction.type, ['income', 'expense'], '交易類型')
  if (!typeResult.isValid) {
    errors.type = typeResult.error
  }

  // 驗證金額
  const amountResult = validateRange(transaction.amount, 0.01, 999999999, '金額')
  if (!amountResult.isValid) {
    errors.amount = amountResult.error
  }

  // 驗證分類
  const categoryResult = validateRequired(transaction.category, '分類')
  if (!categoryResult.isValid) {
    errors.category = categoryResult.error
  }

  // 驗證日期
  const dateResult = validateDate(transaction.date, '日期')
  if (!dateResult.isValid) {
    errors.date = dateResult.error
  }

  // 驗證描述
  const descriptionResult = validateLength(transaction.description, 1, 100, '描述')
  if (!descriptionResult.isValid) {
    errors.description = descriptionResult.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 驗證分類
 * @param {object} category - 分類對象
 * @returns {object} 驗證結果
 */
export function validateCategory(category) {
  const errors = {}

  // 驗證分類名稱
  const nameResult = validateLength(category.name, 1, 20, '分類名稱')
  if (!nameResult.isValid) {
    errors.name = nameResult.error
  }

  // 驗證分類類型
  const typeResult = validateSelect(category.type, ['income', 'expense'], '分類類型')
  if (!typeResult.isValid) {
    errors.type = typeResult.error
  }

  // 驗證顏色
  if (category.color && !/^#[0-9A-F]{6}$/i.test(category.color)) {
    errors.color = '顏色格式不正確'
  }

  // 驗證圖示
  const iconResult = validateLength(category.icon, 1, 10, '圖示')
  if (!iconResult.isValid) {
    errors.icon = iconResult.error
  }

  // 驗證描述
  if (category.description) {
    const descriptionResult = validateLength(category.description, 0, 100, '描述')
    if (!descriptionResult.isValid) {
      errors.description = descriptionResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 驗證預算
 * @param {object} budget - 預算對象
 * @returns {object} 驗證結果
 */
export function validateBudget(budget) {
  const errors = {}

  // 驗證分類
  const categoryResult = validateRequired(budget.category, '分類')
  if (!categoryResult.isValid) {
    errors.category = categoryResult.error
  }

  // 驗證金額
  const amountResult = validateRange(budget.amount, 1, 999999999, '預算金額')
  if (!amountResult.isValid) {
    errors.amount = amountResult.error
  }

  // 驗證期間
  const periodResult = validateSelect(budget.period, ['monthly', 'yearly'], '預算期間')
  if (!periodResult.isValid) {
    errors.period = periodResult.error
  }

  // 驗證年份
  const currentYear = new Date().getFullYear()
  const yearResult = validateRange(budget.year, currentYear - 5, currentYear + 5, '年份')
  if (!yearResult.isValid) {
    errors.year = yearResult.error
  }

  // 驗證月份（如果是月度預算）
  if (budget.period === 'monthly') {
    const monthResult = validateRange(budget.month, 1, 12, '月份')
    if (!monthResult.isValid) {
      errors.month = monthResult.error
    }
  }

  // 驗證警告閾值
  if (budget.alertThreshold !== undefined) {
    const thresholdResult = validateRange(budget.alertThreshold, 0, 100, '警告閾值')
    if (!thresholdResult.isValid) {
      errors.alertThreshold = thresholdResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 組合多個驗證規則
 * @param {any} value - 輸入值
 * @param {array} rules - 驗證規則陣列
 * @returns {object} 驗證結果
 */
export function validateMultiple(value, rules = []) {
  for (const rule of rules) {
    const result = rule(value)
    if (!result.isValid) {
      return result
    }
  }

  return { isValid: true, error: null }
}

/**
 * 驗證表單對象
 * @param {object} formData - 表單資料
 * @param {object} rules - 驗證規則對象
 * @returns {object} 驗證結果
 */
export function validateForm(formData, rules = {}) {
  const errors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field]

    if (Array.isArray(fieldRules)) {
      const result = validateMultiple(value, fieldRules)
      if (!result.isValid) {
        errors[field] = result.error
      }
    } else if (typeof fieldRules === 'function') {
      const result = fieldRules(value)
      if (!result.isValid) {
        errors[field] = result.error
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

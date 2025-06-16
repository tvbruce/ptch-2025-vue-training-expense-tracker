/**
 * 貨幣格式化工具函數
 */

// 支援的貨幣類型
export const CURRENCIES = {
  TWD: { symbol: 'NT$', name: '新台幣', locale: 'zh-TW' },
  USD: { symbol: '$', name: '美元', locale: 'en-US' },
  EUR: { symbol: '€', name: '歐元', locale: 'de-DE' },
  JPY: { symbol: '¥', name: '日圓', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: '人民幣', locale: 'zh-CN' },
}

/**
 * 格式化金額顯示
 * @param {number} amount - 金額
 * @param {string} currency - 貨幣代碼 (預設: TWD)
 * @param {boolean} showDecimals - 是否顯示小數點 (預設: true)
 * @returns {string} 格式化後的金額字串
 */
export function formatCurrency(amount, currency = 'TWD', showDecimals = true) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0'
  }

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.TWD
  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }

  try {
    return new Intl.NumberFormat(currencyInfo.locale, options).format(amount)
  } catch {
    // 如果國際化失敗，回退到基本格式化
    const formattedAmount = showDecimals ? amount.toFixed(2) : Math.round(amount).toString()
    return `${currencyInfo.symbol}${addCommas(formattedAmount)}`
  }
}

/**
 * 簡化的金額格式化 (不含貨幣符號)
 * @param {number} amount - 金額
 * @param {boolean} showDecimals - 是否顯示小數點
 * @returns {string} 格式化後的數字字串
 */
export function formatAmount(amount, showDecimals = true) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0'
  }

  const formattedAmount = showDecimals ? amount.toFixed(2) : Math.round(amount).toString()

  return addCommas(formattedAmount)
}

/**
 * 添加千分位逗號
 * @param {string|number} value - 數值
 * @returns {string} 加上逗號的字串
 */
export function addCommas(value) {
  const str = value.toString()
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 移除千分位逗號並轉換為數字
 * @param {string} value - 含逗號的字串
 * @returns {number} 轉換後的數字
 */
export function parseAmount(value) {
  if (typeof value === 'number') {
    return value
  }

  const cleanValue = value.toString().replace(/[,\s]/g, '')
  const parsed = parseFloat(cleanValue)

  return isNaN(parsed) ? 0 : parsed
}

/**
 * 驗證金額輸入
 * @param {string|number} value - 輸入值
 * @returns {object} 驗證結果 { isValid: boolean, error: string }
 */
export function validateAmount(value) {
  if (!value && value !== 0) {
    return { isValid: false, error: '請輸入金額' }
  }

  const numValue = typeof value === 'string' ? parseAmount(value) : value

  if (isNaN(numValue)) {
    return { isValid: false, error: '請輸入有效的數字' }
  }

  if (numValue < 0) {
    return { isValid: false, error: '金額不能為負數' }
  }

  if (numValue > 999999999) {
    return { isValid: false, error: '金額過大' }
  }

  // 檢查小數位數
  const decimalPlaces = (numValue.toString().split('.')[1] || []).length
  if (decimalPlaces > 2) {
    return { isValid: false, error: '最多只能有兩位小數' }
  }

  return { isValid: true, error: null }
}

/**
 * 獲取貨幣符號
 * @param {string} currency - 貨幣代碼
 * @returns {string} 貨幣符號
 */
export function getCurrencySymbol(currency = 'TWD') {
  return CURRENCIES[currency]?.symbol || 'NT$'
}

/**
 * 獲取貨幣名稱
 * @param {string} currency - 貨幣代碼
 * @returns {string} 貨幣名稱
 */
export function getCurrencyName(currency = 'TWD') {
  return CURRENCIES[currency]?.name || '新台幣'
}

/**
 * 計算百分比變化
 * @param {number} current - 當前值
 * @param {number} previous - 之前值
 * @returns {object} { percentage: number, isPositive: boolean }
 */
export function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) {
    return { percentage: current > 0 ? 100 : 0, isPositive: current >= 0 }
  }

  const change = ((current - previous) / previous) * 100
  return {
    percentage: Math.abs(change),
    isPositive: change >= 0,
  }
}

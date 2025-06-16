/**
 * 日期處理工具函數
 */

/**
 * 格式化日期顯示
 * @param {string|Date} date - 日期
 * @param {string} format - 格式 (預設: YYYY-MM-DD)
 * @returns {string} 格式化後的日期字串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`
    case 'MM/DD':
      return `${month}/${day}`
    case 'MM-DD':
      return `${month}-${day}`
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    case 'MM/DD HH:mm':
      return `${month}/${day} ${hours}:${minutes}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 獲取相對時間描述
 * @param {string|Date} date - 日期
 * @returns {string} 相對時間描述
 */
export function getRelativeTime(date) {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return '剛剛'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分鐘前`
  } else if (diffHours < 24) {
    return `${diffHours}小時前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return formatDate(dateObj, 'MM/DD')
  }
}

/**
 * 格式化相對日期（別名函數）
 * @param {string|Date} date - 日期
 * @returns {string} 相對時間描述
 */
export function formatRelativeDate(date) {
  return getRelativeTime(date)
}

/**
 * 獲取日期範圍
 * @param {string} period - 時間週期 ('today', 'week', 'month', 'year')
 * @returns {object} { start: string, end: string }
 */
export function getDateRange(period) {
  const today = new Date()

  switch (period) {
    case 'today': {
      return {
        start: formatDate(today),
        end: formatDate(today),
      }
    }

    case 'week': {
      const weekStart = new Date(today)
      const dayOfWeek = today.getDay()
      weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      return {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
      }
    }

    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      return {
        start: formatDate(monthStart),
        end: formatDate(monthEnd),
      }
    }

    case 'year': {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      const yearEnd = new Date(today.getFullYear(), 11, 31)

      return {
        start: formatDate(yearStart),
        end: formatDate(yearEnd),
      }
    }

    default: {
      return {
        start: formatDate(today),
        end: formatDate(today),
      }
    }
  }
}

/**
 * 獲取今天的日期字串
 * @returns {string} 今天的日期 (YYYY-MM-DD)
 */
export function getToday() {
  return formatDate(new Date())
}

/**
 * 獲取昨天的日期字串
 * @returns {string} 昨天的日期 (YYYY-MM-DD)
 */
export function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

/**
 * 獲取本週開始日期
 * @returns {string} 本週開始日期 (YYYY-MM-DD)
 */
export function getThisWeekStart() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 週一為開始
  const monday = new Date(today.setDate(diff))
  return formatDate(monday)
}

/**
 * 獲取本月開始日期
 * @returns {string} 本月開始日期 (YYYY-MM-DD)
 */
export function getThisMonthStart() {
  const today = new Date()
  return formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
}

/**
 * 獲取本年開始日期
 * @returns {string} 本年開始日期 (YYYY-MM-DD)
 */
export function getThisYearStart() {
  const today = new Date()
  return formatDate(new Date(today.getFullYear(), 0, 1))
}

/**
 * 獲取上個月的日期範圍
 * @returns {object} { start: string, end: string }
 */
export function getLastMonthRange() {
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  return {
    start: formatDate(lastMonth),
    end: formatDate(lastMonthEnd),
  }
}

/**
 * 獲取指定月份的日期範圍
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {object} { start: string, end: string }
 */
export function getMonthRange(year, month) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  }
}

/**
 * 判斷是否為今天
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否為今天
 */
export function isToday(date) {
  if (!date) return false

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false

  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}

/**
 * 判斷是否為本週
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否為本週
 */
export function isThisWeek(date) {
  if (!date) return false

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false

  const today = new Date()
  const weekStart = new Date(today)
  const dayOfWeek = today.getDay()
  weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return dateObj >= weekStart && dateObj <= weekEnd
}

/**
 * 判斷是否為本月
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否為本月
 */
export function isThisMonth(date) {
  if (!date) return false

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false

  const today = new Date()
  return dateObj.getFullYear() === today.getFullYear() && dateObj.getMonth() === today.getMonth()
}

/**
 * 獲取月份名稱
 * @param {number} month - 月份 (1-12)
 * @returns {string} 月份名稱
 */
export function getMonthName(month) {
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ]
  return months[month - 1] || ''
}

/**
 * 獲取星期名稱
 * @param {number} dayOfWeek - 星期 (0-6, 0為星期日)
 * @returns {string} 星期名稱
 */
export function getDayName(dayOfWeek) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${days[dayOfWeek] || ''}`
}

/**
 * 驗證日期格式
 * @param {string} dateString - 日期字串
 * @param {string} format - 預期格式
 * @returns {boolean} 是否為有效日期
 */
export function isValidDate(dateString, format = 'YYYY-MM-DD') {
  if (!dateString) return false

  let regex
  switch (format) {
    case 'YYYY-MM-DD':
      regex = /^\d{4}-\d{2}-\d{2}$/
      break
    case 'YYYY/MM/DD':
      regex = /^\d{4}\/\d{2}\/\d{2}$/
      break
    default:
      regex = /^\d{4}-\d{2}-\d{2}$/
  }

  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * 計算兩個日期之間的天數差
 * @param {string|Date} startDate - 開始日期
 * @param {string|Date} endDate - 結束日期
 * @returns {number} 天數差
 */
export function getDaysDifference(startDate, endDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 獲取日期的年月信息
 * @param {string|Date} date - 日期
 * @returns {object} { year: number, month: number }
 */
export function getYearMonth(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return { year: 0, month: 0 }

  return {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth() + 1,
  }
}

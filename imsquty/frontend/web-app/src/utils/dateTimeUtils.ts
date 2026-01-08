/**
 * Date & Time Utilities - Indonesia Format
 * 
 * Standard format untuk aplikasi IMSQuty:
 * - Time: 24-hour format (HH:mm)
 * - Date: dd-MM-yyyy
 * - DateTime: dd-MM-yyyy HH:mm
 * - Timezone: Asia/Jakarta (WIB)
 */

/**
 * Format date to Indonesia standard: dd-MM-yyyy
 * @param date - Date object or ISO string
 * @returns Formatted date string
 * @example formatDate(new Date()) => "08-01-2026"
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Format time to 24-hour format: HH:mm
 * @param date - Date object or ISO string
 * @returns Formatted time string
 * @example formatTime(new Date()) => "14:30"
 */
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

/**
 * Format datetime to Indonesia standard: dd-MM-yyyy HH:mm
 * @param date - Date object or ISO string
 * @returns Formatted datetime string
 * @example formatDateTime(new Date()) => "08-01-2026 14:30"
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  return `${formatDate(dateObj)} ${formatTime(dateObj)}`
}

/**
 * Format datetime with seconds: dd-MM-yyyy HH:mm:ss
 * @param date - Date object or ISO string
 * @returns Formatted datetime string with seconds
 * @example formatDateTimeWithSeconds(new Date()) => "08-01-2026 14:30:45"
 */
export const formatDateTimeWithSeconds = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const seconds = String(dateObj.getSeconds()).padStart(2, '0')

  return `${formatDateTime(dateObj)}:${seconds}`
}

/**
 * Parse date string in Indonesia format to Date object
 * @param dateString - Date string in format dd-MM-yyyy
 * @returns Date object or null
 * @example parseDate("08-01-2026") => Date object
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString || dateString === '-') return null

  const parts = dateString.split('-')
  if (parts.length !== 3) return null

  const [day, month, year] = parts.map(Number)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month - 1, day)
}

/**
 * Parse datetime string in Indonesia format to Date object
 * @param dateTimeString - DateTime string in format dd-MM-yyyy HH:mm
 * @returns Date object or null
 * @example parseDateTime("08-01-2026 14:30") => Date object
 */
export const parseDateTime = (dateTimeString: string): Date | null => {
  if (!dateTimeString || dateTimeString === '-') return null

  const parts = dateTimeString.split(' ')
  if (parts.length !== 2) return null

  const [datePart, timePart] = parts
  const date = parseDate(datePart)
  if (!date) return null

  const [hours, minutes] = timePart.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return null

  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Get current date in Indonesia format
 * @returns Current date string
 * @example getCurrentDate() => "08-01-2026"
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date())
}

/**
 * Get current time in 24-hour format
 * @returns Current time string
 * @example getCurrentTime() => "14:30"
 */
export const getCurrentTime = (): string => {
  return formatTime(new Date())
}

/**
 * Get current datetime in Indonesia format
 * @returns Current datetime string
 * @example getCurrentDateTime() => "08-01-2026 14:30"
 */
export const getCurrentDateTime = (): string => {
  return formatDateTime(new Date())
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date object or ISO string
 * @returns Relative time string in Bahasa Indonesia
 */
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`
  return `${diffYears} tahun yang lalu`
}

/**
 * Check if date is today
 * @param date - Date object or ISO string
 * @returns True if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is yesterday
 * @param date - Date object or ISO string
 * @returns True if date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Format date for display (smart format)
 * - If today: "Hari ini, HH:mm"
 * - If yesterday: "Kemarin, HH:mm"
 * - Otherwise: "dd-MM-yyyy HH:mm"
 * @param date - Date object or ISO string
 * @returns Smart formatted string
 */
export const formatDateSmart = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  if (isToday(dateObj)) {
    return `Hari ini, ${formatTime(dateObj)}`
  }

  if (isYesterday(dateObj)) {
    return `Kemarin, ${formatTime(dateObj)}`
  }

  return formatDateTime(dateObj)
}

/**
 * Get day name in Bahasa Indonesia
 * @param date - Date object or ISO string
 * @returns Day name
 */
export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[dateObj.getDay()]
}

/**
 * Get month name in Bahasa Indonesia
 * @param date - Date object or ISO string
 * @returns Month name
 */
export const getMonthName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[dateObj.getMonth()]
}

/**
 * Format date in long format: "Senin, 8 Januari 2026"
 * @param date - Date object or ISO string
 * @returns Long format date string
 */
export const formatDateLong = (date: Date | string | null | undefined): string => {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const dayName = getDayName(dateObj)
  const day = dateObj.getDate()
  const monthName = getMonthName(dateObj)
  const year = dateObj.getFullYear()

  return `${dayName}, ${day} ${monthName} ${year}`
}

/**
 * Add days to date
 * @param date - Date object or ISO string
 * @param days - Number of days to add (can be negative)
 * @returns New date object
 */
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

/**
 * Add hours to date
 * @param date - Date object or ISO string
 * @param hours - Number of hours to add (can be negative)
 * @returns New date object
 */
export const addHours = (date: Date | string, hours: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  dateObj.setHours(dateObj.getHours() + hours)
  return dateObj
}

/**
 * Calculate duration between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Duration object with days, hours, minutes
 */
export const calculateDuration = (
  start: Date | string,
  end: Date | string
): { days: number; hours: number; minutes: number; total: string } => {
  const startObj = typeof start === 'string' ? new Date(start) : start
  const endObj = typeof end === 'string' ? new Date(end) : end

  const diffMs = endObj.getTime() - startObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const days = diffDays
  const hours = diffHours % 24
  const minutes = diffMinutes % 60

  let total = ''
  if (days > 0) total += `${days} hari `
  if (hours > 0) total += `${hours} jam `
  if (minutes > 0) total += `${minutes} menit`

  return { days, hours, minutes, total: total.trim() || '0 menit' }
}

// Export all functions as default object
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateTimeWithSeconds,
  parseDate,
  parseDateTime,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  formatRelativeTime,
  formatDateSmart,
  formatDateLong,
  getDayName,
  getMonthName,
  isToday,
  isYesterday,
  addDays,
  addHours,
  calculateDuration,
}

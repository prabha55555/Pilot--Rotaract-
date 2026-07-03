/**
 * Utility functions for consistently formatting date and time strings 
 * to Indian Standard Time (IST) across the platform.
 */

/**
 * Formats an ISO string or Date object to a medium date and short time in IST (Asia/Kolkata).
 * Example: "8 Jun 2026, 9:01 pm"
 * 
 * @param {string|Date} dateVal - The date representation to format.
 * @returns {string} Formatted IST date and time.
 */
export const formatIST = (dateVal) => {
  if (!dateVal) return '-'
  try {
    let dateStr = String(dateVal)
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
        dateStr += 'Z'
      }
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  } catch (e) {
    console.error('Error formatting date to IST:', e)
    return String(dateVal)
  }
}

/**
 * Formats an ISO string or Date object to a medium date only in IST (Asia/Kolkata).
 * Example: "8 Jun 2026"
 * 
 * @param {string|Date} dateVal - The date representation to format.
 * @returns {string} Formatted IST date.
 */
export const formatDateIST = (dateVal) => {
  if (!dateVal) return '-'
  try {
    let dateStr = String(dateVal)
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
        dateStr += 'Z'
      }
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium'
    }).format(date)
  } catch (e) {
    console.error('Error formatting date to IST:', e)
    return String(dateVal)
  }
}

/**
 * Formats an ISO string or Date object to a short time only in IST (Asia/Kolkata).
 * Example: "9:01 pm"
 * 
 * @param {string|Date} dateVal - The date representation to format.
 * @returns {string} Formatted IST time.
 */
export const formatTimeIST = (dateVal) => {
  if (!dateVal) return '-'
  try {
    let dateStr = String(dateVal)
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
        dateStr += 'Z'
      }
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (e) {
    console.error('Error formatting time to IST:', e)
    return String(dateVal)
  }
}

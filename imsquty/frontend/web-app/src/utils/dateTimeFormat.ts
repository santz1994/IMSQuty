/**
 * Indonesian Date & Time Formatting Utilities
 * Format: 24-hour time (HH:MM), DD-MM-YYYY
 */

/**
 * Format date to Indonesian format: DD-MM-YYYY
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string
 */
export const formatDateID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Format time to Indonesian 24-hour format: HH:MM
 * @param date - Date object, string, or timestamp
 * @returns Formatted time string
 */
export const formatTimeID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * Format date and time to Indonesian format: DD-MM-YYYY HH:MM
 * @param date - Date object, string, or timestamp
 * @returns Formatted date-time string
 */
export const formatDateTimeID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  return `${formatDateID(d)} ${formatTimeID(d)}`;
};

/**
 * Format time with seconds to Indonesian 24-hour format: HH:MM:SS
 * @param date - Date object, string, or timestamp
 * @returns Formatted time string with seconds
 */
export const formatTimeWithSecondsID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format date and time with seconds: DD-MM-YYYY HH:MM:SS
 * @param date - Date object, string, or timestamp
 * @returns Formatted date-time string with seconds
 */
export const formatDateTimeWithSecondsID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  return `${formatDateID(d)} ${formatTimeWithSecondsID(d)}`;
};

/**
 * Parse Indonesian date format (DD-MM-YYYY) to Date object
 * @param dateString - Date string in DD-MM-YYYY format
 * @returns Date object or null if invalid
 */
export const parseIDDate = (dateString: string): Date | null => {
  const parts = dateString.split('-');

  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Parse Indonesian date-time format (DD-MM-YYYY HH:MM) to Date object
 * @param dateTimeString - Date-time string in DD-MM-YYYY HH:MM format
 * @returns Date object or null if invalid
 */
export const parseIDDateTime = (dateTimeString: string): Date | null => {
  const [datePart, timePart] = dateTimeString.split(' ');

  if (!datePart || !timePart) {
    return null;
  }

  const dateParts = datePart.split('-');
  const timeParts = timePart.split(':');

  if (dateParts.length !== 3 || timeParts.length !== 2) {
    return null;
  }

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  const date = new Date(year, month, day, hours, minutes);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Get relative time string in Indonesian (e.g., "2 jam yang lalu")
 * @param date - Date object, string, or timestamp
 * @returns Relative time string in Indonesian
 */
export const getRelativeTimeID = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();

  if (isNaN(d.getTime())) {
    return '-';
  }

  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Baru saja';
  } else if (diffMins < 60) {
    return `${diffMins} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  } else {
    return formatDateID(d);
  }
};

/**
 * Format month name in Indonesian
 * @param monthIndex - Month index (0-11)
 * @returns Indonesian month name
 */
export const getIndonesianMonthName = (monthIndex: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return months[monthIndex] || '';
};

/**
 * Format date with month name: DD Month YYYY (e.g., "08 Januari 2026")
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string with Indonesian month name
 */
export const formatDateWithMonthNameID = (date: Date | string | number): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  const day = d.getDate();
  const month = getIndonesianMonthName(d.getMonth());
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

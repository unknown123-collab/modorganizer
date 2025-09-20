import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';

export const PHILIPPINE_TIMEZONE = 'Asia/Manila';

/**
 * Convert UTC date to Philippine time
 */
export const toPhilippineTime = (date: Date | string): Date => {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(utcDate, PHILIPPINE_TIMEZONE);
};

/**
 * Convert Philippine time to UTC for storage
 */
export const fromPhilippineTime = (date: Date): Date => {
  return fromZonedTime(date, PHILIPPINE_TIMEZONE);
};

/**
 * Format date in Philippine timezone
 */
export const formatPhilippineTime = (date: Date | string, formatStr: string = 'PPP p'): string => {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(utcDate, PHILIPPINE_TIMEZONE, formatStr);
};

/**
 * Get current Philippine time
 */
export const getPhilippineNow = (): Date => {
  return toPhilippineTime(new Date());
};

/**
 * Create a date in Philippine timezone from date parts
 */
export const createPhilippineDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date => {
  const localDate = new Date(year, month, day, hour, minute);
  return fromPhilippineTime(localDate);
};

/**
 * Check if a date is today in Philippine timezone
 */
export const isToday = (date: Date | string): boolean => {
  const targetDate = toPhilippineTime(date);
  const today = getPhilippineNow();
  
  return targetDate.getFullYear() === today.getFullYear() &&
         targetDate.getMonth() === today.getMonth() &&
         targetDate.getDate() === today.getDate();
};

/**
 * Check if a date is tomorrow in Philippine timezone
 */
export const isTomorrow = (date: Date | string): boolean => {
  const targetDate = toPhilippineTime(date);
  const tomorrow = getPhilippineNow();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return targetDate.getFullYear() === tomorrow.getFullYear() &&
         targetDate.getMonth() === tomorrow.getMonth() &&
         targetDate.getDate() === tomorrow.getDate();
};

/**
 * Get start of day in Philippine timezone
 */
export const getPhilippineStartOfDay = (date?: Date | string): Date => {
  const targetDate = date ? toPhilippineTime(date) : getPhilippineNow();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  return fromPhilippineTime(startOfDay);
};

/**
 * Get end of day in Philippine timezone
 */
export const getPhilippineEndOfDay = (date?: Date | string): Date => {
  const targetDate = date ? toPhilippineTime(date) : getPhilippineNow();
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  return fromPhilippineTime(endOfDay);
};
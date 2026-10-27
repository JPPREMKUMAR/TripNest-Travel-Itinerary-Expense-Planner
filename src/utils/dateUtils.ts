/**
 * Safe date parsing and formatting utilities for TripNest
 * Avoids timezone off-by-one errors by treating 'YYYY-MM-DD' as calendar dates.
 */

export function parseCalendarDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

export function formatCalendarDate(
  dateStr: string,
  options?: { month?: 'short' | 'long' | 'numeric'; day?: 'numeric' | '2-digit'; year?: 'numeric'; weekday?: 'short' | 'long' }
): string {
  if (!dateStr) return '';
  const d = parseCalendarDate(dateStr);
  const defaultOpts: Intl.DateTimeFormatOptions = options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return d.toLocaleDateString('en-US', defaultOpts);
}

export function formatShortDate(dateStr: string): string {
  return formatCalendarDate(dateStr, { month: 'short', day: 'numeric' });
}

export function formatDayOfWeek(dateStr: string): string {
  return formatCalendarDate(dateStr, { weekday: 'short' });
}

/**
 * Returns the number of days between two dates inclusive (e.g. Oct 10 to Oct 12 is 3 days)
 */
export function getTripDaysCount(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseCalendarDate(startDateStr);
  const end = parseCalendarDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Generate an array of YYYY-MM-DD date strings from start to end inclusive
 */
export function getDatesBetween(startDateStr: string, endDateStr: string): string[] {
  if (!startDateStr || !endDateStr) return [];
  const dates: string[] = [];
  const current = parseCalendarDate(startDateStr);
  const end = parseCalendarDate(endDateStr);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Checks whether an activity date is strictly within [startDate, endDate]
 */
export function isDateWithinRange(targetDate: string, startDate: string, endDate: string): boolean {
  if (!targetDate || !startDate || !endDate) return false;
  return targetDate >= startDate && targetDate <= endDate;
}

/**
 * Validates that endDate >= startDate
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  return endDate >= startDate;
}

export type TripStatus = 'upcoming' | 'ongoing' | 'past';

export interface TripTiming {
  status: TripStatus;
  daysRemaining: number;
  label: string;
}

/**
 * Calculates countdown / timing status relative to today's date
 */
export function getTripTiming(startDateStr: string, endDateStr: string): TripTiming {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (todayStr < startDateStr) {
    const start = parseCalendarDate(startDateStr);
    const today = parseCalendarDate(todayStr);
    const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: 'upcoming',
      daysRemaining: diffDays,
      label: diffDays === 1 ? 'Departing tomorrow' : `In ${diffDays} days`,
    };
  } else if (todayStr >= startDateStr && todayStr <= endDateStr) {
    const start = parseCalendarDate(startDateStr);
    const today = parseCalendarDate(todayStr);
    const currentDay = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = getTripDaysCount(startDateStr, endDateStr);
    return {
      status: 'ongoing',
      daysRemaining: 0,
      label: `Day ${currentDay} of ${totalDays}`,
    };
  } else {
    const end = parseCalendarDate(endDateStr);
    const today = parseCalendarDate(todayStr);
    const pastDays = Math.floor((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: 'past',
      daysRemaining: -pastDays,
      label: pastDays <= 1 ? 'Completed yesterday' : `Completed ${pastDays} days ago`,
    };
  }
}

/**
 * Returns today's date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Returns a date N days from today as YYYY-MM-DD
 */
export function getDateOffsetDays(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Date and Age calculation utilities for Church Service Platform
 */

export interface ParsedBirthDate {
  day: number;
  month: number;
  year?: number;
}

/**
 * Extracts day, month, and optional birth year from string formats
 * Supports YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD/MM/YYYY
 */
export function parseFullBirthDate(birthDateStr?: string, fallbackMonth?: number): ParsedBirthDate {
  let day = 1;
  let month = fallbackMonth || 1;
  let year: number | undefined = undefined;

  if (birthDateStr) {
    const clean = birthDateStr.trim();
    let parts: string[] = [];

    if (clean.includes('-')) {
      parts = clean.split('-');
    } else if (clean.includes('/')) {
      parts = clean.split('/');
    }

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) || month;
        day = parseInt(parts[2], 10) || day;
      } else {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10) || day;
        month = parseInt(parts[1], 10) || month;
        year = parseInt(parts[2], 10);
      }
    }
  }

  return { day, month, year };
}

/**
 * Calculates accurate age based on birthDate string or fallbackAge
 */
export function calculateAge(birthDateStr?: string, fallbackAge?: number): number {
  if (!birthDateStr) return fallbackAge || 0;

  const { day, month, year } = parseFullBirthDate(birthDateStr);
  if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    return fallbackAge || 0;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // If birthday hasn't occurred yet this year, subtract 1
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Calculates days remaining until next birthday
 * Returns 0 if today, 1..365 for future days
 */
export function getDaysUntilBirthday(birthDateStr?: string, fallbackMonth?: number): number {
  const { day, month } = parseFullBirthDate(birthDateStr, fallbackMonth);
  const today = new Date();
  const currentYear = today.getFullYear();

  // Target birthday this year
  let nextBday = new Date(currentYear, month - 1, day);
  
  // Set time to midnight for accurate day comparison
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // If birthday already passed this year, look at next year
  if (nextBday.getTime() < todayMidnight.getTime()) {
    nextBday = new Date(currentYear + 1, month - 1, day);
  }

  const diffTime = nextBday.getTime() - todayMidnight.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if birthday is within the next N days (default: 7 days)
 */
export function isUpcomingBirthday(birthDateStr?: string, fallbackMonth?: number, withinDays = 7): boolean {
  const days = getDaysUntilBirthday(birthDateStr, fallbackMonth);
  return days >= 0 && days <= withinDays;
}

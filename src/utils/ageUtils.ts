/**
 * Utility functions for calculating dynamic age and birthday status.
 * Automatically increments a person's age on the exact day of their birthday!
 */

export function calculateDynamicAge(birthDate?: string, fallbackAge: number = 0): number {
  if (!birthDate) return fallbackAge;
  
  const trimmed = birthDate.trim();
  // Support YYYY-MM-DD
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 1900) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // 1-indexed
      const currentDay = today.getDate();

      let calculatedAge = currentYear - year;

      // If the birthday has not arrived yet this year, subtract 1
      if (currentMonth < month || (currentMonth === month && currentDay < day)) {
        calculatedAge--;
      }

      return calculatedAge >= 0 ? calculatedAge : fallbackAge;
    }
  }

  return fallbackAge;
}

export function isBirthdayToday(birthDate?: string, birthMonth?: number): boolean {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  if (birthDate) {
    const parts = birthDate.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(m) && !isNaN(d)) {
        return m === currentMonth && d === currentDay;
      }
    }
  }

  if (birthMonth !== undefined) {
    return birthMonth === currentMonth && currentDay === 1; // approximation if only month given
  }

  return false;
}

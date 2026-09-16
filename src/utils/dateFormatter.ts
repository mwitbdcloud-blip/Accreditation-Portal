// Central Date Formatter Utility - Standardized Month-Day-Year (e.g. January 01, 2026)

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Safely parses any date representation (Date, string, number, timestamp)
 * without ever throwing RangeError: Invalid time value.
 * Correctly disambiguates DD/MM/YYYY vs MM/DD/YYYY and ISO timestamps.
 */
export function parseSafeDate(input: string | number | Date | null | undefined): Date | null {
  if (!input && input !== 0) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const str = String(input).trim();
  if (
    !str ||
    str === '—' ||
    str === 'N/A' ||
    str === 'null' ||
    str === 'undefined' ||
    str === 'Invalid Date'
  ) {
    return null;
  }

  // Handle YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const hh = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
    const mm = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    const ss = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      const dt = new Date(Date.UTC(y, m, d, hh, mm, ss));
      if (!isNaN(dt.getTime())) return dt;
    }
  }

  // Handle DD/MM/YYYY, MM/DD/YYYY or DD/MM/YY with optional time
  const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (slashMatch) {
    let p1 = parseInt(slashMatch[1], 10);
    let p2 = parseInt(slashMatch[2], 10);
    let y = parseInt(slashMatch[3], 10);
    if (y < 100) {
      y += y < 50 ? 2000 : 1900;
    }
    const hh = slashMatch[4] ? parseInt(slashMatch[4], 10) : 0;
    const mm = slashMatch[5] ? parseInt(slashMatch[5], 10) : 0;
    const ss = slashMatch[6] ? parseInt(slashMatch[6], 10) : 0;

    let day = p1;
    let month = p2;
    if (p1 > 12 && p2 <= 12) {
      day = p1;
      month = p2;
    } else if (p2 > 12 && p1 <= 12) {
      month = p1;
      day = p2;
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const dt = new Date(Date.UTC(y, month - 1, day, hh, mm, ss));
      if (!isNaN(dt.getTime())) return dt;
    }
  }

  // Standard fallback
  try {
    const standard = new Date(input);
    return isNaN(standard.getTime()) ? null : standard;
  } catch {
    return null;
  }
}

/**
 * Safely converts any date input to an ISO string.
 * Guaranteed NEVER to throw RangeError: Invalid time value.
 */
export function safeToISOString(
  dateInput: string | number | Date | null | undefined,
  fallback?: string
): string {
  try {
    const parsed = parseSafeDate(dateInput);
    if (parsed) {
      return parsed.toISOString();
    }
  } catch {
    // Fallback if any internal issue
  }
  return fallback !== undefined ? fallback : new Date().toISOString();
}

/**
 * Safely returns YYYY-MM-DD from any date input without crashing.
 */
export function safeDatePart(
  dateInput: string | number | Date | null | undefined,
  fallback?: string
): string {
  try {
    const parsed = parseSafeDate(dateInput);
    if (parsed) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {
    // Fallback
  }
  return fallback !== undefined ? fallback : new Date().toISOString().split('T')[0];
}

/**
 * Computes 4-Month Expiry Date (or custom months) safely without throwing.
 */
export function computeExpiryDate(
  startDateStr: string | number | Date | null | undefined,
  months = 4
): string {
  try {
    const parsed = parseSafeDate(startDateStr);
    if (!parsed) return '';
    const expiry = new Date(parsed);
    expiry.setMonth(expiry.getMonth() + months);
    if (isNaN(expiry.getTime())) return '';
    return expiry.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Formats any date input (ISO string, YYYY-MM-DD, timestamp, or Date object)
 * into strict Month-Day-Year format: "January 01, 2026".
 * Guaranteed to NEVER throw RangeError: Invalid time value.
 */
export function formatDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput && dateInput !== 0) return '—';

  const rawStr = String(dateInput).trim();
  if (
    !rawStr ||
    rawStr === 'N/A' ||
    rawStr === '—' ||
    rawStr === 'null' ||
    rawStr === 'undefined' ||
    rawStr === 'Invalid Date'
  ) {
    return '—';
  }

  // If already formatted like "January 01, 2026", return it directly
  if (/^[A-Z][a-z]+ \d{2}, \d{4}$/.test(rawStr)) {
    return rawStr;
  }

  const parsed = parseSafeDate(dateInput);
  if (!parsed) {
    return rawStr;
  }

  try {
    const monthName = MONTH_NAMES[parsed.getUTCMonth()];
    const dayPadded = String(parsed.getUTCDate()).padStart(2, '0');
    const year = parsed.getUTCFullYear();
    return `${monthName} ${dayPadded}, ${year}`;
  } catch {
    return rawStr;
  }
}

/**
 * Formats date and time: "January 01, 2026, 09:15 AM"
 * Guaranteed to NEVER throw RangeError: Invalid time value.
 */
export function formatDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput && dateInput !== 0) return '—';

  const rawStr = String(dateInput).trim();
  if (
    !rawStr ||
    rawStr === 'N/A' ||
    rawStr === '—' ||
    rawStr === 'null' ||
    rawStr === 'undefined' ||
    rawStr === 'Invalid Date'
  ) {
    return '—';
  }

  const parsed = parseSafeDate(dateInput);
  if (!parsed) {
    return rawStr;
  }

  try {
    const monthName = MONTH_NAMES[parsed.getUTCMonth()];
    const dayPadded = String(parsed.getUTCDate()).padStart(2, '0');
    const year = parsed.getUTCFullYear();
    const datePart = `${monthName} ${dayPadded}, ${year}`;

    let hours = parsed.getUTCHours();
    const minutes = String(parsed.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursPadded = String(hours).padStart(2, '0');

    return `${datePart}, ${hoursPadded}:${minutes} ${ampm}`;
  } catch {
    return rawStr;
  }
}

/**
 * Calculates the exact age based on a Date of Birth (YYYY-MM-DD or standard date format)
 * compared against the current date. Returns the age in years as a number, or '' if invalid/empty.
 * Guaranteed to NEVER throw RangeError: Invalid time value.
 */
export function calculateAgeFromDob(dobInput: string | number | Date | null | undefined): number | '' {
  if (!dobInput && dobInput !== 0) return '';
  const parsed = parseSafeDate(dobInput);
  if (!parsed) return '';

  try {
    const today = new Date();
    let calculatedAge = today.getFullYear() - parsed.getFullYear();
    const monthDiff = today.getMonth() - parsed.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
      calculatedAge--;
    }

    return calculatedAge >= 0 && calculatedAge < 130 ? calculatedAge : '';
  } catch {
    return '';
  }
}

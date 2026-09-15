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
 * Formats any date input (ISO string, YYYY-MM-DD, timestamp, or Date object)
 * into strict Month-Day-Year format: "January 01, 2026".
 */
export function formatDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';

  const rawStr = String(dateInput).trim();
  if (!rawStr || rawStr === 'N/A' || rawStr === '—') return '—';

  // If already formatted like "January 01, 2026", return it directly
  if (/^[A-Z][a-z]+ \d{2}, \d{4}$/.test(rawStr)) {
    return rawStr;
  }

  // Handle YYYY-MM-DD specifically to avoid timezone shifting
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr)) {
    const [y, m, d] = rawStr.split('-').map(Number);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const monthName = MONTH_NAMES[m - 1];
      const dayPadded = String(d).padStart(2, '0');
      return `${monthName} ${dayPadded}, ${y}`;
    }
  }

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return rawStr;
  }

  const monthName = MONTH_NAMES[parsed.getMonth()];
  const dayPadded = String(parsed.getDate()).padStart(2, '0');
  const year = parsed.getFullYear();

  return `${monthName} ${dayPadded}, ${year}`;
}

/**
 * Formats date and time: "January 01, 2026, 09:15 AM"
 */
export function formatDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';

  const rawStr = String(dateInput).trim();
  if (!rawStr || rawStr === 'N/A' || rawStr === '—') return '—';

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return rawStr;
  }

  const datePart = formatDate(parsed);
  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursPadded = String(hours).padStart(2, '0');

  return `${datePart}, ${hoursPadded}:${minutes} ${ampm}`;
}

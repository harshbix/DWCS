import { format, parseISO } from 'date-fns';

/**
 * Formats a numeric amount or string into Tanzanian Shilling (TZS) currency format.
 * Example: 12500 -> "12,500 TZS"
 */
export function formatTZS(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) return '0 TZS';
  
  const formatted = new Intl.NumberFormat('en-TZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `${formatted} TZS`;
}

/**
 * Formats an ISO date string or Date object into a readable date format.
 * Example: ISO -> "Oct 20, 2023"
 */
export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  try {
    return format(d, pattern);
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Formats an ISO string into relative time.
 * Example: "10 mins ago"
 */
export function formatRelativeTime(timestamp: string): string {
  // Return directly if it is a preformatted relative string (like in Stitch data)
  if (timestamp.includes('ago') || timestamp.toLowerCase() === 'yesterday') {
    return timestamp;
  }
  
  try {
    const past = parseISO(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return formatDate(past);
  } catch {
    return timestamp;
  }
}

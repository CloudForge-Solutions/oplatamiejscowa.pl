/**
 * Utility functions for formatting data
 * Used across the application for consistent formatting
 */

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'PLN', locale: string = 'pl-PL'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Format date
 */
export function formatDate(date: string | Date, locale: string = 'pl-PL'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return typeof date === 'string' ? date : date.toLocaleDateString();
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date, locale: string = 'pl-PL'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return typeof date === 'string' ? date : date.toLocaleString();
  }
}

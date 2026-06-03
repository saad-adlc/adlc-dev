/** USD currency formatter using the browser Intl API. */
const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as a USD currency string.
 *
 * @param value - Numeric value to format
 * @returns Formatted string, e.g. "$1,234.56"
 */
export function formatCurrency(value: number): string {
  return USD_FORMATTER.format(value);
}

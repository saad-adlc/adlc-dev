/** Result of a profit calculation. */
export interface ProfitResult {
  profitPercentage: number;
  profitAmount: number;
}

const PERCENT_MULTIPLIER = 100;
const DECIMAL_PLACES = 2;

/**
 * Calculate profit percentage and amount from cost and selling prices.
 * Returns null when costPrice is zero or negative to prevent division by zero.
 */
export function calculateProfit(
  costPrice: number,
  sellingPrice: number,
): ProfitResult | null {
  if (costPrice <= 0) return null;
  const profitAmount = sellingPrice - costPrice;
  const profitPercentage = (profitAmount / costPrice) * PERCENT_MULTIPLIER;
  return { profitPercentage, profitAmount };
}

/**
 * Format a number as a USD currency string (e.g. "$25.00" or "-$10.00").
 */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(DECIMAL_PLACES)}`;
}

/**
 * Format a percentage value to 2 decimal places using the absolute value.
 * Callers are responsible for rendering the sign separately.
 */
export function formatPercentage(value: number): string {
  return `${Math.abs(value).toFixed(DECIMAL_PLACES)}%`;
}

/**
 * Parse a string to a number, returning null for empty or non-numeric input.
 */
export function parseNumericInput(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  return parsed;
}

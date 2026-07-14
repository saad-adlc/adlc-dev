import type { LineItem } from './balance-types';

const CENTS = 100;

/**
 * Parses a raw amount string entered by the user.
 * Returns 0 for blank/whitespace, the numeric value for valid input, or null for invalid
 * non-empty strings.
 */
export function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  const n = Number(trimmed);
  return isNaN(n) ? null : n;
}

/**
 * Returns true when the amount string is non-empty and cannot be parsed as a number.
 * Blank strings return false (blank is valid — it counts as 0).
 */
export function isInvalidAmount(amount: string): boolean {
  return amount.trim() !== '' && isNaN(Number(amount.trim()));
}

/**
 * Computes the subtotal for a list of line items.
 * Invalid amounts count as 0 so the total is never broken by bad input.
 */
export function computeTotal(items: LineItem[]): number {
  return items.reduce((sum, it) => sum + (parseAmount(it.amount) ?? 0), 0);
}

/**
 * Returns true when assets equal liabilities+equity to the cent.
 * Uses integer rounding to avoid floating-point drift.
 */
export function isBalanced(assets: number, claims: number): boolean {
  return Math.round(assets * CENTS) === Math.round(claims * CENTS);
}

/**
 * Formats a number as a dollar string with commas and two decimal places.
 * Negative values are prefixed with a minus sign before the dollar sign.
 */
export function formatMoney(n: number): string {
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (n < 0) return `-$${Math.abs(n).toLocaleString('en-US', opts)}`;
  return `$${n.toLocaleString('en-US', opts)}`;
}

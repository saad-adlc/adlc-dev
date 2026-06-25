import type { Transaction } from './types';
import { BUDGET_AMBER_THRESHOLD, BUDGET_RED_THRESHOLD } from './constants';

/** Returns a "YYYY-MM" key for the given year and 1-based month. */
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Filters transactions to those whose date falls in the given year/month. */
export function filterByMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  const prefix = monthKey(year, month);
  return transactions.filter(t => t.date.startsWith(prefix));
}

/** Sums the amounts of all income transactions. */
export function totalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Sums the amounts of all expense transactions. */
export function totalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Returns a map of category → total spent (expenses only). */
export function spentByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, number>>(
      (acc, t) => ({ ...acc, [t.category]: (acc[t.category] ?? 0) + t.amount }),
      {},
    );
}

/** Returns the colour state for a budget progress bar. */
export function progressColor(spent: number, budget: number): 'green' | 'amber' | 'red' {
  if (budget <= 0) return 'green';
  const ratio = spent / budget;
  if (ratio >= BUDGET_RED_THRESHOLD) return 'red';
  if (ratio >= BUDGET_AMBER_THRESHOLD) return 'amber';
  return 'green';
}

/** Formats a number as a CAD dollar string (e.g. "$12.50" or "-$3.00"). */
export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${abs}` : `$${abs}`;
}

/** Returns a human-readable month label such as "June 2026". */
export function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-CA', { month: 'long', year: 'numeric' });
}

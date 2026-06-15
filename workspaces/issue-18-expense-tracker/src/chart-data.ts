import type { Expense } from './types';

export interface CategorySlice {
  category: string;
  total: number;
  percentage: number;
}

export interface DailySpend {
  date: string;
  total: number;
}

/** Derive per-category totals and percentages from expenses. */
export function buildCategorySlices(expenses: Expense[]): CategorySlice[] {
  if (expenses.length === 0) return [];

  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);

  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Derive daily spending totals sorted by date ascending. */
export function buildDailySpend(expenses: Expense[]): DailySpend[] {
  if (expenses.length === 0) return [];

  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);
  }

  return [...totals.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Sum all expense amounts. */
export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

/** Find the category with the highest total spend. Returns empty string if no expenses. */
export function topCategory(expenses: Expense[]): string {
  const slices = buildCategorySlices(expenses);
  return slices.length > 0 ? slices[0].category : '';
}

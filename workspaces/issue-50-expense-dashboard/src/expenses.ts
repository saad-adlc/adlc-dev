/** Represents a single expense transaction. */
export interface Expense {
  date: string;
  merchant: string;
  category: string;
  amount: number;
}

/** All prefilled expense transactions. */
export const EXPENSES: Expense[] = [
  { date: '2026-06-01', merchant: 'Whole Foods', category: 'Food', amount: 84.20 },
  { date: '2026-06-03', merchant: 'Uber', category: 'Transport', amount: 23.50 },
  { date: '2026-06-05', merchant: 'Amazon', category: 'Shopping', amount: 119.99 },
  { date: '2026-06-08', merchant: 'Electric Co', category: 'Bills', amount: 140.00 },
  { date: '2026-06-12', merchant: "Trader Joe's", category: 'Food', amount: 56.30 },
  { date: '2026-06-15', merchant: 'Shell', category: 'Transport', amount: 48.75 },
  { date: '2026-06-20', merchant: 'Target', category: 'Shopping', amount: 72.10 },
  { date: '2026-06-25', merchant: 'Internet', category: 'Bills', amount: 60.00 },
];

/** Distinct categories sorted alphabetically. */
export const CATEGORIES: string[] = Array.from(
  new Set(EXPENSES.map(e => e.category))
).sort();

/** Returns the total spend per category. */
export function categoryTotals(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
}

/** Returns the sum of all expense amounts. */
export function grandTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
